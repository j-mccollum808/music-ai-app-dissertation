import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Jobs from "./features/songs/SongsPage.jsx";
import Upload from "./features/songs/Upload.jsx";

import SetlistPage from "./features/setlists/SetlistPage.jsx";
import SetlistBuilder from "./features/setlists/SetListBuilder.jsx";
import SetlistDetailPage from "./features/setlists/SetlistDetailPage.jsx";

import LyricsWithChordMap from "./features/chords/ChordMap.jsx";

import YouTubeToChords from "./features/youtube/YouTubeToChords.jsx";

import BackButton from "./components/BackButton.jsx";

import { BsFillHouseDoorFill, BsJournal } from "react-icons/bs";
import { FaYoutube } from "react-icons/fa";

// Main application component with routing
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
        // Define application routes
        <Routes>
          <Route path="/" element={<Jobs />} />
          <Route path="/youtube-to-chords" element={<YouTubeToChords />} />
          <Route path="/jobs" element={<Jobs />} />
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
