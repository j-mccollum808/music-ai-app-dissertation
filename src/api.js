// src/api.js

import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";import { db } from "./firebase.js";


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

