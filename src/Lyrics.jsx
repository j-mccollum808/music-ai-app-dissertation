// src/Lyrics.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getJob, fetchJSON } from "./api.js";

export default function Lyrics() {
  const { jobId } = useParams();
  const [lines, setLines] = useState([]); // your lyrics JSON
  const [chords, setChords] = useState([]); // your chords JSON
  const [loading, setLoading] = useState(true);

  const formatChord = (chord) => chord.replace(":maj", "").replace(":min", "m");

  useEffect(() => {
    setLoading(true);
    getJob(jobId)
      .then((detail) => {
        const lyricUrl = detail.result.Lyrics; // replace with the actual key
        const chordUrl = detail.result.chords;
        return Promise.all([
          lyricUrl ? fetchJSON(lyricUrl) : Promise.resolve([]),
          chordUrl ? fetchJSON(chordUrl) : Promise.resolve([]),
        ]);
      })
      .then(([rawLines, rawChords]) => {
        setLines(rawLines);
        setChords(rawChords);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <p>Loading lyrics…</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lyrics</h1>
      <div className="space-y-4 font-mono text-sm">
        {lines.map((line, i) => (
          <div key={i}>
            {/* chord row */}
            <div className="flex">
              {line.words.map((w, j) => {
                // find the chord whose time‐span covers this word
                const hit = chords.find(
                  (c) => w.start >= c.start && w.start < c.end
                );
                return (
                  <span key={j} className="px-1 text-xs">
                    {hit ? formatChord(hit.chord_complex_jazz) : "\u00A0"}
                  </span>
                );
              })}
            </div>
            {/* lyric row */}
            <div className="flex">
              {line.words.map((w, j) => (
                <span key={j} className="px-1">
                  {w.word}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
