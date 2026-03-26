import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (credentials) => apiClient.post('/auth/login', credentials);
export const register = (userData) => apiClient.post('/auth/register', userData);

// Products
export const getProducts = () => apiClient.get('/products');
export const createProduct = (product) => apiClient.post('/products', product);
export const deleteProduct = (id) => apiClient.delete(`/products/${id}`);

// Users
export const getUsers = () => apiClient.get('/users');
export const deleteUser = (id) => apiClient.delete(`/users/${id}`);

// Upload
export const uploadImage = (formData) => apiClient.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export default apiClient;
