// src/Lyrics.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getJob, fetchJSON } from "./api.js";
import BackButton from "./components/BackButton.jsx"; // Import BackButton if needed

export default function Lyrics() {
  const { jobId } = useParams();
  const [lines, setLines] = useState([]); // your lyrics JSON
  const [chords, setChords] = useState([]); // your chords JSON
  const [sections, setSections] = useState([]); //section json
  const [loading, setLoading] = useState(true);

  const formatChord = (chord) => chord.replace(":maj", "").replace(":min", "m");

  useEffect(() => {
    setLoading(true);
    getJob(jobId)
      .then((detail) => {
        const lyricUrl = detail.result.Lyrics; // replace with the actual key
        const chordUrl = detail.result.chords;
        const sectionUrl = detail.result.Sections;
        return Promise.all([
          lyricUrl ? fetchJSON(lyricUrl) : Promise.resolve([]),
          chordUrl ? fetchJSON(chordUrl) : Promise.resolve([]),
          sectionUrl ? fetchJSON(sectionUrl) : Promise.resolve([]),
        ]);
      })
      .then(([rawLines, rawChords, rawSections]) => {
        // grab the very first section’s start (0.2s in your case)
        const offset = rawSections[0]?.start || 0;

        // shift every lyric start forward by that amount
        const adjustedLines = rawLines.map((line) => ({
          ...line,
          start: line.start + offset,
          // if you need to shift end times too:
          end: line.end + offset,
        }));

        // now update state just once
        setLines(adjustedLines);
        setChords(rawChords);
        setSections(rawSections);

        console.log("Adjusted Lyrics:", adjustedLines);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <p>Loading lyrics…</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lyrics</h1>

      {sections.map((sec, si) => (
        <div key={si} className="mb-6">
          <h2 className="text-xl font-semibold">{sec.label}</h2>
          {lines
            .filter((line) => line.start >= sec.start && line.start < sec.end)
            .map((line, li) => (
              <p key={li} className="font-mono text-sm mb-1">
                {line.words.map((w) => w.word).join(" ")}
              </p>
            ))}
        </div>
      ))}
    </div>
  );
}
