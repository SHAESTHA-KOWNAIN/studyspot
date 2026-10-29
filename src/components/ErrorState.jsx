import { AlertCircle } from "lucide-react";

export default function ErrorState({ message, onRetry }) {
  return <div className="state-panel error-state" role="alert"><AlertCircle size={21} /><div><strong>Something went wrong</strong><p>{message || "Please try again."}</p>{onRetry && <button className="button button-secondary button-small" type="button" onClick={onRetry}>Try again</button>}</div></div>;
}
