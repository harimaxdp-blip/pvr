import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC42HcuL4sdxWrB9zcwmXxIQa_a9FsAzIA",
  authDomain: "pvr-ticket-1fc0d.firebaseapp.com",
  projectId: "pvr-ticket-1fc0d",
  storageBucket: "pvr-ticket-1fc0d.firebasestorage.app",
  messagingSenderId: "186313945794",
  appId: "1:186313945794:web:5b2656977e902ca13c415b"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

signInAnonymously(auth).catch((error) => {
  console.error("Anonymous auth failed:", error);
});