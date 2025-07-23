// src/Jobs.jsx
import { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase.js";
import { listWorkflows, listJobs, createJob } from "./api.js";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useDebounce } from "react-use";

export default function Jobs() {
  const [workflowRuns, setWorkflowRuns] = useState([]);
  const [apiJobs, setApiJobs] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null); // ← this is the missing line

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    500,
    [searchTerm]
  );

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

  const runs = apiJobs.filter((job) => {
    const name = job.name?.toLowerCase() || "";
    const status = job.status?.toLowerCase() || "";
    return (
      name.includes(debouncedSearchTerm.toLowerCase()) ||
      status.includes(debouncedSearchTerm.toLowerCase())
    );
  });
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Songs</h1>
        <Link
          to="/upload"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          + Upload
        </Link>
      </div>

      <div className="mb-4 relative w-full sm:w-96">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search songs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded"
        />
      </div>

      {/* Workflow selector + upload form */}
      {/* Jobs list */}
      {runs.length ? (
        <div className="space-y-2">
          {runs.map((job) => {
            const isOpen = menuOpenId === job.id;

            return (
              <div
                key={job.id}
                className="relative p-4 rounded shadow bg-white hover:bg-gray-50 transition border"
              >
                {/* Job name */}
                <Link
                  to={`/jobs/${job.id}`}
                  className="block font-semibold text-gray-800 truncate"
                >
                  {job.name?.length > 30
                    ? job.name.slice(0, 30) + "…"
                    : job.name}
                </Link>

                {/* More button */}
                <button
                  onClick={() =>
                    setMenuOpenId((prev) => (prev === job.id ? null : job.id))
                  }
                  className="absolute top-2 right-2 px-2 py-1 rounded hover:bg-gray-200"
                >
                  ⋮
                </button>

                {/* Dropdown menu */}
                {isOpen && (
                  <div className="absolute top-10 right-2 w-40 bg-white border rounded shadow-lg z-10">
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      Rename
                    </button>
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p>No jobs found.</p>
      )}
    </div>
  );
}
