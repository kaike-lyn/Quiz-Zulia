import React, { useState } from 'react';
import { QuizSubmission, LeaderboardEntry, QuizQuestion } from '../types/quiz';
import { Award, Timer, CheckCircle, XCircle, Share2, RotateCcw, ChevronDown, ChevronUp, Check, BookOpen } from 'lucide-react';

interface QuizResultsProps {
  submission: QuizSubmission;
  leaderboard: LeaderboardEntry[];
  allQuestions: QuizQuestion[];
  onRetry: () => void;
  onGoHome: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  submission,
  leaderboard,
  allQuestions,
  onRetry,
  onGoHome,
}) => {
  const [showReview, setShowReview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Find user's rank in leaderboard
  const userRankIndex = leaderboard.findIndex((entry) => entry.id === submission.id);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : 1;

  // Custom clinical assessment message by Julia Bucchianico
  const getFeedbackMessage = (score: number, total: number) => {
    const ratio = score / total;
    if (ratio >= 0.9) {
      return {
        title: 'Excelente Conhecimento & Visão Crítica!',
        desc: 'Você tem um domínio impressionante sobre a bioquímica nutricional, regulação estrogênica e fatores protetores contra o câncer. Parabéns pelo resultado e agilidade!',
      };
    }
    if (ratio >= 0.7) {
      return {
        title: 'Muito Bom! Ótima Percepção em Saúde.',
        desc: 'Você já possui uma base sólida sobre alimentação preventiva e estilo de vida. Vale a pena revisar os pontos sobre o estroboloma e compostos bioativos das brássicas!',
      };
    }
    return {
      title: 'Boa Tentativa! Hora de Aprofundar.',
      desc: 'Muitos mitos ainda circulam na mídia e no senso comum. Aproveite a revisão abaixo para compreender o que a ciência da nutrição oncológica realmente preconiza.',
    };
  };

  const feedback = getFeedbackMessage(submission.score, submission.totalQuestions);

  const handleShare = async () => {
    const text = `Fiz o Quiz de Mitos e Verdades em Nutrição da Nutricionista Julia Bucchianico! Acertei ${submission.score}/${submission.totalQuestions} em ${submission.formattedTime} e estou em ${userRank}º lugar no ranking. Consegue me superar?`;
    const url = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Meu resultado no Quiz da Julia Bucchianico', text, url });
        return;
      } catch {
        // Fallback
      }
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      
      {/* Top Banner Card: Score & Rank */}
      <div className="bg-[#FAF9F5] border border-[#DCE5DF] rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#E6EFE9] rounded-bl-full pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#5A7365] font-semibold">
            <span>Resultado Final</span>
            <span aria-hidden="true">·</span>
            <span>Julia Bucchianico Nutrição</span>
          </div>

          <h1 className="font-serif-display text-2xl sm:text-4xl text-[#18261F] font-semibold mt-2">
            {feedback.title}
          </h1>

          <p className="text-sm sm:text-base text-[#465C50] mt-2 leading-relaxed">
            {feedback.desc}
          </p>

          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            
            {/* Score */}
            <div className="bg-white border border-[#D8E3DC] rounded-2xl p-4 shadow-xs">
              <div className="text-xs uppercase tracking-wider text-[#687E71] font-medium">
                Pontuação
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif-display text-3xl font-bold text-[#18261F]">
                  {submission.score}
                </span>
                <span className="text-sm text-[#5C7265] font-medium">
                  / {submission.totalQuestions} ({submission.percentage}%)
                </span>
              </div>
              <p className="text-[11px] text-[#6E8376] mt-1">
                Total de acertos no teste
              </p>
            </div>

            {/* Time Taken (Crucial for tie breaker!) */}
            <div className="bg-white border border-[#D8E3DC] rounded-2xl p-4 shadow-xs">
              <div className="text-xs uppercase tracking-wider text-[#687E71] font-medium flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-[#3D5A4C]" />
                <span>Tempo Levado</span>
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-[#18261F] mt-1 tabular-nums">
                {submission.formattedTime}
              </div>
              <p className="text-[11px] text-[#6E8376] mt-1">
                Critério de desempate no ranking
              </p>
            </div>

            {/* Current Position in Ranking */}
            <div className="bg-white border border-[#D8E3DC] rounded-2xl p-4 shadow-xs">
              <div className="text-xs uppercase tracking-wider text-[#687E71] font-medium flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-700" />
                <span>Sua Posição</span>
              </div>
              <div className="font-serif-display text-3xl font-bold text-[#2B4538] mt-1">
                {userRank}º <span className="text-sm font-sans font-normal text-[#5C7265]">lugar</span>
              </div>
              <p className="text-[11px] text-[#6E8376] mt-1">
                No ranking geral de participantes
              </p>
            </div>

          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-6">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#263D31] hover:bg-[#1B2D24] rounded-xl shadow transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Resultado Copiado!' : 'Compartilhar Resultado'}</span>
            </button>

            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#2E4739] bg-[#E8EFEA] hover:bg-[#DCE6DE] rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Refazer o Quiz</span>
            </button>

            <button
              onClick={() => setShowReview(!showReview)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[#536B5E] hover:text-[#18261F] transition-colors cursor-pointer ml-auto"
            >
              <BookOpen className="w-4 h-4" />
              <span>{showReview ? 'Ocultar Gabarito Detalhado' : 'Revisar Todas as Perguntas'}</span>
              {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </div>

      {/* Accordion / Review of All Questions if expanded */}
      {showReview && (
        <div className="bg-white border border-[#DCE5DF] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-[#5A7365]">
              Gabarito Comentado
            </div>
            <h2 className="font-serif-display text-2xl font-semibold text-[#18261F] mt-1">
              Revisão das 13 Questões e Explicações Científicas
            </h2>
            <p className="text-xs text-[#5D7366] mt-1">
              Confira os fundamentos bioquímicos de cada questão comentados pela Nutricionista Julia Bucchianico.
            </p>
          </div>

          <div className="space-y-4">
            {allQuestions.map((q, idx) => {
              const participantAns = submission.answers.find((a) => a.questionId === q.id);
              const isCorrect = participantAns ? participantAns.isCorrect : false;
              const answeredText = participantAns ? participantAns.userAnswer : 'Não respondida';

              return (
                <div
                  key={q.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isCorrect
                      ? 'border-emerald-200 bg-[#F7FAF8]'
                      : 'border-amber-200 bg-[#FDFBF7]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#556F60]">
                        <span>Questão {idx + 1}</span>
                        <span aria-hidden="true">·</span>
                        <span>{q.category}</span>
                      </div>
                      <h3 className="font-medium text-sm sm:text-base text-[#18261F]">
                        {q.statement}
                      </h3>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
                      style={{
                        backgroundColor: isCorrect ? '#E8F5E9' : '#FFF3E0',
                        color: isCorrect ? '#1B5E20' : '#E65100',
                        borderColor: isCorrect ? '#C8E6C9' : '#FFE0B2',
                      }}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Acertou</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Errou</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Answers recap */}
                  <div className="mt-3 flex flex-wrap gap-4 text-xs">
                    <div>
                      Sua resposta: <strong>{answeredText}</strong>
                    </div>
                    <div>
                      Gabarito correto: <strong className="text-emerald-800">{q.isTrue ? 'VERDADEIRO' : 'MITO / FALSO'}</strong>
                    </div>
                    {participantAns && (
                      <div className="text-[#647C6F] font-mono tabular-nums">
                        Tempo gasto: {participantAns.timeSpentSeconds}s
                      </div>
                    )}
                  </div>

                  {/* Scientific explanation */}
                  <div className="mt-3 pt-3 border-t border-black/5 text-xs text-[#2E4537] leading-relaxed">
                    <strong>Comentário de Julia Bucchianico:</strong> {q.explanation}
                    {q.scientificReference && (
                      <span className="block text-[11px] text-[#698173] italic mt-1">
                        Ref: {q.scientificReference}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Official Ranking Table */}
      <div className="bg-white border border-[#DCE5DF] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#5A7365] font-semibold">
              <Award className="w-4 h-4 text-[#3D5A4C]" />
              <span>Tabela de Classificação</span>
            </div>
            <h2 className="font-serif-display text-2xl font-semibold text-[#18261F] mt-1">
              Ranking Geral de Participantes
            </h2>
            <p className="text-xs text-[#5D7366] mt-1">
              Critério: 1º Maior Pontuação. <strong>Critério de desempate: Menor tempo total de resposta.</strong>
            </p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#E4ECE6] text-[#556F60] text-xs uppercase tracking-wider">
                <th className="py-3 px-3 w-16">Posição</th>
                <th className="py-3 px-4">Participante</th>
                <th className="py-3 px-4 text-center">Acertos</th>
                <th className="py-3 px-4 text-center">Aproveitamento</th>
                <th className="py-3 px-4 text-right">Tempo Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF3EF]">
              {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.id === submission.id;
                const medalColors = [
                  'text-amber-500 font-bold',
                  'text-slate-400 font-bold',
                  'text-amber-700 font-bold',
                ];

                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      isCurrentUser
                        ? 'bg-[#EEF5F1] font-medium text-[#18261F]'
                        : 'hover:bg-[#F9FAF8] text-[#334A3E]'
                    }`}
                  >
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {index < 3 ? (
                          <span className={`text-base ${medalColors[index]}`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-semibold text-[#668071] w-6 text-center">
                            #{index + 1}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <span>{entry.participantName}</span>
                          {isCurrentUser && (
                            <span className="text-[10px] bg-[#3D5A4C] text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                              Você
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#71877A]">
                          {entry.participantEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-semibold text-[#18261F] tabular-nums">
                      {entry.score} / {entry.totalQuestions}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-xs tabular-nums">
                      {entry.percentage}%
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#18261F] tabular-nums">
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
