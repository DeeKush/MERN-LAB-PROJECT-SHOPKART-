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


