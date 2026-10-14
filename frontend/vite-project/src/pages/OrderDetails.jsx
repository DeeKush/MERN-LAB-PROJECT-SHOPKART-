import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getOrderById } from '../services/api'

function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setOrder(await getOrderById(id))
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load this order.')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [id])

  if (loading) {
    return (
      <main className="orders-page">
        <Navbar />
        <section className="orders-content"><p>Loading order...</p></section>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="orders-page">
        <Navbar />
        <section className="orders-content">
          <p className="form-error">{error || 'Order not found.'}</p>
        </section>
      </main>
    )
  }

  return (
    <main className="orders-page">
      <Navbar />

      <section className="orders-content order-details-wrap">
        <div className="order-details-box">
          <h1>Order #{order._id.slice(-6)}</h1>
          <p className="order-detail-meta">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>

          <div className="order-detail-row">
            <span>Total</span>
            <strong>₹{order.totalAmount}</strong>
          </div>

          <div className="order-detail-row">
            <span>Status</span>
            <strong>{order.status}</strong>
          </div>

          <div className="order-detail-row">
            <span>Payment</span>
            <strong>{order.paymentStatus}</strong>
          </div>

          <div className="order-items-box">
            {order.items.map((item) => (
              <div key={`${order._id}-${item.product}`} className="order-detail-item">
                <span>{item.name} × {item.quantity}</span>
                <strong>₹{item.price * item.quantity}</strong>
              </div>
            ))}
          </div>

          <div className="shipping-box">
            <h2>Shipping Address</h2>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
            <p>{order.shippingAddress.pincode}</p>
            <p>{order.shippingAddress.phone}</p>
          </div>

          <div className="order-actions">
            <Link to="/orders" className="button button-primary">Back to Orders</Link>
            <Link to="/products" className="button button-quiet">Continue Shopping</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default OrderDetails
