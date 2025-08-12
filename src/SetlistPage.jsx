import { useEffect, useState } from "react";
import { fetchSetlists, deleteSetlist } from "./api.js";
import { useNavigate } from "react-router-dom";

export default function SetlistPage() {
  const [setlists, setSetlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
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
      setOpenMenuId(null);
    } catch (err) {
      console.error("Failed to delete setlist:", err);
      alert("Failed to delete. See console for details.");
    }
  };

  if (loading) return <p className="p-4">Loading setlists…</p>;

  return (
    <div className="p-4 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">My Setlists</h1>
      {setlists.length === 0 ? (
        <p className="text-gray-400">No setlists created yet.</p>
      ) : (
        <ul className="space-y-2 mb-6">
          {setlists.map((sl) => (
            <li key={sl.id}>
              <div
                className="flex items-center justify-between p-4 border rounded shadow bg-gray-900 hover:bg-gray-800 transition border-gray-700 cursor-pointer"
                onClick={() => navigate(`/setlist/${sl.id}`)}
              >
                <div>
                  <p className="font-semibold text-white text-lg">{sl.title}</p>
                  <p className="text-sm text-gray-400">
                    {sl.songIds?.length || 0} songs
                  </p>
                </div>

                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === sl.id ? null : sl.id)
                    }
                    className="text-xl px-2 py-1 rounded hover:bg-gray-700 text-white"
                  >
                    ⋯
                  </button>

                  {openMenuId === sl.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-600 rounded shadow-md z-10">
                      <button
                        onClick={() => {
                          navigate(`/builder?id=${sl.id}`);
                          setOpenMenuId(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-white"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(sl.id)}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-red-400"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button
        className="w-full py-3 bg-[#00FF9F] text-black rounded font-semibold hover:opacity-90"
        onClick={() => navigate("/builder")}
      >
        + Create New Setlist
      </button>
    </div>
  );
}
