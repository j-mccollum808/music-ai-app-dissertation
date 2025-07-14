// src/Jobs.jsx
import { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase.js";
import { listWorkflows, listJobs, createJob } from "./api.js";
import { Link } from "react-router-dom";

export default function Jobs() {
  const [workflowRuns, setWorkflowRuns] = useState([]);
  const [apiJobs, setApiJobs] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState("");

  // Load workflows (for the dropdown) and API-generated jobs
  useEffect(() => {
    listWorkflows()
      .then((res) => {
        const runs = Array.isArray(res.workflows) ? res.workflows : [];
        setWorkflowRuns(runs);
        if (runs.length) setSelectedWorkflow(runs[0].slug);
      })
      .catch((err) => console.error("listWorkflows error:", err));

    listJobs()
      .then((res) => {
        setApiJobs(Array.isArray(res) ? res : []);
      })
      .catch((err) => console.error("listJobs error:", err));
  }, []);

  // Upload MP3 to Firebase, then kick off the Music.AI job
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !selectedWorkflow) return;
    setLoading(true);
    try {
      const pathRef = ref(storage, `audio-uploads/${Date.now()}-${file.name}`);
      await uploadBytes(pathRef, file);
      const publicUrl = await getDownloadURL(pathRef);

      const newJob = await createJob(publicUrl, selectedWorkflow, file.name);
      setApiJobs((prev) => [newJob, ...prev]);
      setFile(null);
    } catch (err) {
      console.error("Upload or job creation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Only show the API-generated jobs here
  const runs = apiJobs;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Jobs</h1>

      {/* Workflow selector + upload form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label className="block font-medium mb-1">Select Workflow:</label>
          <select
            value={selectedWorkflow}
            onChange={(e) => setSelectedWorkflow(e.target.value)}
            className="border p-2 rounded"
            required
          >
            <option value="" disabled>
              Select a workflow
            </option>
            {workflowRuns.map((wf) => (
              <option key={wf.id} value={wf.slug}>
                {wf.name || wf.slug}
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2">
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 rounded flex-1"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {loading ? "Uploading…" : "Upload & Run"}
          </button>
        </div>
      </form>

      {/* Jobs list */}
      {runs.length ? (
        <ul className="space-y-2">
          {runs.map((job) => (
            <li key={job.id} className="flex items-center justify-between">
              {/* Click on the title to see both chords & lyrics */}
              <Link
                to={`/jobs/${job.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {job.id} — <em>{job.name || job.status}</em>
              </Link>
              <div className="space-x-2"></div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No jobs found.</p>
      )}
    </div>
  );
}
