export const REPORT_STATUSES = ["Available", "Moderately Busy", "Busy", "Temporarily Closed"];
const configuredThreshold = Number(import.meta.env.VITE_STALE_AFTER_HOURS);
const defaultThresholdHours = Number.isFinite(configuredThreshold) && configuredThreshold >= 0 ? configuredThreshold : 2;

export function getFreshness(timestamp, thresholdHours = defaultThresholdHours, now = Date.now()) {
  if (!timestamp) return "none";
  const reportTime = new Date(timestamp).getTime();
  if (!Number.isFinite(reportTime)) return "stale";
  return now - reportTime <= thresholdHours * 60 * 60 * 1000 ? "fresh" : "stale";
}

export function latestReport(reports = []) {
  return [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] ?? null;
}

export function filterSpaces(spaces, reports, filters = {}) {
  const reportBySpace = new Map();
  reports.forEach((report) => {
    const current = reportBySpace.get(report.spaceId);
    if (!current || new Date(report.createdAt) > new Date(current.createdAt)) reportBySpace.set(report.spaceId, report);
  });
  const search = (filters.search ?? "").trim().toLowerCase();
  return spaces.filter((space) => {
    if (!space.active && !filters.includeInactive) return false;
    if (search && ![space.name, space.building, space.area, space.description].some((value) => value.toLowerCase().includes(search))) return false;
    if (filters.building && space.building !== filters.building) return false;
    if (filters.area && space.area !== filters.area) return false;
    if (filters.quietZone !== "" && filters.quietZone !== undefined && space.quietZone !== (filters.quietZone === true || filters.quietZone === "true")) return false;
    if (filters.groupStudyAllowed !== "" && filters.groupStudyAllowed !== undefined && space.groupStudyAllowed !== (filters.groupStudyAllowed === true || filters.groupStudyAllowed === "true")) return false;
    if (filters.facility && !space.facilities.includes(filters.facility)) return false;
    if (filters.status && reportBySpace.get(space.id)?.status !== filters.status) return false;
    return true;
  });
}
