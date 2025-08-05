import { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import {
  createJob,
  listWorkflows,
  searchYouTube,
  saveJobResultToFirestore,
  getJob,
} from "../api";

export default function YouTubeToChords() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [workflowSlug, setWorkflowSlug] = useState("");
  const [workflows, setWorkflows] = useState([]);

  const waitForJobCompletion = async (jobId, maxRetries = 10, delay = 3000) => {
    for (let i = 0; i < maxRetries; i++) {
      const job = await getJob(jobId);
      if (job.status === "complete") return job;
      await new Promise((res) => setTimeout(res, delay));
    }
    throw new Error("Job did not complete in time");
  };

  useEffect(() => {
    listWorkflows().then((res) => {
      const runs = res.workflows || [];
      setWorkflows(runs);
      if (runs.length) setWorkflowSlug(runs[0].slug);
    });
  }, []);

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

      // Step 1: Ask local server to convert YouTube to MP3
      const res = await fetch("http://localhost:3001/youtube-to-mp3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      const data = await res.json();
      if (!data.mp3Path) throw new Error("Conversion failed");

      // Step 2: Upload MP3 blob to Firebase
      const response = await fetch(data.mp3Path);
      const blob = await response.blob();
      const fileName = `yt-${videoId}-${Date.now()}.mp3`;
      const fileRef = ref(storage, `audio-uploads/${fileName}`);
      await uploadBytes(fileRef, blob);
      const firebaseUrl = await getDownloadURL(fileRef);

      // Step 3: Kick off chord extraction job
      const job = await createJob(firebaseUrl, workflowSlug, title);

      try {
        const completedJob = await waitForJobCompletion(job.id);
        await saveJobResultToFirestore(completedJob);
      } catch (err) {
        console.error("Saving job result failed:", err);
      }

      window.location.href = `/jobs/${job.id}`;
    } catch (err) {
      console.error("Processing failed:", err);
      alert("Failed to extract chords.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">YouTube to Chords</h1>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search YouTube..."
        className="w-full p-2 border rounded mb-4"
      />
      <button
        onClick={handleSearch}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Search
      </button>

      <select
        value={workflowSlug}
        onChange={(e) => setWorkflowSlug(e.target.value)}
        className="w-full p-2 border rounded mb-6"
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
              className="flex items-start border p-4 rounded shadow-sm hover:bg-gray-50 cursor-pointer"
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
                <p className="font-medium text-gray-800">
                  {video.snippet.title}
                </p>
                <p className="text-sm text-gray-600">
                  {video.snippet.channelTitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <p className="mt-6 text-center text-blue-600 font-semibold">
          Processing song…
        </p>
      )}
    </div>
  );
}
