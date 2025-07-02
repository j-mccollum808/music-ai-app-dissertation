// src/api.js
const BASE_URL = 'https://api.music.ai/v1';
const API_KEY = import.meta.env.VITE_MUSIC_AI_KEY;

if (!API_KEY) {
  throw new Error('VITE_MUSIC_AI_KEY is not defined — did you add it to .env.local and restart Vite?');
}

/**
 * Fetch all jobs.
 * @returns {Promise<Array<{id: string, status: string}>>}
 */
export async function listJobs() {
  const res = await fetch(`${BASE_URL}/job`, {
    headers: {
      // Music AI expects your key here, no “Bearer” prefix
      Authorization: API_KEY,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * getJob → GET /job/:id
 * @param {string} id – the job ID
 * @returns {Promise<Object>} the full job object, with all fields
 */
export async function getJob(id) {
  const res = await fetch(`${BASE_URL}/job/${id}`, {
    headers: { Authorization: API_KEY },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch job ${id}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * fetchBeatMap
 * Given a signed beat-map URL, fetches & returns its JSON payload.
 *
 * @param {string} url – the signed GCS URL for the beat-map
 * @returns {Promise<any>} – the parsed JSON object
 */
export async function fetchBeatMap(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch beat map: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Given a signed URL to a .json file, fetch & parse it.
 */
export async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch JSON: ${res.status} ${res.statusText}`);
  }
  return res.json();
}