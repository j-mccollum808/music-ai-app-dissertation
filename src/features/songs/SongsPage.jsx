import { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { storage } from "../../api/firebase.js";
import {
  listWorkflows,
  listJobs,
  createJob,
  deleteJob,
} from "../../api/api.js";

import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useDebounce } from "react-use";

import ThumbnailImage from "../../components/ThumbnailImage.jsx";

export default function SongsPage() {
  const [workflowRuns, setWorkflowRuns] = useState([]);
  const [apiJobs, setApiJobs] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [jobsLoading, setJobsLoading] = useState(true);

  // Debounce search term input to avoid excessive filtering
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  useEffect(() => {
    listWorkflows().then((res) => {
      const runs = Array.isArray(res.workflows) ? res.workflows : [];
      setWorkflowRuns(runs);
      if (runs.length) setSelectedWorkflow(runs[0].slug);
    });

    setJobsLoading(true);
    listJobs()
      .then((res) => setApiJobs(Array.isArray(res) ? res : []))
      .catch((err) => console.error("listJobs failed:", err))
      .finally(() => setJobsLoading(false));
  }, []);

  // Handle form submission to upload file and create job
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !selectedWorkflow) return;
    setLoading(true);
    try {
      const pathRef = ref(storage, `audio-uploads/${Date.now()}-${file.name}`);
      await uploadBytes(pathRef, file);
      const publicUrl = await getDownloadURL(pathRef);

      const newJob = await createJob(publicUrl, selectedWorkflow, file.name);
      console.log("🎵 Created job:", newJob);
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
    <div className="p-4 bg-black min-h-screen text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Songs</h1>
        <Link
          to="/upload"
          className="px-4 py-2 rounded text-black"
          style={{ backgroundColor: "#00FF9F" }}
        >
          + Upload Song
        </Link>
      </div>

      <div className="mb-4 relative w-full sm:w-96">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search songs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded bg-gray-900 text-white border-gray-700"
        />
      </div>

      {jobsLoading ? (
        <div className="p-1 flex items-center space-x-2 text-gray-300">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#00FF9F] border-t-transparent" />
          <span>Loading jobs…</span>
        </div>
      ) : runs.length ? (
        <div className="space-y-2">
          {runs.map((job) => {
            const isOpen = menuOpenId === job.id;

            const handleDelete = async () => {
              if (!confirm("Are you sure you want to delete this job?")) return;
              try {
                await deleteJob(job.id);
                setApiJobs((prev) => prev.filter((j) => j.id !== job.id));
                setMenuOpenId(null);
              } catch (err) {
                console.error("Delete failed:", err);
              }
            };

            return (
              <div
                key={job.id}
                className="px-3 py-2 rounded-md bg-gray-900 text-white border border-gray-700 shadow relative"
              >
                <div className="flex items-center justify-between">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="flex items-center space-x-4 hover:bg-gray-800 rounded p-1 flex-1"
                  >
                    <ThumbnailImage
                      youtubeUrl={job.youtubeUrl}
                      alt={job.name}
                      className="w-12 h-12"
                    />
                    <span className="font-semibold truncate">
                      {job.name?.length > 30
                        ? job.name.slice(0, 30) + "…"
                        : job.name}
                    </span>
                  </Link>

                  {/* Menu trigger */}
                  <button
                    aria-label="menu"
                    onClick={() =>
                      setMenuOpenId((prev) => (prev === job.id ? null : job.id))
                    }
                    className="ml-2 px-2 py-1 rounded hover:bg-gray-800"
                  >
                    ⋮
                  </button>
                </div>

                {/* Dropdown menu with Delete */}
                {isOpen && (
                  <div className="absolute top-10 right-2 w-40 bg-white border rounded shadow-lg z-10">
                    <button
                      onClick={handleDelete}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400">No jobs found.</p>
      )}
    </div>
  );
}
