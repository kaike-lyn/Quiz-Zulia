import React, { useState } from 'react';
import { Award, ShieldCheck, Share2, Check, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'quiz' | 'leaderboard' | 'about' | 'admin';
  setCurrentTab: (tab: 'home' | 'quiz' | 'leaderboard' | 'about' | 'admin') => void;
  onStartQuiz: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onStartQuiz,
  isAdminLoggedIn,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Quiz de Mitos & Verdades | Julia Bucchianico',
          text: 'Você consegue acertar os mitos e verdades sobre nutrição e saúde? Faça o teste e veja sua posição no ranking!',
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#E7E5DE] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('home')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="font-serif-display text-xl sm:text-2xl font-semibold tracking-tight text-[#1E2E25] group-hover:text-[#3D5A4C] transition-colors">
              Julia Bucchianico
            </span>
          </button>
        </div>

        {/* Zone 2: Clean 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4A5D52]">
          <button
            onClick={() => setCurrentTab('home')}
            className={`transition-colors py-1 hover:text-[#1E2E25] cursor-pointer ${
              currentTab === 'home' ? 'text-[#1E2E25] font-semibold border-b-2 border-[#3D5A4C]' : ''
            }`}
          >
            Início
          </button>
          <button
            onClick={() => setCurrentTab('leaderboard')}
            className={`flex items-center gap-1.5 transition-colors py-1 hover:text-[#1E2E25] cursor-pointer ${
              currentTab === 'leaderboard' ? 'text-[#1E2E25] font-semibold border-b-2 border-[#3D5A4C]' : ''
            }`}
          >
            <Award className="w-4 h-4 text-[#3D5A4C]" />
            Ranking Geral
          </button>
          <button
            onClick={() => setCurrentTab('about')}
            className={`transition-colors py-1 hover:text-[#1E2E25] cursor-pointer ${
              currentTab === 'about' ? 'text-[#1E2E25] font-semibold border-b-2 border-[#3D5A4C]' : ''
            }`}
          >
            A Nutricionista
          </button>
          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex items-center gap-1.5 transition-colors py-1 cursor-pointer ${
              currentTab === 'admin'
                ? 'text-[#1E2E25] font-semibold border-b-2 border-[#3D5A4C]'
                : 'text-[#62776B] hover:text-[#1E2E25]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Área da Nutricionista</span>
            {isAdminLoggedIn && (
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" title="Sessão autenticada" />
            )}
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleShare}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#3D5A4C] bg-[#EEF3EF] hover:bg-[#E2EDE5] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="Copiar link para enviar a pacientes"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copiado!' : 'Compartilhar Link'}</span>
          </button>

          <button
            onClick={onStartQuiz}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#2B4538] hover:bg-[#20362B] active:bg-[#182920] rounded-lg transition-all shadow-sm hover:shadow cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Fazer o Quiz</span>
          </button>
        </div>

      </div>
    </header>
  );
};
