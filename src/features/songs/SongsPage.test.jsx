import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

// ✅ Mock API
vi.mock("../../api/api.js", () => ({
  listWorkflows: vi.fn(() =>
    Promise.resolve({
      workflows: [{ id: "w1", slug: "default", name: "Default" }],
    })
  ),
  listJobs: vi.fn(() =>
    Promise.resolve([
      { id: "j1", name: "Wonderwall", status: "SUCCEEDED" },
      { id: "j2", name: "Yellow", status: "PENDING" },
    ])
  ),
  updateJobName: vi.fn(async (id, newName) => ({
    id,
    name: newName,
    status: "SUCCEEDED",
  })),
  deleteJob: vi.fn(async (id) => Promise.resolve()),
}));

import SongsPage from "./SongsPage.jsx";

// Helper to render page inside router
function renderPage() {
  return render(
    <MemoryRouter>
      <SongsPage />
    </MemoryRouter>
  );
}

describe("SongsPage", () => {
  it("renders initial list and search input", async () => {
    renderPage();
    expect(await screen.findByText(/My Songs/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search songs/i)).toBeInTheDocument();
    expect(screen.getByText(/Wonderwall/i)).toBeInTheDocument();
    expect(screen.getByText(/Yellow/i)).toBeInTheDocument();
  });

  it("filters by search term (debounced)", async () => {
    renderPage();
    const input = await screen.findByPlaceholderText(/search songs/i);
    await userEvent.type(input, "won");
    await new Promise((res) => setTimeout(res, 600));
    expect(screen.getByText(/Wonderwall/i)).toBeInTheDocument();
    expect(screen.queryByText(/Yellow/i)).not.toBeInTheDocument();
  });

  it("renames a job", async () => {
    const { updateJobName } = await import("../../api/api.js");
    renderPage();

    // Open the menu
    const menuButtons = await screen.findAllByRole("button", { name: "⋮" });
    await userEvent.click(menuButtons[0]);

    // Click Rename
    const renameBtn = await screen.findByRole("button", { name: /rename/i });
    await userEvent.click(renameBtn);

    // Find the rename input specifically (not the search box)
    const renameInput = screen.getByDisplayValue("Wonderwall");

    await userEvent.clear(renameInput);
    await userEvent.type(renameInput, "Wonderwall (Acoustic)");

    // Save
    const saveBtn = screen.getByRole("button", { name: /save/i });
    await userEvent.click(saveBtn);

    expect(updateJobName).toHaveBeenCalled();
    expect(
      await screen.findByText(/Wonderwall \(Acoustic\)/i)
    ).toBeInTheDocument();
  });
});
