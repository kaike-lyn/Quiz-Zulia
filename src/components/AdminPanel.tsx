import React, { useState, useEffect, useRef } from 'react';
import { QuizQuestion, QuizSubmission, QuizSettings } from '../types/quiz';
import { INITIAL_QUESTIONS, DEFAULT_SETTINGS } from '../data/initialQuestions';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Download,
  Share2,
  RotateCcw,
  CheckCircle,
  XCircle,
  Eye,
  Lock,
  Search,
  Check,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Camera,
  Upload,
  Image,
  Sparkles
} from 'lucide-react';
import { saveQuizConfig, fetchAllSubmissions, deleteSubmission, resetRanking } from '../services/quizApi';
import {
  uploadNutricionistaPhoto,
  fetchServerPhoto,
  DEFAULT_FALLBACK_PHOTO,
  uploadNutricionistaLogo,
  fetchServerLogo,
  DEFAULT_FALLBACK_LOGO,
  resetLogoToDefault,
  resetPhotoToDefault
} from '../utils/photoStorage';

interface AdminPanelProps {
  questions: QuizQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
  settings: QuizSettings;
  setSettings: React.Dispatch<React.SetStateAction<QuizSettings>>;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
  onRefreshData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  questions,
  setQuestions,
  settings,
  setSettings,
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  onRefreshData,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [activeTab, setActiveTab] = useState<'submissions' | 'questions' | 'share' | 'photo'>('submissions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<QuizSubmission | null>(null);

  // Question Editor state
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formStatement, setFormStatement] = useState('');
  const [formIsTrue, setFormIsTrue] = useState<boolean>(true);
  const [formCategory, setFormCategory] = useState<any>('Alimentação & Prevenção');
  const [formExplanation, setFormExplanation] = useState('');
  const [formReference, setFormReference] = useState('');

  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Nutritionist photo management
  const [panelPhoto, setPanelPhoto] = useState<string>(() => {
    return localStorage.getItem('jb_nutricionista_custom_photo') || DEFAULT_FALLBACK_PHOTO;
  });
  const [panelPhotoSuccess, setPanelPhotoSuccess] = useState(false);
  const panelFileInputRef = useRef<HTMLInputElement>(null);

