// src/Lyrics.jsx
import { useState, useEffect } from "react";
import { getJob, fetchJSON } from "./api.js";

const TEST_ID = "e2c0244c-02ad-4240-83d8-d9808ea08b18";

export default function Lyrics() {
  const [lyrics, setLyrics] = useState([]);

  useEffect(() => {
    getJob(TEST_ID)
      .then((detail) => {
        const url = detail.result?.["lyrics aligned"];
        return url ? fetchJSON(url) : [];
      })
      .then((data) => Array.isArray(data) && setLyrics(data))
      .catch(console.error);
  }, []);

  return (
    <div className="App p-4">
      <h1 className="text-2xl font-bold mb-4">Lyrics</h1>
      {lyrics.length ? (
        <div className="space-y-1">
          {lyrics.map((line, i) => (
            <p key={i}>
              <span className="font-mono text-sm">{line.time}s</span>{" "}
              {line.text}
            </p>
          ))}
        </div>
      ) : (
        <p>No lyrics data.</p>
      )}
    </div>
  );
}
