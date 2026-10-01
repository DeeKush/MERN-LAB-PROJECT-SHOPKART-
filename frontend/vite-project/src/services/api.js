import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8088/',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export const getCurrentCustomer = async () => {
  const response = await api.get('/customers/me')
  return response.data.customerData
}

export const logoutCustomer = async () => {
  const response = await api.post('/customers/logout')
  return response.data
}

export const getProducts = async ({ search, category } = {}) => {
  const response = await api.get('/products', { params: { search, category } })
  return response.data
}

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`)
  return response.data.product
}

export const getWishlist = async () => {
  const response = await api.get('/wishlist')
  return response.data.wishlist
}

export const addToWishlist = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`)
  return response.data
}

export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`)
  return response.data
}

export const getCart = async () => {
  const response = await api.get('/cart')
  return response.data.cart
}

export const addToCartApi = async (productId) => {
  const response = await api.post(`/cart/${productId}`)
  return response.data
}

export const updateCartItemApi = async (productId, quantity) => {
  const response = await api.patch(`/cart/${productId}`, { quantity })
  return response.data
}

export const removeFromCartApi = async (productId) => {
  const response = await api.delete(`/cart/${productId}`)
  return response.data
}

