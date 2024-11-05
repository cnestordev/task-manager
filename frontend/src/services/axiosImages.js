import axios from 'axios';


const environment = import.meta.env.VITE_MODE;

const apiBaseUrl = environment === 'development'
    ? import.meta.env.VITE_BACKEND_LOCALHOST
    : import.meta.env.VITE_BACKEND_API_URL;

const axiosImageUpload = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
});

export default axiosImageUpload;