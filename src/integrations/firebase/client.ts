
import { initializeApp } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCr8rfdzwGYlkZW9tBf0dAj8hTq7JOvKFA",
  authDomain: "snellman-team-manager.firebaseapp.com",
  projectId: "snellman-team-manager",
  storageBucket: "snellman-team-manager.appspot.com",
  messagingSenderId: "658545483794",
  appId: "1:658545483794:web:2a5982ba009393783149f5"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
