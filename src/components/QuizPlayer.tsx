import React, { useState, useEffect, useRef } from 'react';
import { QuizQuestion, ParticipantAnswer, QuizSubmission, QuestionAnswerType } from '../types/quiz';
import { Timer, CheckCircle, XCircle, ArrowRight, BookOpen, Sparkles, AlertCircle } from 'lucide-react';
import { formatDuration } from '../services/quizApi';

interface QuizPlayerProps {
  questions: QuizQuestion[];
  participant: { name: string; email: string; phone?: string };
  onFinish: (submission: QuizSubmission) => void;
  onExit: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  questions,
  participant,
  onFinish,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ParticipantAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<QuestionAnswerType | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const startTimeRef = useRef<number>(Date.now());
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  // Active overall timer
  useEffect(() => {
    startTimeRef.current = Date.now();
    questionStartTimeRef.current = Date.now();

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const seconds = (now - startTimeRef.current) / 1000;
      setElapsedSeconds(seconds);
    }, 100);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex) / questions.length) * 100);

  const handleSelectAnswer = (answer: QuestionAnswerType) => {
    if (isAnswered) return;

    const timeSpent = (Date.now() - questionStartTimeRef.current) / 1000;
    const isCorrect = (answer === 'VERDADEIRO' && currentQuestion.isTrue) ||
                      (answer === 'FALSO' && !currentQuestion.isTrue);

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const record: ParticipantAnswer = {
      questionId: currentQuestion.id,
      statement: currentQuestion.statement,
      userAnswer: answer,
      isCorrect,
      timeSpentSeconds: Number(timeSpent.toFixed(1)),
    };

    setAnswers((prev) => [...prev, record]);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      questionStartTimeRef.current = Date.now();
    } else {
      // Finished all questions!
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    const finalDuration = (Date.now() - startTimeRef.current) / 1000;
    const score = answers.reduce((acc, curr) => (curr.isCorrect ? acc + 1 : acc), 0) +
      (selectedAnswer !== null ? ((selectedAnswer === 'VERDADEIRO' && currentQuestion.isTrue) || (selectedAnswer === 'FALSO' && !currentQuestion.isTrue) ? 0 : 0) : 0);
    
    // Note: answers array already has all recorded answers
    const totalScore = answers.reduce((acc, curr) => (curr.isCorrect ? acc + 1 : acc), 0);
    const percentage = Number(((totalScore / questions.length) * 100).toFixed(1));

    const submission: QuizSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      participantName: participant.name,
      participantEmail: participant.email,
      participantPhone: participant.phone,
      score: totalScore,
      totalQuestions: questions.length,
      percentage,
      totalDurationSeconds: Number(finalDuration.toFixed(1)),
      formattedTime: formatDuration(finalDuration),
      submittedAt: new Date().toISOString(),
      answers,
    };

    onFinish(submission);
  };

  const isCurrentCorrect = selectedAnswer !== null && (
    (selectedAnswer === 'VERDADEIRO' && currentQuestion.isTrue) ||
    (selectedAnswer === 'FALSO' && !currentQuestion.isTrue)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      
      {/* Top Bar with Live Timer, Participant & Progress */}
      <div className="bg-[#FAF9F5] border border-[#DEE6E0] rounded-2xl p-4 sm:p-6 shadow-sm mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Participant context */}
          <div>
            <div className="flex items-center gap-2 text-xs text-[#556D5F] font-medium">
              <span>Participante: <strong className="text-[#18261F]">{participant.name}</strong></span>
              <span aria-hidden="true">·</span>
              <span className="hidden sm:inline">{participant.email}</span>
            </div>
            <div className="text-sm font-semibold text-[#18261F] mt-0.5">
              Pergunta {currentIndex + 1} de {questions.length}
            </div>
          </div>

          {/* Active Timer badge with tabular numerals */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#EEF4F0] border border-[#D5E2D9] rounded-xl text-sm font-mono font-medium text-[#20392C] tabular-nums shadow-xs">
              <Timer className="w-4 h-4 text-[#3D5A4C] animate-pulse" />
              <span>{formatDuration(elapsedSeconds)}</span>
            </div>

            <button
              onClick={onExit}
              className="text-xs text-[#6F8378] hover:text-[#18261F] underline cursor-pointer"
            >
              Sair
            </button>
          </div>

        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E3EBE5] h-2 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-[#3D5A4C] h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white border border-[#DDE7E1] rounded-2xl p-6 sm:p-10 shadow-md">
        
        {/* Category Header */}
        <div className="flex items-center justify-between text-xs text-[#567061] uppercase tracking-wider font-semibold mb-4">
          <span>{currentQuestion.category}</span>
          <span>{currentQuestion.isTrue ? 'Tema: Fator de Proteção' : 'Tema: Mito Comum'}</span>
        </div>

        {/* Question Statement */}
        <h2 className="font-serif-display text-xl sm:text-2xl lg:text-3xl text-[#18261F] font-medium leading-snug mb-8 text-balance">
          "{currentQuestion.statement}"
        </h2>

        {/* Binary Answer Options (Verdadeiro ou Falso / Mito) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* VERDADEIRO BUTTON */}
          <button
            onClick={() => handleSelectAnswer('VERDADEIRO')}
            disabled={isAnswered}
            className={`p-5 rounded-xl border-2 text-left transition-all flex flex-col justify-between min-h-[110px] cursor-pointer ${
              !isAnswered
                ? 'border-[#D2DFD6] bg-[#F7FAF8] hover:bg-[#EEF6F0] hover:border-[#3D5A4C] hover:shadow-sm'
                : selectedAnswer === 'VERDADEIRO'
                ? currentQuestion.isTrue
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500'
                  : 'border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-400'
                : currentQuestion.isTrue
                ? 'border-emerald-500/60 bg-emerald-50/40 opacity-90'
                : 'border-slate-200 opacity-40'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-serif-display text-xl font-semibold tracking-wide">
                VERDADEIRO
              </span>
              {isAnswered && (
                currentQuestion.isTrue ? (
                  <CheckCircle className="w-6 h-6 text-emerald-700" />
                ) : selectedAnswer === 'VERDADEIRO' ? (
                  <XCircle className="w-6 h-6 text-rose-600" />
                ) : null
              )}
            </div>
            <p className="text-xs text-[#536E5F] mt-2">
              Esta afirmação é cientificamente comprovada.
            </p>
          </button>

          {/* MITO / FALSO BUTTON */}
          <button
            onClick={() => handleSelectAnswer('FALSO')}
            disabled={isAnswered}
            className={`p-5 rounded-xl border-2 text-left transition-all flex flex-col justify-between min-h-[110px] cursor-pointer ${
              !isAnswered
                ? 'border-[#D2DFD6] bg-[#F7FAF8] hover:bg-[#EEF6F0] hover:border-[#3D5A4C] hover:shadow-sm'
                : selectedAnswer === 'FALSO'
                ? !currentQuestion.isTrue
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500'
                  : 'border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-400'
                : !currentQuestion.isTrue
                ? 'border-emerald-500/60 bg-emerald-50/40 opacity-90'
                : 'border-slate-200 opacity-40'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-serif-display text-xl font-semibold tracking-wide">
                MITO / FALSO
              </span>
              {isAnswered && (
                !currentQuestion.isTrue ? (
                  <CheckCircle className="w-6 h-6 text-emerald-700" />
                ) : selectedAnswer === 'FALSO' ? (
                  <XCircle className="w-6 h-6 text-rose-600" />
                ) : null
              )}
            </div>
            <p className="text-xs text-[#536E5F] mt-2">
              Esta afirmação é um mito ou equívoco popular.
            </p>
          </button>

        </div>

        {/* Immediate Feedback Box with Julia's Scientific Rationale */}
        {isAnswered && (
          <div className="mt-6 pt-6 border-t border-[#E3ECE6] animate-in fade-in slide-in-from-top-3 duration-300">
            
            {/* Status notification */}
            <div className={`p-4 rounded-xl mb-4 flex items-start gap-3 ${
              isCurrentCorrect
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border border-amber-200 text-amber-900'
            }`}>
              {isCurrentCorrect ? (
                <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="text-sm font-semibold">
                  {isCurrentCorrect ? 'Parabéns, resposta correta!' : 'Não foi dessa vez! Veja a explicação:'}
                </div>
                <div className="text-xs text-[#425A4B]">
                  Gabarito oficial: <strong>{currentQuestion.isTrue ? 'VERDADEIRO' : 'MITO / FALSO'}</strong>
                </div>
              </div>
            </div>

            {/* Scientific Explanation by Julia Bucchianico */}
            <div className="bg-[#FAFBF9] border border-[#DEE7E2] rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2D4A3A]">
                <BookOpen className="w-4 h-4 text-[#3D5A4C]" />
                <span>Explicação da Nutricionista Julia Bucchianico</span>
              </div>
              <p className="text-sm text-[#243B2E] leading-relaxed">
                {currentQuestion.explanation}
              </p>
              {currentQuestion.scientificReference && (
                <div className="text-xs text-[#637C6E] italic pt-1 border-t border-[#E9EFEA]">
                  Fonte / Referência: {currentQuestion.scientificReference}
                </div>
              )}
            </div>

            {/* Next Question / Finish Action */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#263D31] hover:bg-[#1B2F25] rounded-xl shadow-md transition-all cursor-pointer"
              >
                <span>{currentIndex < questions.length - 1 ? 'Próxima Pergunta' : 'Finalizar e Ver Meu Ranking'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
