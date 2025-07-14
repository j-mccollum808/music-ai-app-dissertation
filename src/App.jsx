// src/App.jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ChordMapPage from "./ChordMapPage.jsx";
import Lyrics from "./Lyrics.jsx";
import Jobs from "./jobs.jsx";
import JobPage from "./components/JobsPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 bg-gray-100">
        <Link to="/" className="font-medium text-gray-800 hover:underline">
          Jobs
        </Link>
      </nav>

      <Routes>
        {/* Jobs list */}
        <Route path="/" element={<Jobs />} />
        <Route path="/jobs" element={<Jobs />} />

        {/* Job selector page */}
        <Route path="/jobs/:jobId" element={<JobPage />} />

        {/* Detail views */}
        <Route path="/jobs/:jobId/chords" element={<ChordMapPage />} />
        <Route path="/jobs/:jobId/lyrics" element={<Lyrics />} />
      </Routes>
    </BrowserRouter>
  );
}
