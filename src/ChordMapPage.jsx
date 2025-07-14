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
        const inSection = chords.filter(
          (c) => c.start >= sec.start && c.start < sec.end
        );

        // 1. group chords by bar
        const byBar = inSection.reduce((acc, c) => {
          acc[c.start_bar] = acc[c.start_bar] || [];
          acc[c.start_bar].push(c);
          return acc;
        }, {});

        // 2. pick which bars to render
        const barsToShow = new Set(Object.keys(byBar).map(Number));

        // ─────── HERE ───────
        // Manually add 48 & 49 for Chorus
        if (sec.label === "Chorus") {
          barsToShow.add(48);
          barsToShow.add(49);
        }
        // ────────────────────

        const sortedBars = Array.from(barsToShow).sort((a, b) => a - b);

        return (
          <div key={i} className="mb-6">
            <h3 className="font-semibold">{sec.label}</h3>

            {sortedBars.length ? (
              <div className="grid grid-cols-4 gap-4 mt-2">
                {sortedBars.map((bar) => {
                  // prepare 4 slots with dashes
                  const slots = Array(4).fill("–");
                  const chordsInBar = byBar[bar] || [];
                  chordsInBar.forEach((c) => {
                    slots[c.start_beat - 1] = formatChord(c.chord_complex_pop);
                  });

                  return (
                    <div key={bar} className="p-2 border rounded text-center">
                      <div className="font-semibold mb-1">Bar {bar}</div>
                      <div>{slots.join(" / ")}</div>
                    </div>
                  );
                })}
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
