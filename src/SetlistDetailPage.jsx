// src/SetlistDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchSetlists, listJobs } from "./api.js";

export default function SetlistDetailPage() {
  const { id } = useParams();
  const [setlist, setSetlist] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <h1 className="text-2xl font-bold mb-4">{setlist.title}</h1>
      {setlist.songIds?.length === 0 ? (
        <p>No songs in this setlist.</p>
      ) : (
        <ul className="space-y-2">
          {setlist.songIds.map((jobId) => {
            const job = songMap.get(jobId);
            if (!job) return null;

            return (
              <li key={job.id} className="p-3 border rounded shadow">
                <p className="font-semibold">{job.name || `Song ${job.id}`}</p>
                <div className="space-x-2 mt-2">
                  <Link
                    to={`/jobs/${job.id}/lyrics`}
                    className="text-blue-600 underline text-sm"
                  >
                    Lyrics
                  </Link>
                  <Link
                    to={`/jobs/${job.id}/chords`}
                    className="text-green-600 underline text-sm"
                  >
                    Chords
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
