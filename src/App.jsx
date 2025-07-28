import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Jobs from "./jobs.jsx";
import JobPage from "./components/JobsPage.jsx";
import Lyrics from "./Lyrics.jsx";
import LyricsBeta from "./LyricsBeta.jsx";
import SetlistPage from "./SetlistPage.jsx"; //
import SetlistBuilder from "./SetListBuilder.jsx"; //
import BackButton from "./components/BackButton.jsx";
import SetlistDetailPage from "./SetlistDetailPage.jsx";
import Upload from "./Upload.jsx"; // import at top
import { BsFillHouseDoorFill } from "react-icons/bs";
import { BsJournal } from "react-icons/bs";
import LyricsWithChordMap from "./ChordMap.jsx";
import SettingsPage from "./SettingsPage.jsx";
import LyricsOnly from "./LyricsOnly.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 bg-gray-100">
        <div className="flex justify-center items-center space-x-25">
          {/* Center */}

          <Link
            to="/setlist"
            className="font-medium text-gray-800 hover:underline"
          >
            <BsJournal />
          </Link>
          <Link to="/" className="font-medium text-gray-800 hover:underline">
            <BsFillHouseDoorFill />
          </Link>
          <Link
            to="/settings"
            className="font-medium text-gray-800 hover:underline"
          >
            Settings
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Jobs />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:jobId/lyrics-only" element={<LyricsOnly />} />
        <Route path="/jobs/:jobId/lyric-beta" element={<LyricsBeta />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/setlist" element={<SetlistPage />} />{" "}
        <Route path="/upload" element={<Upload />} />
        <Route path="/builder" element={<SetlistBuilder />} />{" "}
        <Route path="/setlist/:id" element={<SetlistDetailPage />} />
        <Route path="/jobs/:jobId" element={<LyricsWithChordMap />} />
      </Routes>
    </BrowserRouter>
  );
}
