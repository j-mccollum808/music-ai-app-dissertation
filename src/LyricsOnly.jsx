import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getJob, fetchJSON } from "./api.js";

export default function LyricsOnly() {
  const { jobId } = useParams();
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🟢 LyricsOnly component mounted");

    setLoading(true);
    getJob(jobId)
      .then((detail) => {
        const lyricUrl = detail.result?.Lyrics;
        return lyricUrl ? fetchJSON(lyricUrl) : Promise.resolve([]);
      })
      .then((rawLines) => {
        console.log("Job ID:", jobId);
        console.log("Loaded lines:", rawLines); // 👈 ADD THESE HERE

        setLines(rawLines || []);
      })
      .catch((err) => console.error("Error loading lyrics:", err))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <p>Loading lyrics…</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lyrics</h1>
      <div className="space-y-3 text-left font-mono text-sm leading-relaxed">
        {lines.map((line, i) => (
          <p key={i}>{line.text}</p>
        ))}
      </div>
    </div>
  );
}
