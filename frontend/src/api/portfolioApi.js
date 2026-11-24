import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const TOKEN_KEY = "jas_admin_token";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export const getAdminToken = () => localStorage.getItem(TOKEN_KEY);

export const setAdminToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

const authHeaders = (isMultipart = false) => {
  const token = getAdminToken();
  const headers = {};
  if (token) {
    headers.Authorization = `Token ${token}`;
  }
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

// Public Endpoints
export const fetchPortfolioData = async () => {
  const response = await apiClient.get("/portfolio/");
  return response.data;
};

export const trackVisit = async (path = "/") => {
  try {
    await apiClient.post("/track-visit/", { path });
  } catch {
    // Fail silently so visitor experience is never interrupted
  }
};

// Admin Auth
export const adminLogin = async (username, password) => {
  const response = await apiClient.post("/admin/login/", { username, password });
  return response.data;
};

// Admin Analytics & Stats
export const fetchAdminStats = async () => {
  const response = await apiClient.get("/admin/stats/", {
    headers: authHeaders(),
  });
  return response.data;
};

// Admin Profile CRUD
export const fetchAdminProfile = async () => {
  const response = await apiClient.get("/admin/profile/", {
    headers: authHeaders(),
  });
  return response.data;
};

export const updateAdminProfile = async (formData) => {
  const response = await apiClient.patch("/admin/profile/", formData, {
    headers: authHeaders(true),
  });
  return response.data;
};

// Admin Projects CRUD
export const fetchAdminProjects = async () => {
  const response = await apiClient.get("/admin/projects/", {
    headers: authHeaders(),
  });
  return response.data;
};

export const createAdminProject = async (formData) => {
  const response = await apiClient.post("/admin/projects/", formData, {
    headers: authHeaders(true),
  });
  return response.data;
};

export const updateAdminProject = async (id, formData) => {
  const response = await apiClient.patch(`/admin/projects/${id}/`, formData, {
    headers: authHeaders(true),
  });
  return response.data;
};

export const deleteAdminProject = async (id) => {
  await apiClient.delete(`/admin/projects/${id}/`, {
    headers: authHeaders(),
  });
};

// Admin Skills CRUD
export const fetchAdminSkills = async () => {
  const response = await apiClient.get("/admin/skills/", {
    headers: authHeaders(),
  });
  return response.data;
};

export const createAdminSkill = async (formData) => {
  const response = await apiClient.post("/admin/skills/", formData, {
    headers: authHeaders(true),
  });
  return response.data;
};

export const updateAdminSkill = async (id, formData) => {
  const response = await apiClient.patch(`/admin/skills/${id}/`, formData, {
    headers: authHeaders(true),
  });
  return response.data;
};

export const deleteAdminSkill = async (id) => {
  await apiClient.delete(`/admin/skills/${id}/`, {
    headers: authHeaders(),
  });
};

// Admin Social Links CRUD
export const fetchAdminSocials = async () => {
  const response = await apiClient.get("/admin/socials/", {
    headers: authHeaders(),
  });
  return response.data;
};

export const createAdminSocial = async (payload) => {
  const response = await apiClient.post("/admin/socials/", payload, {
    headers: authHeaders(),
  });
  return response.data;
};

export const updateAdminSocial = async (id, payload) => {
  const response = await apiClient.patch(`/admin/socials/${id}/`, payload, {
    headers: authHeaders(),
  });
  return response.data;
};

export const deleteAdminSocial = async (id) => {
  await apiClient.delete(`/admin/socials/${id}/`, {
    headers: authHeaders(),
  });
};

export default apiClient;