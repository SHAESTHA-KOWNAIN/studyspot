import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { BookOpen, LogOut, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout, isModerator } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    navigate("/");
  }

  const closeMenu = () => setMenuOpen(false);
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Link className="brand" to="/" onClick={closeMenu} aria-label="StudySpot home">
          <span className="brand-mark"><BookOpen size={19} aria-hidden="true" /></span>
          <span>StudySpot</span>
        </Link>
        <button className="icon-button mobile-menu-button" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`nav-links${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
          <NavLink to="/spaces" onClick={closeMenu}>Find a space</NavLink>
          {isModerator && <NavLink to="/moderator" onClick={closeMenu}><ShieldCheck size={16} /> Manage</NavLink>}
          {user ? (
            <div className="nav-user">
              <span className="nav-user-name"><UserRound size={16} /> {user.name}</span>
              <button className="button button-quiet button-small" type="button" onClick={handleLogout}><LogOut size={15} /> Log out</button>
            </div>
          ) : (
            <div className="nav-auth">
              <NavLink to="/login" onClick={closeMenu}>Log in</NavLink>
              <Link className="button button-primary button-small" to="/register" onClick={closeMenu}>Create account</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
