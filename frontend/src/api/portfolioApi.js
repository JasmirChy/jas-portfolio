import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchPortfolioData = async () => {
  const response = await apiClient.get("/portfolio/");
  return response.data;
};

export default apiClient;