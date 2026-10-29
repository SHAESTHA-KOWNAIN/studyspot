import { ArrowUpRight, MapPin, Users, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import { latestReport } from "../utils/statusUtils.js";
import { formatDate, timeAgo } from "../utils/dateUtils.js";
import StatusBadge from "./StatusBadge.jsx";
import FreshnessBadge from "./FreshnessBadge.jsx";

export default function SpaceCard({ space, reports }) {
  const latest = latestReport(reports);
  return (
    <article className="space-card">
      <div className="space-card-top">
        <StatusBadge status={latest?.status} />
        {latest && <FreshnessBadge timestamp={latest.createdAt} />}
      </div>
      <h2>{space.name}</h2>
      <p className="space-location"><MapPin size={15} aria-hidden="true" /> {space.building} <span aria-hidden="true">·</span> {space.area}</p>
      <p className="space-description">{space.description}</p>
      <div className="space-flags">
        <span>{space.quietZone ? <VolumeX size={14} /> : <Users size={14} />}{space.quietZone ? "Quiet zone" : "Conversation okay"}</span>
        <span><Users size={14} />{space.groupStudyAllowed ? "Group study" : "Individual study"}</span>
      </div>
      <div className="facility-list">{space.facilities.slice(0, 4).map((facility) => <span className="facility-chip" key={facility}>{facility}</span>)}</div>
      <div className="space-card-bottom">
        <span className="report-time" title={formatDate(latest?.createdAt)}>{latest ? `Reported ${timeAgo(latest.createdAt)}` : "Waiting for first report"}</span>
        <Link className="text-link" to={`/spaces/${space.id}`}>Details <ArrowUpRight size={15} /></Link>
      </div>
    </article>
  );
}
