// src/components/jobdetails/JobDetail.jsx
import React from "react";
import ChordMapPage from "../ChordMapPage.jsx";
import Lyrics from "../Lyrics.jsx";

export default function JobDetail() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Song Details</h1>

      {/* Chords section */}
      <ChordMapPage />

      {/* Lyrics section */}
      <div className="mt-8">
        <Lyrics />
      </div>
    </div>
  );
}
