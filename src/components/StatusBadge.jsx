import { CircleDot } from "lucide-react";

const statusClass = {
  Available: "status-available",
  "Moderately Busy": "status-moderate",
  Busy: "status-busy",
  "Temporarily Closed": "status-closed",
};

export default function StatusBadge({ status }) {
  if (!status) return <span className="status-badge status-none">No reports yet</span>;
  return <span className={`status-badge ${statusClass[status] ?? "status-none"}`}><CircleDot size={13} aria-hidden="true" />{status}</span>;
}
