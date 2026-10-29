import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content"><Outlet /></main>
      <Footer />
    </div>
  );
}
