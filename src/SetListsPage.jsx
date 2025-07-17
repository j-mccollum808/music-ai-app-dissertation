// src/SetlistsPage.jsx
import React, { useState, useEffect } from "react";
import {
  fetchSetlists,
  fetchSongs,
  createSetlist,
  updateSetlist,
} from "./api.js";
import Modal from "./components/Modal.jsx";

// A simple Setlists page where songs can be added to setlists
export default function SetlistsPage() {
  const [setlists, setSetlists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState(null); // current setlist being edited
  const [selectedSongIds, setSelectedSongIds] = useState(new Set());
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchSetlists(), fetchSongs()])
      .then(([sl, sg]) => {
        setSetlists(sl);
        setSongs(sg);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = () => {
    setCurrent(null);
    setNewTitle("");
    setSelectedSongIds(new Set());
    setShowModal(true);
  };

  const handleEdit = (setlist) => {
    setCurrent(setlist);
    setNewTitle(setlist.title);
    setSelectedSongIds(new Set(setlist.songs.map((s) => s.id)));
    setShowModal(true);
  };

  const handleSave = () => {
    const payload = { title: newTitle, songIds: Array.from(selectedSongIds) };
    const action = current
      ? updateSetlist(current.id, payload)
      : createSetlist(payload);

    action
      .then((updated) => {
        // refresh local list
        const updatedList = current
          ? setlists.map((sl) => (sl.id === updated.id ? updated : sl))
          : [...setlists, updated];
        setSetlists(updatedList);
        setShowModal(false);
      })
      .catch(console.error);
  };

  if (loading) return <p className="p-4">Loading setlists…</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Setlists</h1>
      <div className="space-y-4 mb-6">
        {setlists.map((sl) => (
          <div
            key={sl.id}
            className="flex items-center justify-between p-4 bg-white rounded shadow"
          >
            <div>
              <p className="font-semibold">{sl.title}</p>
              <p className="text-sm text-gray-500">{sl.songs.length} songs</p>
            </div>
            <button
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => handleEdit(sl)}
            >
              …
            </button>
          </div>
        ))}
      </div>
      <button
        className="w-full py-3 bg-gray-200 rounded font-semibold"
        onClick={handleAdd}
      >
        + ADD
      </button>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 className="text-xl font-bold mb-4">
            {current ? "Edit Setlist" : "New Setlist"}
          </h2>
          <input
            type="text"
            placeholder="Setlist title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <div className="max-h-64 overflow-y-auto mb-4">
            {songs.map((song) => (
              <label key={song.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectedSongIds.has(song.id)}
                  onChange={() => {
                    const copy = new Set(selectedSongIds);
                    copy.has(song.id)
                      ? copy.delete(song.id)
                      : copy.add(song.id);
                    setSelectedSongIds(copy);
                  }}
                  className="mr-2"
                />
                {song.title}
              </label>
            ))}
          </div>
          <div className="flex justify-end space-x-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
