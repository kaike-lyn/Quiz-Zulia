import React, { useState } from 'react';
import { Mail, User, ArrowRight, Clock, Award, CheckCircle } from 'lucide-react';

interface ParticipantAuthProps {
  onConfirm: (participant: { name: string; email: string; phone?: string }) => void;
  onCancel: () => void;
  initialEmail?: string;
  initialName?: string;
  totalQuestions: number;
}

export const ParticipantAuth: React.FC<ParticipantAuthProps> = ({
  onConfirm,
  onCancel,
  initialEmail = '',
  initialName = '',
  totalQuestions,
}) => {
  const [name, setName] = useState(initialName || localStorage.getItem('jb_last_name') || '');
  const [email, setEmail] = useState(initialEmail || localStorage.getItem('jb_last_email') || '');
  const [phone, setPhone] = useState(localStorage.getItem('jb_last_phone') || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || cleanName.length < 2) {
      setError('Por favor, informe seu nome completo ou como prefere ser chamado.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Por favor, insira um endereço de e-mail válido para identificação.');
      return;
    }

    localStorage.setItem('jb_last_name', cleanName);
    localStorage.setItem('jb_last_email', cleanEmail);
    if (phone.trim()) {
      localStorage.setItem('jb_last_phone', phone.trim());
    }

    onConfirm({
      name: cleanName,
      email: cleanEmail,
      phone: phone.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14231B]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF9F5] border border-[#DDE6E0] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3D5A4C] via-[#638774] to-[#3D5A4C]" />

        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5A7365]">
              <span>Identificação do Participante</span>
              <span aria-hidden="true">·</span>
              <span>{totalQuestions} Questões</span>
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#18261F] mt-1">
              Entrar para o Quiz
            </h2>
            <p className="text-sm text-[#4E6356] mt-1.5 leading-relaxed">
              Informe seu e-mail para registrar suas respostas e concorrer ao ranking de acertos e agilidade.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#2C4839] uppercase tracking-wider mb-1.5">
                Seu Nome Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#63796E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariana Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5DFD8] rounded-xl text-sm text-[#18261F] placeholder:text-[#8FA196] focus:outline-none focus:ring-2 focus:ring-[#3D5A4C] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2C4839] uppercase tracking-wider mb-1.5">
                Seu E-mail de Acesso *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#63796E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5DFD8] rounded-xl text-sm text-[#18261F] placeholder:text-[#8FA196] focus:outline-none focus:ring-2 focus:ring-[#3D5A4C] focus:border-transparent transition-all"
                />
              </div>
              <p className="text-[11px] text-[#6E8176] mt-1">
                Utilizado para identificação e consulta dos resultados pela Nutricionista Julia Bucchianico.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2C4839] uppercase tracking-wider mb-1.5">
                WhatsApp / Telefone <span className="text-[#87998F] lowercase">(opcional)</span>
              </label>
              <input
                type="tel"
                placeholder="(DDD) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#D5DFD8] rounded-xl text-sm text-[#18261F] placeholder:text-[#8FA196] focus:outline-none focus:ring-2 focus:ring-[#3D5A4C] focus:border-transparent transition-all"
              />
            </div>

            {/* Quick reminder on ranking rule */}
            <div className="bg-[#EEF4F0] border border-[#DCE8DF] rounded-xl p-3 text-xs text-[#395042] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#223B2D]">
                <Clock className="w-3.5 h-3.5 text-[#3D5A4C]" />
                <span>Como funciona o ranking:</span>
              </div>
              <p>
                1. Sua pontuação é baseada no número de acertos.
                <br />
                2. Em caso de empate, vence quem responder em <strong>menos tempo</strong>!
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 text-xs font-medium text-[#4D6255] hover:text-[#18261F] transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#263D31] hover:bg-[#1C2E25] active:bg-[#14221B] rounded-xl transition-all shadow cursor-pointer"
              >
                <span>Iniciar Quiz Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
