import { createContext, useContext, useEffect, useState } from 'react'
import { getCart, addToCartApi, updateCartItemApi, removeFromCartApi } from '../services/api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [authRequired, setAuthRequired] = useState(false)

  const refreshCart = async () => {
    setLoading(true)
    setError('')
    setAuthRequired(false)

    try {
      setCart(await getCart())
    } catch (err) {
      setCart([])
      if (err.response?.status === 401) {
        setAuthRequired(true)
      } else {
        setError('Could not load your cart.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadInitialCart = async () => {
      try {
        setCart(await getCart())
      } catch (err) {
        setCart([])
        if (err.response?.status === 401) {
          setAuthRequired(true)
        } else {
          setError('Could not load your cart.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadInitialCart()
  }, [])

  const addToCart = async (productId) => {
    await addToCartApi(productId)
    await refreshCart()
  }

  const updateQuantity = async (productId, quantity) => {
    await updateCartItemApi(productId, quantity)
    await refreshCart()
  }

  const removeFromCart = async (productId) => {
    await removeFromCartApi(productId)
    await refreshCart()
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * (item.product?.price || 0), 0)

  return (
    <CartContext.Provider
      value={{ cart, loading, error, authRequired, totalItems, subtotal, addToCart, updateQuantity, removeFromCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- context provider + hook is the standard pattern
export function useCart() {
  return useContext(CartContext)
}
