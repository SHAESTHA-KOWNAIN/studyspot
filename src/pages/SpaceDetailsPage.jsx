import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, Clock3, MapPin, Users, VolumeX } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getSpaceById } from "../api/spacesApi.js";
import { createSpaceReport, getSpaceReports } from "../api/reportsApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import { latestReport, getFreshness } from "../utils/statusUtils.js";
import { formatDate } from "../utils/dateUtils.js";
import StatusBadge from "../components/StatusBadge.jsx";
import FreshnessBadge from "../components/FreshnessBadge.jsx";
import ReportForm from "../components/ReportForm.jsx";
import ReportHistory from "../components/ReportHistory.jsx";
import LoadingState from "../components/LoadingState.jsx";
import ErrorState from "../components/ErrorState.jsx";

export default function SpaceDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [space, setSpace] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [spaceData, reportData] = await Promise.all([getSpaceById(id), getSpaceReports(id)]);
      setSpace(spaceData);
      setReports(reportData);
    } catch (loadError) {
      setError(loadError.message || "Space details could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  async function submitReport(reportData) {
    const report = await createSpaceReport(id, reportData, user);
    setReports((current) => [report, ...current]);
  }

  if (loading) return <div className="container page-container"><LoadingState label="Loading space details..." /></div>;
  if (error || !space) return <div className="container page-container"><ErrorState message={error || "Study space not found."} onRetry={load} /><Link className="back-link" to="/spaces"><ArrowLeft size={16} /> Back to spaces</Link></div>;
  const latest = latestReport(reports);
  const freshness = getFreshness(latest?.createdAt);

  return (
    <div className="container page-container detail-page">
      <Link className="back-link" to="/spaces"><ArrowLeft size={16} /> All study spaces</Link>
      <section className="detail-hero">
        <div className="detail-main">
          <span className="eyebrow"><MapPin size={14} /> {space.building}</span>
          <h1>{space.name}</h1>
          <p className="detail-area">{space.area}</p>
          <p className="detail-description">{space.description}</p>
          <div className="detail-attributes"><span><VolumeX size={16} />{space.quietZone ? "Quiet zone" : "Not a quiet zone"}</span><span><Users size={16} />{space.groupStudyAllowed ? "Group study suitable" : "Individual study"}</span></div>
          <div className="detail-facilities"><h2>Facilities</h2><div className="facility-list">{space.facilities.map((facility) => <span className="facility-chip" key={facility}><Check size={13} />{facility}</span>)}</div></div>
        </div>
        <aside className="latest-report-card" aria-label="Latest community report">
          <span className="mini-label">LATEST COMMUNITY UPDATE</span>
          <div className="latest-status"><StatusBadge status={latest?.status} />{latest && <FreshnessBadge timestamp={latest.createdAt} />}</div>
          {latest ? <><p className="latest-time"><Clock3 size={15} /> Reported {formatDate(latest.createdAt)}</p><p className="freshness-explanation">{freshness === "fresh" ? "This report is within the freshness window." : "This update is older and may no longer reflect current conditions."}</p></> : <p className="freshness-explanation">There are no reports yet. Share an update if you have visited recently.</p>}
          <span className="community-note">Community-reported information can change.</span>
        </aside>
      </section>
      <div className="detail-lower-grid">
        <section className="content-card history-card"><div className="card-heading"><div><span className="eyebrow">Community notes</span><h2>Recent reports</h2></div><span className="report-count">{reports.length}</span></div><ReportHistory reports={reports} /></section>
        <section className="content-card contribution-card"><span className="eyebrow">Help the next student</span><h2>Share a quick update</h2>{user ? <ReportForm onSubmit={submitReport} /> : <div className="login-prompt"><p>Sign in to share a report with the campus community.</p><Link className="button button-primary" to="/login" state={{ from: { pathname: `/spaces/${id}` } }}>Log in to report</Link></div>}</section>
      </div>
    </div>
  );
}
