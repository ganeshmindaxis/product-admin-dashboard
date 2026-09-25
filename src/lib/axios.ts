import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = 'https://dummyjson.com';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Add Authorization header if token exists
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { message?: string };
      
      if (status === 401) {
        errorMessage = data.message || 'Unauthorized access. Please log in again.';
        if (typeof window !== 'undefined') {
          // Clear invalid token if auth fails
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      } else if (status === 404) {
        errorMessage = data.message || 'Resource not found.';
      } else if (status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (data.message) {
        errorMessage = data.message;
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;
