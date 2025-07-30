import { useEffect, useState } from "react";
import { fetchSetlists } from "./api.js"; // ✅ make sure this is implemented
import { useNavigate } from "react-router-dom";

export default function SetlistPage() {
  const navigate = useNavigate();
  const [setlists, setSetlists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSetlists()
      .then((data) => setSetlists(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
                <p className="font-semibold">{sl.title}</p>
                <p className="text-sm text-gray-600">
                  {sl.songs?.length || 0} songs
                </p>
              </div>
              {/* Optional: open builder with preloaded setlist */}
              <button
                onClick={() => navigate(`/builder?id=${sl.id}`)}
                className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ➕ Create New Setlist */}
      <button
        className="w-full py-3 bg-blue-600 text-white rounded font-semibold"
        onClick={() => navigate("/builder")}
      >
        + Create New Setlist
      </button>
    </div>
  );
}
