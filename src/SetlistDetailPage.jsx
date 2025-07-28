// src/SetlistDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchSetlists, listJobs } from "./api.js";

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

  if (loading) return <p className="p-4">Loading setlist…</p>;
  if (!setlist) return <p className="p-4 text-red-500">Setlist not found.</p>;

  const songMap = new Map(jobs.map((job) => [job.id, job]));

  return (
    <div className="p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
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
                {/* Entire card links to default view */}
                <Link
                  to={`/jobs/${job.id}`}
                  className="block font-semibold text-gray-800 truncate"
                >
                  {job.name?.length > 30
                    ? job.name.slice(0, 30) + "…"
                    : job.name}
                </Link>

                {/* Optional: dropdown menu (disabled for now) */}
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
