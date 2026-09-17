import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'
import { getProducts } from '../services/api'

const CATEGORIES = ['All categories', 'Electronics', 'Fashion', 'Books', 'Home']

function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const category = searchParams.get('category') || ''

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await getProducts({ search, category })
        setProducts(data.products)
      } catch {
        setError('Something went wrong while loading products.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [search, category])

  const handleCategoryChange = (value) => {
    setSearchParams(value ? { category: value } : {})
  }

  return (
    <main className="products-page">
      <Navbar />

      <section className="products-content">
        <div className="products-layout">
          <aside className="filters">
            <p className="filter-title">Category</p>
            <div className="filter-group">
              {CATEGORIES.map((option) => {
                const value = option === 'All categories' ? '' : option
                return (
                  <label key={option}>
                    <input
                      type="radio"
                      name="category"
                      checked={category === value}
                      onChange={() => handleCategoryChange(value)}
                    />
                    {option}
                  </label>
                )
              })}
            </div>
          </aside>

          <div>
            <div className="products-toolbar">
              <h1>
                Products
                {!isLoading && !error && (
                  <span className="result-count">{products.length} results</span>
                )}
              </h1>
            </div>

            <SearchBar search={search} onSearchChange={setSearch} />

            {isLoading && <p>Loading products...</p>}

            {!isLoading && error && <p>{error}</p>}

            {!isLoading && !error && products.length === 0 && <p>No products found.</p>}

            {!isLoading && !error && products.length > 0 && (
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Products
