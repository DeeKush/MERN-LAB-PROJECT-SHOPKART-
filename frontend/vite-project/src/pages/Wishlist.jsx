import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getWishlist, removeFromWishlist } from '../services/api'

function Wishlist() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [authRequired, setAuthRequired] = useState(false)

  useEffect(() => {
    const loadWishlist = async () => {
      setIsLoading(true)
      setError('')
      setAuthRequired(false)

      try {
        setItems(await getWishlist())
      } catch (err) {
        if (err.response?.status === 401) {
          setAuthRequired(true)
        } else {
          setError('Something went wrong while loading your wishlist.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadWishlist()
  }, [])

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId)
      setItems((prev) => prev.filter((product) => product._id !== productId))
    } catch {
      setError('Could not remove that item. Please try again.')
    }
  }

  return (
    <main className="wishlist-page">
      <Navbar />

      <section className="wishlist-content">
        <h1>My Wishlist</h1>

        {isLoading && <p>Loading your wishlist...</p>}

        {!isLoading && authRequired && (
          <p>
            Please <Link to="/login">log in</Link> to view your wishlist.
          </p>
        )}

        {!isLoading && !authRequired && error && <p>{error}</p>}

        {!isLoading && !authRequired && !error && items.length === 0 && (
          <p>Your wishlist is empty. Go add some products you love!</p>
        )}

        {!isLoading && !authRequired && !error && items.length > 0 && (
          <div className="wishlist-grid">
            {items.map((product) => (
              <article className="wishlist-card" key={product._id}>
                <img className="wishlist-image" src={product.image} alt={product.name} />
                <div className="wishlist-info">
                  <p className="eyebrow">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p className="product-price">₹{product.price}</p>
                  <div className="wishlist-actions">
                    <Link className="button view-btn" to={`/products/${product._id}`}>
                      View Details
                    </Link>
                    <button
                      className="button button-quiet"
                      type="button"
                      onClick={() => handleRemove(product._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Wishlist
