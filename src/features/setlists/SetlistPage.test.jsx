// src/features/setlists/SetlistPage.test.jsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App.jsx";

/* ── Firebase no-op ── */
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
}));
vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));
vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(() => ({})),
}));

/* ── API mock (match the path used by SetlistDetailPage.jsx) ── */
const api = {
  fetchSetlists: vi.fn(),
  listJobs: vi.fn(),
};

vi.mock("../../api/api.js", () => ({
  fetchSetlists: (...args) => api.fetchSetlists(...args),
  listJobs: (...args) => api.listJobs(...args),
}));

function renderAt(path) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

beforeEach(() => {
  vi.clearAllMocks();

  api.fetchSetlists.mockResolvedValue([
    { id: "sl-1", title: "Friday Night Set", songIds: ["j1", "j2"] },
  ]);

  api.listJobs.mockResolvedValue([
    { id: "j1", name: "Song One" },
    { id: "j2", name: "Song Two" },
  ]);
});

describe("SetlistPage (via App)", () => {
  it("lists setlists and navigates to details on click", async () => {
    const user = userEvent.setup();
    renderAt("/setlist");

    // sees the setlist on the list page
    const first = await screen.findByText(/friday night set/i);
    expect(first).toBeInTheDocument();

    // click into details
    await user.click(first);

    // detail page pulls from the SAME mocked module path and shows songs
    const title = await screen.findByText(/friday night set/i);
    expect(title).toBeInTheDocument();

    const songOne = await screen.findByText(/song one/i);
    const songTwo = await screen.findByText(/song two/i);
    expect(songOne).toBeInTheDocument();
    expect(songTwo).toBeInTheDocument();
  });

  it("navigates to builder when creating a new setlist", async () => {
    const user = userEvent.setup();
    renderAt("/setlist");

    const createBtn = await screen.findByRole("button", {
      name: /\+ create new setlist/i,
    });
    await user.click(createBtn);

    const heading = await screen.findByText(/setlist builder/i);
    expect(heading).toBeInTheDocument();
  });
});
