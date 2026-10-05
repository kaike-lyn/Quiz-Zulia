import { QuizQuestion, QuizSubmission, LeaderboardEntry, QuizSettings } from '../types/quiz';
import { INITIAL_QUESTIONS, DEFAULT_SETTINGS } from '../data/initialQuestions';
import {
  saveSubmissionToFirestore,
  fetchSubmissionsFromFirestore,
  deleteSubmissionFromFirestore,
  resetSubmissionsInFirestore,
  saveQuizConfigToFirestore,
  fetchQuizConfigFromFirestore
} from '../firebase/firestoreService';

const STORAGE_KEYS = {
  QUESTIONS: 'jb_quiz_questions_v1',
  SETTINGS: 'jb_quiz_settings_v1',
  SUBMISSIONS: 'jb_quiz_submissions_v1'
};

export async function fetchQuizConfig(): Promise<{ questions: QuizQuestion[]; settings: QuizSettings }> {
  // 1. Try Firebase Firestore first (permanent cloud)
  try {
    const firestoreConfig = await fetchQuizConfigFromFirestore();
    if (firestoreConfig && firestoreConfig.questions.length > 0) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(firestoreConfig.questions));
      if (firestoreConfig.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...DEFAULT_SETTINGS, ...firestoreConfig.settings }));
      }
      return {
        questions: firestoreConfig.questions,
        settings: { ...DEFAULT_SETTINGS, ...(firestoreConfig.settings || {}) }
      };
    }
  } catch (err) {
    console.warn('Firestore quiz config lookup error, trying fallback', err);
  }

  // 2. Try backend API fallback
  try {
    const res = await fetch('/api/quiz-config');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.questions) && data.questions.length > 0) {
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(data.questions));
        if (data.settings) {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...DEFAULT_SETTINGS, ...data.settings }));
        }
        return {
          questions: data.questions,
          settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) }
        };
      }
    }
  } catch (err) {
    console.warn('Backend /api/quiz-config unreachable, checking local cache', err);
  }

  // 3. Fallback to local storage or initial seed
  const cachedQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
  const cachedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

  const questions: QuizQuestion[] = cachedQuestions ? JSON.parse(cachedQuestions) : INITIAL_QUESTIONS;
  const settings: QuizSettings = cachedSettings ? JSON.parse(cachedSettings) : DEFAULT_SETTINGS;

  return { questions, settings };
}

export async function saveQuizConfig(questions: QuizQuestion[], settings: QuizSettings): Promise<boolean> {
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

  // Sync to Firebase Firestore
  try {
    await saveQuizConfigToFirestore(questions, settings);
  } catch (err) {
    console.warn('Failed to sync config to Firestore', err);
  }

  // Sync to backend /api
  try {
    await fetch('/api/quiz-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions, settings })
    });
  } catch (err) {
    console.warn('Failed to sync to backend /api/quiz-config', err);
  }

  return true;
}

export async function submitQuizResult(submission: QuizSubmission): Promise<QuizSubmission> {
  const cleanEmail = submission.participantEmail.trim().toLowerCase();
  
  // Check local cache first
  const existingLocal = getLocalSubmissions();
  const alreadyExists = existingLocal.find(s => s.participantEmail.trim().toLowerCase() === cleanEmail);
  if (alreadyExists) {
    return alreadyExists;
  }

  // 1. Save to Firebase Firestore (PERMANENT CLOUD DATABASE)
  let savedSubmission = submission;
  try {
    savedSubmission = await saveSubmissionToFirestore(submission);
  } catch (err) {
    console.warn('Failed to save directly to Firestore, proceeding with local & API backup', err);
  }

  // 2. Cache in localStorage
  const updatedLocal = [savedSubmission, ...existingLocal.filter(s => s.id !== savedSubmission.id)];
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updatedLocal));

  // 3. Backup to Express backend API (if online)
  try {
    fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savedSubmission)
    }).catch(() => {});
  } catch {}

  return savedSubmission;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  // 1. Fetch directly from Firebase Firestore (instant & always live)
  try {
    const firestoreSubmissions = await fetchSubmissionsFromFirestore();
    if (firestoreSubmissions && firestoreSubmissions.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(firestoreSubmissions));
      return firestoreSubmissions.map((sub, index) => ({
        rank: index + 1,
        id: sub.id,
        participantName: sub.participantName,
        participantEmail: sub.participantEmail,
        score: sub.score,
        totalQuestions: sub.totalQuestions,
        percentage: sub.percentage,
        totalDurationSeconds: sub.totalDurationSeconds,
        formattedTime: sub.formattedTime,
        submittedAt: sub.submittedAt
      }));
    }
  } catch (err) {
    console.warn('Firestore leaderboard query error, checking fallbacks', err);
  }

  // 2. Fallback to backend API
  try {
    const res = await fetch('/api/leaderboard');
    if (res.ok) {
      const data: LeaderboardEntry[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch leaderboard from API, computing from local storage', err);
  }

  // 3. Fallback to local storage
  const submissions = getLocalSubmissions();
  const sorted = [...submissions].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (a.totalDurationSeconds || 999999) - (b.totalDurationSeconds || 999999);
  });

  return sorted.map((sub, index) => ({
    rank: index + 1,
    id: sub.id,
    participantName: sub.participantName,
    participantEmail: sub.participantEmail,
    score: sub.score,
    totalQuestions: sub.totalQuestions,
    percentage: sub.percentage,
    totalDurationSeconds: sub.totalDurationSeconds,
    formattedTime: sub.formattedTime,
    submittedAt: sub.submittedAt
  }));
}

export async function fetchAllSubmissions(): Promise<QuizSubmission[]> {
  // 1. Fetch directly from Firebase Firestore
  try {
    const firestoreItems = await fetchSubmissionsFromFirestore();
    if (firestoreItems && firestoreItems.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(firestoreItems));
      return firestoreItems;
    }
  } catch (err) {
    console.warn('Firestore fetch all submissions error, checking fallbacks', err);
  }

  // 2. Fallback to API
  try {
    const res = await fetch('/api/submissions');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch all submissions from API', err);
  }

  return getLocalSubmissions();
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const local = getLocalSubmissions().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(local));

  // Delete from Firestore
  try {
    await deleteSubmissionFromFirestore(id);
  } catch (err) {
    console.warn('Failed to delete from Firestore', err);
  }

  // Delete from API
  try {
    await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
  } catch {}

  return true;
}

export async function resetRanking(pin: string): Promise<boolean> {
  if (pin !== 'julia2026' && pin !== 'nutri2026') {
    return false;
  }
  localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);

  // Reset in Firestore
  try {
    await resetSubmissionsInFirestore();
  } catch (err) {
    console.warn('Failed to reset in Firestore', err);
  }

  // Reset in API
  try {
    await fetch('/api/submissions/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
  } catch {}

  return true;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getLocalSubmissions(): QuizSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
