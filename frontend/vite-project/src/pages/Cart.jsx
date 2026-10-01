import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'

function Cart() {
  const { cart, loading, error, authRequired, totalItems, subtotal, updateQuantity, removeFromCart } = useCart()

  return (
    <main className="cart-page">
      <Navbar />

      <section className="cart-content">
        <h1>My Cart</h1>

        {loading && <p>Loading your cart...</p>}

        {!loading && authRequired && (
          <p>
            Please <Link to="/login">log in</Link> to view your cart.
          </p>
        )}

        {!loading && !authRequired && error && <p>{error}</p>}

        {!loading && !authRequired && !error && cart.length === 0 && (
          <p>
            Your cart is empty. <Link to="/products">Browse products</Link> to add something.
          </p>
        )}

        {!loading && !authRequired && !error && cart.length > 0 && (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.map((item) => (
                <article className="cart-item" key={item.product._id}>
                  <img className="cart-item-image" src={item.product.image} alt={item.product.name} />

                  <div className="cart-item-info">
                    <h3>{item.product.name}</h3>
                    <p className="product-price">₹{item.product.price}</p>
                  </div>

                  <div className="cart-item-qty">
                    <button
                      type="button"
                      className="icon-btn"
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      className="icon-btn"
                      disabled={item.quantity >= item.product.stock}
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <p className="cart-item-total">₹{item.quantity * item.product.price}</p>

                  <button
                    type="button"
                    className="button button-quiet"
                    onClick={() => removeFromCart(item.product._id)}
                  >
                    Remove
                  </button>
                </article>
              ))}
            </div>

            <aside className="cart-summary">
              <h2>Order Summary</h2>
              <p className="summary-row">
                <span>Items</span>
                <span>{totalItems}</span>
              </p>
              <p className="summary-row summary-total">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </p>
              <Link className="button button-primary" to="/products">
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}

export default Cart
