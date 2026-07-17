import axios from "axios";

const API = axios.create({
  baseURL: "grievance-portal-production-1c12.up.railway.app",
});

// Automatically attach the login token (if it exists) to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;