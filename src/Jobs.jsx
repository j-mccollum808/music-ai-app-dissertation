// src/Jobs.jsx
import { useState, useEffect } from "react";
import { listJobs } from "./api.js";
import { Link } from "react-router-dom";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    listJobs()
      .then((res) => setJobs(Array.isArray(res) ? res : []))
      .catch(console.error);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Select a Job</h1>
      {jobs.length ? (
        <ul className="space-y-2">
          {jobs.map((j) => (
            <li key={j.id} className="flex items-center space-x-4">
              <span className="font-medium">{j.id}</span>
              <Link
                to={`/jobs/${j.id}/chords`}
                className="text-blue-600 hover:underline"
              >
                Chords
              </Link>
              <Link
                to={`/jobs/${j.id}/lyrics`}
                className="text-blue-600 hover:underline"
              >
                Lyrics
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No jobs to select.</p>
      )}
    </div>
  );
}
