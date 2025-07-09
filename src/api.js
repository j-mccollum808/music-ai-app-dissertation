// src/api.js
const BASE_URL = 'https://api.music.ai/v1';
const API_KEY = import.meta.env.VITE_MUSIC_AI_KEY;

if (!API_KEY) {
  throw new Error('VITE_MUSIC_AI_KEY is not defined — did you add it to .env.local and restart Vite?');
}

/**
 * Fetch all API-created jobs.
 * @returns {Promise<Array>}
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
 * Fetch all workflow definitions.
 * @returns {Promise<{workflows: Array}>}
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
 * Create a new job to process audio.
 * @param {string} audioUrl - Public URL of the audio.
 * @param {string} workflowSlug - Workflow slug identifier.
 * @param {string} jobName - Human-friendly job name.
 * @returns {Promise<Object>} The created job object.
 */
export async function createJob(audioUrl, workflowSlug, jobName) {
  const payload = {
    name: jobName,
    workflow: workflowSlug,
    params: { inputUrl: audioUrl }
  };

  console.log('createJob payload:', payload);
  const res = await fetch(`${BASE_URL}/job`, {
    method: 'POST',
    headers: {
      Authorization: API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('createJob error response:', errText);
    throw new Error(`Failed to create job: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch a job by its ID.
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
 * Fetch and parse JSON from a given URL.
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
