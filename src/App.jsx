// src/App.jsx
import { useState, useEffect } from 'react';
import { listJobs, getJob, fetchJSON } from './api.js';
import './App.css';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [chordMapData, setChordMapData] = useState([]);

  // Fetch list of jobs on initial mount
  useEffect(() => {
    listJobs()
      .then(setJobs)
      .catch(err => console.error('❌ listJobs error:', err));
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
    <div style={{ padding: '1rem', fontFamily: 'sans-serif', background: '#222', color: '#fff' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Music AI Jobs</h1>
      <p style={{ marginBottom: '1rem' }}>Click “View Details” to load job info and chord map.</p>

      {/* List of jobs */}
      <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
        {jobs.map(job => (
          <li key={job.id} style={{ marginBottom: '0.5rem' }}>
            <strong>{job.id}</strong> — {job.status}
            <button
              onClick={() => viewDetails(job.id)}
              style={{ marginLeft: '0.5rem', textDecoration: 'underline', color: '#61dafb', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View Details
            </button>
          </li>
        ))}
      </ul>

      {/* Render job details */}
      {jobDetails && (
        <section style={{ background: '#333', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Job Details</h2>
          <pre style={{ overflowX: 'auto', fontSize: '0.875rem' }}>
            {JSON.stringify(jobDetails, null, 2)}
          </pre>
        </section>
      )}

      {/* Render chord map in a 4-column CSS grid */}
      {chordMapData.length > 0 && (
        <section style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <h2 style={{ gridColumn: '1 / -1', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Chord Map</h2>
          {chordMapData.map((item, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid #555',
                padding: '1rem',
                borderRadius: '0.5rem',
                textAlign: 'center',
                background: '#444',
                boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                color: '#fff'
              }}
            >
              {item.chord_majmin}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}


