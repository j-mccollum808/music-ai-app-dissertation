import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Jobs from "./SongsPage.jsx";
import SetlistPage from "./SetlistPage.jsx";
import SetlistBuilder from "./SetListBuilder.jsx";
import BackButton from "./components/BackButton.jsx";
import SetlistDetailPage from "./SetlistDetailPage.jsx";
import Upload from "./Upload.jsx";
import { BsFillHouseDoorFill, BsJournal } from "react-icons/bs";
import LyricsWithChordMap from "./ChordMap.jsx";
import SettingsPage from "./SettingsPage.jsx";
import { IoIosSettings } from "react-icons/io";
import YouTubeToChords from "./components/YouTubeToChords.jsx";
import { FaYoutube } from "react-icons/fa";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white">
        <nav className="p-4 bg-black border-b border-gray-700">
          <div className="flex justify-center items-center space-x-10 text-2xl">
            <Link to="/" className="text-white hover:text-[#00FF9F]">
              <BsFillHouseDoorFill />
            </Link>
            <Link to="/setlist" className="text-white hover:text-[#00FF9F]">
              <BsJournal />
            </Link>

            {/* <Link to="/settings" className="text-white hover:text-[#00FF9F]">
            IoIosSettings />
            </Link> */}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Jobs />} />
          <Route path="/youtube-to-chords" element={<YouTubeToChords />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/setlist" element={<SetlistPage />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/builder" element={<SetlistBuilder />} />
          <Route path="/setlist/:id" element={<SetlistDetailPage />} />
          <Route path="/jobs/:jobId" element={<LyricsWithChordMap />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
