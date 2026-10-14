import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getOrders } from '../services/api'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setOrders(await getOrders())
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load your orders.')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  return (
    <main className="orders-page">
      <Navbar />

      <section className="orders-content">
        <h1>My Orders</h1>

        {loading && <p>Loading orders...</p>}
        {!loading && error && <p className="form-error">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="empty-state-box">
            <p>You have not placed any orders yet.</p>
            <Link to="/products" className="button button-primary">
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order._id}>
                <div className="order-card-header">
                  <h2>Order #{order._id.slice(-6)}</h2>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="order-card-body">
                  {order.items.slice(0, 2).map((item) => (
                    <p key={`${order._id}-${item.product}`}>
                      {item.name} × {item.quantity}
                    </p>
                  ))}

                  {order.items.length > 2 && <p>+{order.items.length - 2} more items</p>}
                </div>

                <div className="order-card-footer">
                  <strong>₹{order.totalAmount}</strong>
                  <span>Status: {order.status}</span>
                </div>

                <Link to={`/orders/${order._id}`} className="button button-primary order-view-btn">
                  View Details
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Orders
