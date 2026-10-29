import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ title, message, confirmLabel = "Confirm", onConfirm, onCancel, busy = false }) {
  const dialogRef = useRef(null);
  useEffect(() => { dialogRef.current?.focus(); }, []);
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description" tabIndex="-1" ref={dialogRef}>
        <span className="dialog-icon"><AlertTriangle size={22} /></span>
        <h2 id="dialog-title">{title}</h2>
        <p id="dialog-description">{message}</p>
        <div className="dialog-actions"><button className="button button-secondary" type="button" onClick={onCancel} disabled={busy}>Cancel</button><button className="button button-danger" type="button" onClick={onConfirm} disabled={busy}>{busy ? "Working..." : confirmLabel}</button></div>
      </section>
    </div>
  );
}
