import { useEffect, useState } from "react";
import { listJobs, createSetlist } from "./api.js";
import { useNavigate } from "react-router-dom";

export default function SetlistBuilder() {
  const [songs, setSongs] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    listJobs().then(setSongs).catch(console.error);
  }, []);

  const toggleSelect = (id) => {
    const copy = new Set(selectedIds);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setSelectedIds(copy);
  };

  const handleSave = async () => {
    if (!title || selectedIds.size === 0) {
      alert("Please enter a title and select at least one song.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        songIds: Array.from(selectedIds),
      };
      await createSetlist(payload);
      navigate("/setlist"); // redirect back to list
    } catch (err) {
      console.error("Failed to save setlist:", err);
      alert("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Setlist Builder</h1>

      <input
        type="text"
        placeholder="Setlist title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded mb-6"
      />

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
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Setlist"}
        </button>
      </div>
    </div>
  );
}
