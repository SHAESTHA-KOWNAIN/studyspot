import { getFreshness } from "../utils/statusUtils.js";

export default function FreshnessBadge({ timestamp }) {
  const freshness = getFreshness(timestamp);
  if (freshness === "none") return null;
  return <span className={`freshness-badge freshness-${freshness}`}>{freshness === "fresh" ? "Fresh" : "Stale"}</span>;
}
