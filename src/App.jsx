import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Jobs from "./jobs.jsx";
import JobPage from "./components/JobsPage.jsx";
import ChordMapPage from "./ChordMapPage.jsx";
import Lyrics from "./Lyrics.jsx";
import LyricsBeta from "./LyricsBeta.jsx";
import SetlistPage from "./SetlistPage.jsx"; //
import SetlistBuilder from "./SetListBuilder.jsx"; //
import BackButton from "./components/BackButton.jsx";
import SetlistDetailPage from "./SetlistDetailPage.jsx";
import Upload from "./Upload.jsx"; // import at top
import { BsFillHouseDoorFill } from "react-icons/bs";
import { BsJournal } from "react-icons/bs";
import LyricsWithChordMap from "./LyricsWithChordMap.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 bg-gray-100">
        <div className="flex justify-between items-center w-full">
          {/* Left Side */}
          <BackButton />

          {/* Center */}
          <Link to="/" className="font-medium text-gray-800 hover:underline">
            <BsFillHouseDoorFill />
          </Link>

          {/* Right Side */}
          <Link
            to="/setlist"
            className="font-medium text-gray-800 hover:underline"
          >
            <BsJournal />
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Jobs />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:jobId/chords" element={<ChordMapPage />} />
        <Route path="/jobs/:jobId/lyrics" element={<Lyrics />} />
        <Route path="/jobs/:jobId/lyric-beta" element={<LyricsBeta />} />
        <Route path="/setlist" element={<SetlistPage />} />{" "}
        <Route path="/upload" element={<Upload />} />
        {/* ✅ Custom setlists */}
        <Route path="/builder" element={<SetlistBuilder />} />{" "}
        {/* ✅ Setlist creation */}
        <Route path="/setlist/:id" element={<SetlistDetailPage />} />
        <Route path="/jobs/:jobId" element={<LyricsWithChordMap />} />
      </Routes>
    </BrowserRouter>
  );
}
