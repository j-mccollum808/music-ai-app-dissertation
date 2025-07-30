import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJob, fetchJSON } from "./api.js";
import { useChordView } from "./contexts/ChordViewContext.jsx";

export default function LyricsWithChordMap() {
  const { jobId } = useParams();
  const [jobTitle, setJobTitle] = useState("");
  const [sections, setSections] = useState([]);
  const [lines, setLines] = useState([]);
  const [chords, setChords] = useState([]);
  const { simplification } = useChordView();
  const navigate = useNavigate();
  const [adjustedChords, setAdjustedChords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("both");

  const formatChord = (chordObj) => {
    const key = `chord_${simplification}_pop`;
    const chord = chordObj[key] || "–";
    return chord.replace(":maj", "").replace(":min", "m");
  };

  useEffect(() => {
    setLoading(true);
    getJob(jobId)
      .then((detail) => {
        setJobTitle(detail.name || jobId);
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

        // Removed global histogram and shift logic as section-based shifting is used now
        // Shift now applied per section in the rendering logic

        const normalized = rawChords.map((c) => ({ ...c }));
        console.log("✅ Loaded chords:", normalized);

        setAdjustedChords(normalized);
      })
      .catch((err) => console.error("load error", err))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <p>Loading…</p>;

  return (
    <div className="p-4 max-w-screen-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Song: {jobTitle}</h1>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
      >
        ← Songs
      </button>

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
        <p className="inline-block ml-4 italic text-sm text-gray-500">
          Mode: {view}
        </p>
      </div>

      <div
        className={
          view === "both" ? "grid grid-cols-1 md:grid-cols-2 gap-8" : ""
        }
      >
        {/* Lyrics */}
        {(view === "both" || view === "lyrics") && (
          <div className="w-full">
            <h2 className="text-xl font-bold mb-4">Lyrics</h2>
            <div className="space-y-4 font-mono">
              {sections.map((section, si) => {
                const linesInSection = lines.filter(
                  (line) =>
                    line.start >= section.start && line.start < section.end
                );
                if (linesInSection.length === 0) return null;
                return (
                  <div key={si} className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {section.label}
                    </h3>
                    <div className="space-y-2">
                      {linesInSection.map((line, li) => {
                        const lineChords = adjustedChords.filter(
                          (c) => c.start >= line.start && c.start < line.end
                        );
                        return (
                          <div key={li}>
                            {view !== "lyrics" && (
                              <div className="flex flex-wrap">
                                {line.words?.map((w, j) => {
                                  const hit = lineChords.find(
                                    (c) => w.start >= c.start && w.start < c.end
                                  );
                                  return (
                                    <span key={j} className="px-1 text-xs">
                                      {hit ? formatChord(hit) : "\u00A0"}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                            <div className="flex flex-wrap">
                              {line.words
                                ? line.words.map((w, j) => (
                                    <span key={j} className="px-1">
                                      {w.word}
                                    </span>
                                  ))
                                : line.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chord Map */}
        {(view === "both" || view === "chords") && (
          <div className="w-full">
            <h2 className="text-xl font-bold mb-4">
              Normalized Chord Map{" "}
              <span className="text-sm">
                (most chords started on a different beat)
              </span>
            </h2>
            {sections.map((sec, si) => {
              const inSec = adjustedChords.filter(
                (c) => c.start >= sec.start && c.start < sec.end
              );

              inSec.forEach((c, i) => {
                if (typeof c.start_beat !== "number" || isNaN(c.start_beat)) {
                  console.warn(
                    `⚠️ Missing start_beat in section "${sec.label}" at index ${i}`,
                    c
                  );
                }
              });

              const beatCounts = inSec.reduce((acc, c) => {
                acc[c.start_beat] = (acc[c.start_beat] || 0) + 1;
                return acc;
              }, {});
              const mostCommon = Object.entries(beatCounts).sort(
                (a, b) => b[1] - a[1]
              )[0]?.[0];
              const sectionShift = mostCommon
                ? (4 + 1 - Number(mostCommon)) % 4
                : 0;
              if (!mostCommon) {
                console.warn(
                  `⚠️ Section "${sec.label}" has no valid start_beat values. Defaulting shift to 0.`
                );
              }
              console.log(
                `Section: ${sec.label} | Most common beat: ${mostCommon}`
              );
              const byBar = inSec.reduce((acc, c) => {
                for (let i = c.start_bar; i <= c.end_bar; i++) {
                  acc[i] = acc[i] || [];
                  acc[i].push(c);
                }
                return acc;
              }, {});

              const barNums = Object.keys(byBar).map(Number);
              if (barNums.length === 0)
                return (
                  <p key={si} className="italic text-sm mt-1">
                    No chords in this section.
                  </p>
                );

              const minBar = Math.min(...barNums);
              const maxBar = Math.max(...barNums);
              const allBars = Array.from(
                { length: maxBar - minBar + 1 },
                (_, i) => minBar + i
              );
              const barStrings = {};
              const bars = allBars.map((bar) => {
                const slots = Array(4).fill("–");
                (byBar[bar] || []).forEach((c) => {
                  const beat =
                    ((c.start_beat - Number(mostCommon) + 4) % 4) + 1;
                  slots[beat - 1] = formatChord(c);
                });
                barStrings[bar] = slots.join(" / ");
                return bar;
              });

              const barChunks = [];
              for (let i = 0; i < bars.length; i += 4) {
                barChunks.push(bars.slice(i, i + 4));
              }

              let lastBarContent = "";

              return (
                <div key={si} className="mb-6">
                  <h3 className="font-semibold">{sec.label}</h3>
                  {barChunks.map((chunk, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-4 gap-2 mb-2">
                      {chunk.map((bar) => {
                        const slots = Array(4).fill("–");
                        (byBar[bar] || []).forEach((c) => {
                          const beat =
                            ((c.start_beat - Number(mostCommon) + 4) % 4) + 1;
                          console.log(
                            `Chord '${formatChord(c)}' | Bar ${
                              bar + 1
                            } | Adjusted Beat: ${beat}`
                          );
                          slots[beat - 1] = formatChord(c);
                        });

                        const display = (() => {
                          const filled = slots.filter((s) => s !== "–");
                          const content =
                            filled.length === 1 && slots[0] !== "–"
                              ? slots[0]
                              : filled.length === 2 &&
                                slots[0] !== "–" &&
                                slots[2] !== "–" &&
                                slots[1] === "–" &&
                                slots[3] === "–"
                              ? `${slots[0]} ${slots[2]}`
                              : slots.join(" / ");

                          if (content === lastBarContent) {
                            return "%";
                          } else {
                            lastBarContent = content;
                            return content;
                          }
                        })();

                        return (
                          <div
                            key={bar}
                            className="relative p-2 border text-center"
                          >
                            <div className="absolute top-1 left-1 text-[10px] font-semibold text-gray-500 text-left">
                              Bar {bar + 1}
                            </div>
                            <div className="pt-4 text-[10px]">{display}</div>
                          </div>
                        );
                      })}
                      {chunk.length < 4 &&
                        Array.from({ length: 4 - chunk.length }).map(
                          (_, idx) => (
                            <div
                              key={`empty-${idx}`}
                              className="p-2 border text-center opacity-0"
                            >
                              Empty
                            </div>
                          )
                        )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
