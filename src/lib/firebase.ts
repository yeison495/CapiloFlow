import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "capiloflow",
  appId: "1:27039120818:web:6784c51df1301e7718f8ab",
  storageBucket: "capiloflow.firebasestorage.app",
  apiKey: "AIzaSyB0l4EP7fnWUgSDkak-2djX33i8VA7_IwQ",
  authDomain: "capiloflow.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "27039120818",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
