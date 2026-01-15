import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import SongsPage from "./SongsPage.jsx";

// 👇 Mock API
vi.mock("../../api/api.js", () => {
  return {
    listJobs: vi.fn(),
    deleteJob: vi.fn(),
    listWorkflows: vi.fn(() => Promise.resolve({ workflows: [] })),
    createJob: vi.fn(),
  };
});

import { listJobs, deleteJob } from "../../api/api.js";

beforeAll(() => {
  window.confirm = vi.fn(() => true); // always confirm delete
});

beforeEach(() => {
  vi.clearAllMocks();
});

function renderPage() {
  return render(
    <MemoryRouter>
      <SongsPage />
    </MemoryRouter>
  );
}

describe("SongsPage", () => {
  it("renders initial list and search input", async () => {
    listJobs.mockResolvedValueOnce([
      { id: "j1", name: "Wonderwall", status: "SUCCEEDED" },
      { id: "j2", name: "Yellow", status: "PENDING" },
    ]);

    renderPage();

    expect(await screen.findByText(/My Songs/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search songs/i)).toBeInTheDocument();
    expect(await screen.findByText(/Wonderwall/i)).toBeInTheDocument();
    expect(await screen.findByText(/Yellow/i)).toBeInTheDocument();
  });

  it("filters by search term (debounced)", async () => {
    listJobs.mockResolvedValueOnce([
      { id: "j1", name: "Wonderwall", status: "SUCCEEDED" },
      { id: "j2", name: "Yellow", status: "PENDING" },
    ]);

    renderPage();
    const input = await screen.findByPlaceholderText(/search songs/i);
    await userEvent.type(input, "won");

    await act(() => new Promise((res) => setTimeout(res, 600)));

    expect(screen.getByText(/Wonderwall/i)).toBeInTheDocument();
    expect(screen.queryByText(/Yellow/i)).not.toBeInTheDocument();
  });

  it("deletes a job", async () => {
    listJobs.mockResolvedValueOnce([
      { id: "j1", name: "Wonderwall", status: "SUCCEEDED" },
    ]);
    deleteJob.mockResolvedValueOnce();

    renderPage();

    await screen.findByText(/Wonderwall/i);

    // Open menu
    const menuButton = await screen.findByRole("button", { name: /menu/i });
    await userEvent.click(menuButton);

    // Click Delete
    await userEvent.click(
      await screen.findByRole("button", { name: /delete/i })
    );

    expect(deleteJob).toHaveBeenCalledWith("j1");
  });

  it("shows empty state when no songs exist", async () => {
    listJobs.mockResolvedValueOnce([]);
    renderPage();

    expect(await screen.findByText(/No jobs found/i)).toBeInTheDocument();
  });

  it("shows loading state while fetching", async () => {
    listJobs.mockReturnValue(new Promise(() => {})); // never resolves
    renderPage();

    expect(await screen.findByText(/Loading jobs/i)).toBeInTheDocument();
  });
});
