// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore'; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBynh8HcedIgIrBxskyE8E2q0SCqnrGxd4",
  authDomain: "chatsupport-382de.firebaseapp.com",
  projectId: "chatsupport-382de",
  storageBucket: "chatsupport-382de.appspot.com",
  messagingSenderId: "343593143364",
  appId: "1:343593143364:web:6fb67044613922c480c011",
  measurementId: "G-ET1S1M0040"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);