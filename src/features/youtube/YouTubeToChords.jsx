import { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../api/firebase.js";
import {
  createJob,
  listWorkflows,
  searchYouTube,
  saveJobResultToFirestore,
  getJob,
} from "../../api/api.js";

export default function YouTubeToChords() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [workflowSlug, setWorkflowSlug] = useState("");
  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    listWorkflows().then((res) => {
      const runs = res.workflows || [];
      setWorkflows(runs);
      if (runs.length) setWorkflowSlug(runs[0].slug);
    });
  }, []);

  const waitForJobCompletion = async (jobId, maxRetries = 40, delay = 3000) => {
    for (let i = 0; i < maxRetries; i++) {
      const job = await getJob(jobId);
      console.log(
        `⏳ Polling job ${jobId} (${i + 1}/${maxRetries}) → status: ${
          job.status
        }`
      );
      if (["SUCCEEDED", "complete"].includes(job.status)) {
        if (!job.result) throw new Error("Job completed without result");
        console.log("✅ Job complete:", job);
        console.log("🎯 Sections:", job.result.Sections);
        console.log("🎯 Lyrics:", job.result.Lyrics);
        console.log("🎯 Chords:", job.result.chords);
        return job;
      }
      if (["FAILED", "errored", "failed"].includes(job.status)) {
        throw new Error(`Job failed with status: ${job.status}`);
      }
      await new Promise((res) => setTimeout(res, delay));
    }
    throw new Error("Job did not complete in time");
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const res = await searchYouTube(query);
      setResults(res.items || []);
    } catch (err) {
      console.error("YouTube search failed:", err);
      alert("YouTube search failed. See console.");
    }
  };

  const handleProcessVideo = async (videoId, title) => {
    setLoading(true);
    try {
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      console.log("🎬 Converting:", youtubeUrl);

      const res = await fetch("http://localhost:3001/youtube-to-mp3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      const data = await res.json();
      if (!data.mp3Path) throw new Error("Conversion failed");

      const response = await fetch(data.mp3Path);
      const blob = await response.blob();
      const fileName = `yt-${videoId}-${Date.now()}.mp3`;
      const fileRef = ref(storage, `audio-uploads/${fileName}`);
      await uploadBytes(fileRef, blob);
      const firebaseUrl = await getDownloadURL(fileRef);

      console.log("📤 Uploaded to Firebase:", firebaseUrl);

      const job = await createJob(firebaseUrl, workflowSlug, title);
      console.log("🚀 Job started:", job);

      const completedJob = await waitForJobCompletion(job.id);

      await saveJobResultToFirestore(completedJob);
      console.log("📦 Saved to Firestore");

      window.location.href = `/jobs/${job.id}`;
    } catch (err) {
      console.error("❌ Failed to process YouTube video:", err);
      alert("Failed to extract chords. See console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">YouTube to Chords</h1>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search YouTube..."
        className="w-full p-2 border rounded mb-4 bg-[#1e2633] border-[#2f394b] text-white placeholder-gray-400"
      />
      <button
        onClick={handleSearch}
        className="mb-6 px-4 py-2 bg-[#00FF9F] text-black rounded hover:opacity-90"
      >
        Search
      </button>

      <select
        value={workflowSlug}
        onChange={(e) => setWorkflowSlug(e.target.value)}
        className="w-full p-2 border border-gray-600 rounded mb-6 bg-black text-white"
      >
        {workflows.map((wf) => (
          <option key={wf.id} value={wf.slug}>
            {wf.name || wf.slug}
          </option>
        ))}
      </select>

      {results.length > 0 && (
        <div className="grid gap-4">
          {results.map((video) => (
            <div
              key={video.id.videoId}
              className="flex items-start border border-gray-700 bg-gray-900 p-4 rounded shadow-sm hover:bg-gray-800 cursor-pointer"
              onClick={() =>
                handleProcessVideo(video.id.videoId, video.snippet.title)
              }
            >
              <img
                src={video.snippet.thumbnails.default.url}
                alt={video.snippet.title}
                className="w-24 h-18 mr-4 rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-white">{video.snippet.title}</p>
                <p className="text-sm text-gray-400">
                  {video.snippet.channelTitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div
          className="sticky top-0 left-0 z-20 flex items-center gap-2 text-gray-300 mb-3"
          aria-live="polite"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#00FF9F] border-t-transparent" />
          <span>Processing song…</span>
        </div>
      )}
    </div>
  );
}
