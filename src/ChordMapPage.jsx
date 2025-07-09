// src/ChordMapPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getJob, fetchJSON } from "./api.js";

export default function ChordMapPage() {
  const { jobId } = useParams();
  const [sections, setSections] = useState([]);
  const [chords, setChords] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatChord = (chord) => chord.replace(":maj", "").replace(":min", "m");

  useEffect(() => {
    setLoading(true);
    getJob(jobId)
      .then((detail) => {
        // Grab the URLs using the exact result keys
        const secUrl = detail.result?.Sections;
        const chordUrl = detail.result?.chords;
        return Promise.all([
          secUrl ? fetchJSON(secUrl) : Promise.resolve([]),
          chordUrl ? fetchJSON(chordUrl) : Promise.resolve([]),
        ]);
      })
      .then(([secs, chs]) => {
        setSections(Array.isArray(secs) ? secs : []);
        setChords(Array.isArray(chs) ? chs : []);
      })
      .catch((err) => console.error("❌ load job error:", err))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <p>Loading chords…</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chord Map</h1>
      {sections.map((sec, i) => {
        // chords use `start` & `end` timestamps
        const inSection = chords.filter(
          (c) => c.start >= sec.start && c.start < sec.end
        );
        return (
          <div key={i} className="mb-6">
            <h3 className="font-semibold">{sec.label}</h3>
            {inSection.length ? (
              <div className="grid grid-cols-4 gap-4 mt-2">
                {inSection.map((c, ci) => (
                  <div key={ci} className="p-2 border rounded text-center">
                    {formatChord(c.chord_majmin)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="italic text-sm mt-1">No chords in this section.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
