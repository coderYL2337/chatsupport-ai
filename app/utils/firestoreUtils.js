// utils/firestoreUtils.js

import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Assuming you have firebaseConfig set up

// Function to save chat history
export const saveChatHistory = async (userId, chatHistory) => {
  try {
    const userDoc = doc(db, "users", userId);
    await setDoc(userDoc, { chatHistory: chatHistory }, { merge: true });
  } catch (error) {
    console.error("Error saving chat history: ", error);
  }
};

// Function to load chat history
export const loadChatHistory = async (userId) => {
  try {
    const userDoc = doc(db, "users", userId);
    const docSnap = await getDoc(userDoc);
    if (docSnap.exists()) {
      return docSnap.data().chatHistory || [];
    } else {
      console.log("No such document!");
      return [];
    }
  } catch (error) {
    console.error("Error loading chat history: ", error);
    return [];
  }
};
