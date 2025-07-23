import { useEffect, useState } from "react";
import { fetchSetlists, deleteSetlist } from "./api.js";
import { useNavigate } from "react-router-dom";

export default function SetlistPage() {
  const [setlists, setSetlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSetlists()
      .then(setSetlists)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this setlist?")) return;

    try {
      await deleteSetlist(id);
      setSetlists((prev) => prev.filter((sl) => sl.id !== id));
    } catch (err) {
      console.error("Failed to delete setlist:", err);
      alert("Failed to delete. See console for details.");
    }
  };

  if (loading) return <p className="p-4">Loading setlists…</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Setlists</h1>

      {setlists.length === 0 ? (
        <p>No setlists created yet.</p>
      ) : (
        <ul className="space-y-2 mb-6">
          {setlists.map((sl) => (
            <li
              key={sl.id}
              className="p-4 border rounded flex items-center justify-between"
            >
              <div>
                <p
                  onClick={() => navigate(`/setlist/${sl.id}`)}
                  className="font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  {sl.title}
                </p>

                <p className="font-semibold">{sl.title}</p>
                <p className="text-sm text-gray-600">
                  {sl.songIds?.length || 0} songs
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/builder?id=${sl.id}`)}
                  className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(sl.id)}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        className="w-full py-3 bg-blue-600 text-white rounded font-semibold"
        onClick={() => navigate("/builder")}
      >
        + Create New Setlist
      </button>
    </div>
  );
}
