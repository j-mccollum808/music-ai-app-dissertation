// src/features/songs/Upload.test.jsx
import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

/* -------------------- Mocks (must be defined before imports) -------------------- */

// Navigation spy
const navigateSpy = vi.fn();

// Mock react-router-dom: keep real exports, override useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateSpy,
  };
});

// Central API spies
const apiMocks = {
  createJob: vi.fn(),
  listWorkflows: vi.fn(),
  getJob: vi.fn(),
  saveJobResultToFirestore: vi.fn(),
};

// Mock API module used by Upload & YouTube stubs
vi.mock("../../api/api.js", () => ({
  createJob: (...args) => apiMocks.createJob(...args),
  listWorkflows: (...args) => apiMocks.listWorkflows(...args),
  getJob: (...args) => apiMocks.getJob(...args),
  saveJobResultToFirestore: (...args) =>
    apiMocks.saveJobResultToFirestore(...args),
}));

// Mock FileUploader so we can “upload” a file without Firebase/storage
vi.mock("../../components/FileUploader.jsx", () => ({
  default: ({ onComplete }) => (
    <div>
      <input
        data-testid="file-input"
        type="file"
        onChange={(e) => {
          const file =
            e.target.files?.[0] ||
            new File(["x"], "song.mp3", { type: "audio/mpeg" });
          onComplete?.({ file, publicUrl: "http://test/song.mp3" });
        }}
      />
    </div>
  ),
}));

// Mock YouTubeToChords to avoid its internal effects/requests
vi.mock("../youtube/YouTubeToChords.jsx", () => ({
  default: () => (
    <div>
      <h1>YouTube to Chords</h1>
      <input placeholder="Enter YouTube URL" />
    </div>
  ),
}));

/* -------------------- Import after mocks -------------------- */

import Upload from "./Upload.jsx";

/* -------------------- Test setup -------------------- */

beforeEach(() => {
  vi.clearAllMocks();
  navigateSpy.mockReset();

  window.alert = vi.fn();

  // Upload.jsx expects an ARRAY from listWorkflows()
  apiMocks.listWorkflows.mockResolvedValue([{ slug: "music-ai-workflow-v1" }]);

  // createJob returns a job id immediately
  apiMocks.createJob.mockResolvedValue({
    id: "job-123",
    name: "my-song.mp3",
    status: "QUEUED",
  });

  // getJob should be SUCCEEDED on first check so the poll loop returns immediately
  apiMocks.getJob.mockResolvedValue({
    id: "job-123",
    name: "my-song.mp3",
    status: "SUCCEEDED",
    result: {
      sections: "http://test/sections.json",
      lyrics: "http://test/lyrics.json",
      chords: "http://test/chords.json",
    },
    outputs: [
      { name: "sections.json", file: { url: "http://test/sections.json" } },
      { name: "lyrics.json", file: { url: "http://test/lyrics.json" } },
      { name: "chords.json", file: { url: "http://test/chords.json" } },
    ],
  });

  apiMocks.saveJobResultToFirestore.mockResolvedValue();
});

function renderPage() {
  return render(
    <MemoryRouter>
      <Upload />
    </MemoryRouter>
  );
}

/* -------------------- Tests -------------------- */

describe("Upload", () => {
  it("renders initial upload view", () => {
    renderPage();

    expect(screen.getByText(/Get Chords From a Song/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Upload File/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /YouTube/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Upload & Run/i })
    ).toBeInTheDocument();
  });

  it("toggles between upload and YouTube mode", async () => {
    renderPage();

    const youtubeTab = screen.getByRole("button", { name: /YouTube/i });
    await userEvent.click(youtubeTab);

    expect(
      screen.getByPlaceholderText(/Enter YouTube URL/i)
    ).toBeInTheDocument();
  });

  it("completes file upload flow and navigates to job", async () => {
    const user = userEvent.setup();
    renderPage();

    // Upload a file via the stubbed FileUploader (enables the submit button)
    const fileInput = screen.getByTestId("file-input");
    const file = new File(["content"], "my-song.mp3", { type: "audio/mpeg" });
    await user.upload(fileInput, file);

    // Submit
    const submitBtn = screen.getByRole("button", { name: /Upload & Run/i });
    await user.click(submitBtn);

    // listWorkflows is called on submit
    await waitFor(() => {
      expect(apiMocks.listWorkflows).toHaveBeenCalledTimes(1);
    });

    // createJob is called with (publicUrl, workflowSlug, fileName)
    await waitFor(() => {
      expect(apiMocks.createJob).toHaveBeenCalledWith(
        "http://test/song.mp3",
        expect.any(String), // workflow slug chosen by Upload’s state
        "my-song.mp3"
      );
    });

    // Navigates to job page
    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith("/jobs/job-123");
    });
    // getJob polled and succeeded
    await waitFor(() => {
      expect(apiMocks.getJob).toHaveBeenCalledWith("job-123");
    });

    // Firestore save called with completed job
    await waitFor(() => {
      expect(apiMocks.saveJobResultToFirestore).toHaveBeenCalled();
    });

    // No alert on success
    expect(window.alert).not.toHaveBeenCalled();
  });
});
