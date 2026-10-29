import { CheckCircle2, XCircle, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;
  const Icon = type === "error" ? XCircle : CheckCircle2;
  return <div className={`toast toast-${type}`} role={type === "error" ? "alert" : "status"}><Icon size={18} /><span>{message}</span><button type="button" aria-label="Dismiss notification" onClick={onClose}><X size={16} /></button></div>;
}
