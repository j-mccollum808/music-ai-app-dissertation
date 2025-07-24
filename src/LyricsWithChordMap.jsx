// src/LyricsWithChordMap.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getJob, fetchJSON } from "./api.js";

export default function LyricsWithChordMap() {
  const { jobId } = useParams();
  const [sections, setSections] = useState([]);
  const [lines, setLines] = useState([]);
  const [chords, setChords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("chords"); // 'both', 'lyrics', 'chords'

  const formatChord = (c) => c.replace(":maj", "").replace(":min", "m");

  useEffect(() => {
    setLoading(true);
    getJob(jobId)
      .then((detail) => {
        const secUrl = detail.result?.Sections;
        const lyricUrl = detail.result?.Lyrics;
        const chordUrl = detail.result?.chords;
        return Promise.all([
          secUrl ? fetchJSON(secUrl) : Promise.resolve([]),
          lyricUrl ? fetchJSON(lyricUrl) : Promise.resolve([]),
          chordUrl ? fetchJSON(chordUrl) : Promise.resolve([]),
        ]);
      })
      .then(([secs, rawLines, rawChords]) => {
        setSections(Array.isArray(secs) ? secs : []);
        setLines(Array.isArray(rawLines) ? rawLines : []);
        setChords(Array.isArray(rawChords) ? rawChords : []);
      })
      .catch((err) => console.error("load error", err))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <p>Loading…</p>;

  return (
    <div className="p-4">
      {/* Toggle Buttons */}
      <div className="mb-6 space-x-2">
        {["both", "lyrics", "chords"].map((option) => (
          <button
            key={option}
            onClick={() => setView(option)}
            className={`px-4 py-2 rounded font-medium ${
              view === option
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {option === "both"
              ? "Both"
              : option === "lyrics"
              ? "Lyrics Only"
              : "Chords Only"}
          </button>
        ))}
      </div>

      <div className={view === "both" ? "grid grid-cols-2 gap-8" : ""}>
        {/* ── Lyrics ── */}
        {(view === "both" || view === "lyrics") && (
          <div>
            <h2 className="text-xl font-bold mb-4">Lyrics</h2>
            <div className="space-y-4 font-mono text-sm">
              {lines.map((line, i) => {
                const lineChords = chords.filter(
                  (c) => c.start >= line.start && c.start < line.end
                );
                return (
                  <div key={i} className="mb-2">
                    <div className="flex">
                      {line.words.map((w, j) => {
                        const hit = lineChords.find(
                          (c) => w.start >= c.start && w.start < c.end
                        );
                        return (
                          <span key={j} className="px-1 text-xs">
                            {hit
                              ? formatChord(hit.chord_complex_jazz)
                              : "\u00A0"}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex">
                      {line.words.map((w, j) => (
                        <span key={j} className="px-1">
                          {w.word}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Chord Map ── */}
        {(view === "both" || view === "chords") && (
          <div>
            <h2 className="text-xl font-bold mb-4">Chord Map x2</h2>
            {sections.map((sec, si) => {
              const inSec = chords.filter(
                (c) => c.start >= sec.start && c.start < sec.end
              );
              const byBar = inSec.reduce((acc, c) => {
                acc[c.start_bar] = acc[c.start_bar] || [];
                acc[c.start_bar].push(c);
                return acc;
              }, {});
              const bars = Object.keys(byBar)
                .map(Number)
                .sort((a, b) => a - b);

              return (
                <div key={si} className="mb-6">
                  <h3 className="font-semibold">{sec.label}</h3>
                  {bars.length ? (
                    <div className="grid grid-cols-4 gap-0 mt-2">
                      {bars.map((bar) => {
                        const slots = Array(4).fill("–");
                        byBar[bar].forEach((c) => {
                          slots[c.start_beat - 1] = formatChord(
                            c.chord_complex_pop
                          );
                        });
                        return (
                          <div
                            key={bar}
                            className="relative p-2 border  text-center"
                          >
                            {/* Bar number in top-left corner of the box */}
                            <div className="absolute top-1 left-1 text-[10px] font-semibold text-gray-500 text-left">
                              Bar {bar}
                            </div>

                            {/* Padding to prevent overlap with Bar label */}
                            <div className="pt-4 text-[10px]">
                              {slots.join(" / ")}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="italic text-sm mt-1">
                      No chords in this section.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
