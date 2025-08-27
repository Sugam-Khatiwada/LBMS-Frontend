import axios from 'axios';

// Base URL for all API requests.
// Used by the axios instance below to build request URLs.
export const baseURL = 'http://localhost:8000/api';
// Application display name (used across UI for consistent branding)
export const APP_NAME = 'BookHub';

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * - Purpose: Run before each request is sent.
 * - What it does: Reads a token from localStorage and, if present,
 *   attaches it as a Bearer Authorization header to outgoing requests.
 * - Returns: the (possibly modified) config to continue the request.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // If an error occurs while building the request, reject the promise so
    // calling code can handle the error.
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * - Purpose: Handle responses and global HTTP errors.
 * - What it does: Passes successful responses through unchanged.
 *   If a 401 Unauthorized response is received, it clears the stored token
 *   and redirects the browser to the root (login) page.
 * - Returns: the response on success or rejects with the error.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and force a navigation to the login/root page.
      localStorage.removeItem("token");
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Export the configured axios instance for use across the app.
export default api;