import axios from 'axios';

const rawBaseUrl = (import.meta.env.VITE_API_URL || '/api').trim();
const normalizedBaseUrl = rawBaseUrl.startsWith('http')
  ? (rawBaseUrl.replace(/\/+$/, '').endsWith('/api')
      ? rawBaseUrl.replace(/\/+$/, '')
      : `${rawBaseUrl.replace(/\/+$/, '')}/api`)
  : (rawBaseUrl.startsWith('/') ? rawBaseUrl : `/${rawBaseUrl}`);

const api = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login handled by AuthContext/Router
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
