// src/App.jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ChordMapPage from "./ChordMapPage.jsx";
import Lyrics from "./Lyrics.jsx";
import Jobs from "./Jobs.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 bg-gray-100 flex space-x-4">
        <Link to="/jobs">Jobs</Link>
        <Link to="/jobs/:jobId/chords">Chords</Link>
        <Link to="/jobs/:jobId/lyrics">Lyrics</Link>
      </nav>

      <Routes>
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:jobId/chords" element={<ChordMapPage />} />
        <Route path="/jobs/:jobId/lyrics" element={<Lyrics />} />
      </Routes>
    </BrowserRouter>
  );
}
