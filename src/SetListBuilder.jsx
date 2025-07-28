import { useEffect, useState } from "react";
import { listJobs, createSetlist, updateSetlist, getSetlist } from "./api.js";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SetlistBuilder() {
  const [songs, setSongs] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get("id"); // comes from /builder?id=abc

  useEffect(() => {
    async function load() {
      try {
        const jobs = await listJobs();
        setSongs(jobs);

        if (editingId) {
          const existing = await getSetlist(editingId);
          console.log("Editing setlist loaded:", existing);

          if (!existing) {
            console.warn("Setlist not found for ID:", editingId);
          } else {
            setTitle(existing.title || "");
            const ids =
              existing.songIds || existing.songs?.map((s) => s.id) || [];
            setSelectedIds(new Set(ids));
          }
        }
      } catch (err) {
        console.error("Failed to load jobs or setlist:", err);
      }
    }

    load();
  }, [editingId]);

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

      if (editingId) {
        await updateSetlist(editingId, payload);
      } else {
        await createSetlist(payload);
      }

      navigate("/setlist");
    } catch (err) {
      console.error("Failed to save setlist:", err);
      alert("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      setlistbuilder.jsx
      <h1 className="text-2xl font-bold mb-6">Setlist Builder</h1>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
      >
        ← Back
      </button>
      <input
        type="text"
        placeholder="Setlist title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded mb-6"
      />
      <div className="flex flex-col space-y-3">
        {songs.map((song) => {
          const isSelected = selectedIds.has(song.id);
          return (
            <div
              key={song.id}
              className={`relative p-4 border rounded shadow-sm bg-white hover:bg-gray-50 transition cursor-pointer ${
                isSelected ? "ring-2 ring-blue-500 border-blue-500" : ""
              }`}
              onClick={() => toggleSelect(song.id)}
            >
              <p className="font-semibold text-gray-800 truncate">
                {song.name || `Song ${song.id}`}
              </p>
              <p className="text-sm text-gray-500">{song.status}</p>

              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full text-white flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
            </div>
          );
        })}
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
