/**
 * API Service — Centralized HTTP client for backend communication.
 * 
 * CONCEPT: Axios Instance & Interceptors
 * Instead of configuring every API call individually, we create a
 * reusable Axios instance with:
 * 1. Base URL: All requests go to our backend
 * 2. Request Interceptor: Automatically attaches JWT token to every request
 * 3. Response Interceptor: Handles token expiry globally
 * 
 * This is the "Single Responsibility Principle" — one module handles all API logic.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create a configured Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * CONCEPT: Request Interceptor
 * Runs BEFORE every request is sent.
 * We use it to attach the JWT token from localStorage.
 * 
 * Flow: Component calls api.get('/tasks/') 
 *       → Interceptor adds "Authorization: Bearer <token>"
 *       → Request is sent to server
 */
api.interceptors.request.use(
  (config) => {
    const tokens = localStorage.getItem('tokens');
    if (tokens) {
      const { access } = JSON.parse(tokens);
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * CONCEPT: Response Interceptor
 * Runs AFTER every response is received.
 * If we get a 401 (token expired), we redirect to login.
 * 
 * Advanced: You could implement automatic token refresh here
 * using the refresh token, but for simplicity we redirect to login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('tokens');
      localStorage.removeItem('user');
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================
// Auth API calls
// ============================================================
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  getMe: () => api.get('/auth/me/'),
  getUsers: () => api.get('/auth/users/'),
};

// ============================================================
// Task API calls
// ============================================================
export const taskAPI = {
  list: () => api.get('/tasks/'),
  get: (id) => api.get(`/tasks/${id}/`),
  create: (data) => api.post('/tasks/', data),
  update: (id, data) => api.put(`/tasks/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/tasks/${id}/`, data),
  delete: (id) => api.delete(`/tasks/${id}/`),
};

export default api;