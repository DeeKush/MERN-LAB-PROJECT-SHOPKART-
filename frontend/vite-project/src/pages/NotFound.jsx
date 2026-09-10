import { Link } from 'react-router-dom'

function NotFound() {
  return <main className="loading-screen"><p>That page is out of stock.</p><Link className="button button-primary" to="/">Back home</Link></main>
}

export default NotFound
