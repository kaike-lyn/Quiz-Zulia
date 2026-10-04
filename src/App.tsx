/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizSubmission, LeaderboardEntry, QuizSettings } from './types/quiz';
import { INITIAL_QUESTIONS, DEFAULT_SETTINGS } from './data/initialQuestions';
import { fetchQuizConfig, fetchLeaderboard, submitQuizResult } from './services/quizApi';
import { GameLobby } from './components/GameLobby';
import { GameCountdown } from './components/GameCountdown';
import { GameStage } from './components/GameStage';
import { GameOverPodium } from './components/GameOverPodium';
import { LeaderboardView } from './components/LeaderboardView';
import { AdminPanel } from './components/AdminPanel';

type GameScreen = 'LOBBY' | 'COUNTDOWN' | 'PLAYING' | 'GAME_OVER' | 'LEADERBOARD' | 'ADMIN';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('LOBBY');
  const [questions, setQuestions] = useState<QuizQuestion[]>(INITIAL_QUESTIONS);
  const [gameQuestions, setGameQuestions] = useState<QuizQuestion[]>(INITIAL_QUESTIONS);
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Active Player state
  const [activePlayer, setActivePlayer] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const [lastSubmission, setLastSubmission] = useState<QuizSubmission | null>(null);

  // Admin login state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('jb_admin_auth') === 'true';
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const config = await fetchQuizConfig();
      if (config.questions && config.questions.length > 0) {
        setQuestions(config.questions);
      }
      if (config.settings) {
        setSettings(config.settings);
      }
      const board = await fetchLeaderboard();
      setLeaderboard(board);
    } catch (err) {
      console.error('Error initializing quiz data:', err);
    }
  };

  // Fisher-Yates shuffle algorithm to guarantee genuine random order for every player
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleStartGame = (player: { name: string; email: string }) => {
    setActivePlayer(player);
    // Randomize question order on every single attempt
    const randomized = shuffleArray(questions);
    setGameQuestions(randomized);
    setScreen('COUNTDOWN');
  };

  const handleCountdownComplete = () => {
    setScreen('PLAYING');
  };

  const handleFinishGame = async (submission: QuizSubmission) => {
    setLastSubmission(submission);
    setScreen('GAME_OVER');

    // Save to server & sync leaderboard
    await submitQuizResult(submission);
    const updatedBoard = await fetchLeaderboard();
    setLeaderboard(updatedBoard);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F4] text-[#713000] flex flex-col justify-between selection:bg-[#B66C3D] selection:text-white">
      
      {/* Dynamic Screen rendering */}
      <main className="flex-1 flex flex-col justify-center">
        
        {screen === 'LOBBY' && (
          <GameLobby
            onStartGame={handleStartGame}
            onOpenLeaderboard={() => setScreen('LEADERBOARD')}
            onOpenAdmin={() => setScreen('ADMIN')}
            leaderboard={leaderboard}
            totalQuestions={questions.length}
          />
        )}

        {screen === 'COUNTDOWN' && activePlayer && (
          <GameCountdown
            playerName={activePlayer.name}
            onCountdownComplete={handleCountdownComplete}
          />
        )}

        {screen === 'PLAYING' && activePlayer && (
          <GameStage
            questions={gameQuestions}
            player={activePlayer}
            onFinishGame={handleFinishGame}
            onExitGame={() => setScreen('LOBBY')}
          />
        )}

        {screen === 'GAME_OVER' && lastSubmission && (
          <GameOverPodium
            submission={lastSubmission}
            leaderboard={leaderboard}
            allQuestions={gameQuestions}
            onGoToLobby={() => setScreen('LOBBY')}
          />
        )}

        {screen === 'LEADERBOARD' && (
          <div className="py-6">
            <div className="max-w-5xl mx-auto px-4 mb-4">
              <button
                onClick={() => setScreen('LOBBY')}
                className="text-xs font-mono font-bold text-[#2F4F3B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                ← Voltar ao Início do Jogo
              </button>
            </div>
            <LeaderboardView
              leaderboard={leaderboard}
              onStartQuiz={() => setScreen('LOBBY')}
            />
          </div>
        )}

        {screen === 'ADMIN' && (
          <div className="py-6">
            <div className="max-w-6xl mx-auto px-4 mb-4">
              <button
                onClick={() => setScreen('LOBBY')}
                className="text-xs font-mono font-bold text-[#2F4F3B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                ← Voltar para o Jogo
              </button>
            </div>
            <AdminPanel
              questions={questions}
              setQuestions={setQuestions}
              settings={settings}
              setSettings={setSettings}
              isAdminLoggedIn={isAdminLoggedIn}
              setIsAdminLoggedIn={setIsAdminLoggedIn}
              onRefreshData={loadAllData}
            />
          </div>
        )}

      </main>

    </div>
  );
}
