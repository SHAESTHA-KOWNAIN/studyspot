import { http, normalizeResponse } from "./axios.js";
import * as mock from "../services/mockReportService.js";

const useMock = import.meta.env.VITE_USE_MOCK_API !== "false";

export async function getSpaceReports(spaceId) {
  if (useMock) return mock.getSpaceReports(spaceId);
  const result = normalizeResponse(await http.get(`/spaces/${encodeURIComponent(spaceId)}/reports`));
  return Array.isArray(result) ? result : result?.reports ?? [];
}

export async function createSpaceReport(spaceId, reportData, reporter) {
  if (useMock) return mock.createSpaceReport(spaceId, reportData, reporter);
  const result = normalizeResponse(await http.post(`/spaces/${encodeURIComponent(spaceId)}/reports`, reportData));
  return result?.report ?? result;
}
