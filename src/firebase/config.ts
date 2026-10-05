import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

export const firebaseConfig = {
  projectId: "knowledgeable-abbey-9bndl",
  appId: "1:736337709324:web:f1f8b0515cc03618166129",
  apiKey: "AIzaSyAeTsBRbaeEo8V2fTYtYdH4vA2Eo4JzzrI",
  authDomain: "knowledgeable-abbey-9bndl.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-quizmitosverdade-d7ccec7e-b3aa-4204-b250-733305d2d57b",
  storageBucket: "knowledgeable-abbey-9bndl.firebasestorage.app",
  messagingSenderId: "736337709324"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection on boot per Firebase guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'submissions', 'connection_test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration.");
    }
  }
}
testConnection();
