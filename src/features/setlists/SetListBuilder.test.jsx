import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App.jsx";

/* ---- Firebase no-op (prevent real SDK) ---- */
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

/* ---- API mock (IMPORTANT: mock the SAME PATH the component imports) ---- */
const api = {
  listJobs: vi.fn(),
  createSetlist: vi.fn(),
  updateSetlist: vi.fn(),
  getSetlist: vi.fn(),
  fetchSetlists: vi.fn(),
};

// NOTE the path: ../../api/api.js  (matches imports inside the app)
vi.mock("../../api/api.js", () => ({
  listJobs: (...a) => api.listJobs(...a),
  createSetlist: (...a) => api.createSetlist(...a),
  updateSetlist: (...a) => api.updateSetlist(...a),
  getSetlist: (...a) => api.getSetlist(...a),
  fetchSetlists: (...a) => api.fetchSetlists(...a),
}));

function renderAt(path) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

beforeEach(() => {
  vi.clearAllMocks();
  window.alert = vi.fn();

  api.listJobs.mockResolvedValue([
    { id: "j1", name: "Song One" },
    { id: "j2", name: "Song Two" },
  ]);

  api.getSetlist.mockResolvedValue(null);

  api.createSetlist.mockResolvedValue({
    id: "sl-1",
    title: "Friday Night Set",
    songIds: ["j1", "j2"],
  });

  api.fetchSetlists.mockResolvedValue([
    { id: "sl-1", title: "Friday Night Set", songIds: ["j1", "j2"] },
  ]);
});

describe("SetListBuilder (via App)", () => {
  it("lets a user pick songs, name a setlist, save, and shows the list page", async () => {
    const user = userEvent.setup();
    renderAt("/builder");

    const songOne = await screen.findByTestId("job-j1");
    const songTwo = await screen.findByTestId("job-j2");
    await user.click(songOne);
    await user.click(songTwo);

    // Fill title
    const titleInput =
      screen.queryByPlaceholderText(/set\s*list.*(title|name)/i) ||
      screen.getByRole("textbox");
    await user.clear(titleInput);
    await user.type(titleInput, "Friday Night Set");

    // Save
    const saveBtn =
      screen.queryByRole("button", { name: /save setlist/i }) ||
      screen.getByRole("button", { name: /save/i });
    await user.click(saveBtn);

    // Assert payload
    expect(api.createSetlist).toHaveBeenCalledWith({
      title: "Friday Night Set",
      songIds: expect.arrayContaining(["j1", "j2"]),
    });

    // Lands on list page with item
    const setItem = await screen.findByText(/friday night set/i);
    expect(setItem).toBeInTheDocument();
  });

  it("validates title + at least one song selected", async () => {
    const user = userEvent.setup();
    renderAt("/builder");

    const saveBtn =
      (await screen.findByRole("button", { name: /save setlist/i })) ||
      screen.getByRole("button", { name: /save/i });
    await user.click(saveBtn);

    expect(window.alert).toHaveBeenCalled();
  });
});
