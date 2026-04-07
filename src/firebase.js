import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDMRtMyrMzpXBjYAmBFIDBAF5A4M2McZ6A",
  authDomain: "shreyaschatfree.firebaseapp.com",
  projectId: "shreyaschatfree",
  databaseURL: "https://shreyaschatfree-default-rtdb.firebaseio.com/", // हे कन्फर्म करण्यासाठी एकदा Realtime DB डॅशबोर्ड बघा
  storageBucket: "shreyaschatfree.firebasestorage.app",
  messagingSenderId: "669280639291",
  appId: "1:669280639291:web:2afb4f18340801a3a37f1e"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
