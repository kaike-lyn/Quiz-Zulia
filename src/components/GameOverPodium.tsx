import React, { useState, useEffect } from 'react';
import { QuizSubmission, LeaderboardEntry, QuizQuestion } from '../types/quiz';
import { soundManager } from '../utils/audio';
import { ConfettiCanvas } from './ConfettiCanvas';
import { BrandLogo } from './BrandLogo';
import {
  Award,
  Timer,
  Share2,
  Check,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Sparkles,
  Home,
  Instagram
} from 'lucide-react';

interface GameOverPodiumProps {
  submission: QuizSubmission;
  leaderboard: LeaderboardEntry[];
  allQuestions: QuizQuestion[];
  onGoToLobby: () => void;
}

export const GameOverPodium: React.FC<GameOverPodiumProps> = ({
  submission,
  leaderboard,
  allQuestions,
  onGoToLobby,
}) => {
  const [showReview, setShowReview] = useState(true); // Open by default at the end
  const [copied, setCopied] = useState(false);
  const [confettiBurst, setConfettiBurst] = useState(1);

  useEffect(() => {
    soundManager.playVictoryFanfare();
    const timer = setTimeout(() => {
      setConfettiBurst((prev) => prev + 1);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Find player's position
  const rankIndex = leaderboard.findIndex((entry) => entry.id === submission.id);
  const userRank = rankIndex !== -1 ? rankIndex + 1 : 1;

  const handleShare = async () => {
    const text = `🎮 Fiz o Quiz de Mitos & Verdades da Nutricionista Julia Bucchianico! Acertei ${submission.score}/${submission.totalQuestions} em ${submission.formattedTime} e estou no ${userRank}º lugar do ranking oficial! 🏆 Consegue bater meu recorde de tempo?`;
    const url = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Recorde no Quiz da Nutricionista Julia Bucchianico',
          text,
          url,
        });
        return;
      } catch {
        // fallback
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 relative">
      
      {/* Celebratory confetti */}
      <ConfettiCanvas trigger={confettiBurst} count={80} />

      {/* Brand Header */}
      <div className="flex items-center justify-between">
        <BrandLogo size="sm" />
        <button
          onClick={onGoToLobby}
          className="px-4 py-2 bg-white border border-[#C58D65]/40 text-xs font-bold text-[#713000] hover:bg-[#FBF6F0] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Home className="w-3.5 h-3.5 text-[#B66C3D]" />
          <span>Voltar para o Início</span>
        </button>
      </div>

      {/* Main Victory Card - Clean Healthcare Aesthetic with Off-white & Champagne */}
      <div className="bg-white border-2 border-[#C58D65]/40 rounded-3xl p-6 sm:p-10 text-[#713000] shadow-xl relative overflow-hidden text-center space-y-6">
        
        {/* Subtle decorative champagne warmth */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F0E0D0]/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F0E0D0]/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 space-y-3">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0E0D0] border border-[#C58D65]/40 text-[#713000] text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#B66C3D]" />
            <span>PARTIDA FINALIZADA · TENTATIVA GRAVADA</span>
          </div>

          <h1 className="font-serif-display text-3xl sm:text-5xl font-black text-[#713000]">
            {userRank === 1 ? '👑 NOVO 1º LUGAR NO RANKING!' : '🏆 RESULTADO REGISTRADO!'}
          </h1>

          <p className="text-xs sm:text-sm text-[#713000]/80 max-w-lg mx-auto font-mono">
            {submission.participantName}, sua pontuação e tempo oficial foram computados no quadro de líderes.
          </p>

          {/* 3 Metric Scoreboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-center">
            
            {/* Score */}
            <div className="bg-[#FFF9F4] border-2 border-[#C58D65]/40 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#B66C3D] font-bold block">
                Acertos Científicos
              </span>
              <div className="font-mono text-3xl sm:text-4xl font-black text-[#713000] mt-1">
                {submission.score} <span className="text-lg font-normal text-[#B66C3D]">/ {submission.totalQuestions}</span>
              </div>
              <span className="text-[11px] text-[#713000]/70 font-mono mt-0.5 block">
                {submission.percentage}% de aproveitamento
              </span>
            </div>

            {/* Time Taken (The Tie Breaker!) */}
            <div className="bg-[#F0E0D0] border-2 border-[#B66C3D] rounded-2xl p-4 shadow-sm ring-2 ring-[#B66C3D]/20">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#713000] font-bold">
                <Timer className="w-3.5 h-3.5 text-[#B66C3D]" />
                <span>Tempo Levado</span>
              </div>
              <div className="font-mono text-3xl sm:text-4xl font-black text-[#713000] mt-1 tabular-nums">
                {submission.formattedTime}
              </div>
              <span className="text-[11px] text-[#B66C3D] font-mono font-bold mt-0.5 block">
                Critério de desempate no ranking!
              </span>
            </div>

            {/* Position in Ranking */}
            <div className="bg-[#FFF9F4] border-2 border-[#C58D65]/40 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#B66C3D] font-bold block">
                Colocação Oficial
              </span>
              <div className="font-serif-display text-3xl sm:text-4xl font-black text-[#713000] mt-1">
                {userRank}º <span className="text-lg font-sans font-normal text-[#B66C3D]">Lugar</span>
              </div>
              <span className="text-[11px] text-[#713000]/70 font-mono mt-0.5 block">
                {userRank <= 3 ? 'No pódio oficial!' : 'Entre os melhores!'}
              </span>
            </div>

          </div>

          {/* 1 Attempt notification badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F0E0D0] border border-[#C58D65]/40 text-[#713000] text-xs mt-3">
            <ShieldCheck className="w-4 h-4 text-[#62552D] shrink-0" />
            <span>Sua pontuação é definitiva. Cada participante possui apenas <strong>1 tentativa oficial</strong>.</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={onGoToLobby}
              className="px-6 py-3.5 bg-white text-[#713000] hover:bg-[#FBF6F0] active:scale-95 font-black text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer border-2 border-[#C58D65]/50"
            >
              <Home className="w-4 h-4 text-[#B66C3D]" />
              <span>Voltar para o Início</span>
            </button>

            <button
              onClick={handleShare}
              className="px-6 py-3.5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-95 active:scale-95 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer border-b-4 border-[#651c87]"
              title="Compartilhar resultado no Instagram"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Instagram className="w-4 h-4 text-white" />}
              <span>{copied ? 'Copiado! Cole no Instagram' : 'Compartilhar no Instagram'}</span>
            </button>

            <button
              onClick={() => setShowReview(!showReview)}
              className="px-6 py-3.5 bg-[#F0E0D0] hover:bg-[#E8D4C2] active:scale-95 text-[#713000] font-bold text-sm rounded-2xl border border-[#C58D65]/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#B66C3D]" />
              <span>{showReview ? 'Ocultar Gabarito' : 'Ver Gabarito Completo'}</span>
              {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </div>

      {/* GABARITO OFICIAL COMENTADO */}
      {showReview && (
        <div className="bg-white border-2 border-[#C58D65]/40 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-[#F0E0D0] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase font-mono font-bold text-[#B66C3D]">
                <BookOpen className="w-4 h-4" />
                <span>Gabarito Oficial Comentado</span>
              </div>
              <h2 className="font-serif-display text-2xl font-bold text-[#713000] mt-1">
                Fundamentação Científica por Julia Bucchianico
              </h2>
              <p className="text-xs text-[#713000]/70 mt-0.5">
                Leia agora com calma todas as explicações científicas sobre cada uma das 13 questões.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {allQuestions.map((q, idx) => {
              const ans = submission.answers.find((a) => a.questionId === q.id);
              const isCorrect = ans ? ans.isCorrect : false;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border text-xs space-y-2.5 transition-all ${
                    isCorrect
                      ? 'border-[#62552D]/30 bg-[#F4F6F2]'
                      : 'border-[#B66C3D]/30 bg-[#FAF3EC]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono font-bold text-[#B66C3D] block">
                        Questão {idx + 1} · {q.category}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-[#713000] leading-snug">
                        "{q.statement}"
                      </h3>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 flex items-center gap-1 ${
                      isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Acertou</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Errou</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs font-mono pt-1">
                    <span className="text-[#713000]/80">
                      Sua resposta: <strong className="text-[#713000]">{ans?.userAnswer || '—'}</strong>
                    </span>
                    <span className="text-[#713000]/80">
                      Gabarito correto:{' '}
                      <strong className={q.isTrue ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                        {q.isTrue ? 'VERDADEIRO' : 'MITO / FALSO'}
                      </strong>
                    </span>
                    {ans && (
                      <span className="text-[#B66C3D] font-bold">
                        Tempo gasto: {ans.timeSpentSeconds}s
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#713000] bg-white p-3.5 rounded-xl border border-[#F0E0D0] leading-relaxed space-y-1">
                    <p>
                      <strong>Explicação da Nutricionista:</strong> {q.explanation}
                    </p>
                    {q.scientificReference && (
                      <span className="block text-[11px] text-[#713000]/60 italic pt-1 border-t border-[#F0E0D0]">
                        Referência: {q.scientificReference}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Leaderboard */}
      <div className="bg-white border-2 border-[#C58D65]/40 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-mono font-bold text-[#B66C3D] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#B66C3D]" />
              <span>Quadro de Líderes Oficial</span>
            </span>
            <h2 className="font-serif-display text-2xl font-bold text-[#713000] mt-0.5">
              Ranking Geral de Participantes
            </h2>
          </div>

          <div className="text-right text-[11px] text-[#713000]/70 font-mono">
            Critério: Acertos + <strong>Menor Tempo</strong> ⚡
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#F0E0D0] text-[#713000]/70 uppercase text-[11px] font-mono tracking-wider">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Jogador</th>
                <th className="py-2.5 px-3 text-center">Acertos</th>
                <th className="py-2.5 px-3 text-right">Tempo Levado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF3EC]">
              {leaderboard.map((entry, idx) => {
                const isCurrent = entry.id === submission.id;
                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      isCurrent ? 'bg-[#F0E0D0]/60 font-bold text-[#713000]' : 'hover:bg-[#FFF9F4] text-[#713000]'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold">
                      {idx === 0 ? '🥇 1º' : idx === 1 ? '🥈 2º' : idx === 2 ? '🥉 3º' : `${idx + 1}º`}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span>{entry.participantName}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-[#B66C3D] text-white px-1.5 py-0.2 rounded font-mono">
                            VOCÊ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold tabular-nums">
                      {entry.score} / {entry.totalQuestions}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-[#B66C3D]">
                      {entry.formattedTime}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
