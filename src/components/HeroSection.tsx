import React from 'react';
import { ArrowRight, Timer, Award, CheckCircle2, ShieldAlert } from 'lucide-react';

interface HeroSectionProps {
  onStartQuiz: () => void;
  onViewLeaderboard: () => void;
  totalQuestions: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartQuiz,
  onViewLeaderboard,
  totalQuestions,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Clean unboxed metadata separator - anti-pill discipline */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#5A7365] font-semibold">
              <span>Nutrição Clínica & Oncologia</span>
              <span aria-hidden="true">·</span>
              <span>Por Julia Bucchianico</span>
              <span aria-hidden="true">·</span>
              <span>{totalQuestions} Questões</span>
            </div>

            {/* Headline with text-wrap: balance */}
            <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-[#18261F] font-semibold leading-[1.15] text-balance">
              Mitos & Verdades sobre Alimentação, Hormônios e Prevenção Celular
            </h1>

            {/* Subtitle / Lead prose */}
            <p className="text-base sm:text-lg text-[#405448] leading-relaxed max-w-2xl">
              Descubra o que a ciência da nutrição funcional realmente comprova sobre
              microbiota, brássicas, estrogênio, xenobióticos e o risco de doenças crônicas.
              Teste seus conhecimentos e descubra sua colocação no ranking oficial.
            </p>

            {/* 3 Core Trust Criteria (Clean minimal cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#F3F6F4] border border-[#E3EBE5] rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-[#2C4839] font-medium text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Evidência Científica</span>
                </div>
                <p className="text-xs text-[#566B5F] mt-1 leading-snug">
                  Exclusivo com diretrizes do INCA, OMS, WCRF e periódicos internacionais.
                </p>
              </div>

              <div className="bg-[#F3F6F4] border border-[#E3EBE5] rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-[#2C4839] font-medium text-sm">
                  <Timer className="w-4 h-4 text-[#3D5A4C] shrink-0" />
                  <span>Cronômetro Ativo</span>
                </div>
                <p className="text-xs text-[#566B5F] mt-1 leading-snug">
                  O tempo é registrado e usado como critério de desempate no ranking.
                </p>
              </div>

              <div className="bg-[#F3F6F4] border border-[#E3EBE5] rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-[#2C4839] font-medium text-sm">
                  <Award className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Ranking Geral</span>
                </div>
                <p className="text-xs text-[#566B5F] mt-1 leading-snug">
                  Veja imediatamente sua pontuação e colocação ao concluir o teste.
                </p>
              </div>
            </div>

            {/* Primary Action Zone */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <button
                onClick={onStartQuiz}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-semibold text-white bg-[#263D31] hover:bg-[#1C2E25] active:bg-[#14221B] rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer whitespace-nowrap"
              >
                <span>Fazer o Quiz com meu E-mail</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onViewLeaderboard}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-medium text-[#2C4839] bg-[#E7EFEA] hover:bg-[#D9E6DD] rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                <Award className="w-4 h-4 text-[#3D5A4C]" />
                <span>Ver Ranking de Participantes</span>
              </button>
            </div>

            <div className="text-xs text-[#63796E] flex items-center gap-1.5 pt-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#3D5A4C]" />
              <span>Acesso rápido através do seu e-mail. Seus dados e resultados ficam salvos com segurança.</span>
            </div>

          </div>

          {/* Right Column: Visual Frame */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#E3EBE5] bg-[#EAEFEA]">
              <img
                src="/src/assets/images/hero_nutrition_clinic_1791131611120.jpg"
                alt="Ambiente estético e minimalista de nutrição clínica por Julia Bucchianico"
                className="w-full h-80 sm:h-96 lg:h-[430px] object-cover transition-transform duration-700 hover:scale-105"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback container
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.classList.add('bg-gradient-to-br', 'from-[#E5ECE7]', 'to-[#D2DFD5]', 'flex', 'items-center', 'justify-center', 'p-8');
                  }
                }}
              />
              
              {/* Subtle scrim & brand tag */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#14231B]/75 via-[#14231B]/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs uppercase tracking-widest text-emerald-200 font-medium">
                  Prática Baseada em Evidências
                </span>
                <p className="font-serif-display text-lg sm:text-xl font-medium mt-1 text-white text-balance">
                  "Nutrição inteligente é aquela que respeita a bioquímica celular e empodera o paciente com a verdade."
                </p>
                <span className="text-xs text-white/80 mt-2 font-mono">
                  — Nutricionista Julia Bucchianico
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
