import { Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import SpacesPage from "./pages/SpacesPage.jsx";
import SpaceDetailsPage from "./pages/SpaceDetailsPage.jsx";
import ModeratorDashboard from "./pages/ModeratorDashboard.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ModeratorRoute from "./components/ModeratorRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/spaces" element={<SpacesPage />} />
        <Route path="/spaces/:id" element={<SpaceDetailsPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<ModeratorRoute />}>
            <Route path="/moderator" element={<ModeratorDashboard />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
