import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { createJob, listWorkflows } from "../api";

export default function YouTubeToChords() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [workflowSlug, setWorkflowSlug] = useState("");
  const [workflows, setWorkflows] = useState([]);

  useState(() => {
    listWorkflows().then((res) => {
      const runs = res.workflows || [];
      setWorkflows(runs);
      if (runs.length) setWorkflowSlug(runs[0].slug);
    });
  }, []);

  const handleDownloadAndProcess = async () => {
    if (!youtubeUrl || !workflowSlug)
      return alert("Enter YouTube URL and select a workflow.");
    setLoading(true);

    try {
      // Step 1: Ask local server to download & convert
      const res = await fetch("http://localhost:3001/youtube-to-mp3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      const data = await res.json();
      if (!data.mp3Path) throw new Error("No mp3Path returned");

      // Step 2: Fetch the MP3 and upload to Firebase
      const response = await fetch(data.mp3Path);
      const blob = await response.blob();
      const fileName = `yt-audio-${Date.now()}.mp3`;
      const fileRef = ref(storage, `audio-uploads/${fileName}`);
      await uploadBytes(fileRef, blob);
      const firebaseUrl = await getDownloadURL(fileRef);

      // Step 3: Kick off a Music.AI job
      const job = await createJob(firebaseUrl, workflowSlug, fileName);
      window.location.href = `/jobs/${job.id}`;
    } catch (err) {
      console.error("Error processing video:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">YouTube to Chords</h1>
      <input
        type="text"
        placeholder="Enter YouTube URL"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <select
        value={workflowSlug}
        onChange={(e) => setWorkflowSlug(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        {workflows.map((wf) => (
          <option key={wf.id} value={wf.slug}>
            {wf.name || wf.slug}
          </option>
        ))}
      </select>
      <button
        onClick={handleDownloadAndProcess}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Processing…" : "Extract Chords from YouTube"}
      </button>
    </div>
  );
}
