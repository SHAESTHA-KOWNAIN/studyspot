const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const mockReports = [
  { id: "report-001", spaceId: "central-library", reporterId: "demo-member", reporterName: "Avery M.", status: "Available", note: "Plenty of desks on the east side.", createdAt: hoursAgo(0.35) },
  { id: "report-002", spaceId: "central-library", reporterId: "demo-moderator", reporterName: "Jordan R.", status: "Moderately Busy", note: "A few tables are filling up.", createdAt: hoursAgo(4.5) },
  { id: "report-003", spaceId: "digital-library", reporterId: "demo-member", reporterName: "Sam K.", status: "Busy", note: "Most workstations are occupied.", createdAt: hoursAgo(1.1) },
  { id: "report-004", spaceId: "engineering-reading", reporterId: "demo-member", reporterName: "Riley T.", status: "Moderately Busy", note: "Some open seats near the windows.", createdAt: hoursAgo(3) },
  { id: "report-005", spaceId: "science-study", reporterId: "demo-moderator", reporterName: "Jordan R.", status: "Available", note: "", createdAt: hoursAgo(0.8) },
  { id: "report-006", spaceId: "research-scholars", reporterId: "demo-member", reporterName: "Avery M.", status: "Busy", note: "Full during the afternoon.", createdAt: hoursAgo(5) },
  { id: "report-007", spaceId: "quiet-study", reporterId: "demo-member", reporterName: "Sam K.", status: "Available", note: "Quiet with several open carrels.", createdAt: hoursAgo(26) },
  { id: "report-008", spaceId: "group-room-a", reporterId: "demo-member", reporterName: "Riley T.", status: "Temporarily Closed", note: "Room is being cleaned.", createdAt: hoursAgo(0.4) },
  { id: "report-009", spaceId: "group-room-b", reporterId: "demo-moderator", reporterName: "Jordan R.", status: "Moderately Busy", note: "One table is currently free.", createdAt: hoursAgo(1.6) },
  { id: "report-010", spaceId: "humanities-hall", reporterId: "demo-member", reporterName: "Avery M.", status: "Available", note: "Quiet this morning.", createdAt: hoursAgo(28) },
];
