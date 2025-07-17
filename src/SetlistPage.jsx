import { Link, useNavigate } from "react-router-dom";

export default function SetlistPage({ jobs = [] }) {
  const navigate = useNavigate(); // for navigation

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Setlists</h1>

      {jobs.length === 0 ? (
        <p>No songs in setlist yet.</p>
      ) : (
        <ul className="space-y-2 mb-6">
          {jobs.map((job) => (
            <li key={job.id} className="border p-2 rounded">
              <Link
                to={`/jobs/${job.id}`}
                className="text-blue-600 font-medium hover:underline"
              >
                {job.name || `Song ${job.id}`}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* ➕ Create New Setlist Button */}
      <button
        className="w-full py-3 bg-gray-200 rounded font-semibold"
        onClick={() => navigate("/builder")}
      >
        + Create New Setlist
      </button>
    </div>
  );
}
