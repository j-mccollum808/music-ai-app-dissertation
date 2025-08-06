// src/Jobs.jsx
import { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { storage, db } from "./firebase.js";
import { listWorkflows, listJobs, createJob, deleteJob } from "./api.js";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useDebounce } from "react-use";

export default function Jobs() {
  const [editingJobId, setEditingJobId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [workflowRuns, setWorkflowRuns] = useState([]);
  const [apiJobs, setApiJobs] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  useEffect(() => {
    listWorkflows().then((res) => {
      const runs = Array.isArray(res.workflows) ? res.workflows : [];
      setWorkflowRuns(runs);
      if (runs.length) setSelectedWorkflow(runs[0].slug);
    });

    listJobs().then((res) => {
      setApiJobs(Array.isArray(res) ? res : []);
    });
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
      setApiJobs((prev) => [newJob, ...prev]);
      setFile(null);
    } catch (err) {
      console.error("Upload or job creation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateJobName = async (jobId, newName) => {
    const jobRef = doc(db, "songs", jobId);
    await updateDoc(jobRef, { name: newName });
    return { ...apiJobs.find((j) => j.id === jobId), name: newName };
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
        <h1 className="text-2xl font-bold">Songs</h1>
        <Link
          to="/upload"
          className="px-4 py-2 rounded text-black"
          style={{ backgroundColor: "#00FF9F" }}
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
          className="w-full pl-10 pr-4 py-2 border rounded bg-gray-900 text-white border-gray-700"
        />
      </div>

      {runs.length ? (
        <div className="space-y-2">
          {runs.map((job) => {
            const isOpen = menuOpenId === job.id;
            const isEditing = editingJobId === job.id;

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

            const handleSaveRename = async () => {
              try {
                const updated = await updateJobName(job.id, editedName);
                setApiJobs((prev) =>
                  prev.map((j) => (j.id === job.id ? updated : j))
                );
                setEditingJobId(null);
                setMenuOpenId(null);
              } catch (err) {
                console.error("Rename failed:", err);
              }
            };

            return (
              <div
                key={job.id}
                className="relative p-4 rounded-lg bg-gray-900 text-white border border-gray-700 shadow"
              >
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="border px-2 py-1 rounded w-full bg-gray-800 text-white border-gray-600"
                    />
                    <button
                      onClick={handleSaveRename}
                      className="text-black px-3 py-1 rounded"
                      style={{ backgroundColor: "#00FF9F" }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingJobId(null);
                        setMenuOpenId(null);
                      }}
                      className="text-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <Link
                    to={`/jobs/${job.id}`}
                    className="block font-semibold truncate hover:underline"
                  >
                    {job.name?.length > 30
                      ? job.name.slice(0, 30) + "…"
                      : job.name}
                  </Link>
                )}

                {!isEditing && (
                  <button
                    onClick={() =>
                      setMenuOpenId((prev) => (prev === job.id ? null : job.id))
                    }
                    className="absolute top-2 right-2 px-2 py-1 rounded hover:bg-gray-800"
                  >
                    ⋮
                  </button>
                )}

                {isOpen && !isEditing && (
                  <div className="absolute top-10 right-2 w-40 bg-gray-800 border border-gray-600 rounded shadow-lg z-10">
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                      onClick={() => {
                        setEditingJobId(job.id);
                        setEditedName(job.name || "");
                        setMenuOpenId(null);
                      }}
                    >
                      ✏️ Rename
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-red-500"
                      onClick={handleDelete}
                    >
                      🗑 Delete
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
