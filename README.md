Music AI — Chords & Lyrics from MP3 or YouTube

Generate chord charts and lyric sheets from uploaded audio or YouTube videos, and build setlists for practice or gigs. Built with React + Vite, Firebase (Storage + Firestore), and a Music AI API.

Prerequisites

Node 18+ (ESM support)
Firebase project (Storage + Firestore enabled)
Music AI API key
YouTube Data API key (for search)

npm run dev # frontend only
npm run server # youtube helper only
npm run dev:all # both together

Install
git clone <your-repo>
cd music-ai-app
cd music-ai
npm install

# (optional but recommended for DX)

npm install -D concurrently nodemon

To run code:

npm run dev:all

To run tests:

npm test

Acknowledgements
Vite + React
Firebase
Music AI API
YouTube Data API
