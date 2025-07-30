// src/components/JobPage.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";

export default function JobPage() {
  const { jobId } = useParams();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Song #{jobId}</h1>

      <div className="flex space-x-4">
        <Link
          to={`/jobs/${jobId}/chords`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View Chords
        </Link>

        <Link
          to={`/jobs/${jobId}/lyrics`}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          View Lyrics
        </Link>
        <Link
          to={`/jobs/${jobId}/lyric-beta`}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          View Lyric Beta
        </Link>
      </div>
    </div>
  );
}
