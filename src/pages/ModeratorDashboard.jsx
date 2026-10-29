import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, Building2, CircleAlert, Plus, RotateCcw, Search, ShieldCheck, Users } from "lucide-react";
import { createSpace, deactivateSpace, getSpaces, resetSampleData, updateSpace } from "../api/spacesApi.js";
import { getSpaceReports } from "../api/reportsApi.js";
import { getFreshness, latestReport, REPORT_STATUSES } from "../utils/statusUtils.js";
import { formatDate } from "../utils/dateUtils.js";
import { validateSpace } from "../utils/validation.js";
import StatusBadge from "../components/StatusBadge.jsx";
import FreshnessBadge from "../components/FreshnessBadge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import Toast from "../components/Toast.jsx";

const blankSpace = { name: "", building: "", area: "", description: "", facilities: [], quietZone: false, groupStudyAllowed: false, active: true };

function SpaceEditor({ initial, onSave, onCancel, submitting, formRef }) {
  const [values, setValues] = useState(initial ?? blankSpace);
  const [facilitiesText, setFacilitiesText] = useState((initial?.facilities ?? []).join(", "));
  const [errors, setErrors] = useState({});
  const setField = (field, value) => setValues((current) => ({ ...current, [field]: value }));

  function submit(event) {
    event.preventDefault();
    const data = { ...values, facilities: facilitiesText.split(",").map((item) => item.trim()).filter(Boolean) };
    const nextErrors = validateSpace(data);
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) onSave(data);
  }

  return (
    <form className="space-editor" ref={formRef} onSubmit={submit} noValidate>
      <div className="editor-heading"><div><span className="eyebrow">{initial ? "Update listing" : "Add a listing"}</span><h2>{initial ? "Edit study space" : "Create study space"}</h2>{initial && <p className="editor-space-name">{initial.name}</p>}</div></div>
      <div className="editor-grid">
        <label>Space name<input value={values.name} onChange={(event) => setField("name", event.target.value)} aria-invalid={Boolean(errors.name)} />{errors.name && <span className="field-error">{errors.name}</span>}</label>
        <label>Building<input value={values.building} onChange={(event) => setField("building", event.target.value)} aria-invalid={Boolean(errors.building)} />{errors.building && <span className="field-error">{errors.building}</span>}</label>
        <label>Area<input value={values.area} onChange={(event) => setField("area", event.target.value)} aria-invalid={Boolean(errors.area)} />{errors.area && <span className="field-error">{errors.area}</span>}</label>
        <label className="editor-wide">Description<textarea rows="3" value={values.description} onChange={(event) => setField("description", event.target.value)} aria-invalid={Boolean(errors.description)} />{errors.description && <span className="field-error">{errors.description}</span>}</label>
        <label className="editor-wide">Facilities <span className="muted">(comma separated)</span><input value={facilitiesText} onChange={(event) => setFacilitiesText(event.target.value)} placeholder="Wi-Fi, Power outlets" /></label>
      </div>
      <div className="checkbox-row">
        <label className="checkbox-label"><input type="checkbox" checked={values.quietZone} onChange={(event) => setField("quietZone", event.target.checked)} /> Quiet zone</label>
        <label className="checkbox-label"><input type="checkbox" checked={values.groupStudyAllowed} onChange={(event) => setField("groupStudyAllowed", event.target.checked)} /> Group study allowed</label>
        {initial && <label className="checkbox-label"><input type="checkbox" checked={values.active} onChange={(event) => setField("active", event.target.checked)} /> Active</label>}
      </div>
      <div className="editor-actions"><button className="button button-secondary" type="button" onClick={onCancel} disabled={submitting}>Cancel</button><button className="button button-primary" type="submit" disabled={submitting}>{submitting ? "Saving..." : initial ? "Save changes" : "Create space"}</button></div>
    </form>
  );
}

