import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import SetlistDetailPage from "../setlists/SetlistDetailPage.jsx";

/* ✅ Firebase mock */
vi.mock("../../firebase", () => ({
  storage: {},
  db: {},
}));

/* ✅ API mock */
vi.mock("../../api/api.js", async () => {
  const actual = await vi.importActual("../../api/api.js");
  return {
    ...actual,
    fetchSetlists: vi.fn(),
    listJobs: vi.fn(),
  };
});
import * as api from "../../api/api.js";

function renderDetailPage(id = "sl-1") {
  return render(
    <MemoryRouter initialEntries={[`/setlist/${id}`]}>
      <Routes>
        <Route path="/setlist/:id" element={<SetlistDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SetlistDetailPage", () => {
  it("shows setlist title and song links to /jobs/:id", async () => {
    api.fetchSetlists.mockResolvedValue([
      { id: "sl-1", title: "Friday Night Set", songIds: ["j1", "j2"] },
    ]);
    api.listJobs.mockResolvedValue([
      { id: "j1", name: "Song One" },
      { id: "j2", name: "Song Two" },
    ]);

    renderDetailPage();

    const title = await screen.findByText(/friday night set/i);
    expect(title).toBeInTheDocument();

    const songOne = await screen.findByText(/song one/i);
    const songTwo = await screen.findByText(/song two/i);
    expect(songOne).toBeInTheDocument();
    expect(songTwo).toBeInTheDocument();
  });
});
