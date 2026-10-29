import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span>StudySpot <span className="muted">· Find a place to focus.</span></span>
        <span className="footer-note">Availability is community-reported and may be out of date.</span>
        <Link to="/spaces">Browse spaces</Link>
      </div>
    </footer>
  );
}
