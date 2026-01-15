import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";

/* ---------- Firebase mocks ---------- */
vi.mock("firebase/app", () => ({ initializeApp: vi.fn(() => ({})) }));

const getDocMock = vi.fn(); // define BEFORE the mock factory uses it
vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  getDoc: (...args) => getDocMock(...args),
}));

// ChordMap imports db from ../../firebase
vi.mock("../../firebase", () => ({ db: {} }));

/* ---------- Context mock (configurable) ---------- */
// Make simplification switchable per test.
let mockSimplification = "basic";
vi.mock("../../contexts/ChordViewContext", () => ({
  useChordView: () => ({
    simplification: mockSimplification,
    setSimplification: vi.fn(),
  }),
}));

/* ---------- API mock ---------- */
const apiMocks = {
  getJob: vi.fn(),
  fetchJSON: vi.fn(),
};
vi.mock("../../api/api.js", () => ({
  getJob: (...a) => apiMocks.getJob(...a),
  fetchJSON: (...a) => apiMocks.fetchJSON(...a),
}));

/* ---------- Import component AFTER mocks ---------- */
import ChordMap from "./ChordMap.jsx";

/* ---------- Shared setup ---------- */
beforeEach(() => {
  vi.clearAllMocks();
  mockSimplification = "basic"; // reset between tests

  // Force Firestore cache miss so it hits job.result URLs
  getDocMock.mockResolvedValue({ exists: () => false });

  // Job result has URLs (ChordMap expects .sections/.lyrics/.chords)
  apiMocks.getJob.mockResolvedValue({
    id: "job-1",
    status: "SUCCEEDED",
    result: {
      sections: "http://test/sections.json",
      lyrics: "http://test/lyrics.json",
      chords: "http://test/chords.json",
    },
  });

  // Mock payloads to mirror your real data shape
  apiMocks.fetchJSON.mockImplementation(async (url) => {
    if (url.includes("sections")) {
      return [
        { start: 0.0, end: 0.4, label: "Intro" },
        { start: 0.4, end: 17.6, label: "Intro" },
        { start: 17.6, end: 33.65, label: "Verse" },
      ];
    }

    if (url.includes("lyrics")) {
      return [
        {
          start: 0.8,
          end: 2.61,
          text: "At first I was afraid, I was p...",
          language: "english",
          words: [
            { word: "At", start: 0.8, end: 1.08 },
            { word: "first", start: 1.08, end: 1.25 },
          ],
        },
      ];
    }

    if (url.includes("chords")) {
      // Provide all three pops; UI picks based on simplification.
      return [
        {
          start: 0.45,
          end: 1.6,
          start_bar: 0,
          start_beat: 2,
          end_bar: 0,
          end_beat: 4,
          chord_basic_pop: "Dm",
          chord_simple_pop: "Dm",
          chord_complex_pop: "Dm7", //  complex form to assert
        },
        {
          start: 1.6,
          end: 3.0,
          start_bar: 1,
          start_beat: 1,
          end_bar: 1,
          end_beat: 3,
          chord_basic_pop: "G",
          chord_simple_pop: "G",
          chord_complex_pop: "G7", //  complex form to assert
        },
      ];
    }

    throw new Error("Unexpected URL " + url);
  });
});

function renderOnJob(id = "job-1") {
  return render(
    <MemoryRouter initialEntries={[`/jobs/${id}`]}>
      <Routes>
        <Route path="/jobs/:jobId" element={<ChordMap />} />
      </Routes>
    </MemoryRouter>
  );
}

/* ---------- Tests ---------- */
describe("ChordMap (lyrics + chord chart)", () => {
  it("renders a chord chart from job outputs (basic)", async () => {
    renderOnJob();

    // chord symbol appears inside a bar string like "– / Dm / – / –"
    const dmNode = await screen.findByText((t) => t.includes("Dm"));
    expect(dmNode).toBeInTheDocument();
  });

  it("renders complex chord symbols when simplification is 'complex' (context)", async () => {
    mockSimplification = "complex";
    renderOnJob();

    expect(
      await screen.findByText((t) => t.includes("Dm7"))
    ).toBeInTheDocument();
    expect(
      await screen.findByText((t) => t.includes("G7"))
    ).toBeInTheDocument();
  });

  it("renders lyrics when switching to Lyrics view", async () => {
    renderOnJob();

    const user = userEvent.setup();
    const lyricsBtn = await screen.findByRole("button", { name: /lyrics/i });
    await user.click(lyricsBtn);

    expect(await screen.findByText("At")).toBeInTheDocument();
    expect(await screen.findByText("first")).toBeInTheDocument();
  });
});
