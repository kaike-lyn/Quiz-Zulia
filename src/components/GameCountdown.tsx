import React, { useEffect, useState } from 'react';
import { soundManager } from '../utils/audio';
import { AlertCircle } from 'lucide-react';

interface GameCountdownProps {
  onCountdownComplete: () => void;
  playerName: string;
}

export const GameCountdown: React.FC<GameCountdownProps> = ({
  onCountdownComplete,
  playerName,
}) => {
  const [count, setCount] = useState<number>(3);

  // Play initial beep on mount
  useEffect(() => {
    soundManager.playCountdownBeep(false);
  }, []);

  // Step countdown safely outside render/updater
  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        const nextCount = count - 1;
        setCount(nextCount);
        if (nextCount > 0) {
          soundManager.playCountdownBeep(false);
        } else {
          soundManager.playCountdownBeep(true); // "VALENDO!"
        }
      }, 850);
      return () => clearTimeout(timer);
    } else {
      // Dwell on "VALENDO! 🚀" for 650ms, then transition to stage
      const finishTimer = setTimeout(() => {
        onCountdownComplete();
      }, 650);
      return () => clearTimeout(finishTimer);
    }
  }, [count, onCountdownComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFF9F4]/95 backdrop-blur-md text-[#713000] select-none">
      <div className="text-center space-y-6 max-w-md px-4">
        
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg font-bold text-[#713000] font-mono tracking-wider">
            {playerName}
          </span>
        </div>

        <div className="text-xs uppercase tracking-widest text-[#B66C3D] font-mono font-bold">
          PREPARE-SE PARA O DESAFIO...
        </div>

        <div className="h-28 flex items-center justify-center">
          {count > 0 ? (
            <div
              key={count}
              className="text-8xl sm:text-9xl font-black text-[#B66C3D] drop-shadow-[0_4px_15px_rgba(182,108,61,0.25)] animate-in zoom-in-50 duration-300"
            >
              {count}
            </div>
          ) : (
            <div
              className="text-6xl sm:text-7xl font-black text-[#62552D] drop-shadow-[0_4px_20px_rgba(98,85,45,0.3)] tracking-wider animate-in zoom-in-75 duration-200"
            >
              VALENDO! 🚀
            </div>
          )}
        </div>

        {/* Clear Reminder on Timer & Next button */}
        <div className="bg-[#F0E0D0] border-2 border-[#C58D65]/50 rounded-2xl p-4 text-xs text-[#713000] space-y-1 text-left font-mono shadow-sm">
          <div className="flex items-center gap-1.5 text-[#B66C3D] font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>LEMBRE-SE:</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            • Responda e clique no botão <strong>"Próxima Pergunta"</strong> para avançar.<br />
            • <strong>O cronômetro não para!</strong> O gabarito ficará disponível somente no final.
          </p>
        </div>

      </div>
    </div>
  );
};
