import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ModeratorDashboard from "../pages/ModeratorDashboard.jsx";

const scrollIntoView = vi.fn();
const originalScrollIntoView = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");

beforeEach(() => {
  localStorage.clear();
  scrollIntoView.mockClear();
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });
  vi.stubGlobal("requestAnimationFrame", (callback) => {
    callback();
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalScrollIntoView) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScrollIntoView);
  else delete HTMLElement.prototype.scrollIntoView;
});

describe("moderator editor scrolling", () => {
  it("scrolls to the editor on Edit and Add, and updates the selected space values", async () => {
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><ModeratorDashboard /></MemoryRouter>);

    await screen.findAllByRole("button", { name: "Edit" });
    const centralLibraryRow = screen.getAllByRole("row").find((row) => within(row).queryByText("Central Library", { exact: true }));
    fireEvent.click(within(centralLibraryRow).getByRole("button", { name: "Edit" }));

    expect(await screen.findByRole("heading", { name: "Edit study space" })).toBeInTheDocument();
    expect(screen.getByText("Central Library", { selector: ".editor-space-name" })).toBeInTheDocument();
    expect(screen.getByLabelText("Space name")).toHaveValue("Central Library");
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" }));

    fireEvent.click(within(centralLibraryRow).getByRole("button", { name: "Edit" }));
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(2));

    const engineeringRow = screen.getAllByRole("row").find((row) => within(row).queryByText("Engineering Reading Room", { exact: true }));
    fireEvent.click(within(engineeringRow).getByRole("button", { name: "Edit" }));
    await waitFor(() => expect(screen.getByLabelText("Space name")).toHaveValue("Engineering Reading Room"));
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(3));

    fireEvent.click(screen.getByRole("button", { name: "Add space" }));
    expect(await screen.findByRole("heading", { name: "Create study space" })).toBeInTheDocument();
    expect(screen.getByLabelText("Space name")).toHaveValue("");
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(4));
  });
});
