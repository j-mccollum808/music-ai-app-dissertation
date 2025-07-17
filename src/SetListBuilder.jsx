// src/SetlistBuilder.jsx
import { useEffect, useState } from "react";
import { listJobs } from "./api.js";

export default function SetlistBuilder() {
  const [songs, setSongs] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    listJobs().then(setSongs).catch(console.error);
  }, []);

  const toggleSelect = (id) => {
    const copy = new Set(selectedIds);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setSelectedIds(copy);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Setlist Builder</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {songs.map((song) => (
          <div
            key={song.id}
            className={`p-4 border rounded shadow cursor-pointer ${
              selectedIds.has(song.id)
                ? "bg-blue-100 border-blue-500"
                : "bg-white"
            }`}
            onClick={() => toggleSelect(song.id)}
          >
            <p className="font-semibold">{song.name || `Song ${song.id}`}</p>
            <p className="text-sm text-gray-600">{song.status}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 text-right">
        <button className="px-4 py-2 bg-green-600 text-white rounded">
          Save Setlist
        </button>
      </div>
    </div>
  );
}
