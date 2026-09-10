import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'

function Register() {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError('')
        setSuccess('')
        setIsSubmitting(true)

        try {
            const response = await api.post('/customers/register', form)

            console.log(response.data)

            setSuccess('User registered successfully!')

            setForm({
                fullName: '',
                email: '',
                password: '',
                phone: ''
            })

        } catch (error) {
            console.log(error)

            setError(
                error.response?.data?.message ||
                'Something went wrong. Please try again.'
            )

        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="auth-shell register-shell">

            <section className="auth-intro">
                <p className="eyebrow">A BETTER WAY TO BUY</p>

                <h1>Make room for the good stuff.</h1>

                <p className="intro-copy">
                    Create your ShopKart account and keep your next great
                    find close at hand.
                </p>

                <div className="intro-list">
                    <span>01</span> Curated everyday essentials
                </div>

                <div className="intro-list">
                    <span>02</span> A simpler way to shop
                </div>
            </section>

            <section className="auth-panel">

                <div className="panel-heading">
                    <p className="eyebrow">JOIN THE CLUB</p>
                    <h2>Create your account</h2>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                    noValidate
                >

                    {/* Full Name */}
                    <label htmlFor="fullName">
                        Full name
                    </label>

                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Alex Morgan"
                    />

                    {/* Email */}
                    <label htmlFor="register-email">
                        Email address
                    </label>

                    <input
                        id="register-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                    />

                    <div className="form-grid">

                        {/* Password */}
                        <div>
                            <label htmlFor="register-password">
                                Password
                            </label>

                            <input
                                id="register-password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="6+ characters"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone">
                                Phone number
                            </label>

                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="10 digits"
                            />
                        </div>

                    </div>

                    {/* Error */}
                    {error && (
                        <p
                            className="form-error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    {/* Success */}
                    {success && (
                        <p
                            className="form-success"
                            role="status"
                        >
                            {success}
                        </p>
                    )}

                    {/* Submit Button */}
                    <button
                        className="button button-primary"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? 'Creating account...'
                            : 'Create account'
                        }

                        <span aria-hidden="true">→</span>
                    </button>

                </form>

                <p className="switch-auth">
                    Already have an account?{' '}
                    <Link to="/login">
                        Sign in
                    </Link>
                </p>

            </section>
        </main>
    )
}

export default Register
