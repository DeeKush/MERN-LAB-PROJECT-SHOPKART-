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

