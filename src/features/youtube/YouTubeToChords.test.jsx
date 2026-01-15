import { describe, it, beforeEach, vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// --- Firebase no-ops so imports don't explode ---
vi.mock("firebase/app", () => ({ initializeApp: vi.fn(() => ({})) }));
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
  ref: vi.fn(() => ({})),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}));

// --- API mocks (match the path the component uses) ---
const api = {
  listWorkflows: vi.fn(),
  searchYouTube: vi.fn(),
  createJob: vi.fn(),
  saveJobResultToFirestore: vi.fn(),
  getJob: vi.fn(),
};

vi.mock("../../api/api.js", () => ({
  listWorkflows: (...a) => api.listWorkflows(...a),
  searchYouTube: (...a) => api.searchYouTube(...a),
  createJob: (...a) => api.createJob(...a),
  saveJobResultToFirestore: (...a) => api.saveJobResultToFirestore(...a),
  getJob: (...a) => api.getJob(...a),
}));

import YouTubeToChords from "./YouTubeToChords.jsx";

beforeEach(() => {
  vi.clearAllMocks();
  // jsdom doesn't implement alert; stub it
  window.alert = vi.fn();

  // default mocks for each test; they can be overridden in a test if needed
  api.listWorkflows.mockResolvedValue({
    workflows: [
      { id: "wf-1", slug: "default", name: "Default" },
      { id: "wf-2", slug: "alt", name: "Alternative" },
    ],
  });

  api.searchYouTube.mockResolvedValue({
    items: [
      {
        id: { videoId: "vid1" },
        snippet: {
          title: "Song One",
          channelTitle: "Channel A",
          thumbnails: { default: { url: "https://example.com/1.jpg" } },
        },
      },
      {
        id: { videoId: "vid2" },
        snippet: {
          title: "Song Two",
          channelTitle: "Channel B",
          thumbnails: { default: { url: "https://example.com/2.jpg" } },
        },
      },
    ],
  });
});

describe("YouTubeToChords", () => {
  it("loads workflows and allows selecting one", async () => {
    render(<YouTubeToChords />);

    // the <select> should get options from listWorkflows useEffect
    const defaultOption = await screen.findByRole("option", {
      name: /default/i,
    });
    expect(defaultOption).toBeInTheDocument();

    const altOption = await screen.findByRole("option", {
      name: /alternative/i,
    });
    expect(altOption).toBeInTheDocument();
  });

  it("searches YouTube and shows results", async () => {
    const user = userEvent.setup();
    render(<YouTubeToChords />);

    // Type a query & click Search
    const input = screen.getByPlaceholderText(/search youtube/i);
    await user.type(input, "Song");
    await user.click(screen.getByRole("button", { name: /search/i }));

    // Our mocked results should render
    const first = await screen.findByText(/song one/i);
    const second = await screen.findByText(/song two/i);
    expect(first).toBeInTheDocument();
    expect(second).toBeInTheDocument();
  });
});
