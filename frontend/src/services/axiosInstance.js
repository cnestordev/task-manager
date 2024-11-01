import axios from 'axios';

const apiBaseUrl = import.meta.env.MODE === 'development'
  ? import.meta.env.VITE_BACKEND_LOCALHOST
  : import.meta.env.VITE_BACKEND_PRODUCTION;

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
