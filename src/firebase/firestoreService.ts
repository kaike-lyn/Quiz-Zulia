import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from './config';
import { QuizSubmission, LeaderboardEntry, QuizQuestion, QuizSettings } from '../types/quiz';

const SUBMISSIONS_COLLECTION = 'submissions';
const CONFIG_COLLECTION = 'config';

export async function saveSubmissionToFirestore(submission: QuizSubmission): Promise<QuizSubmission> {
  try {
    const cleanEmail = submission.participantEmail.trim().toLowerCase();

    // Check if user already submitted with this email
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      where('participantEmail', '==', cleanEmail)
    );
    const existingSnap = await getDocs(q);

    if (!existingSnap.empty) {
      const existingDoc = existingSnap.docs[0].data() as QuizSubmission;
      return existingDoc;
    }

    const docRef = doc(db, SUBMISSIONS_COLLECTION, submission.id);
    const payload = {
      ...submission,
      participantEmail: cleanEmail,
      submittedAt: submission.submittedAt || new Date().toISOString()
    };

    await setDoc(docRef, payload);
    return payload;
  } catch (error) {
    console.error('Error saving submission to Firestore:', error);
    throw error;
  }
}

export async function fetchSubmissionsFromFirestore(): Promise<QuizSubmission[]> {
  try {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      orderBy('score', 'desc')
    );
    const snapshot = await getDocs(q);
    const items: QuizSubmission[] = [];

    snapshot.forEach((docSnap) => {
      items.push(docSnap.data() as QuizSubmission);
    });

    // Secondary sort by duration ascending
    items.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return (a.totalDurationSeconds || 999999) - (b.totalDurationSeconds || 999999);
    });

    return items;
  } catch (error) {
    console.error('Error fetching submissions from Firestore:', error);
    return [];
  }
}

export async function deleteSubmissionFromFirestore(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, SUBMISSIONS_COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Error deleting submission from Firestore:', error);
    return false;
  }
}

export async function resetSubmissionsInFirestore(): Promise<boolean> {
  try {
    const snapshot = await getDocs(collection(db, SUBMISSIONS_COLLECTION));
    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Error resetting submissions in Firestore:', error);
    return false;
  }
}

export async function saveQuizConfigToFirestore(
  questions: QuizQuestion[],
  settings: QuizSettings
): Promise<boolean> {
  try {
    await setDoc(doc(db, CONFIG_COLLECTION, 'quiz'), {
      questions,
      settings,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving quiz config to Firestore:', error);
    return false;
  }
}

export async function fetchQuizConfigFromFirestore(): Promise<{
  questions: QuizQuestion[];
  settings: QuizSettings;
} | null> {
  try {
    const snap = await getDoc(doc(db, CONFIG_COLLECTION, 'quiz'));
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        return {
          questions: data.questions,
          settings: data.settings
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching quiz config from Firestore:', error);
    return null;
  }
}

export async function saveIdentityToFirestore(
  photoUrl?: string,
  logoUrl?: string
): Promise<boolean> {
  try {
    const payload: Record<string, any> = { updatedAt: new Date().toISOString() };
    if (photoUrl) payload.photoUrl = photoUrl;
    if (logoUrl) payload.logoUrl = logoUrl;

    await setDoc(doc(db, CONFIG_COLLECTION, 'identity'), payload, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving identity to Firestore:', error);
    return false;
  }
}

export async function fetchIdentityFromFirestore(): Promise<{
  photoUrl?: string;
  logoUrl?: string;
} | null> {
  try {
    const snap = await getDoc(doc(db, CONFIG_COLLECTION, 'identity'));
    if (snap.exists()) {
      const data = snap.data();
      return {
        photoUrl: data.photoUrl,
        logoUrl: data.logoUrl
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching identity from Firestore:', error);
    return null;
  }
}
