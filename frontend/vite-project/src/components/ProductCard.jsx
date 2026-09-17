import { useState } from 'react'
import { Link } from 'react-router-dom'

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

  const toggleWish = () => {
    const list = readWishlist()
    const next = !wished
    const updated = next
      ? [...list, product._id]
      : list.filter((id) => id !== product._id)

    localStorage.setItem('wishlist', JSON.stringify(updated))
    setWished(next)
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

        <Link className="button view-btn" to={`/products/${product._id}`}>
          View Details
        </Link>
      </div>
    </article>
  )
}

export default ProductCard
