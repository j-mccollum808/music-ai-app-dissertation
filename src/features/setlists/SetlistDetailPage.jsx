// src/SetlistDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchSetlists, listJobs } from "../../api/api.js";

export default function SetlistDetailPage() {
  const { id } = useParams();
  const [setlist, setSetlist] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchSetlists(), listJobs()])
      .then(([allSetlists, allJobs]) => {
        const match = allSetlists.find((s) => s.id === id);
        setSetlist(match);
        setJobs(allJobs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 flex items-center space-x-2 text-gray-600">
        <div className="spinner" />
        <span>Loading setlist…</span>
      </div>
    );
  }
  if (!setlist) return <p className="p-4 text-red-500">Setlist not found.</p>;

  const songMap = new Map(jobs.map((job) => [job.id, job]));

  return (
    <div className="p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-[#00FF9F] text-black rounded hover:opacity-90"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold mb-4">{setlist.title}</h1>
      {setlist.songIds?.length === 0 ? (
        <p>No songs in this setlist.</p>
      ) : (
        <div className="space-y-2">
          {setlist.songIds.map((jobId) => {
            const job = songMap.get(jobId);
            if (!job) return null;

            return (
              <div
                key={job.id}
                className="relative p-4 rounded shadow bg-white hover:bg-gray-50 transition border"
              >
                <Link
                  to={`/jobs/${job.id}`}
                  className="block font-semibold text-gray-800 truncate"
                >
                  {job.name?.length > 30
                    ? job.name.slice(0, 30) + "…"
                    : job.name}
                </Link>

                <button
                  disabled
                  className="absolute top-2 right-2 px-2 py-1 rounded text-gray-400"
                  title="More options (coming soon)"
                >
                  ⋮
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
