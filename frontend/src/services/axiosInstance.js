import axios from 'axios';


const environment = import.meta.env.MODE

const apiBaseUrl = environment === 'development'
  ? import.meta.env.VITE_BACKEND_LOCALHOST
  : import.meta.env.VITE_BACKEND_API_URL;

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
