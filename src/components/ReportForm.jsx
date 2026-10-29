import { useState } from "react";
import { Send } from "lucide-react";
import { REPORT_STATUSES } from "../utils/statusUtils.js";
import { validateReport } from "../utils/validation.js";

export default function ReportForm({ onSubmit }) {
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateReport({ status, note });
    setErrors(nextErrors);
    setFeedback(null);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    try {
      await onSubmit({ status, note });
      setFeedback({ type: "success", text: "Thanks — your update has been shared." });
      setStatus("");
      setNote("");
    } catch (error) {
      setFeedback({ type: "error", text: error.message || "Your report could not be submitted." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="report-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="report-status">Current availability <span className="required">*</span></label>
      <select id="report-status" value={status} onChange={(event) => setStatus(event.target.value)} aria-invalid={Boolean(errors.status)}>
        <option value="">Choose a status</option>{REPORT_STATUSES.map((item) => <option key={item}>{item}</option>)}
      </select>
      {errors.status && <span className="field-error">{errors.status}</span>}
      <label htmlFor="report-note">Add a note <span className="muted">(optional)</span></label>
      <textarea id="report-note" rows="3" maxLength="300" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Share a helpful detail, like where you found a seat." aria-describedby="note-count" />
      <span className="character-count" id="note-count">{note.length}/300</span>
      {errors.note && <span className="field-error">{errors.note}</span>}
      {feedback && <p className={`inline-feedback ${feedback.type}`} role="status">{feedback.text}</p>}
      <button className="button button-primary" type="submit" disabled={submitting}><Send size={16} />{submitting ? "Sharing..." : "Share an update"}</button>
    </form>
  );
}
