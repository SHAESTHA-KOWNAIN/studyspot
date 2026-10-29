import { http, normalizeResponse } from "./axios.js";
import * as mock from "../services/mockSpaceService.js";
import { resetMockData } from "../services/mockStorage.js";

const useMock = import.meta.env.VITE_USE_MOCK_API !== "false";

export async function getSpaces(filters = {}) {
  if (useMock) return mock.getSpaces(filters);
  const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined));
  const result = normalizeResponse(await http.get("/spaces", { params }));
  return Array.isArray(result) ? result : result?.spaces ?? [];
}

export async function getSpaceById(id) {
  if (useMock) return mock.getSpaceById(id);
  const result = normalizeResponse(await http.get(`/spaces/${encodeURIComponent(id)}`));
  return result?.space ?? result;
}

export async function createSpace(data) {
  if (useMock) return mock.createSpace(data);
  const result = normalizeResponse(await http.post("/spaces", data));
  return result?.space ?? result;
}

export async function updateSpace(id, data) {
  if (useMock) return mock.updateSpace(id, data);
  const result = normalizeResponse(await http.patch(`/spaces/${encodeURIComponent(id)}`, data));
  return result?.space ?? result;
}

export async function deactivateSpace(id) {
  if (useMock) return mock.deactivateSpace(id);
  const result = normalizeResponse(await http.delete(`/spaces/${encodeURIComponent(id)}`));
  return result?.space ?? result;
}

export async function resetSampleData() {
  if (!useMock) throw new Error("Sample-data reset is only available in mock API mode.");
  resetMockData();
}
