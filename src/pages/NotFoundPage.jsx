import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return <section className="container not-found"><span className="not-found-code">404</span><h1>This page wandered off.</h1><p>We couldn't find the page you were looking for.</p><Link className="button button-primary" to="/">Back to StudySpot</Link></section>;
}
