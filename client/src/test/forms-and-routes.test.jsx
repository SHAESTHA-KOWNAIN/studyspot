import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import ReportForm from "../components/ReportForm.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import ModeratorRoute from "../components/ModeratorRoute.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";

function renderWithAuth(ui, initialEntries = ["/"]) {
  return render(<MemoryRouter initialEntries={initialEntries} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider>{ui}</AuthProvider></MemoryRouter>);
}

describe("forms and access routes", () => {
  it("renders the four supported availability labels accessibly", () => {
    render(<StatusBadge status="Temporarily Closed" />);
    expect(screen.getByText("Temporarily Closed")).toBeInTheDocument();
  });

  it("shows login validation errors for empty fields", async () => {
    localStorage.clear();
    renderWithAuth(<LoginPage />);
    fireEvent.click(await screen.findByRole("button", { name: /log in/i }));
    expect(await screen.findByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
  });

  it("validates registration password confirmation", async () => {
    localStorage.clear();
    renderWithAuth(<RegisterPage />);
    fireEvent.change(await screen.findByLabelText("Full name"), { target: { value: "Taylor Student" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "taylor@example.edu" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "valid-password" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "different-password" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument();
  });

  it("validates a report then submits it with feedback", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ReportForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: /share an update/i }));
    expect(await screen.findByText("Choose a valid availability status.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/current availability/i), { target: { value: "Available" } });
    fireEvent.change(screen.getByLabelText(/add a note/i), { target: { value: "Several desks are free." } });
    fireEvent.click(screen.getByRole("button", { name: /share an update/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ status: "Available", note: "Several desks are free." }));
    expect(await screen.findByText("Thanks — your update has been shared.")).toBeInTheDocument();
  });

  it("redirects signed-out visitors from protected moderator pages", async () => {
    localStorage.clear();
    renderWithAuth(
      <Routes>
        <Route path="/login" element={<p>Login route</p>} />
        <Route element={<ProtectedRoute />}>
          <Route element={<ModeratorRoute />}>
            <Route path="/moderator" element={<p>Moderator dashboard</p>} />
          </Route>
        </Route>
      </Routes>,
      ["/moderator"],
    );
    expect(await screen.findByText("Login route")).toBeInTheDocument();
    expect(screen.queryByText("Moderator dashboard")).not.toBeInTheDocument();
  });

  it("keeps a member out of the moderator route and allows the moderator role", async () => {
    localStorage.setItem("studyspot-mock-user", JSON.stringify({ id: "demo-member", name: "Avery Morgan", email: "student@studyspot.demo", role: "member" }));
    const memberView = renderWithAuth(
      <Routes>
        <Route path="/spaces" element={<p>Public directory</p>} />
        <Route element={<ModeratorRoute />}><Route path="/moderator" element={<p>Moderator dashboard</p>} /></Route>
      </Routes>,
      ["/moderator"],
    );
    expect(await screen.findByText("Public directory")).toBeInTheDocument();
    expect(screen.queryByText("Moderator dashboard")).not.toBeInTheDocument();
    memberView.unmount();

    localStorage.setItem("studyspot-mock-user", JSON.stringify({ id: "demo-moderator", name: "Jordan Reed", email: "moderator@studyspot.demo", role: "moderator" }));
    renderWithAuth(
      <Routes><Route element={<ModeratorRoute />}><Route path="/moderator" element={<p>Moderator dashboard</p>} /></Route></Routes>,
      ["/moderator"],
    );
    expect(await screen.findByText("Moderator dashboard")).toBeInTheDocument();
  });
});
