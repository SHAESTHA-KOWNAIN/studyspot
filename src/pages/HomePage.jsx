import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Check, Clock3, MapPin, Search, UsersRound } from "lucide-react";

const highlights = [
  { icon: Search, title: "Find a good fit", text: "Filter campus spaces by building, facilities, quiet zones, and group-study suitability." },
  { icon: UsersRound, title: "Help your community", text: "Share a quick update so other students can make a more informed choice." },
  { icon: Clock3, title: "See when it was shared", text: "Each update shows its timestamp and whether it is still within the freshness window." },
];

export default function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> A little more focus, wherever you study</span>
            <h1>Find your next<br /><span>place to focus.</span></h1>
            <p className="hero-description">Discover libraries, quiet corners, and spaces to work together. StudySpot brings student-reported availability into one simple campus guide.</p>
            <div className="hero-actions"><Link className="button button-primary button-large" to="/spaces">Explore study spaces <ArrowRight size={17} /></Link><Link className="button button-secondary button-large" to="/register">Join the community</Link></div>
            <p className="hero-disclaimer"><Clock3 size={14} /> Availability is community-reported and may become outdated.</p>
          </div>
          <div className="hero-visual" aria-label="Illustration of study space information">
            <div className="visual-topline"><span className="visual-dot" /><span>YOUR CAMPUS, AT A GLANCE</span><span className="visual-date">Community updates</span></div>
            <div className="visual-heading"><div><span className="mini-label">RECENTLY REPORTED</span><h2>Places to settle in</h2></div><span className="visual-icon"><MapPin size={19} /></span></div>
            <div className="visual-space"><span className="visual-space-icon"><BookOpen size={18} /></span><div className="visual-space-name"><strong>Central Library</strong><small>Main Block · Level 2</small></div><span className="visual-status visual-status-green"><span />Available</span></div>
            <div className="visual-space"><span className="visual-space-icon muted-icon"><UsersRound size={18} /></span><div className="visual-space-name"><strong>Learning Commons</strong><small>Student Centre · Level 2</small></div><span className="visual-status visual-status-yellow"><span />Moderately busy</span></div>
            <div className="visual-space"><span className="visual-space-icon muted-icon"><Check size={18} /></span><div className="visual-space-name"><strong>Quiet Study Zone</strong><small>Central Library · Level 4</small></div><span className="visual-status visual-status-gray"><span />Updated earlier</span></div>
            <div className="visual-footnote"><span><Clock3 size={13} /> Reports shown as examples</span><span>Not live occupancy</span></div>
          </div>
        </div>
      </section>
      <section className="container features-section">
        <div className="section-heading"><span className="eyebrow">A better study session starts here</span><h2>Campus spaces, made easier to find.</h2><p>Useful details and recent community notes help you choose a space that suits the way you study.</p></div>
        <div className="feature-grid">{highlights.map(({ icon: Icon, title, text }) => <article className="feature-card" key={title}><span className="feature-icon"><Icon size={20} /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>
      <section className="bottom-cta"><div className="container cta-inner"><div><span className="eyebrow">Your next study spot is waiting</span><h2>Take a look around campus.</h2><p>Browse spaces and community reports before you head out.</p></div><Link className="button button-primary button-large" to="/spaces">Browse spaces <ArrowRight size={17} /></Link></div></section>
    </>
  );
}
