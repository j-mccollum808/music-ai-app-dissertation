// src/Upload.jsx
// src/features/songs/Upload.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createJob } from "../../api/api.js"; // ✅ up 2 levels
import YouTubeToChords from "../youtube/YouTubeToChords.jsx"; // ✅ sibling feature
import FileUploader from "../../components/FileUploader.jsx"; // ✅ up 2 levels

export default function Upload() {
  const [mode, setMode] = useState("upload"); // "upload" | "youtube"
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileComplete = ({ file, publicUrl }) => {
    setFileUrl(publicUrl);
    setFileName(file?.name || "Uploaded Song");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileUrl) return;
    setLoading(true);
    try {
      const WORKFLOW = "music-ai-workflow-v1";
      const newJob = await createJob(fileUrl, WORKFLOW, fileName);
      navigate(`/jobs/${newJob.id}`);
    } catch (err) {
      console.error("Upload or job creation failed:", err);
      alert("Upload or job creation failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Upload box */}
          <FileUploader onComplete={handleFileComplete} />

          <button
            type="submit"
            disabled={loading || !fileUrl}
            className="px-4 py-2 bg-[#00FF9F] text-black rounded disabled:opacity-50"
          >
            {loading ? "Processing…" : "Upload & Run"}
          </button>
        </form>
      )}

      {mode === "youtube" && <YouTubeToChords />}
    </div>
  );
}
