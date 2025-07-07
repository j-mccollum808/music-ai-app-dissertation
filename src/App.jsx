// src/App.jsx
import { useState, useEffect } from 'react';
import { listJobs, getJob, fetchJSON } from './api.js';
import './App.css';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [chordMapData, setChordMapData] = useState([]);
  const [lyricsData, setLyricsData] = useState([]);
  const [sectionsData, setSectionsData] = useState([]);



  // Fetch list of jobs on initial mount
  useEffect(() => {
  listJobs()
    .then(res => {
      console.log('fetched jobs:', res);
      setJobs(res);
    })
    .catch(err => console.error('listJobs error:', err));
}, []);

useEffect(() => {
    const TEST_ID = 'e2c0244c-02ad-4240-83d8-d9808ea08b18';

    getJob(TEST_ID)
      .then(detail => {
        setJobDetails(detail);

        const urls = {
          sections: detail.result?.sections,
          chords: detail.result?.['chord map'],
          lyrics: detail.result?.['lyrics aligned']
        };

        return Promise.all([
          urls.sections ? fetchJSON(urls.sections) : Promise.resolve([]),
          urls.chords  ? fetchJSON(urls.chords)  : Promise.resolve([]),
          urls.lyrics  ? fetchJSON(urls.lyrics)  : Promise.resolve([])
        ]);
      })
      .then(([sections, chords, lyrics]) => {
        setSectionsData(Array.isArray(sections) ? sections : []);
        setChordMapData(Array.isArray(chords)   ? chords   : []);
        setLyricsData(Array.isArray(lyrics)     ? lyrics   : []);
      })
      .catch(err => console.error('❌ load test job error:', err));
  }, []);

  // Handler to fetch a single job’s details and its chord map JSON
  const viewDetails = async (id) => {
    try {
      const detail = await getJob(id);
      console.log('🔍 Job detail:', detail);
      setJobDetails(detail);

      // Extract the chord map URL from result
      const chordMapUrl = detail.result?.['chords map'];
      if (!chordMapUrl) {
        console.warn('⚠️ No "chords map" URL found in result');
        setChordMapData([]);
        return;
      }

      // Fetch and store chord map JSON (array of chord objects)
      const data = await fetchJSON(chordMapUrl);
      console.log('🎶 Fetched chord map data:', data);
      setChordMapData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`❌ viewDetails error for ${id}:`, err);
    }
  };

   return (
    <div className="App p-4">
      <h1 className="text-2xl font-bold mb-4">Job Results</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Sections</h2>
        {sectionsData.length
          ? (
            <ul className="list-disc list-inside">
              {sectionsData.map((sec, i) => (
                <li key={i}>
                  <strong>{sec.label}</strong> @ {sec.start}s – {sec.end}s
                </li>
              ))}
            </ul>
          )
          : <p>No sections data.</p>
        }
      </section>

       <section className="mb-6">
  <h2 className="text-xl font-semibold mb-2">Chord Map</h2>
  {chordMapData.length
    ? (
      <div className="grid grid-cols-4 gap-4">
        {chordMapData.map((c, i) => (
          <div
            key={i}
            className="p-2 border rounded text-center"
          >
            {c.chord_majmin}
          </div>
        ))}
      </div>
    )
    : <p>No chord data.</p>
  }
</section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Lyrics Aligned</h2>
        {lyricsData.length
          ? (
            <div className="space-y-1">
              {lyricsData.map((line, i) => (
                <p key={i}>
                  <span className="font-mono text-sm">{line.time}s</span>{' '}
                  {line.text}
                </p>
              ))}
            </div>
          )
          : <p>No lyrics data.</p>
        }
      </section>
    </div>
  );
}