  // Nutritionist logo management
  const [panelLogo, setPanelLogo] = useState<string>(() => {
    return localStorage.getItem('jb_custom_logo') || DEFAULT_FALLBACK_LOGO;
  });
  const [panelLogoSuccess, setPanelLogoSuccess] = useState(false);
  const panelLogoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchServerPhoto().then((photo) => {
      if (photo) setPanelPhoto(photo);
    });
    fetchServerLogo().then((logo) => {
      if (logo) setPanelLogo(logo);
    });
  }, []);

  const handlePanelPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPanelPhoto(dataUrl);
        await uploadNutricionistaPhoto(dataUrl);
        setPanelPhotoSuccess(true);
        setTimeout(() => setPanelPhotoSuccess(false), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePanelLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPanelLogo(dataUrl);
        await uploadNutricionistaLogo(dataUrl);
        setPanelLogoSuccess(true);
        setTimeout(() => setPanelLogoSuccess(false), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetPhoto = async () => {
    await resetPhotoToDefault();
    setPanelPhoto(DEFAULT_FALLBACK_PHOTO);
  };

  const handleResetLogo = async () => {
    await resetLogoToDefault();
    setPanelLogo(DEFAULT_FALLBACK_LOGO);
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadSubmissions();
    }
  }, [isAdminLoggedIn]);

  const loadSubmissions = async () => {
    setLoadingSubmissions(true);
    const data = await fetchAllSubmissions();
    setSubmissions(data);
    setLoadingSubmissions(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === 'julia2026' || pinInput.trim() === 'nutri2026' || pinInput.trim() === 'admin') {
      setIsAdminLoggedIn(true);
      setPinError('');
      sessionStorage.setItem('jb_admin_auth', 'true');
    } else {
      setPinError('PIN incorreto. (Dica padrão: julia2026)');
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('jb_admin_auth');
  };

  // Question management
  const openNewQuestionModal = () => {
    setEditingId(null);
    setFormStatement('');
    setFormIsTrue(true);
    setFormCategory('Alimentação & Prevenção');
    setFormExplanation('');
    setFormReference('');
    setIsEditingQuestion(true);
  };

  const openEditQuestionModal = (q: QuizQuestion) => {
    setEditingId(q.id);
    setFormStatement(q.statement);
    setFormIsTrue(q.isTrue);
    setFormCategory(q.category);
    setFormExplanation(q.explanation);
    setFormReference(q.scientificReference || '');
    setIsEditingQuestion(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStatement.trim() || !formExplanation.trim()) {
      alert('Por favor, preencha o enunciado e a explicação da pergunta.');
      return;
    }

    let updatedQuestions: QuizQuestion[];
    if (editingId) {
      updatedQuestions = questions.map((q) =>
        q.id === editingId
          ? {
              ...q,
              statement: formStatement.trim(),
              isTrue: formIsTrue,
              category: formCategory,
              explanation: formExplanation.trim(),
              scientificReference: formReference.trim() || undefined,
            }
          : q
      );
    } else {
      const newQuestion: QuizQuestion = {
        id: `q_${Date.now()}`,
        statement: formStatement.trim(),
        isTrue: formIsTrue,
        category: formCategory,
        explanation: formExplanation.trim(),
        scientificReference: formReference.trim() || undefined,
      };
      updatedQuestions = [...questions, newQuestion];
    }

    setQuestions(updatedQuestions);
    await saveQuizConfig(updatedQuestions, settings);
    setIsEditingQuestion(false);
    showToast('Perguntas salvas com sucesso!');
  };

  const handleDeleteQuestion = async (id: string) => {
    if (questions.length <= 1) {
      alert('O quiz precisa ter pelo menos 1 pergunta.');
      return;
    }
    if (confirm('Deseja realmente excluir esta pergunta do quiz?')) {
      const updated = questions.filter((q) => q.id !== id);
      setQuestions(updated);
      await saveQuizConfig(updated, settings);
      showToast('Pergunta excluída!');
    }
  };

  const handleRestoreDefaults = async () => {
    if (confirm('Deseja restaurar as 13 perguntas originais de Mitos e Verdades da Julia Bucchianico?')) {
      setQuestions(INITIAL_QUESTIONS);
      await saveQuizConfig(INITIAL_QUESTIONS, DEFAULT_SETTINGS);
      showToast('Perguntas padrão restauradas com sucesso!');
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (confirm('Deseja excluir este registro de participante?')) {
      await deleteSubmission(id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      onRefreshData();
      showToast('Registro excluído.');
    }
  };

  const handleResetLeaderboard = async () => {
    const code = prompt('Para zerar todo o ranking e resultados, digite julia2026:');
    if (code === 'julia2026') {
      await resetRanking('julia2026');
      setSubmissions([]);
      onRefreshData();
      showToast('Ranking zerado com sucesso!');
    }
  };

  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Export submissions to CSV
  const exportToCSV = () => {
    if (submissions.length === 0) {
      alert('Nenhum resultado registrado ainda para exportar.');
      return;
    }

    const headers = ['Data', 'Nome', 'Email', 'Telefone', 'Acertos', 'Total', 'Aproveitamento %', 'Tempo Total'];
    const rows = submissions.map((s) => [
      `"${new Date(s.submittedAt).toLocaleString('pt-BR')}"`,
      `"${s.participantName.replace(/"/g, '""')}"`,
      `"${s.participantEmail.replace(/"/g, '""')}"`,
      `"${(s.participantPhone || '').replace(/"/g, '""')}"`,
      s.score,
      s.totalQuestions,
      `"${s.percentage}%"`,
      `"${s.formattedTime}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Resultados_Quiz_Julia_Bucchianico_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = async (customText?: string) => {
    const origin = window.location.origin;
    const textToCopy = customText
      ? `${customText}\n${origin}`
      : origin;

    await navigator.clipboard.writeText(textToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // If not logged in, show elegant PIN access
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-white border-2 border-[#C58D65]/40 rounded-3xl p-8 shadow-md text-center space-y-6">
          <div className="w-14 h-14 bg-[#F0E0D0] border border-[#C58D65]/40 rounded-2xl flex items-center justify-center mx-auto text-[#B66C3D]">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-[#B66C3D] font-bold font-mono">
              Área Restrita
            </div>
            <h1 className="font-serif-display text-2xl font-bold text-[#713000] mt-1">
              Painel da Nutricionista
            </h1>
            <p className="text-xs text-[#713000]/70 mt-1.5 leading-relaxed">
              Acesso exclusivo para <strong>Julia Bucchianico</strong> visualizar resultados dos pacientes, editar perguntas e gerenciar o ranking.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {pinError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                {pinError}
              </div>
            )}

            <div>
              <input
                type="password"
                placeholder="Digite o PIN de acesso (ex: julia2026)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-4 py-3 bg-[#FFF9F4] border border-[#C58D65]/40 rounded-xl text-center text-sm font-mono tracking-widest text-[#713000] focus:outline-none focus:ring-2 focus:ring-[#B66C3D]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 text-sm font-semibold text-white bg-[#B66C3D] hover:bg-[#9E582E] rounded-xl shadow transition-colors cursor-pointer"
            >
              Entrar no Painel de Controle
            </button>

            <p className="text-[11px] text-[#713000]/60">
              PIN padrão pré-configurado: <code className="bg-[#F0E0D0] px-1 py-0.5 rounded">julia2026</code>
            </p>
          </form>
        </div>
      </div>
    );
  }

  const filteredSubmissions = submissions.filter(
    (s) =>
      s.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.participantEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      
      {/* Toast Alert */}
      {saveSuccessMsg && (
        <div className="fixed top-20 right-4 z-50 bg-[#713000] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-[#F0E0D0]" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Top Banner with Actions */}
      <div className="bg-white border-2 border-[#C58D65]/40 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B66C3D]">
            <ShieldCheck className="w-4 h-4 text-[#B66C3D]" />
            <span>Gestão & Controle</span>
            <span aria-hidden="true">·</span>
            <span>Julia Bucchianico</span>
          </div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#713000] mt-1">
            Painel da Nutricionista
          </h1>
          <p className="text-xs sm:text-sm text-[#713000]/70 mt-1">
            Gerencie as perguntas do quiz, acompanhe os resultados salvos e envie o link para seus pacientes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSubmissions}
            className="p-2.5 bg-[#FFF9F4] border border-[#C58D65]/40 text-[#713000] hover:bg-[#F0E0D0] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Atualizar lista de resultados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSubmissions ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 text-xs font-medium text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
          >
            Sair do Painel
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#F0E0D0] pb-2 text-sm font-medium">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'bg-[#B66C3D] text-white shadow-xs font-bold'
              : 'text-[#713000] hover:bg-[#F0E0D0]'
          }`}
        >
          <span>Resultados Salvos</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-white/20">
            {submissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'questions'
              ? 'bg-[#B66C3D] text-white shadow-xs font-bold'
              : 'text-[#713000] hover:bg-[#F0E0D0]'
          }`}
        >
          <span>Perguntas & Alternativas</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-[#F0E0D0] text-[#713000]">
            {questions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('share')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'share'
              ? 'bg-[#B66C3D] text-white shadow-xs font-bold'
              : 'text-[#713000] hover:bg-[#F0E0D0]'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Compartilhar Link</span>
        </button>

        <button
          onClick={() => setActiveTab('photo')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'photo'
              ? 'bg-[#B66C3D] text-white shadow-xs font-bold'
              : 'text-[#713000] hover:bg-[#F0E0D0]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Identidade Visual (Logo & Foto)</span>
        </button>
      </div>

      {/* TAB 1: SUBMISSIONS (RESULTADOS SALVOS) */}
      {activeTab === 'submissions' && (
        <div className="bg-white border border-[#DCE5DF] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#7A8F83] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F9FAF8] border border-[#D5DFD8] rounded-xl text-xs text-[#18261F] focus:outline-none focus:ring-2 focus:ring-[#3D5A4C]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#2C4839] bg-[#EEF4F0] hover:bg-[#DEEBE1] rounded-xl transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV (Excel)</span>
              </button>

              <button
                onClick={handleResetLeaderboard}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Zerar Ranking</span>
              </button>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-16 text-[#6B8274] space-y-2">
              <p className="text-sm font-medium">Nenhum resultado registrado ainda.</p>
              <p className="text-xs">
                Envie o link do quiz para os participantes para que os resultados apareçam aqui em tempo real.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#E4ECE6] text-[#556F60] text-xs uppercase tracking-wider">
                    <th className="py-3 px-3">Data / Hora</th>
                    <th className="py-3 px-4">Participante</th>
                    <th className="py-3 px-4">Contato</th>
                    <th className="py-3 px-4 text-center">Acertos</th>
                    <th className="py-3 px-4 text-center">Tempo Total</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF3EF]">
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#F9FAF8] transition-colors text-[#334A3E]">
                      <td className="py-3.5 px-3 text-xs text-[#6F8679] whitespace-nowrap">
                        {new Date(sub.submittedAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#18261F]">{sub.participantName}</div>
                        <div className="text-xs text-[#71877A]">{sub.participantEmail}</div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-[#526B5D]">
                        {sub.participantPhone || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-semibold text-[#18261F]">{sub.score} / {sub.totalQuestions}</span>
                        <span className="text-xs text-[#6B8274] block font-mono">({sub.percentage}%)</span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-[#18261F] tabular-nums">
                        {sub.formattedTime}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="p-1.5 text-[#3D5A4C] hover:bg-[#EEF4F0] rounded-lg transition-colors cursor-pointer"
                          title="Visualizar respostas detalhadas"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubmission(sub.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir este resultado"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: QUESTIONS & ALTERNATIVES */}
      {activeTab === 'questions' && (
        <div className="bg-white border border-[#DCE5DF] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif-display text-xl font-semibold text-[#18261F]">
                Perguntas Cadastradas no Quiz ({questions.length})
              </h2>
              <p className="text-xs text-[#5F786B] mt-0.5">
                Defina o enunciado, se a afirmação é Verdadeira ou Mito/Falso, e a fundamentação científica.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRestoreDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#486354] bg-[#EEF4F0] hover:bg-[#DEEBE1] rounded-xl transition-colors cursor-pointer"
                title="Restaura as 13 perguntas originais de Julia Bucchianico"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Originais</span>
              </button>

              <button
                onClick={openNewQuestionModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#263D31] hover:bg-[#1A2C23] rounded-xl shadow transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Nova Pergunta</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 sm:p-5 rounded-2xl border border-[#DDE7E1] bg-[#FAFBF9] hover:bg-white transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#556F60]">
                      <span>{idx + 1}. {q.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        q.isTrue
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {q.isTrue ? 'VERDADEIRO' : 'MITO / FALSO'}
                      </span>
                    </div>

                    <h3 className="font-medium text-sm sm:text-base text-[#18261F] leading-snug">
                      "{q.statement}"
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditQuestionModal(q)}
                      className="p-1.5 text-[#3D5A4C] hover:bg-[#EEF4F0] rounded-lg transition-colors cursor-pointer"
                      title="Editar pergunta"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir pergunta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#3E5649] bg-white p-3 rounded-xl border border-[#E5EFE8] leading-relaxed">
                  <strong className="text-[#1D3227]">Explicação / Justificativa:</strong> {q.explanation}
                  {q.scientificReference && (
                    <span className="block text-[11px] text-[#71897C] italic mt-1">
                      Ref: {q.scientificReference}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SHARE LINK */}
      {activeTab === 'share' && (
        <div className="bg-white border border-[#DCE5DF] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="font-serif-display text-xl font-semibold text-[#18261F]">
              Compartilhar o Link com Pacientes e Alunos
            </h2>
            <p className="text-xs text-[#5F786B] mt-0.5">
              Envie o link direto para que seus pacientes acessem, façam login com o e-mail e registrem seus tempos.
            </p>
          </div>

          <div className="p-5 bg-[#FAFBF9] border border-[#DEE7E2] rounded-2xl space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2D4738] mb-1">
                Link Direto do Quiz
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={window.location.origin}
                  className="flex-1 px-4 py-2.5 bg-white border border-[#D5DFD8] rounded-xl text-xs font-mono text-[#18261F]"
                />
                <button
                  onClick={() => handleCopyLink()}
                  className="px-5 py-2.5 bg-[#263D31] hover:bg-[#1A2C23] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>
            </div>

            {/* Template ready for WhatsApp */}
            <div className="pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2D4738] mb-1">
                Mensagem Pronta para WhatsApp
              </label>
              <div className="p-4 bg-white border border-[#DCE5DF] rounded-xl text-xs text-[#2A4134] whitespace-pre-line leading-relaxed">
                {`Olá! Aqui é a nutricionista Julia Bucchianico. ✨\n\nPreparei um Quiz exclusivo de Mitos & Verdades sobre alimentação, metabolismo do estrogênio, brássicas e fatores de prevenção do câncer.\n\nVocê consegue acertar todas as questões? O teste cronometra seu tempo para o nosso Ranking Geral!\n\nAcesse agora através do link:\n${window.location.origin}`}
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={() =>
                    handleCopyLink(
                      `Olá! Aqui é a nutricionista Julia Bucchianico. ✨\n\nPreparei um Quiz exclusivo de Mitos & Verdades sobre alimentação, metabolismo do estrogênio, brássicas e fatores de prevenção do câncer.\n\nVocê consegue acertar todas as questões? O teste cronometra seu tempo para o nosso Ranking Geral!\n\nAcesse agora através do link:`
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#2A4134] bg-[#EEF4F0] hover:bg-[#DEEBE1] rounded-xl transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copiar Mensagem Formatada</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BRANDING (LOGOTIPO E FOTO DE CAPA) */}
      {activeTab === 'photo' && (
        <div className="space-y-6">
          
          {/* SECTION 1: LOGO UPLOADER */}
          <div className="bg-white border-2 border-[#C58D65]/40 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <input
              type="file"
              ref={panelLogoInputRef}
              accept="image/*"
              onChange={handlePanelLogoSelect}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-36 h-28 rounded-2xl overflow-hidden border-2 border-[#C58D65]/60 shadow-md bg-white p-2 flex items-center justify-center shrink-0">
                <img
                  src={panelLogo}
                  alt="Logotipo Oficial"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F0E0D0] text-[#713000] text-[10px] font-mono font-bold uppercase tracking-wider">
                  <Image className="w-3 h-3 text-[#B66C3D]" />
                  <span>Logotipo da Marca</span>
                </div>

                <h2 className="font-serif-display text-xl font-bold text-[#713000]">
                  Logotipo Oficial da Nutricionista
                </h2>

                <p className="text-xs text-[#713000]/70 leading-relaxed max-w-xl">
                  Carregue aqui o arquivo original do seu logotipo (PNG com fundo transparente, JPG ou SVG). Ele substituirá o logo atual no cabeçalho e em todas as telas do aplicativo.
                </p>

                {panelLogoSuccess && (
                  <div className="p-3 bg-[#F0E0D0] border border-[#62552D] text-[#62552D] text-xs rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
                    <Check className="w-4 h-4" />
                    <span>Seu logotipo original foi carregado e atualizado em todas as telas!</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start pt-1">
                  <button
                    type="button"
                    onClick={() => panelLogoInputRef.current?.click()}
                    className="px-5 py-2.5 bg-[#B66C3D] hover:bg-[#A05329] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Escolher Arquivo do Meu Logo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="px-4 py-2.5 bg-[#FFF9F4] hover:bg-[#F0E0D0] text-[#713000] border border-[#C58D65]/40 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                  >
                    <span>Restaurar Logo Padrão</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: PHOTO UPLOADER */}
          <div className="bg-white border-2 border-[#C58D65]/40 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <input
              type="file"
              ref={panelFileInputRef}
              accept="image/*"
              onChange={handlePanelPhotoSelect}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-36 h-48 rounded-2xl overflow-hidden border-2 border-[#C58D65]/60 shadow-md bg-[#F0E0D0] relative shrink-0">
                <img
                  src={panelPhoto}
                  alt="Foto da Nutricionista"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F0E0D0] text-[#713000] text-[10px] font-mono font-bold uppercase tracking-wider">
                  <Camera className="w-3 h-3 text-[#B66C3D]" />
                  <span>Foto de Perfil</span>
                </div>

                <h2 className="font-serif-display text-xl font-bold text-[#713000]">
                  Sua Foto Oficial na Capa do Quiz
                </h2>

                <p className="text-xs text-[#713000]/70 leading-relaxed max-w-xl">
                  Carregue a sua foto original para ser exibida com nitidez na moldura da tela inicial para todos os participantes do quiz.
                </p>

                {panelPhotoSuccess && (
                  <div className="p-3 bg-[#F0E0D0] border border-[#62552D] text-[#62552D] text-xs rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
                    <Check className="w-4 h-4" />
                    <span>Sua foto foi carregada e salva com sucesso!</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start pt-1">
                  <button
                    type="button"
                    onClick={() => panelFileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-[#B66C3D] hover:bg-[#A05329] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Escolher Arquivo da Minha Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetPhoto}
                    className="px-4 py-2.5 bg-[#FFF9F4] hover:bg-[#F0E0D0] text-[#713000] border border-[#C58D65]/40 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                  >
                    <span>Restaurar Foto Padrão</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* MODAL: View Participant Details */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14231B]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FAF9F5] border border-[#DCE5DF] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-[#5A7365] font-semibold">
                  Relatório Detalhado de Respostas
                </div>
                <h2 className="font-serif-display text-2xl font-semibold text-[#18261F] mt-1">
                  {selectedSubmission.participantName}
                </h2>
                <div className="text-xs text-[#5D7466] mt-0.5">
                  {selectedSubmission.participantEmail} · {selectedSubmission.participantPhone || 'Sem telefone'}
                </div>
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-[#647C6F] hover:text-[#18261F] text-sm cursor-pointer p-1"
              >
                ✕ Fechar
              </button>
            </div>

            {/* Score pill */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-white border border-[#DCE5DF] rounded-2xl text-center text-xs">
              <div>
                <div className="text-[#6E8376]">Pontuação</div>
                <div className="text-lg font-bold text-[#18261F]">{selectedSubmission.score} / {selectedSubmission.totalQuestions}</div>
              </div>
              <div>
                <div className="text-[#6E8376]">Aproveitamento</div>
                <div className="text-lg font-bold text-[#18261F]">{selectedSubmission.percentage}%</div>
              </div>
              <div>
                <div className="text-[#6E8376]">Tempo Total</div>
                <div className="text-lg font-bold font-mono text-[#18261F]">{selectedSubmission.formattedTime}</div>
              </div>
            </div>

            {/* Questions answered */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4E6657]">
                Respostas dadas pelo participante ({selectedSubmission.answers.length}):
              </h3>

              {selectedSubmission.answers.map((ans, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    ans.isCorrect
                      ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                      : 'border-amber-200 bg-amber-50/40 text-amber-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#18261F]">{idx + 1}. {ans.statement}</span>
                    <span className="shrink-0 flex items-center gap-1 font-semibold">
                      {ans.isCorrect ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Acertou</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-amber-700" />
                          <span>Errou</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#4A6354] flex gap-3">
                    <span>Marcou: <strong>{ans.userAnswer}</strong></span>
                    <span>Tempo na pergunta: <strong>{ans.timeSpentSeconds}s</strong></span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#263D31] hover:bg-[#1A2C23] rounded-xl cursor-pointer"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add/Edit Question */}
      {isEditingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14231B]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FAF9F5] border border-[#DCE5DF] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div>
              <div className="text-xs uppercase tracking-wider text-[#5A7365] font-semibold">
                {editingId ? 'Editar Pergunta' : 'Nova Pergunta'}
              </div>
              <h2 className="font-serif-display text-2xl font-semibold text-[#18261F] mt-1">
                {editingId ? 'Modificar Questão do Quiz' : 'Criar Nova Questão para o Quiz'}
              </h2>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#2D4738] mb-1">
                  Enunciado da Pergunta *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: A alimentação é um fator modificável relacionado ao risco de câncer..."
                  value={formStatement}
                  onChange={(e) => setFormStatement(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#D5DFD8] rounded-xl text-xs text-[#18261F] focus:outline-none focus:ring-2 focus:ring-[#3D5A4C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#2D4738] mb-1">
                    Gabarito Correto *
                  </label>
                  <select
                    value={formIsTrue ? 'true' : 'false'}
                    onChange={(e) => setFormIsTrue(e.target.value === 'true')}
                    className="w-full px-4 py-2.5 bg-white border border-[#D5DFD8] rounded-xl text-xs text-[#18261F] focus:outline-none focus:ring-2 focus:ring-[#3D5A4C]"
                  >
                    <option value="true">VERDADEIRO</option>
                    <option value="false">MITO / FALSO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#2D4738] mb-1">
                    Categoria Temática
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-white border border-[#D5DFD8] rounded-xl text-xs text-[#18261F] focus:outline-none focus:ring-2 focus:ring-[#3D5A4C]"
                  >
                    <option value="Alimentação & Prevenção">Alimentação & Prevenção</option>
                    <option value="Microbiota & Imunidade">Microbiota & Imunidade</option>
                    <option value="Hormônios & Metabolismo">Hormônios & Metabolismo</option>
                    <option value="Toxinas & Ambiente">Toxinas & Ambiente</option>
                    <option value="Estilo de Vida">Estilo de Vida</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#2D4738] mb-1">
                  Explicação Científica da Nutricionista *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Justifique o porquê desta resposta cientificamente..."
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#D5DFD8] rounded-xl text-xs text-[#18261F] focus:outline-none focus:ring-2 focus:ring-[#3D5A4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#2D4738] mb-1">
                  Referência Científica (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: OMS / INCA / World Cancer Research Fund"
                  value={formReference}
                  onChange={(e) => setFormReference(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#D5DFD8] rounded-xl text-xs text-[#18261F] focus:outline-none focus:ring-2 focus:ring-[#3D5A4C]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingQuestion(false)}
                  className="px-4 py-2 text-xs font-medium text-[#4D6255] hover:text-[#18261F] cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#263D31] hover:bg-[#1A2C23] rounded-xl shadow cursor-pointer"
                >
                  Salvar Pergunta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
