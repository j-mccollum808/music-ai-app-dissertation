import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "./firebase.js";



const BASE_URL = 'https://api.music.ai/v1';
const API_KEY = import.meta.env.VITE_MUSIC_AI_KEY;
const DEFAULT_WORKFLOW = "untitled-workflow-20012db";



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
    throw new Error(`Failed to list workflows: ${res.status}`);
  }
  const data = await res.json();
  console.log("🔍 listWorkflows response:", data); 
  return data.workflows || [];
}

/**
 * Create a new job to process audio.
 * @param {string} audioUrl - Public URL of the audio.
 * @param {string} workflowSlug - Workflow slug identifier.
 * @param {string} jobName - Human-friendly job name.
 * @returns {Promise<Object>} The created job object.
 */
export async function createJob(audioUrl, workflowSlug, jobName) {
  if (!audioUrl) throw new Error("createJob: audioUrl is required");

  // treat '', '   ', null, undefined as "no slug"
  const workflow = (workflowSlug ?? "").trim() || DEFAULT_WORKFLOW;

  const payload = {
    name: jobName || "Untitled",
    workflow,                        
    params: { inputUrl: audioUrl },
  };

  console.log("createJob payload:", payload);
  const res = await fetch(`${BASE_URL}/job`, {
    method: "POST",
    headers: {
      Authorization: API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("createJob error response:", errText);
    throw new Error(`Failed to create job: ${res.status} ${errText || res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch a job by its ID.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getJob(jobId) {
  const res = await fetch(`${BASE_URL}/job/${jobId}`, {
    headers: { Authorization: API_KEY },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch job: ${res.status}`);
  }
  const job = await res.json();
  console.log("🎵 getJob result:", job); 
  return job;
}

export async function fetchJSON(url) {
  const res = await fetch(url);
  const contentType = res.headers.get("Content-Type");

  if (!res.ok || !contentType?.includes("application/json")) {
    const text = await res.text();
    console.error("fetchJSON failed. Response was not JSON. Sample:", text.slice(0, 300));
    throw new Error("Invalid JSON response.");
  }

  try {
    return await res.json();
  } catch (err) {
    const text = await res.text();
    console.error("Failed to parse JSON. Response body:", text.slice(0, 300));
    throw new Error("JSON parse error.");
  }
}

/**
 * Create a new setlist in Firestore
 * @param {{ title: string, songIds: string[] }} payload
 */
export async function createSetlist({ title, songIds }) {
  const docRef = await addDoc(collection(db, "setlists"), {
    title,
    songIds,
    createdAt: Date.now()
  });

  return { id: docRef.id, title, songIds };
}

/**
 * Fetch all setlists from Firestore
 */
export async function fetchSetlists() {
  const snapshot = await getDocs(collection(db, "setlists"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Delete a setlist by ID from Firestore
 * @param {string} id
 */
export async function deleteSetlist(id) {
  await deleteDoc(doc(db, "setlists", id));
}

/**
 * Delete a job by ID.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteJob(id) {
  const res = await fetch(`${BASE_URL}/job/${id}`, {
    method: 'DELETE',
    headers: { Authorization: API_KEY }
  });
  if (!res.ok) {
    throw new Error(`Failed to delete job ${id}: ${res.status} ${res.statusText}`);
  }
}

/**
 * Fetch a single setlist by ID.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getSetlist(id) {
  const ref = doc(db, "setlists", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error(`Setlist not found: ${id}`);
  }

  return { id: snap.id, ...snap.data() };
}

/**
 * Update an existing setlist.
 * @param {string} id
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function updateSetlist(id, payload) {
  const ref = doc(db, "setlists", id);
  await updateDoc(ref, {
    ...payload,
    updatedAt: Date.now(),
  });
  return { id, ...payload };
}

const YT_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export async function searchYouTube(query) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&key=${YT_API_KEY}`
  );

  if (!res.ok) throw new Error("YouTube API search failed");

  return res.json();
}

/**
 * Given a job, fetch the chords.json output
 */
export async function getChordOutput(job) {
  if (!job?.outputs) throw new Error("No job outputs found.");
  const output = job.outputs.find((o) => o.name === "chords.json");
  if (!output) throw new Error("chords.json not found.");
  const res = await fetch(output.file.url);
  return await res.json();
}

/**
 * Given a job, fetch the lyrics.json output
 */
export async function getLyricOutput(job) {
  if (!job?.outputs) throw new Error("No job outputs found.");
  const output = job.outputs.find((o) => o.name === "lyrics.json");
  if (!output) throw new Error("lyrics.json not found.");
  const res = await fetch(output.file.url);
  return await res.json();
}

/**
 * Given a job, fetch the sections.json output
 */
export async function getSectionsOutput(job) {
  if (!job?.outputs) throw new Error("No job outputs found.");
  const output = job.outputs.find((o) => o.name === "sections.json");
  if (!output) throw new Error("sections.json not found.");
  const res = await fetch(output.file.url);
  return await res.json();
}

// ...
export async function saveJobResultToFirestore(job) {
  const jobId = job.id;

  const jobDoc = doc(db, "songs", jobId); // Use jobId as the document ID
  await setDoc(jobDoc, {
    jobId,
    name: job.name || "",
    status: job.status,
    createdAt: Date.now(),
    sections: job.result?.Sections || null,
    lyrics: job.result?.Lyrics || null,
    chords: job.result?.chords || null,
  });
}

// Update a job's name
export async function updateJobName(id, newName) {
  const res = await fetch(`${BASE_URL}/job/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: newName })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to rename job ${id}: ${res.status} ${res.statusText} — ${text}`);
  }
  return res.json();
}
