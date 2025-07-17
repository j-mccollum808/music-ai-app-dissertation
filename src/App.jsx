import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Jobs from "./jobs.jsx";
import JobPage from "./components/JobsPage.jsx";
import ChordMapPage from "./ChordMapPage.jsx";
import Lyrics from "./Lyrics.jsx";
import LyricsBeta from "./LyricsBeta.jsx";
import SetlistPage from "./SetlistPage.jsx"; // ✅ renamed or redirected
import SetlistBuilder from "./SetListBuilder.jsx"; // ✅ note casing
import BackButton from "./components/BackButton.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 bg-gray-100 flex space-x-4">
        <Link to="/" className="font-medium text-gray-800 hover:underline">
          Home
        </Link>
        <Link
          to="/setlist"
          className="font-medium text-gray-800 hover:underline"
        >
          Setlist
        </Link>
        <Link
          to="/builder"
          className="font-medium text-gray-800 hover:underline"
        >
          Builder
        </Link>
        <BackButton />
      </nav>

      <Routes>
        <Route path="/" element={<Jobs />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:jobId" element={<JobPage />} />
        <Route path="/jobs/:jobId/chords" element={<ChordMapPage />} />
        <Route path="/jobs/:jobId/lyrics" element={<Lyrics />} />
        <Route path="/jobs/:jobId/lyric-beta" element={<LyricsBeta />} />
        <Route path="/setlist" element={<SetlistPage />} />{" "}
        {/* ✅ Custom setlists */}
        <Route path="/builder" element={<SetlistBuilder />} />{" "}
        {/* ✅ Setlist creation */}
      </Routes>
    </BrowserRouter>
  );
}
