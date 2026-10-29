export function formatDate(value) {
  if (!value) return "No reports yet";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function timeAgo(value, now = Date.now()) {
  if (!value) return "No reports yet";
  const reportTime = new Date(value).getTime();
  if (!Number.isFinite(reportTime)) return "Unknown date";
  const elapsedMinutes = Math.max(0, Math.floor((now - reportTime) / 60000));
  if (elapsedMinutes < 1) return "Just now";
  if (elapsedMinutes < 60) return `${elapsedMinutes} min ago`;
  const hours = Math.floor(elapsedMinutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
