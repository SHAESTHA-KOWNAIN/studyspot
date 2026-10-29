import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("studyspot-api-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("studyspot-api-token");
      sessionStorage.removeItem("studyspot-api-user");
      window.dispatchEvent(new Event("studyspot:unauthorized"));
    }
    return Promise.reject(error);
  },
);

export function normalizeResponse(response) {
  return response?.data?.data ?? response?.data;
}
