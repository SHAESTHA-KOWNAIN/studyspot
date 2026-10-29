import { SearchX } from "lucide-react";

export default function EmptyState({ title = "No spaces found", children }) {
  return <div className="empty-panel"><span className="empty-icon"><SearchX size={23} /></span><h2>{title}</h2><p>{children}</p></div>;
}
