/**
 * axiosInstance.js
 * Centralized Axios instance used by all API services.
 * - Reads base URL from REACT_APP_API_BASE.
 * - Attaches Authorization header from storage if a token is present.
 */

import axios from 'axios';

/**
 * Axios instance with preconfigured baseURL.
 * baseURL comes from REACT_APP_API_BASE to support different environments.
 */
const instance = axios.create({
  // Read from env so different builds (dev/staging/prod) can target different APIs.
  // If not provided, axios will use relative URLs as-is.
  baseURL: process.env.REACT_APP_API_BASE || undefined,
});

/**
 * Request interceptor
 * - Looks for a JWT token in localStorage, then sessionStorage.
 * - If found, adds an Authorization: Bearer <token> header.
 */
instance.interceptors.request.use(
  (config) => {
    // Prefer long-lived token first (remember me)
    let token = localStorage.getItem('token');
    if (!token) {
      // Fallback to session-only token
      token = sessionStorage.getItem('token');
    }
    if (token) {
      // Standard bearer token header expected by backend
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;