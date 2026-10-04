import React, { useState } from 'react';
import { LeaderboardEntry } from '../types/quiz';
import { BrandLogo } from './BrandLogo';
import { Award, Timer, Search, Clock, Home } from 'lucide-react';

interface LeaderboardViewProps {
  leaderboard: LeaderboardEntry[];
  onStartQuiz: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  leaderboard,
  onStartQuiz,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = leaderboard.filter((entry) =>
    entry.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.participantEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      
      {/* Brand Header */}
      <div className="flex items-center justify-between">
        <BrandLogo size="sm" />
        <button
          onClick={onStartQuiz}
          className="px-4 py-2 bg-white border border-[#C58D65]/40 text-xs font-bold text-[#713000] hover:bg-[#FBF6F0] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Home className="w-3.5 h-3.5 text-[#B66C3D]" />
          <span>Voltar ao Início</span>
        </button>
      </div>

      {/* Header section */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#713000] bg-[#F0E0D0] px-3.5 py-1 rounded-full border border-[#C58D65]/30">
          <Award className="w-3.5 h-3.5 text-[#B66C3D]" />
          <span>Ranking Oficial em Tempo Real</span>
        </div>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#713000]">
          Quadro de Líderes do Quiz
        </h1>
        <p className="text-sm text-[#713000]/80 leading-relaxed">
          Classificação baseada em acertos. Em caso de empate na pontuação, o
          critério determinante é a <strong>agilidade (menor tempo total de resposta)</strong>.
        </p>
      </div>

      {/* Top 3 Podium Highlights */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {top3.map((entry, index) => {
            const styles = [
              {
                border: 'border-[#B66C3D] bg-gradient-to-b from-[#FFF9F4] to-[#F0E0D0]',
                badge: 'bg-[#B66C3D] text-white',
                label: '🥇 1º Colocado(a)',
              },
              {
                border: 'border-[#C58D65] bg-gradient-to-b from-white to-[#F0E0D0]/60',
                badge: 'bg-[#C58D65] text-white',
                label: '🥈 2º Colocado(a)',
              },
              {
                border: 'border-[#C58D65]/50 bg-gradient-to-b from-white to-[#FAF3EC]',
                badge: 'bg-[#F0E0D0] text-[#713000]',
                label: '🥉 3º Colocado(a)',
              },
            ][index];

            return (
              <div
                key={entry.id}
                className={`p-5 rounded-2xl border-2 ${styles.border} shadow-sm flex flex-col justify-between`}
              >
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${styles.badge}`}>
                    {styles.label}
                  </span>
                  <div className="font-serif-display text-lg font-bold text-[#713000] mt-2 truncate" title={entry.participantName}>
                    {entry.participantName}
                  </div>
                  <div className="text-xs text-[#713000]/70 font-mono">
                    {entry.participantEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#713000]/70">Acertos:</span>{' '}
                    <strong className="text-sm font-semibold text-[#713000]">{entry.score}/{entry.totalQuestions}</strong>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-[#B66C3D] tabular-nums">
                    <Timer className="w-3.5 h-3.5" />
                    <span>{entry.formattedTime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white border-2 border-[#C58D65]/40 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#C58D65] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar participante por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FFF9F4] border border-[#C58D65]/40 rounded-xl text-xs text-[#713000] placeholder:text-[#C58D65]/60 focus:outline-none focus:ring-2 focus:ring-[#B66C3D]"
            />
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#713000]/70 space-y-2">
            <Clock className="w-8 h-8 text-[#C58D65] mx-auto opacity-70" />
            <p className="text-sm font-medium">Nenhum participante encontrado.</p>
            <p className="text-xs">Seja a primeira pessoa a realizar o quiz e liderar o placar!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#F0E0D0] text-[#713000]/70 text-xs font-mono uppercase tracking-wider">
                  <th className="py-3 px-3 w-16">Colocação</th>
                  <th className="py-3 px-4">Nome do Participante</th>
                  <th className="py-3 px-4 text-center">Acertos</th>
                  <th className="py-3 px-4 text-center">Aproveitamento</th>
                  <th className="py-3 px-4 text-right">Tempo Levado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF3EC]">
                {filtered.map((entry, index) => (
                  <tr key={entry.id} className="hover:bg-[#FFF9F4] transition-colors text-[#713000]">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 font-bold font-mono">
                        {index === 0 ? '🥇 1º' : index === 1 ? '🥈 2º' : index === 2 ? '🥉 3º' : `${index + 1}º`}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#713000]">
                      <div>{entry.participantName}</div>
                      <div className="text-xs text-[#713000]/60 font-normal">
                        {entry.participantEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#713000] tabular-nums font-mono">
                      {entry.score} / {entry.totalQuestions}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs tabular-nums text-[#B66C3D] font-bold">
                      {entry.percentage}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-[#B66C3D]">
                      {entry.formattedTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
