import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'
import { createPaymentOrder, verifyPayment } from '../services/api'

const initialForm = {
  fullName: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: '',
}

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')

    if (existingScript) {
      if (window.Razorpay) {
        resolve(true)
        return
      }

      existingScript.addEventListener('load', () => resolve(true), { once: true })
      existingScript.addEventListener('error', () => resolve(false), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

function Checkout() {
  const navigate = useNavigate()
  const { cart, subtotal, totalItems, loading, authRequired, refreshCart } = useCart()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const orderItems = useMemo(() => {
    return cart.map((item) => ({
      ...item,
      lineTotal: item.quantity * (item.product?.price || 0),
    }))
  }, [cart])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const nextErrors = {}
    const trimmed = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, String(value).trim()])
    )

    Object.entries(trimmed).forEach(([key, value]) => {
      if (!value) {
        nextErrors[key] = 'This field is required.'
      }
    })

    if (trimmed.phone && !/^[6-9]\d{9}$/.test(trimmed.phone)) {
      nextErrors.phone = 'Enter 10 digits, starting with 6, 7, 8, or 9.'
    }

    if (trimmed.pincode && !/^\d{6}$/.test(trimmed.pincode)) {
      nextErrors.pincode = 'Pincode must contain 6 digits.'
    }

    return { nextErrors, trimmed }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const { nextErrors, trimmed } = validateForm()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setServerError('')

    try {
      const response = await createPaymentOrder({ shippingAddress: trimmed })
      const scriptReady = await loadRazorpayScript()

      if (!scriptReady || !window.Razorpay) {
        throw new Error('Razorpay checkout could not be loaded.')
      }

      const options = {
        key: response.key,
        amount: response.amount,
        currency: response.currency,
        name: 'ShopKart',
        description: 'Order Payment',
        order_id: response.razorpayOrderId,
        handler: async function (razorpayResponse) {
          try {
            await verifyPayment({
              shopKartOrderId: response.shopKartOrderId,
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
            })

            await refreshCart()
            navigate(`/order-success/${response.shopKartOrderId}`)
          } catch (error) {
            setServerError(error.response?.data?.message || 'Payment verification failed.')
          }
        },
        prefill: {
          name: trimmed.fullName,
          contact: trimmed.phone,
        },
        theme: {
          color: '#ff5a36',
        },
      }

      const razorpayInstance = new window.Razorpay(options)
      razorpayInstance.on('payment.failed', (error) => {
        setServerError('Payment failed. Your cart is still safe.')
        console.error(error)
      })
      razorpayInstance.open()
    } catch (error) {
      setServerError(error.response?.data?.message || error.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="checkout-page">
        <Navbar />
        <section className="checkout-content">
          <p>Loading cart...</p>
        </section>
      </main>
    )
  }

  if (authRequired) {
    navigate('/login')
    return null
  }

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <Navbar />
        <section className="checkout-content empty-state-box">
          <h1>Your cart is empty</h1>
          <p>Add products before you try to checkout.</p>
          <button type="button" className="button button-primary" onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="checkout-page">
      <Navbar />

      <section className="checkout-content">
        <div className="checkout-box">
          <div className="checkout-form-panel">
            <h1>Checkout</h1>

            <form className="checkout-form" onSubmit={handleSubmit} noValidate>
              <div className="checkout-section">
                <h2>Shipping Details</h2>

                <div className="field-row">
                  <label>
                    Full Name
                    <input name="fullName" value={form.fullName} onChange={handleChange} />
                    {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                  </label>
                </div>

                <div className="field-row">
                  <label>
                    Phone
                    <input name="phone" value={form.phone} onChange={handleChange} />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </label>
                </div>

                <div className="field-row">
                  <label>
                    Address
                    <input name="addressLine1" value={form.addressLine1} onChange={handleChange} />
                    {errors.addressLine1 && <span className="field-error">{errors.addressLine1}</span>}
                  </label>
                </div>

                <div className="field-grid">
                  <label>
                    City
                    <input name="city" value={form.city} onChange={handleChange} />
                    {errors.city && <span className="field-error">{errors.city}</span>}
                  </label>

                  <label>
                    State
                    <input name="state" value={form.state} onChange={handleChange} />
                    {errors.state && <span className="field-error">{errors.state}</span>}
                  </label>
                </div>

                <div className="field-row">
                  <label>
                    Pincode
                    <input name="pincode" value={form.pincode} onChange={handleChange} />
                    {errors.pincode && <span className="field-error">{errors.pincode}</span>}
                  </label>
                </div>
              </div>

              {serverError && <p className="form-error">{serverError}</p>}

              <button type="submit" className="button button-primary checkout-submit" disabled={submitting}>
                {submitting ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          <aside className="order-summary-panel">
            <h2>Order Summary</h2>

            {orderItems.map((item) => (
              <div className="summary-line" key={item.product._id}>
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <strong>₹{item.lineTotal}</strong>
              </div>
            ))}

            <div className="summary-total-line">
              <span>Total</span>
              <strong>₹{subtotal}</strong>
            </div>

            <p className="summary-meta">{totalItems} item(s)</p>
          </aside>
        </div>
      </section>
    </main>
  )
}

export default Checkout
