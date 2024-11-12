import axios from 'axios';


const environment = import.meta.env.VITE_MODE;

const apiBaseUrl = environment === 'development'
  ? window.location.hostname === "localhost" ? import.meta.env.VITE_BACKEND_LOCALHOST : import.meta.env.VITE_BACKEND_LOCAL_IP
  : import.meta.env.VITE_BACKEND_API_URL;

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
