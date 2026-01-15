// src/features/setlists/SetListBuilder.jsx
import { useEffect, useState } from "react";
import {
  listJobs,
  createSetlist,
  updateSetlist,
  getSetlist,
} from "../../api/api.js";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SetlistBuilder() {
  const [songs, setSongs] = useState([]); // <-- listJobs() goes here
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get("id"); // /builder?id=abc

  useEffect(() => {
    async function load() {
      try {
        const jobs = await listJobs();
        setSongs(jobs);

        if (editingId) {
          const existing = await getSetlist(editingId);
          if (existing) {
            setTitle(existing.title || "");
            const ids =
              existing.songIds || existing.songs?.map((s) => s.id) || [];
            setSelectedIds(new Set(ids));
          } else {
            console.warn("Setlist not found for ID:", editingId);
          }
        }
      } catch (err) {
        console.error("Failed to load jobs or setlist:", err);
      }
    }
    load();
  }, [editingId]);

  // Toggle selection of a song ID
  const toggleSelect = (id) => {
    const copy = new Set(selectedIds);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setSelectedIds(copy);
  };

  // Save the setlist (create or update)
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
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-[#00FF9F] text-black rounded hover:opacity-90"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Setlist Builder</h1>

      <input
        type="text"
        placeholder="Setlist title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded mb-6"
      />

      <div className="flex flex-col space-y-3">
        {songs.map((song) => {
          const isSelected = selectedIds.has(song.id); // <-- use selectedIds
          return (
            <div
              key={song.id}
              data-testid={`job-${song.id}`} // <-- stable for tests
              className={`relative p-4 border rounded shadow-sm bg-white hover:bg-gray-50 transition cursor-pointer ${
                isSelected ? "ring-2 ring-[#00FF9F]" : ""
              }`}
              onClick={() => toggleSelect(song.id)}
            >
              <p className="font-semibold text-gray-800 truncate">
                {song.name || song.title || `Song ${song.id}`}
              </p>

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
          className="px-4 py-2 bg-[#00FF9F] text-black rounded disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Setlist"}
        </button>
      </div>
    </div>
  );
}
