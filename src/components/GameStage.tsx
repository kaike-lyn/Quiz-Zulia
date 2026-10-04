import React, { useState, useEffect, useRef } from 'react';
import { QuizQuestion, ParticipantAnswer, QuizSubmission, QuestionAnswerType } from '../types/quiz';
import { soundManager } from '../utils/audio';
import {
  Timer,
  Volume2,
  VolumeX,
  ArrowRight,
  Sparkles,
  User,
  Check,
  AlertCircle
} from 'lucide-react';
import { formatDuration } from '../services/quizApi';

interface GameStageProps {
  questions: QuizQuestion[];
  player: { name: string; email: string };
  onFinishGame: (submission: QuizSubmission) => void;
  onExitGame: () => void;
}

export const GameStage: React.FC<GameStageProps> = ({
  questions,
  player,
  onFinishGame,
  onExitGame,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ParticipantAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<QuestionAnswerType | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);

  const startTimeRef = useRef<number>(Date.now());
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

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
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  // Keyboard controls: V for Verdadeiro, F for Falso, Enter to advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'v' || e.key === 'V' || e.key === '1') {
        handleSelectAnswer('VERDADEIRO');
      } else if (e.key === 'f' || e.key === 'F' || e.key === '2' || e.key === 'm' || e.key === 'M') {
        handleSelectAnswer('FALSO');
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (selectedAnswer !== null) {
          e.preventDefault();
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnswer, currentIndex]);

  const handleSelectAnswer = (answer: QuestionAnswerType) => {
    soundManager.playClick();
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;
    soundManager.playClick();

    const timeSpent = (Date.now() - questionStartTimeRef.current) / 1000;
    const isCorrect =
      (selectedAnswer === 'VERDADEIRO' && currentQuestion.isTrue) ||
      (selectedAnswer === 'FALSO' && !currentQuestion.isTrue);

    const record: ParticipantAnswer = {
      questionId: currentQuestion.id,
      statement: currentQuestion.statement,
      userAnswer: selectedAnswer,
      isCorrect,
      timeSpentSeconds: Number(timeSpent.toFixed(1)),
    };

    const updatedAnswers = [...answers, record];
    setAnswers(updatedAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      questionStartTimeRef.current = Date.now();
    } else {
      finishGame(updatedAnswers);
    }
  };

  const finishGame = (finalAnswers: ParticipantAnswer[]) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    const finalDuration = (Date.now() - startTimeRef.current) / 1000;
    const totalScore = finalAnswers.reduce((acc, curr) => (curr.isCorrect ? acc + 1 : acc), 0);
    const percentage = Number(((totalScore / questions.length) * 100).toFixed(1));

    const submission: QuizSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      participantName: player.name,
      participantEmail: player.email,
      score: totalScore,
      totalQuestions: questions.length,
      percentage,
      totalDurationSeconds: Number(finalDuration.toFixed(1)),
      formattedTime: formatDuration(finalDuration),
      submittedAt: new Date().toISOString(),
      answers: finalAnswers,
    };

    onFinishGame(submission);
  };

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) soundManager.playClick();
  };

  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="min-h-[85vh] flex flex-col justify-between max-w-4xl mx-auto px-4 py-4 sm:py-6 relative">
      
      {/* Top HUD Meter - Clean Off-white & Champagne styling */}
      <div className="bg-white text-[#713000] border-2 border-[#C58D65]/40 rounded-2xl p-3 sm:p-4 shadow-md flex items-center justify-between gap-3 mb-4">
        
        {/* Player Profile & Question Counter */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F0E0D0] border border-[#C58D65]/40 flex items-center justify-center text-[#B66C3D] shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-[#713000] truncate max-w-[120px] sm:max-w-[200px]">
              {player.name}
            </div>
            <div className="text-xs font-mono text-[#713000]/70">
              Questão <strong className="text-[#713000] font-bold">{currentIndex + 1}</strong> de {questions.length}
            </div>
          </div>
        </div>

        {/* Center: Active Continuous Timer */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FFF9F4] border-2 border-[#B66C3D]/50 rounded-xl font-mono text-sm sm:text-base font-bold text-[#B66C3D] tabular-nums shadow-xs">
          <Timer className="w-4 h-4 text-[#B66C3D] animate-pulse" />
          <span>{formatDuration(elapsedSeconds)}</span>
        </div>

        {/* Right: Audio mute toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-[#FFF9F4] hover:bg-[#F0E0D0] text-[#B66C3D] border border-[#F0E0D0] transition-colors cursor-pointer"
            title={isMuted ? 'Ativar som' : 'Silenciar som'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#B66C3D]" />}
          </button>
        </div>

      </div>

      {/* Progress Bar in Cobre & Bronze Claro Gradient */}
      <div className="w-full bg-[#F0E0D0] h-2 rounded-full overflow-hidden mb-4 shadow-inner">
        <div
          className="bg-gradient-to-r from-[#B66C3D] to-[#C58D65] h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Center Arena: Question Card */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-white border-2 border-[#C58D65]/40 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6 relative overflow-hidden">
          
          {/* Category Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0E0D0] border border-[#C58D65]/30 text-[#713000] text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#B66C3D]" />
            <span>{currentQuestion.category}</span>
          </div>

          {/* Statement */}
          <h2 className="font-serif-display text-2xl sm:text-3xl lg:text-4xl text-[#713000] font-semibold leading-tight text-balance max-w-3xl mx-auto">
            "{currentQuestion.statement}"
          </h2>

          <p className="text-xs text-[#713000]/70 font-mono">
            {selectedAnswer === null
              ? 'Selecione uma das opções abaixo para responder:'
              : 'Opção marcada! Agora clique no botão abaixo para prosseguir:'}
          </p>

          {/* The 2 Giant Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1 max-w-2xl mx-auto w-full">
            
            {/* BUTTON 1: VERDADEIRO (Verde Claro Luminoso) */}
            <button
              onClick={() => handleSelectAnswer('VERDADEIRO')}
              className={`p-6 rounded-2xl font-black text-xl sm:text-2xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 select-none border-b-6 active:translate-y-1 active:border-b-2 shadow-lg ${
                selectedAnswer === 'VERDADEIRO'
                  ? 'bg-gradient-to-b from-emerald-500 to-green-600 border-green-800 text-white ring-4 ring-emerald-300 ring-offset-2 scale-102 shadow-emerald-500/30'
                  : 'bg-gradient-to-b from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 border-green-700 text-white shadow-emerald-400/25 hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2 font-serif-display tracking-wider drop-shadow-xs">
                <span>VERDADEIRO</span>
                {selectedAnswer === 'VERDADEIRO' && (
                  <Check className="w-5 h-5 text-white animate-in zoom-in stroke-[3]" />
                )}
              </div>
              <span className="text-[11px] font-mono font-bold opacity-90 uppercase tracking-widest text-emerald-100">
                [ Tecla V ]
              </span>
            </button>

            {/* BUTTON 2: MITO / FALSO (Vermelho Vibrante) */}
            <button
              onClick={() => handleSelectAnswer('FALSO')}
              className={`p-6 rounded-2xl font-black text-xl sm:text-2xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 select-none border-b-6 active:translate-y-1 active:border-b-2 shadow-lg ${
                selectedAnswer === 'FALSO'
                  ? 'bg-gradient-to-b from-rose-500 to-red-600 border-red-800 text-white ring-4 ring-rose-300 ring-offset-2 scale-102 shadow-rose-500/30'
                  : 'bg-gradient-to-b from-rose-400 to-red-500 hover:from-rose-500 hover:to-red-600 border-red-700 text-white shadow-rose-400/25 hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2 font-serif-display tracking-wider drop-shadow-xs">
                <span>MITO / FALSO</span>
                {selectedAnswer === 'FALSO' && (
                  <Check className="w-5 h-5 text-white animate-in zoom-in stroke-[3]" />
                )}
              </div>
              <span className="text-[11px] font-mono font-bold opacity-90 uppercase tracking-widest text-rose-100">
                [ Tecla F ]
              </span>
            </button>

          </div>

          {/* NEXT QUESTION ACTION BUTTON (Appears as soon as an option is selected!) */}
          <div className="pt-2">
            {selectedAnswer !== null ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <button
                  onClick={handleNextQuestion}
                  className="w-full max-w-md mx-auto py-4 px-8 bg-gradient-to-r from-[#B66C3D] to-[#C58D65] hover:from-[#A05329] hover:to-[#B66C3D] active:scale-95 text-white font-black text-base uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-3 cursor-pointer border-b-4 border-[#8E471F] animate-pulse"
                >
                  <span>{isLastQuestion ? 'FINALIZAR E VER RESULTADO' : 'PRÓXIMA PERGUNTA'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-[11px] text-[#713000]/70 font-mono">
                  Dica: Você também pode pressionar [ Enter ] ou a barra de espaço para avançar!
                </p>
              </div>
            ) : (
              <div className="text-xs text-[#713000]/60 italic py-3 flex items-center justify-center gap-1.5 font-mono">
                <AlertCircle className="w-4 h-4 text-[#B66C3D]" />
                <span>Selecione uma resposta para habilitar o botão de avanço</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Bottom Exit Bar */}
      <div className="mt-4 flex items-center justify-between text-xs text-[#713000]/70 font-medium">
        <button
          onClick={onExitGame}
          className="hover:text-rose-700 underline cursor-pointer"
        >
          Sair da Partida
        </button>

        <span className="font-mono text-[11px]">
          O cronômetro não para · Gabarito completo no final!
        </span>
      </div>

    </div>
  );
};
