import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase.js";
import { listWorkflows, createJob } from "./api.js";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Upload() {
  const [workflowRuns, setWorkflowRuns] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    listWorkflows()
      .then((res) => {
        const runs = Array.isArray(res.workflows) ? res.workflows : [];
        setWorkflowRuns(runs);
        if (runs.length) setSelectedWorkflow(runs[0].slug);
      })
      .catch((err) => console.error("listWorkflows error:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !selectedWorkflow) return;
    setLoading(true);
    try {
      const pathRef = ref(storage, `audio-uploads/${Date.now()}-${file.name}`);
      await uploadBytes(pathRef, file);
      const publicUrl = await getDownloadURL(pathRef);
      const newJob = await createJob(publicUrl, selectedWorkflow, file.name);

      navigate(`/jobs/${newJob.id}`);
    } catch (err) {
      console.error("Upload or job creation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Upload a Song</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Select Workflow:</label>
          <select
            value={selectedWorkflow}
            onChange={(e) => setSelectedWorkflow(e.target.value)}
            className="border p-2 rounded w-full"
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

        <div className="flex flex-col space-y-2">
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 rounded w-full"
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
    </div>
  );
}
