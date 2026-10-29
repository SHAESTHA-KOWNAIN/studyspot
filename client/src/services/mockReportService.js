import { REPORT_STATUSES } from "../utils/statusUtils.js";
import { readReports, readSpaces, writeReports } from "./mockStorage.js";

export async function getSpaceReports(spaceId) {
  if (!readSpaces().some((space) => space.id === spaceId)) throw new Error("Study space not found.");
  return readReports().filter((report) => report.spaceId === spaceId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function createSpaceReport(spaceId, reportData, reporter) {
  if (!readSpaces().some((space) => space.id === spaceId && space.active)) throw new Error("Study space not found.");
  if (!REPORT_STATUSES.includes(reportData.status)) throw new Error("Choose a valid availability status.");
  if ((reportData.note ?? "").length > 300) throw new Error("Notes must be 300 characters or fewer.");
  const reports = readReports();
  const report = {
    id: `report-${crypto.randomUUID()}`,
    spaceId,
    reporterId: reporter.id,
    reporterName: reporter.name,
    status: reportData.status,
    note: reportData.note?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };
  reports.push(report);
  writeReports(reports);
  return report;
}
