// src/api/index.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export const getProducts = () => api.get('/products');
export const createProduct = (data) => api.post('/products', data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
