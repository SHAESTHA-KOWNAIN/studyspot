import { http, normalizeResponse } from "./axios.js";
import * as mock from "../services/mockAuthService.js";

const useMock = import.meta.env.VITE_USE_MOCK_API !== "false";

export async function login(credentials) {
  if (useMock) return mock.login(credentials);
  const result = normalizeResponse(await http.post("/auth/login", credentials));
  if (result?.token) sessionStorage.setItem("studyspot-api-token", result.token);
  const user = result?.user ?? result;
  sessionStorage.setItem("studyspot-api-user", JSON.stringify(user));
  return user;
}

export async function register(userData) {
  if (useMock) return mock.register(userData);
  const result = normalizeResponse(await http.post("/auth/register", userData));
  if (result?.token) sessionStorage.setItem("studyspot-api-token", result.token);
  const user = result?.user ?? result;
  sessionStorage.setItem("studyspot-api-user", JSON.stringify(user));
  return user;
}

export async function logout() {
  if (useMock) return mock.logout();
  sessionStorage.removeItem("studyspot-api-token");
  sessionStorage.removeItem("studyspot-api-user");
}

export async function getCurrentUser() {
  if (useMock) return mock.getCurrentUser();
  const user = sessionStorage.getItem("studyspot-api-user");
  return user ? JSON.parse(user) : null;
}
