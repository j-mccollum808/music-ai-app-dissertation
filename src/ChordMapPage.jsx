// src/App.jsx
import { useState, useEffect } from "react";
import { listJobs, getJob, fetchJSON } from "./api.js";
import "./App.css";

export default function App() {
  const [jobDetails, setJobDetails] = useState(null);
  const [chordMapData, setChordMapData] = useState([]);
  const [lyricsData, setLyricsData] = useState([]);
  const [sectionsData, setSectionsData] = useState([]);
  const formatChord = (chord) => {
    return chord
      .replace(":maj", "") // drop “:maj”
      .replace(":min", "m"); // turn “:min” into “m”
  };

  useEffect(() => {
    const TEST_ID = "e2c0244c-02ad-4240-83d8-d9808ea08b18";

    getJob(TEST_ID)
      .then((detail) => {
        setJobDetails(detail);

        const urls = {
          sections: detail.result?.sections,
          chords: detail.result?.["chord map"],
          lyrics: detail.result?.["lyrics aligned"],
        };

        return Promise.all([
          urls.sections ? fetchJSON(urls.sections) : Promise.resolve([]),
          urls.chords ? fetchJSON(urls.chords) : Promise.resolve([]),
          urls.lyrics ? fetchJSON(urls.lyrics) : Promise.resolve([]),
        ]);
      })
      .then(([sections, chords, lyrics]) => {
        console.log("RAW sections:", sections);
        console.log("RAW chords:  ", chords);
        setSectionsData(Array.isArray(sections) ? sections : []);
        setChordMapData(Array.isArray(chords) ? chords : []);
        setLyricsData(Array.isArray(lyrics) ? lyrics : []);
      })
      .catch((err) => console.error("❌ load test job error:", err));
  }, []);

  // Handler to fetch a single job’s details and its chord map JSON
  const viewDetails = async (id) => {
    try {
      const detail = await getJob(id);
      console.log("🔍 Job detail:", detail);
      setJobDetails(detail);

      // Extract the chord map URL from result
      const chordMapUrl = detail.result?.["chords map"];
      if (!chordMapUrl) {
        console.warn('⚠️ No "chords map" URL found in result');
        setChordMapData([]);
        return;
      }

      // Fetch and store chord map JSON (array of chord objects)
      const data = await fetchJSON(chordMapUrl);
      console.log("🎶 Fetched chord map data:", data);
      setChordMapData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`❌ viewDetails error for ${id}:`, err);
    }
  };

  return (
    <div className="App p-4">
      <section>
        <h2 className="text-xl font-semibold mb-2">
          Chord Map 1 section and chord
        </h2>

        {sectionsData.map((sec, si) => {
          // grab chords whose time falls in this section
          const inSection = chordMapData.filter(
            (c) => c.start >= sec.start && c.start < sec.end
          );

          return (
            <div key={si} className="mb-6">
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
                <p className="italic text-sm mt-1">
                  No chords in this section.
                </p>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
