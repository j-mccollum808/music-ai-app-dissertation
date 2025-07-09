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

  // Load workflows and API-created jobs
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

  // Upload MP3 to Firebase, then create a Music.AI job
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      console.warn("No file selected");
      return;
    }
    if (!selectedWorkflow) {
      console.warn("No workflow selected");
      return;
    }
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

  // Combine workflows and API jobs for display
  const runs = [...workflowRuns, ...apiJobs];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Jobs</h1>

      {/* Workflow selector and upload form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label className="block font-medium mb-1">Select Workflow:</label>
          <select
            value={selectedWorkflow}
            onChange={(e) => setSelectedWorkflow(e.target.value)}
            className="w-full border p-2 rounded"
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

      {/* Jobs and Workflows list */}
      {runs.length ? (
        <ul className="space-y-2">
          {runs.map((job) => (
            <li key={job.id} className="flex items-center justify-between">
              <span className="font-medium">
                {job.id} — <em>{job.name || job.status}</em>
              </span>
              <div className="space-x-2">
                <Link
                  to={`/jobs/${job.id}/chords`}
                  className="text-blue-600 hover:underline"
                >
                  Chords
                </Link>
                <Link
                  to={`/jobs/${job.id}/lyrics`}
                  className="text-blue-600 hover:underline"
                >
                  Lyrics
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No jobs or workflows found.</p>
      )}
    </div>
  );
}