export default function ModeratorDashboard() {
  const [spaces, setSpaces] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [editing, setEditing] = useState(null);
  const [scrollRequest, setScrollRequest] = useState(0);
  const formRef = useRef(null);
  const [formBusy, setFormBusy] = useState(false);
  const [deactivating, setDeactivating] = useState(null);
  const [dialogBusy, setDialogBusy] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const allSpaces = await getSpaces({ includeInactive: true });
      const reportGroups = await Promise.all(allSpaces.map((space) => getSpaceReports(space.id)));
      setSpaces(allSpaces);
      setReports(reportGroups.flat());
    } catch (loadError) {
      setError(loadError.message || "The management dashboard could not be loaded.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (!scrollRequest) return undefined;
    const frame = requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [scrollRequest]);

  function startEditing(space) {
    setEditing({ ...space });
    setScrollRequest((request) => request + 1);
  }

  function startCreating() {
    setEditing({ ...blankSpace });
    setScrollRequest((request) => request + 1);
  }

  const reportBySpace = useMemo(() => new Map(spaces.map((space) => [space.id, latestReport(reports.filter((report) => report.spaceId === space.id))])), [spaces, reports]);
  const activeSpaces = spaces.filter((space) => space.active);
  const withReports = activeSpaces.filter((space) => reportBySpace.get(space.id));
  const staleCount = withReports.filter((space) => getFreshness(reportBySpace.get(space.id)?.createdAt) === "stale").length;
  const visibleSpaces = spaces.filter((space) => {
    if (visibility === "active" && !space.active) return false;
    if (visibility === "inactive" && space.active) return false;
    const query = search.trim().toLowerCase();
    return !query || [space.name, space.building, space.area].some((value) => value.toLowerCase().includes(query));
  });

  async function saveSpace(data) {
    setFormBusy(true);
    try {
      if (editing?.id) await updateSpace(editing.id, data);
      else await createSpace(data);
      setEditing(null);
      setToast({ type: "success", message: editing?.id ? "Study space updated." : "Study space created." });
      await loadData();
    } catch (saveError) {
      setToast({ type: "error", message: saveError.message || "The study space could not be saved." });
    } finally { setFormBusy(false); }
  }

  async function confirmDeactivate() {
    if (!deactivating) return;
    setDialogBusy(true);
    try {
      await deactivateSpace(deactivating.id);
      setToast({ type: "success", message: `${deactivating.name} is no longer listed publicly.` });
      setDeactivating(null);
      await loadData();
    } catch (actionError) {
      setToast({ type: "error", message: actionError.message || "The space could not be deactivated." });
    } finally { setDialogBusy(false); }
  }

  async function confirmReset() {
    setDialogBusy(true);
    try {
      await resetSampleData();
      setResetOpen(false);
      setToast({ type: "success", message: "Sample spaces and reports have been restored." });
      await loadData();
    } catch (actionError) {
      setToast({ type: "error", message: actionError.message || "Sample data could not be reset." });
    } finally { setDialogBusy(false); }
  }

  return (
    <div className="container page-container moderator-page">
      <div className="page-heading moderator-heading"><div><span className="eyebrow"><ShieldCheck size={14} /> Moderator tools</span><h1>Space management</h1><p>Keep campus listings useful and up to date for the community.</p></div><div className="moderator-actions"><button className="button button-secondary button-small" type="button" onClick={() => setResetOpen(true)}><RotateCcw size={15} /> Reset sample data</button><button className="button button-primary" type="button" onClick={startCreating}><Plus size={16} /> Add space</button></div></div>
      <div className="stats-grid">
        <article className="stat-card"><span className="stat-icon blue"><Building2 size={19} /></span><div><span>Active spaces</span><strong>{loading ? "—" : activeSpaces.length}</strong></div></article>
        <article className="stat-card"><span className="stat-icon green"><Activity size={19} /></span><div><span>With reports</span><strong>{loading ? "—" : withReports.length}</strong></div></article>
        <article className="stat-card"><span className="stat-icon amber"><CircleAlert size={19} /></span><div><span>Stale reports</span><strong>{loading ? "—" : staleCount}</strong></div></article>
        <article className="stat-card"><span className="stat-icon violet"><Users size={19} /></span><div><span>Total reports</span><strong>{loading ? "—" : reports.length}</strong></div></article>
      </div>
      {editing && <SpaceEditor key={editing.id || "new"} initial={editing.id ? editing : null} onSave={saveSpace} onCancel={() => setEditing(null)} submitting={formBusy} formRef={formRef} />}
      <section className="management-section">
        <div className="management-toolbar"><div><span className="eyebrow">Campus directory</span><h2>Manage spaces</h2></div><div className="table-filters"><label className="table-search"><Search size={16} /><span className="sr-only">Search spaces</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search spaces..." /></label><label className="sr-only" htmlFor="space-visibility">Filter spaces</label><select id="space-visibility" value={visibility} onChange={(event) => setVisibility(event.target.value)}><option value="all">All spaces</option><option value="active">Active only</option><option value="inactive">Inactive only</option></select></div></div>
        {loading ? <LoadingState label="Loading managed spaces..." /> : error ? <ErrorState message={error} onRetry={loadData} /> : visibleSpaces.length === 0 ? <EmptyState title={spaces.length ? "No matching spaces" : "No spaces yet"}>{spaces.length ? "Change your search or visibility filter to see other listings." : "Create a study space to begin building the campus directory."}</EmptyState> : (
          <div className="management-table-wrap"><table className="management-table"><thead><tr><th>Study space</th><th>Latest report</th><th>Updated</th><th>Listing</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
            {visibleSpaces.map((space) => {
              const latest = reportBySpace.get(space.id);
              return <tr key={space.id}><td><strong>{space.name}</strong><span>{space.building} · {space.area}</span></td><td><StatusBadge status={latest?.status} />{latest && <FreshnessBadge timestamp={latest.createdAt} />}</td><td>{latest ? formatDate(latest.createdAt) : "—"}</td><td><span className={`listing-state ${space.active ? "listing-active" : "listing-inactive"}`}>{space.active ? "Active" : "Inactive"}</span></td><td><div className="table-actions"><button type="button" className="button button-quiet button-small" onClick={() => startEditing(space)}>Edit</button>{space.active && <button type="button" className="button button-quiet button-small deactivate-button" onClick={() => setDeactivating(space)}>Deactivate</button>}</div></td></tr>;
            })}
          </tbody></table></div>
        )}
      </section>
      <p className="admin-note">Reports remain in history when a space is deactivated. The development sample-data reset is available only in mock API mode.</p>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      {deactivating && <ConfirmDialog title="Deactivate this space?" message={`${deactivating.name} will be hidden from the public directory. Existing reports will be preserved.`} confirmLabel="Deactivate space" onCancel={() => setDeactivating(null)} onConfirm={confirmDeactivate} busy={dialogBusy} />}
      {resetOpen && <ConfirmDialog title="Reset sample data?" message="Your mock spaces, reports, and registered demo accounts will be restored to the original sample set. This cannot be undone." confirmLabel="Reset sample data" onCancel={() => setResetOpen(false)} onConfirm={confirmReset} busy={dialogBusy} />}
    </div>
  );
}
