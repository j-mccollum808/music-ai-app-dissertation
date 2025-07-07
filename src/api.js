// src/api.js
const BASE_URL = 'https://api.music.ai/v1';
const API_KEY = import.meta.env.VITE_MUSIC_AI_KEY;

if (!API_KEY) {
  throw new Error('VITE_MUSIC_AI_KEY is not defined — did you add it to .env.local and restart Vite?');
}

/**
 * Fetch all jobs (API jobs endpoint).
 * @returns {Promise<Array<{id: string, status: string}>>}
 */
export async function listJobs() {
  const res = await fetch(`${BASE_URL}/job`, {
    headers: { Authorization: API_KEY }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch all workflows (orchestrator runs).
 * @returns {Promise<Array>}
 */
export async function listWorkflows() {
  const res = await fetch(`${BASE_URL}/workflow`, {
    headers: { Authorization: API_KEY }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch workflows: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Get a job by its ID.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getJob(id) {
  const res = await fetch(`${BASE_URL}/job/${id}`, {
    headers: { Authorization: API_KEY }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch job ${id}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Given a signed URL to a .json file, fetch & parse it.
 * @param {string} url
 * @returns {Promise<any>}
 */
export async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch JSON: ${res.status} ${res.statusText}`);
  }
  return res.json();
}