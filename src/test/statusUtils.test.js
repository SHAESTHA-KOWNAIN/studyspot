import { describe, expect, it } from "vitest";
import { filterSpaces, getFreshness, latestReport } from "../utils/statusUtils.js";
import { mockSpaces } from "../data/mockSpaces.js";
import { mockReports } from "../data/mockReports.js";

describe("availability helpers", () => {
  it("calculates fresh, stale, and missing reports independently of status", () => {
    const now = new Date("2026-10-29T10:00:00Z").getTime();
    expect(getFreshness("2026-10-29T09:00:00Z", 2, now)).toBe("fresh");
    expect(getFreshness("2026-10-29T07:59:00Z", 2, now)).toBe("stale");
    expect(getFreshness(null, 2, now)).toBe("none");
  });

  it("renders a latest report based on timestamp, not array order", () => {
    const reports = [
      { status: "Busy", createdAt: "2026-10-28T08:00:00Z" },
      { status: "Available", createdAt: "2026-10-29T08:00:00Z" },
    ];
    expect(latestReport(reports).status).toBe("Available");
  });

  it("combines text, status, facilities, and suitability filters", () => {
    const result = filterSpaces(mockSpaces, mockReports, {
      search: "library",
      status: "Available",
      facility: "Wi-Fi",
      quietZone: "true",
      groupStudyAllowed: "false",
    });
    expect(result.map((space) => space.id)).toEqual(["central-library", "quiet-study"]);
  });
});
