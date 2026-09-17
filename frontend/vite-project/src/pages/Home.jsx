import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'
import FloatingChat from '../components/FloatingChat'
import { getProducts } from '../services/api'

const CATEGORIES = ['Electronics', 'Fashion', 'Books']

const BENEFITS = [
  { label: 'Verified products', sub: 'Every listing checked', icon: 'shield' },
  { label: 'Live stock levels', sub: 'Always up to date', icon: 'pulse' },
  { label: 'Secure login', sub: 'JWT + hashed passwords', icon: 'lock' },
  { label: 'Fast search', sub: 'Filter by category', icon: 'bolt' },
]

function BenefitIcon({ name }) {
  const common = { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }
  if (name === 'shield') return <svg {...common}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinejoin="round" /></svg>
  if (name === 'pulse') return <svg {...common}><path d="M3 12h4l2 8 4-16 2 8h6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  if (name === 'lock') return <svg {...common}><rect x="5" y="11" width="14" height="9" rx="1.5" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
  return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" strokeLinejoin="round" /></svg>
}

function getCountdown() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const diff = midnight - now

  return {
    hours: String(Math.floor(diff / 3.6e6)).padStart(2, '0'),
    minutes: String(Math.floor((diff % 3.6e6) / 6e4)).padStart(2, '0'),
    seconds: String(Math.floor((diff % 6e4) / 1e3)).padStart(2, '0'),
  }
}

function Home() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(getCountdown)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts()
        setProducts(data.products)
      } catch {
        setError('Something went wrong while loading products.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown()), 1000)
    return () => clearInterval(timer)
  }, [])

  const featured = products[0]
  const arrivals = products.slice(1)
  const collage = [products[1], products[3]].filter(Boolean)

  return (
    <main className="storefront">
      <Navbar />

      <div className="page-shell">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Up to 50% off select items</p>
            <h1>
              Shop More,<br /><span className="accent-text">Save More!</span>
            </h1>
            <p className="hero-lede">
              Discover amazing deals on electronics, fashion &amp; books.
            </p>
            <Link className="button button-primary" to="/products">
              Shop Collection
            </Link>
          </div>

          {collage.length > 0 && (
            <div className="hero-visual">
              <span className="collage-badge">Up to<br /><strong>50%</strong><br />off</span>
              <div className="hero-visual-frame">
                {collage.map((product) => (
                  <img key={product._id} src={product.image} alt="" />
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="benefits-strip">
          {BENEFITS.map((b) => (
            <div className="benefit-item" key={b.label}>
              <span className="benefit-icon"><BenefitIcon name={b.icon} /></span>
              <div>
                <p className="benefit-label">{b.label}</p>
                <p className="benefit-sub">{b.sub}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="category-strip">
          <h2>Shop by Category</h2>
          <div className="category-grid">
            {CATEGORIES.map((cat) => {
              const sample = products.find((p) => p.category === cat)
              return (
                <Link key={cat} className="category-tile" to={`/products?category=${cat}`}>
                  <span className="category-photo">
                    {sample ? <img src={sample.image} alt="" /> : cat.charAt(0)}
                  </span>
                  {cat}
                </Link>
              )
            })}
          </div>
        </section>

        {isLoading && <p className="state-message">Loading products...</p>}
        {!isLoading && error && <p className="state-message">{error}</p>}

        {!isLoading && !error && featured && (
          <section className="featured-deal">
            <div className="featured-copy">
              <span className="featured-tag">Deal of the Day</span>
              <h2>Grab It Before<br />It's Gone!</h2>
              <p>Only {featured.stock} left in stock — don't miss out.</p>
              <p className="featured-price">
                ₹{featured.price}
              </p>

              <div className="countdown" aria-label="Today's pick refreshes at midnight">
                <div className="countdown-units">
                  <span><strong>{countdown.hours}</strong>h</span>
                  <span><strong>{countdown.minutes}</strong>m</span>
                  <span><strong>{countdown.seconds}</strong>s</span>
                </div>
              </div>

              <Link className="button button-primary" to={`/products/${featured._id}`}>
                Shop Now
              </Link>
            </div>
            <div className="featured-visual">
              <img className="featured-image" src={featured.image} alt={featured.name} />
            </div>
          </section>
        )}

        {!isLoading && !error && arrivals.length > 0 && (
          <section className="arrivals">
            <h2>New Arrivals</h2>
            <div className="products-grid">
              {arrivals.map((product) => (
                <ProductCard key={product._id} product={product} tag="New" />
              ))}
            </div>
          </section>
        )}
      </div>

      <section className="newsletter">
        <h2>Stay in the Loop</h2>
        <p>Subscribe for exclusive offers, new arrivals &amp; more.</p>
        <NewsletterForm />
      </section>

      <Footer />
      <FloatingChat />
    </main>
  )
}

function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
    setEmail('')
  }

  if (subscribed) return <p className="newsletter-thanks">You're on the list.</p>

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email address"
        required
      />
      <button type="submit" className="button button-primary">Subscribe</button>
    </form>
  )
}

export default Home
