import { beforeEach, describe, expect, it } from "vitest";
import { getSpaces, deactivateSpace, createSpace } from "../services/mockSpaceService.js";
import { createSpaceReport, getSpaceReports } from "../services/mockReportService.js";
import { resetMockData } from "../services/mockStorage.js";
import { latestReport } from "../utils/statusUtils.js";

beforeEach(() => {
  localStorage.clear();
  resetMockData();
});

describe("mock services", () => {
  it("persists submitted reports and derives the latest status from history", async () => {
    const report = await createSpaceReport("central-library", { status: "Busy", note: "Nearly full" }, { id: "test-user", name: "Test Student" });
    const history = await getSpaceReports("central-library");
    expect(history[0]).toEqual(report);
    expect(latestReport(history).status).toBe("Busy");
    expect(JSON.parse(localStorage.getItem("studyspot-mock-reports"))).toContainEqual(report);
  });

  it("keeps deactivated spaces out of the public directory and preserves their reports", async () => {
    const before = await getSpaceReports("central-library");
    await deactivateSpace("central-library");
    expect((await getSpaces()).some((space) => space.id === "central-library")).toBe(false);
    expect(await getSpaceReports("central-library")).toHaveLength(before.length);
  });

  it("creates a valid space that appears in the directory", async () => {
    const space = await createSpace({ name: "Test Room", building: "North Hall", area: "Room 1", description: "A test area.", facilities: ["Wi-Fi"], quietZone: false, groupStudyAllowed: true });
    expect((await getSpaces()).some((item) => item.id === space.id)).toBe(true);
  });
});
