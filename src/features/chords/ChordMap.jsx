import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJob, fetchJSON } from "../../api/api.js"; // ✅ correct path
import { useChordView } from "../../contexts/ChordViewContext.jsx";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../api/firebase.js";

export default function ChordMap() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { simplification, setSimplification } = useChordView(); // already here

  const [sections, setSections] = useState([]);
  const [lines, setLines] = useState([]);
  const [chords, setChords] = useState([]);
  const [adjustedChords, setAdjustedChords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("both");
  const [error, setError] = useState(null);

  const formatChord = (chordObj) => {
    const key = `chord_${simplification}_pop`;
    const chord = chordObj[key] || "–";
    return chord.replace(":maj", "").replace(":min", "m");
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        let result = null;

        const songDoc = await getDoc(doc(db, "songs", jobId));
        if (songDoc.exists()) {
          result = songDoc.data();
          console.log("📄 Loaded song from Firestore:", result);
        } else {
          const job = await getJob(jobId);
          if (!job.result) throw new Error("No result found from job.");
          result = job.result;
        }

        if (!result.sections || !result.chords || !result.lyrics) {
          console.warn("⚠️ Missing one or more expected result URLs", result);
          throw new Error("One or more outputs are missing.");
        }

        const [secs, rawLines, rawChords] = await Promise.all([
          fetchJSON(result.sections),
          fetchJSON(result.lyrics),
          fetchJSON(result.chords),
        ]);

        setSections(Array.isArray(secs) ? secs : []);
        setLines(Array.isArray(rawLines) ? rawLines : []);
        setChords(Array.isArray(rawChords) ? rawChords : []);

        const histogram = rawChords.reduce((acc, c) => {
          acc[c.start_beat] = (acc[c.start_beat] || 0) + 1;
          return acc;
        }, {});
        const mostCommon = Object.entries(histogram).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0];
        const shift = (4 + 1 - Number(mostCommon)) % 4;

        const normalized = rawChords.map((c) => ({
          ...c,
          adjusted_start_beat: ((c.start_beat - 1 + shift) % 4) + 1,
        }));

        setAdjustedChords(normalized);
      } catch (err) {
        console.error("❌ Failed to load job data:", err);
        setError("Failed to load song data. Try uploading again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [jobId, simplification]);

  if (loading) {
    return (
      <div className="p-4 text-gray-600 flex items-center space-x-2">
        <div className="spinner" />
        <span>Loading song data…</span>
      </div>
    );
  }
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-[#00FF9F] text-black rounded hover:opacity-90"
      >
        ← Back
      </button>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Chord Complexity:</label>
        <select
          value={simplification}
          onChange={(e) => setSimplification(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="basic">Basic</option>
          <option value="simple">Simple</option>
          <option value="complex">Complex</option>
        </select>
      </div>

      {/* View selector */}
      <div className="mb-6 space-x-2">
        {["both", "lyrics", "chords"].map((option) => (
          <button
            key={option}
            onClick={() => setView(option)}
            className={`px-4 py-2 rounded font-medium ${
              view === option
                ? "bg-[#00FF9F] text-black"
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

      <div
        className={
          view === "both" ? "grid grid-cols-1 md:grid-cols-2 gap-8" : ""
        }
      >
        {/* Lyrics column */}
        {(view === "both" || view === "lyrics") && (
          <div>
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
                              <div className="flex flex-wrap text-xs text-gray-500">
                                {line.words?.map((w, j) => {
                                  const hit = lineChords.find(
                                    (c) => w.start >= c.start && w.start < c.end
                                  );
                                  return (
                                    <span key={j} className="px-1">
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

        {/* Chords column */}
        {(view === "both" || view === "chords") && (
          <div>
            <h2 className="text-xl font-bold mb-4">Chord Map</h2>
            {sections.map((sec, si) => {
              const inSec = adjustedChords.filter(
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                      {bars.map((bar) => {
                        const slots = Array(4).fill("–");
                        byBar[bar].forEach((c) => {
                          const beat = c.adjusted_start_beat;
                          slots[beat - 1] = formatChord(c);
                        });

                        return (
                          <div
                            key={bar}
                            className="relative p-2 border text-center"
                          >
                            <div className="absolute top-1 left-1 text-[10px] font-semibold text-gray-500">
                              Bar {bar}
                            </div>
                            <div className="pt-4 text-[10px]">
                              {(() => {
                                const filled = slots.filter((s) => s !== "–");
                                if (filled.length === 1 && slots[0] !== "–") {
                                  return slots[0];
                                } else if (
                                  filled.length === 2 &&
                                  slots[0] !== "–" &&
                                  slots[2] !== "–"
                                ) {
                                  return `${slots[0]} ${slots[2]}`;
                                } else {
                                  return slots.join(" / ");
                                }
                              })()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="italic text-sm text-gray-500">
                      No chords found in this section.
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
