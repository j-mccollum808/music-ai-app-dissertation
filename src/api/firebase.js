// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getStorage }    from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';


// Firebase config pulled from your .env.local via Vite
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  // (optional) messagingSenderId, appId if you need them elsewhere
};

// Initialize Firebase App
const firebaseApp = initializeApp(firebaseConfig);

// Export the storage instance for uploads & downloads
export const storage = getStorage(firebaseApp);
export const db = getFirestore(firebaseApp); 


