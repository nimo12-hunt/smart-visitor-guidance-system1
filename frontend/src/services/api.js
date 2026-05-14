import axios from "axios";

// Create axios instance with base URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Required for sending/receiving HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add token
API.interceptors.request.use(
  (config) => {
    // FIXED: Use "adminToken" instead of "token"
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminAuthenticated");
      localStorage.removeItem("adminUser");
      // Redirect to login unless already on the admin login route
      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error - please check your connection");
      return Promise.reject({
        message: "Network error. Please check your connection.",
        original: error,
      });
    }

    return Promise.reject(error);
  },
);

export default API;
