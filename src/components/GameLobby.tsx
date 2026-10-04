import React, { useState, useEffect, useRef } from 'react';
import { LeaderboardEntry } from '../types/quiz';
import { soundManager } from '../utils/audio';
import { BrandLogo } from './BrandLogo';
import {
  fetchServerPhoto,
  uploadNutricionistaPhoto,
  DEFAULT_FALLBACK_PHOTO
} from '../utils/photoStorage';
import {
  Play,
  Award,
  User,
  Mail,
  Volume2,
  VolumeX,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Shuffle,
  Camera,
  Check
} from 'lucide-react';

interface GameLobbyProps {
  onStartGame: (player: { name: string; email: string }) => void;
  onOpenLeaderboard: () => void;
  onOpenAdmin: () => void;
  leaderboard: LeaderboardEntry[];
  totalQuestions: number;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  onStartGame,
  onOpenLeaderboard,
  onOpenAdmin,
  leaderboard,
  totalQuestions,
}) => {
  const [name, setName] = useState(() => localStorage.getItem('jb_player_name') || '');
  const [email, setEmail] = useState(() => localStorage.getItem('jb_player_email') || '');
  const [error, setError] = useState('');
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);

  // Nutritionist photo state
  const [photoUrl, setPhotoUrl] = useState<string>(() => {
    return localStorage.getItem('jb_nutricionista_custom_photo') || DEFAULT_FALLBACK_PHOTO;
  });

  useEffect(() => {
    // Check server for stored custom photo
    fetchServerPhoto().then((serverPhoto) => {
      if (serverPhoto) {
        setPhotoUrl(serverPhoto);
        localStorage.setItem('jb_nutricionista_custom_photo', serverPhoto);
      }
    });

    const handlePhotoUpdated = () => {
      const stored = localStorage.getItem('jb_nutricionista_custom_photo');
      if (stored) setPhotoUrl(stored);
    };

    window.addEventListener('jb_photo_updated', handlePhotoUpdated);
    return () => window.removeEventListener('jb_photo_updated', handlePhotoUpdated);
  }, []);

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) soundManager.playClick();
  };

  // Check if typed email already played
  const cleanEmail = email.trim().toLowerCase();
  const existingPlayerEntry = cleanEmail
    ? leaderboard.find((entry) => entry.participantEmail.toLowerCase() === cleanEmail)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();

    const cleanName = name.trim();

    if (!cleanName || cleanName.length < 2) {
      setError('Por favor, informe seu nome para a partida.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Digite um e-mail válido para registrar seu recorde.');
      return;
    }

    // ENFORCE 1 ATTEMPT PER PERSON
    if (existingPlayerEntry) {
      setError('Este e-mail já realizou o quiz! Cada pessoa pode fazer o teste apenas 1 vez.');
      return;
    }

    localStorage.setItem('jb_player_name', cleanName);
    localStorage.setItem('jb_player_email', cleanEmail);

    onStartGame({
      name: cleanName,
      email: cleanEmail,
    });
  };

  const topPlayer = leaderboard.length > 0 ? leaderboard[0] : null;

  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-4xl mx-auto px-4 py-8">
      
      {/* Brand Header Bar with Logo */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <BrandLogo size="md" />

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-white border border-[#F0E0D0] text-[#B66C3D] hover:bg-[#FBF6F0] transition-colors cursor-pointer shadow-xs"
            title={isMuted ? 'Ativar Sons' : 'Silenciar Sons'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#B66C3D]" />}
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#C58D65]/50 text-xs font-bold text-[#713000] hover:bg-[#FBF6F0] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Award className="w-4 h-4 text-[#B66C3D]" />
            <span>Ver Ranking</span>
          </button>
        </div>
      </div>

      {/* Main Clean Card - Off-white canvas, White Card with Julia's photo */}
      <div className="relative bg-white rounded-3xl p-6 sm:p-10 text-[#713000] shadow-xl border-2 border-[#C58D65]/40 overflow-hidden">
        
        {/* Subtle decorative champagne warmth */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F0E0D0]/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F0E0D0]/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Portrait of Julia Bucchianico & Game Information */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Julia's Portrait Header Card */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="relative shrink-0">
                <div className="w-28 sm:w-36 h-36 sm:h-44 rounded-2xl overflow-hidden border-2 border-[#C58D65]/60 shadow-md bg-[#F0E0D0] relative">
                  <img
                    src={photoUrl}
                    alt="Nutricionista Julia Bucchianico"
                    className="w-full h-full object-cover object-top"
                  />

                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#713000]/95 via-[#713000]/60 to-transparent p-1.5 text-center pointer-events-none">
                    <span className="text-[9px] font-bold text-white uppercase font-mono tracking-wider block">
                      Julia Bucchianico
                    </span>
                    <span className="text-[7.5px] text-[#F0E0D0] uppercase font-mono block">
                      CRN 3 - 38059
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F0E0D0] border border-[#C58D65]/40 text-[#713000] text-[10px] font-mono tracking-wider font-bold">
                  <Shuffle className="w-3 h-3 text-[#B66C3D]" />
                  <span>ORDEM ALEATÓRIA · {totalQuestions} QUESTÕES</span>
                </div>

                <h1 className="font-serif-display text-2xl sm:text-4xl font-black text-[#713000] leading-tight tracking-tight">
                  Mitos & Verdades
                </h1>

                <p className="text-xs text-[#713000]/80 leading-relaxed">
                  Bem-vindo(a) ao meu desafio científico! <strong>Cada pessoa pode responder apenas 1 vez</strong>, e o desempate no ranking é quem respondeu mais rápido.
                </p>
              </div>
            </div>

            {/* MANDATORY USER NOTICE: Clean health-aesthetic instruction box */}
            <div className="bg-[#FFF9F4] border-2 border-[#C58D65]/50 rounded-2xl p-4 text-xs text-left space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-[#713000] font-bold uppercase tracking-wider text-[11px]">
                <AlertTriangle className="w-4 h-4 text-[#B66C3D] shrink-0" />
                <span>Instruções Importantes da Prova</span>
              </div>
              
              <ul className="space-y-1.5 text-[#713000]/90 text-[11px] leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#B66C3D] font-bold">1.</span>
                  <span>Após selecionar a alternativa, <strong>você deve clicar no botão "Próxima Pergunta"</strong> para avançar.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#B66C3D] font-bold">2.</span>
                  <span><strong className="text-[#713000]">O cronômetro continua rodando sem parar</strong> durante todo o teste até o envio da última questão.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#B66C3D] font-bold">3.</span>
                  <span>A <strong>ordem das perguntas é sempre sorteada de forma aleatória</strong> a cada tentativa!</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#B66C3D] font-bold">4.</span>
                  <span>O <strong>gabarito oficial com as explicações</strong> ficará disponível <strong>somente ao final</strong> para você não perder tempo.</span>
                </li>
              </ul>
            </div>

            {/* Current Champion Ticker */}
            {topPlayer && (
              <div className="bg-[#F0E0D0]/50 border border-[#C58D65]/40 rounded-2xl p-3 flex items-center justify-between text-xs shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">👑</span>
                  <div className="text-left">
                    <span className="text-[#B66C3D] text-[10px] uppercase font-mono font-bold block">
                      Recorde Atual no Ranking
                    </span>
                    <span className="font-bold text-[#713000] truncate max-w-[150px] block">
                      {topPlayer.participantName}
                    </span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[#713000] font-bold block">{topPlayer.score}/{topPlayer.totalQuestions} acertos</span>
                  <span className="text-[11px] text-[#B66C3D] font-semibold">em {topPlayer.formattedTime}</span>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Player Registration Form */}
          <div className="lg:col-span-6">
            <div className="bg-[#FFF9F4] border-2 border-[#C58D65]/40 rounded-2xl p-6 sm:p-7 shadow-md">
              
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#713000] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#B66C3D]" />
                  <span>Identificação do Jogador</span>
                </h2>
                <span className="text-[11px] text-[#62552D] font-mono font-semibold">
                  Tentativa única
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-xl flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {/* If typed email already exists */}
                {existingPlayerEntry && (
                  <div className="p-3.5 bg-[#F0E0D0] border border-[#C58D65] rounded-xl text-xs space-y-2 text-[#713000]">
                    <div className="flex items-center gap-1.5 font-bold text-[#713000]">
                      <CheckCircle className="w-4 h-4 text-[#62552D]" />
                      <span>Você já realizou este quiz!</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Resultado gravado: <strong>{existingPlayerEntry.score}/{existingPlayerEntry.totalQuestions} acertos</strong> em <strong>{existingPlayerEntry.formattedTime}</strong> (#{existingPlayerEntry.rank}º no ranking).
                      Para manter a disputa justa, é permitida apenas 1 participação por pessoa.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenLeaderboard}
                      className="w-full py-2 bg-[#B66C3D] text-white font-bold rounded-lg text-xs uppercase tracking-wider hover:bg-[#A05329] transition-colors cursor-pointer"
                    >
                      Ver Minha Posição no Ranking
                    </button>
                  </div>
                )}

                {/* Player Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#713000] mb-1">
                    Seu Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#B66C3D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mariana Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#C58D65]/40 rounded-xl text-sm text-[#713000] placeholder:text-[#C58D65]/60 focus:outline-none focus:ring-2 focus:ring-[#B66C3D] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Player Email */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#713000] mb-1">
                    Seu E-mail (Acesso Único) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#B66C3D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="seuemail@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#C58D65]/40 rounded-xl text-sm text-[#713000] placeholder:text-[#C58D65]/60 focus:outline-none focus:ring-2 focus:ring-[#B66C3D] focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-[#713000]/70 mt-1">
                    Cada e-mail pode realizar o teste apenas 1 vez. O tempo começa logo após o início!
                  </p>
                </div>

                {/* Primary Start Button in Cobre (#B66C3D) */}
                <button
                  type="submit"
                  disabled={Boolean(existingPlayerEntry)}
                  className={`w-full py-4 mt-2 px-6 font-black text-base uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 border-b-4 ${
                    existingPlayerEntry
                      ? 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-[#B66C3D] to-[#C58D65] hover:from-[#A05329] hover:to-[#B66C3D] active:scale-[0.98] text-white cursor-pointer border-[#8E471F] shadow-[0_6px_20px_rgba(182,108,61,0.35)]'
                  }`}
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>{existingPlayerEntry ? 'TESTE JÁ REALIZADO' : 'INICIAR PARTIDA AGORA'}</span>
                </button>

              </form>

            </div>
          </div>

        </div>

      </div>

      {/* Discreet footer access for Julia's Admin */}
      <div className="mt-6 flex items-center justify-between text-xs text-[#713000]/70 font-medium">
        <div>
          Quiz Show desenvolvido para a nutricionista <strong>Julia Bucchianico · CRN 3 - 38059</strong>
        </div>

        <button
          onClick={onOpenAdmin}
          className="hover:text-[#713000] text-[#B66C3D] font-bold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>⚙️ Painel da Nutricionista</span>
        </button>
      </div>

    </div>
  );
};
