import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  listWorkflows,
  createJob,
  getJob,
  saveJobResultToFirestore,
} from "../../api/api.js";
import YouTubeToChords from "../youtube/YouTubeToChords.jsx";
import FileUploader from "../../components/FileUploader.jsx";
import StickyAction from "../../components/StickyAction.jsx";

// Wait for a job to complete by polling its status
async function waitForJobCompletion(jobId, maxRetries = 60, delay = 3000) {
  for (let i = 0; i < maxRetries; i++) {
    const j = await getJob(jobId);
    const status = String(j?.status || "").toUpperCase();
    if (["SUCCEEDED", "COMPLETE", "COMPLETED", "DONE"].includes(status)) {
      return j;
    }
    if (["FAILED", "ERROR", "ERRORED"].includes(status)) {
      throw new Error(`Job failed: ${status}`);
    }
    await new Promise((r) => setTimeout(r, delay));
  }
  throw new Error("Job did not complete in time");
}

export default function Upload() {
  const [mode, setMode] = useState("upload"); // "upload" or "youtube"
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Callback when file upload completes
  const handleFileComplete = ({ file, publicUrl }) => {
    setFileUrl(publicUrl);
    setFileName(file?.name || "Uploaded Song");
  };

  //  Handle form submission to upload file and create job
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileUrl) return;
    setLoading(true);
    try {
      const workflows = await listWorkflows();
      if (!workflows?.length || !workflows[0]?.slug) {
        throw new Error("No workflows available (missing slug).");
      }
      const workflowSlug = workflows[0].slug;

      const newJob = await createJob(
        fileUrl,
        workflowSlug,
        fileName || "Uploaded Song"
      );
      const completedJob = await waitForJobCompletion(newJob.id);

      await saveJobResultToFirestore(completedJob);
      navigate(`/jobs/${newJob.id}`);
    } catch (err) {
      console.error("Upload or job creation failed:", err);
      alert("Upload or job creation failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-28">
      <h1 className="text-2xl font-bold mb-6">Get Chords From a Song</h1>

      {/* Mode toggle */}
      <div className="inline-flex mb-6 rounded-xl border border-gray-700 overflow-hidden">
        <button
          className={`px-4 py-2 text-sm ${
            mode === "upload" ? "bg-white text-black" : "bg-black text-white"
          }`}
          onClick={() => setMode("upload")}
        >
          Upload File
        </button>
        <button
          className={`px-4 py-2 text-sm ${
            mode === "youtube" ? "bg-white text-black" : "bg-black text-white"
          }`}
          onClick={() => setMode("youtube")}
        >
          YouTube
        </button>
      </div>

      {mode === "upload" && (
        <form id="uploadForm" onSubmit={handleSubmit} className="space-y-4">
          <FileUploader onComplete={handleFileComplete} />
        </form>
      )}

      {mode === "youtube" && <YouTubeToChords />}

      {/* Sticky bottom action*/}
      {mode === "upload" && (
        <StickyAction
          type="submit"
          form="uploadForm"
          disabled={loading || !fileUrl}
        >
          {loading ? "Processing…" : "Upload & Run"}
        </StickyAction>
      )}
    </div>
  );
}
