export type QuestionAnswerType = 'VERDADEIRO' | 'FALSO';

export interface QuizQuestion {
  id: string;
  statement: string;
  isTrue: boolean; // true = Verdade, false = Mito / Falso
  category: 'Alimentação & Prevenção' | 'Microbiota & Imunidade' | 'Hormônios & Metabolismo' | 'Toxinas & Ambiente' | 'Estilo de Vida';
  explanation: string;
  scientificReference?: string;
}

export interface ParticipantAnswer {
  questionId: string;
  statement: string;
  userAnswer: QuestionAnswerType;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface QuizSubmission {
  id: string;
  participantName: string;
  participantEmail: string;
  participantPhone?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  totalDurationSeconds: number;
  formattedTime: string;
  submittedAt: string;
  answers: ParticipantAnswer[];
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  participantName: string;
  participantEmail: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  totalDurationSeconds: number;
  formattedTime: string;
  submittedAt: string;
}

export interface QuizSettings {
  title: string;
  nutritionistName: string;
  subtitle: string;
  allowInstantFeedback: boolean;
  randomizeQuestions: boolean;
  adminPin: string;
}
