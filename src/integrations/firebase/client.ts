
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgm7HF2_x04fDHUdClAv8LeMahrGp1RU8",
  authDomain: "snellman-team-manager.firebaseapp.com",
  projectId: "snellman-team-manager",
  storageBucket: "snellman-team-manager.appspot.com",
  messagingSenderId: "658545483794",
  appId: "1:658545483794:web:2a5982ba009393783149f5"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
