import { Link, useNavigate } from 'react-router-dom'
import { logoutCustomer } from '../services/api'

function Navbar() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutCustomer()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/" aria-label="ShopKart home">
        <span className="brand-mark">S</span>
        <span>ShopKart</span>
      </Link>
      <button className="button button-quiet" type="button" onClick={handleLogout}>
        Log out <span aria-hidden="true">↗</span>
      </button>
    </header>
  )
}

export default Navbar
