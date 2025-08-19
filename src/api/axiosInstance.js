
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || undefined,
});

instance.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token');
    if (!token) {
      token = sessionStorage.getItem('token');
    }
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;