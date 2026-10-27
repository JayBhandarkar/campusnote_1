import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cn_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or session terminated
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      // Don't auto-redirect if checking /auth/me or logging in
      if (!url.includes('/auth/login') && !url.includes('/auth/register') && !url.includes('/auth/me')) {
        localStorage.removeItem('cn_token');
        localStorage.removeItem('cn_user');
        window.location.href = '/login?sessionExpired=true';
      }
    }
    return Promise.reject(error);
  }
);
