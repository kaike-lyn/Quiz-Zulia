import React from 'react';
import { ArrowRight, BookOpen, ShieldCheck, HeartPulse, Sparkles, Award } from 'lucide-react';

interface AboutNutritionistProps {
  onStartQuiz: () => void;
}

export const AboutNutritionist: React.FC<AboutNutritionistProps> = ({ onStartQuiz }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 space-y-16">
      
      {/* Editorial Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left image with fallback */}
        <div className="lg:col-span-5">
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#DCE5DF] bg-[#FAFBF9]">
            <img
              src="/src/assets/images/nutrition_consultation_desk_1791131626687.jpg"
              alt="Consultório estético de nutrição clínica da Dra. Julia Bucchianico"
              className="w-full h-80 sm:h-96 lg:h-[460px] object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.classList.add('bg-gradient-to-br', 'from-[#E5ECE7]', 'to-[#D2DFD5]', 'p-8', 'flex', 'items-center', 'justify-center');
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#18261F]/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-xs uppercase tracking-widest text-emerald-200 font-medium">
                Nutrição de Precisão
              </span>
              <h3 className="font-serif-display text-xl font-semibold mt-1">
                Julia Bucchianico
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                Nutricionista Clínica & Funcional
              </p>
            </div>
          </div>
        </div>

        {/* Right Editorial Story */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#5A7365] font-semibold">
            <span>A Nutricionista & Idealizadora</span>
            <span aria-hidden="true">·</span>
            <span>Julia Bucchianico</span>
          </div>

          <h1 className="font-serif-display text-3xl sm:text-4xl text-[#18261F] font-semibold leading-tight text-balance">
            Nutrição com Rigor Científico, Prevenção e Consciência Celular
          </h1>

          <div className="space-y-4 text-sm sm:text-base text-[#465C50] leading-relaxed">
            <p>
              A nutrição vai muito além da contagem de calorias. No organismo humano,
              cada alimento fornece compostos que conversam diretamente com os nossos genes,
              nossas bactérias intestinais e nossos receptores hormonais.
            </p>
            <p>
              Este quiz foi desenvolvido por <strong>Julia Bucchianico</strong> para desmistificar
              informações populares e levar conhecimento embasado sobre temas cruciais:
              a influência da gordura corporal na inflamação crônica, a modulação do estrogênio
              pelas brássicas e pelo estroboloma, e o impacto real dos xenobióticos no nosso DNA.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-[#DCE5DF]">
              <div className="flex items-center gap-2 text-[#274233] font-semibold text-sm">
                <HeartPulse className="w-4 h-4 text-[#3D5A4C]" />
                <span>Prevenção Oncológica</span>
              </div>
              <p className="text-xs text-[#586E61] mt-1.5 leading-snug">
                Foco no controle de fatores modificáveis, redução de citocinas inflamatórias e proteção do DNA celular.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#DCE5DF]">
              <div className="flex items-center gap-2 text-[#274233] font-semibold text-sm">
                <BookOpen className="w-4 h-4 text-[#3D5A4C]" />
                <span>Eixo Intestino & Hormônios</span>
              </div>
              <p className="text-xs text-[#586E61] mt-1.5 leading-snug">
                Compreensão profunda do estroboloma, aromatase periférica e metabolização saudável de estrogênios.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onStartQuiz}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#263D31] hover:bg-[#1A2C23] rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Testar Meus Conhecimentos no Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
