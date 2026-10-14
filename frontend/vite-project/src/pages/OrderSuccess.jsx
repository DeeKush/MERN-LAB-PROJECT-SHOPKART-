import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'

function OrderSuccess() {
  const { id } = useParams()

  return (
    <main className="orders-page">
      <Navbar />

      <section className="orders-content order-success-wrap">
        <div className="empty-state-box order-success-box">
          <h1>✅ Order Placed Successfully</h1>
          <p>
            <strong>Order ID:</strong> {id}
          </p>
          <p>Your order has been saved successfully.</p>

          <div className="order-actions">
            <Link to="/orders" className="button button-primary">View My Orders</Link>
            <Link to="/products" className="button button-quiet">Continue Shopping</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default OrderSuccess
