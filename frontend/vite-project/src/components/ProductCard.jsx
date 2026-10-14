import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { addToWishlist, removeFromWishlist } from '../services/api'

const LOW_STOCK_THRESHOLD = 10
const DISCOUNT_RATE = 0.2

function readWishlist() {
  try {
    return JSON.parse(localStorage.getItem('wishlist') || '[]')
  } catch {
    return []
  }
}

function Stars() {
  return (
    <span className="stars" aria-hidden="true">
      {'★★★★★'.split('').map((s, i) => (
        <span key={i} className={i < 4 ? 'star-filled' : ''}>{s}</span>
      ))}
    </span>
  )
}

function ProductCard({ product, tag }) {
  const isLow = product.stock <= LOW_STOCK_THRESHOLD
  const [wished, setWished] = useState(() => readWishlist().includes(product._id))
  const oldPrice = Math.round(product.price / (1 - DISCOUNT_RATE))
  const { addToCart } = useCart()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [cartMessage, setCartMessage] = useState('')

  const toggleWish = async () => {
    const next = !wished
    try {
      if (next) {
        await addToWishlist(product._id)
      } else {
        await removeFromWishlist(product._id)
      }
      setWished(next)

      const list = readWishlist()
      const updated = next
        ? [...list, product._id]
        : list.filter((id) => id !== product._id)
      localStorage.setItem('wishlist', JSON.stringify(updated))
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Please log in to add items to your wishlist.")
      } else {
        console.error("Could not update wishlist", err)
      }
    }
  }

  const handleAddToCart = async () => {
    setAdding(true)
    setCartMessage('')

    try {
      await addToCart(product._id)
      setAdded(true)
      setTimeout(() => setAdded(false), 1600)
    } catch (err) {
      setCartMessage(err.response?.status === 401 ? 'Log in to add to cart' : 'Could not add to cart')
      setTimeout(() => setCartMessage(''), 2500)
    } finally {
      setAdding(false)
    }
  }

  return (
    <article className="product-card">
      {tag && <span className="card-tag">{tag}</span>}

      <div className="product-media">
        <img className="product-image" src={product.image} alt={product.name} />
        <button
          className={`wish-btn${wished ? ' wished' : ''}`}
          type="button"
          onClick={toggleWish}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wished}
        >
          {wished ? '♥' : '♡'}
        </button>
      </div>

      <div className="product-info">
        <p className="eyebrow">{product.category}</p>
        <h3>{product.name}</h3>
        <Stars />

        <div className="product-meta-row">
          <p className="product-price">
            ₹{product.price} <span className="old-price">₹{oldPrice}</span>
          </p>
          <span className={`stock-badge ${isLow ? 'low' : 'ok'}`}>
            {isLow ? `Only ${product.stock} left` : 'In stock'}
          </span>
        </div>

        <div className="card-actions">
          <Link className="button view-btn" to={`/products/${product._id}`}>
            View Details
          </Link>
          <button
            className={`button button-primary card-cart-btn${added ? ' added' : ''}`}
            type="button"
            disabled={adding || product.stock === 0}
            onClick={handleAddToCart}
          >
            {added ? 'Added ✓' : 'Add to Cart'}
          </button>
        </div>

        {cartMessage && <p className="card-cart-message">{cartMessage}</p>}
      </div>
    </article>
  )
}

export default ProductCard
