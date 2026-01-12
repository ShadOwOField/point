import React, { useState, useEffect } from 'react';
import { PointStats, Choice } from '../types';

interface GameOverlayProps {
  stats: PointStats;
  isVisible: boolean;
  dialog: string;
  choices: Choice[];
  onChoice: (choice: Choice) => void;
  lastUserResponse: string | null;
}

const GameOverlay: React.FC<GameOverlayProps> = ({ stats, isVisible, dialog, choices, onChoice, lastUserResponse }) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Robust typewriter effect logic
  useEffect(() => {
    let currentIdx = 0;
    setDisplayText("");
    setIsTyping(true);
    
    const interval = setInterval(() => {
      if (currentIdx < dialog.length) {
        // Use substring to prevent state race conditions or mixed characters
        setDisplayText(dialog.substring(0, currentIdx + 1));
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30);
    
    return () => clearInterval(interval);
  }, [dialog]);

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case 'Comfort': return 'Умиротворение';
      case 'Tranquil': return 'Спокойствие';
      case 'Anxiety': return 'Тревога';
      case 'Fear': return 'Страх';
      case 'Panic': return 'Паника';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Comfort': return 'bg-cyan-300';
      case 'Tranquil': return 'bg-emerald-400';
      case 'Anxiety': return 'bg-yellow-400';
      case 'Fear': return 'bg-orange-500';
      case 'Panic': return 'bg-rose-600';
      default: return 'bg-white';
    }
  };

  if (!isVisible) return null;

  // Visual jitter at low energy
  const jitterClass = stats.energy < 15 ? 'animate-jitter' : '';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col">
      
      {/* Energy Indicator - Top Right */}
      <div className="absolute top-12 right-12 w-48 transition-opacity duration-1000">
        <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2 font-medium">
          <span>ЖИЗНЕННАЯ СИЛА</span>
          <span>{stats.energy}%</span>
        </div>
        <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${stats.energy < 20 ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]' : 'bg-white/40'}`} 
            style={{ width: `${stats.energy}%` }}
          />
        </div>
        <div className="mt-4 flex items-center gap-2">
           <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)] ${getStatusColor(stats.status)}`} />
           <span className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-light">
             {getStatusTranslation(stats.status)}
           </span>
        </div>
      </div>

      {/* Dialog Window - Bottom Center */}
      <div className={`mt-auto mb-20 px-8 flex flex-col items-center ${jitterClass}`}>
        <div className={`w-full max-w-2xl bg-slate-900/60 backdrop-blur-3xl border border-white/5 rounded-3xl p-10 pointer-events-auto shadow-2xl transition-all duration-1000 ${stats.energy === 0 ? 'border-rose-900/40 shadow-rose-900/20' : 'border-white/10'}`}>
          
          {/* User's last response indicator */}
          {lastUserResponse && (
             <div className="mb-6 animate-fade-in opacity-40">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 block mb-1">Вы:</span>
                <p className="text-white/60 font-light italic text-sm">{lastUserResponse}</p>
                <div className="h-px w-8 bg-white/10 mt-4" />
             </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 block mb-1">Частица:</span>
            <p className="text-white/90 font-light text-base md:text-lg leading-relaxed tracking-wide min-h-[3em]">
              {displayText}
              {isTyping && <span className="inline-block w-1.5 h-4 bg-white/40 ml-1 animate-pulse" />}
            </p>
          </div>

          {choices.length > 0 && !isTyping && (
            <div className="mt-10 flex flex-wrap gap-4 animate-fade-in">
              {choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => onChoice(choice)}
                  className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[11px] uppercase tracking-[0.2em] text-white/50 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {choice.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 0.4; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1.2s forwards ease-out;
        }
        @keyframes jitter {
          0% { transform: translate(0, 0); }
          25% { transform: translate(1px, -1px); }
          50% { transform: translate(-1px, 1px); }
          75% { transform: translate(1px, 1px); }
          100% { transform: translate(0, 0); }
        }
        .animate-jitter {
          animation: jitter 0.2s infinite linear;
        }
      `}} />
    </div>
  );
};

export default GameOverlay;