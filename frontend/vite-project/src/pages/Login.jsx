import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { api } from '../services/api.js'

function Login() {

    const [form, setForm] = useState({
        email: '',
        password: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const navigate = useNavigate()
    const location = useLocation()


    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }


    const handleSubmit = async (e) => {

        // Prevent page from refreshing
        e.preventDefault()

        // Remove previous error
        setError('')

        // Start loading
        setIsSubmitting(true)

        try {

            // Send login data to backend
            await api.post('/customers/login', form)

            console.log('User Logged in')

            // Login successful → go to home page
            navigate('/home')

        } catch (error) {

            console.log(error)

            // Get error message sent by backend
            setError(
                error.response?.data?.message ||
                'Login failed. Please check your email and password.'
            )

        } finally {

            // Stop loading
            setIsSubmitting(false)
        }
    }


    return (
        <main className="auth-shell">

            <section className="auth-intro">
                <p className="eyebrow">
                    THE EVERYDAY MARKETPLACE
                </p>

                <h1>
                    Everything you need, one good find away.
                </h1>

                <p className="intro-copy">
                    Shop with intention. Discover useful things,
                    familiar favorites, and a little inspiration
                    for the week ahead.
                </p>

                <div className="intro-stamp">
                    EST. 2026 <span>•</span> SHOPKART
                </div>
            </section>


            <section className="auth-panel">

                <div className="panel-heading">
                    <p className="eyebrow">
                        WELCOME BACK
                    </p>

                    <h2>
                        Sign in to ShopKart
                    </h2>

                    {location.state?.registered && (
                        <p className="success-message">
                            Account created. You can sign in now.
                        </p>
                    )}
                </div>


                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                    noValidate
                >

                    <label htmlFor="email">
                        Email address
                    </label>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                    />


                    <label htmlFor="password">
                        Password
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                    />


                    {error && (
                        <p className="form-error" role="alert">
                            {error}
                        </p>
                    )}


                    <button
                        className="button button-primary"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? 'Signing in...'
                            : 'Sign in'
                        }

                        <span aria-hidden="true">
                            →
                        </span>
                    </button>

                </form>


                <p className="switch-auth">
                    New to ShopKart?{' '}
                    <Link to="/register">
                        Create an account
                    </Link>
                </p>

            </section>
        </main>
    )
}

export default Login


