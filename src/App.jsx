import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Jobs from "./jobs.jsx";
import SetlistPage from "./SetlistPage.jsx"; //
import SetlistBuilder from "./SetListBuilder.jsx"; //
import BackButton from "./components/BackButton.jsx";
import SetlistDetailPage from "./SetlistDetailPage.jsx";
import Upload from "./Upload.jsx"; // import at top
import { BsFillHouseDoorFill } from "react-icons/bs";
import { BsJournal } from "react-icons/bs";
import LyricsWithChordMap from "./ChordMap.jsx";
import SettingsPage from "./SettingsPage.jsx";
import { IoIosSettings } from "react-icons/io";
import YouTubeToChords from "./components/YouTubeToChords.jsx";
import { FaYoutube } from "react-icons/fa";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 bg-gray-100">
        <div className="flex justify-center items-center space-x-10 text-xl">
          <Link to="/setlist" className="text-gray-800 hover:text-blue-600">
            <BsJournal />
          </Link>
          <Link to="/" className="text-gray-800 hover:text-blue-600">
            <BsFillHouseDoorFill />
          </Link>
          <Link
            to="/youtube-to-chords"
            className="text-gray-800 hover:text-red-600"
          >
            <FaYoutube />
          </Link>
          <Link to="/settings" className="text-gray-800 hover:text-blue-600">
            <IoIosSettings />
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Jobs />} />
        <Route path="/youtube-to-chords" element={<YouTubeToChords />} />
        <Route path="/jobs" element={<Jobs />} />
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
