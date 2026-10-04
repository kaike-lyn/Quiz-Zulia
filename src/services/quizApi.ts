import { QuizQuestion, QuizSubmission, LeaderboardEntry, QuizSettings } from '../types/quiz';
import { INITIAL_QUESTIONS, DEFAULT_SETTINGS } from '../data/initialQuestions';

const STORAGE_KEYS = {
  QUESTIONS: 'jb_quiz_questions_v1',
  SETTINGS: 'jb_quiz_settings_v1',
  SUBMISSIONS: 'jb_quiz_submissions_v1'
};

export async function fetchQuizConfig(): Promise<{ questions: QuizQuestion[]; settings: QuizSettings }> {
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

  // Fallback to local storage or initial seed
  const cachedQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
  const cachedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

  const questions: QuizQuestion[] = cachedQuestions ? JSON.parse(cachedQuestions) : INITIAL_QUESTIONS;
  const settings: QuizSettings = cachedSettings ? JSON.parse(cachedSettings) : DEFAULT_SETTINGS;

  return { questions, settings };
}

export async function saveQuizConfig(questions: QuizQuestion[], settings: QuizSettings): Promise<boolean> {
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

  try {
    const res = await fetch('/api/quiz-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions, settings })
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to sync to backend /api/quiz-config', err);
    return true; // Local storage updated
  }
}

export async function submitQuizResult(submission: QuizSubmission): Promise<QuizSubmission> {
  const cleanEmail = submission.participantEmail.trim().toLowerCase();
  
  // Check local cache first
  const existingLocal = getLocalSubmissions();
  const alreadyExists = existingLocal.find(s => s.participantEmail.trim().toLowerCase() === cleanEmail);
  if (alreadyExists) {
    return alreadyExists;
  }

  const updatedLocal = [submission, ...existingLocal];
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updatedLocal));

  try {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    });
    if (res.ok) {
      const data = await res.json();
      return data.submission || submission;
    } else if (res.status === 409) {
      const data = await res.json();
      if (data.existing) {
        return data.existing;
      }
    }
  } catch (err) {
    console.warn('Failed to post submission to backend, stored locally', err);
  }

  return submission;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch('/api/leaderboard');
    if (res.ok) {
      const data: LeaderboardEntry[] = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch leaderboard from API, computing from local storage', err);
  }

  // Fallback computation
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
  try {
    const res = await fetch('/api/submissions');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        // Sync local storage
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

  try {
    const res = await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return true;
  }
}

export async function resetRanking(pin: string): Promise<boolean> {
  if (pin !== 'julia2026' && pin !== 'nutri2026') {
    return false;
  }
  localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);

  try {
    const res = await fetch('/api/submissions/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    return res.ok;
  } catch {
    return true;
  }
}

function getLocalSubmissions(): QuizSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);
  if (mins === 0) {
    return `${secs}.${tenths}s`;
  }
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
}
