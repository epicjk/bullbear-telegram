'use client';

import { GamePhase } from './useBullBearGame';

interface BullBearHeaderProps {
  currentRound: number;
  gamePhase: GamePhase;
  timeRemaining: number;
  balance: number;
  isConnected: boolean;
  onBack?: () => void;
}

export function BullBearHeader({
  currentRound,
  gamePhase,
  timeRemaining,
  balance,
  isConnected,
  onBack,
}: BullBearHeaderProps) {
  const phaseLabels: Record<GamePhase, string> = {
    betting: 'BETTING',
    countdown: 'LOCKING',
    game: 'LIVE',
    result: 'RESULT',
  };

  const phaseColors: Record<GamePhase, string> = {
    betting: 'bg-[#fbbf24]/15 text-[#fbbf24]',
    countdown: 'bg-red-500/15 text-red-500',
    game: 'bg-[#a855f7]/15 text-[#a855f7]',
    result: 'bg-[#22c55e]/15 text-[#22c55e]',
  };

  return (
    <header className="flex justify-between items-center px-3 py-2 md:px-5 md:py-3 bg-[#12121a]/80 backdrop-blur-sm border-b border-white/5">
      {/* Left - Logo */}
      <div className="flex items-center gap-2 md:gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white/60 text-lg md:text-xl">arrow_back</span>
          </button>
        )}
        <div className="flex items-center gap-2">
          {/* Orbital Logo */}
          <div className="relative w-10 h-10 md:w-12 md:h-12">
            {/* Orbits */}
            <div className="absolute inset-0 border-2 border-white/15 rounded-full animate-[spin_8s_linear_infinite]" />
            <div className="absolute inset-[12.5%] border-2 border-white/15 rounded-full animate-[spin_6s_linear_infinite_reverse]" />
            <div className="absolute inset-[25%] border-2 border-white/15 rounded-full animate-[spin_4s_linear_infinite]" />
            {/* Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-[#f7931a] to-[#ffab40] flex items-center justify-center shadow-[0_0_20px_rgba(247,147,26,0.6)] animate-pulse">
              <span className="text-white font-black text-xs md:text-sm">₿</span>
            </div>
          </div>
          <span
            className="font-['Orbitron'] text-lg md:text-xl font-black tracking-wider bg-gradient-to-r from-[#22c55e] via-[#fbbf24] to-[#ef4444] bg-clip-text text-transparent bg-[length:200%_auto] animate-[shine_4s_linear_infinite]"
          >
            BITBATTLE
          </span>
        </div>
      </div>

      {/* Center - Round Info */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Round Display */}
        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-[#12121a] rounded-xl border border-white/5">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#22c55e] animate-pulse' : 'bg-red-500'}`} />
          <div className="flex flex-col items-center">
            <span className="text-[10px] md:text-xs text-gray-500 tracking-wider">ROUND</span>
            <span className="font-['Orbitron'] text-sm md:text-lg font-black text-[#fbbf24]">#{currentRound}</span>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-wider ${phaseColors[gamePhase]}`}>
            {phaseLabels[gamePhase]}
          </div>
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-['Orbitron'] text-sm md:text-lg font-bold ${
            timeRemaining <= 5 && gamePhase === 'betting'
              ? 'bg-red-500/20 border-2 border-red-500 text-red-500 animate-pulse'
              : 'bg-[#12121a] border-2 border-white/10 text-white'
          }`}>
            {timeRemaining}
          </div>
        </div>
      </div>

      {/* Right - Balance & Settings */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Balance */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-[#12121a] to-[rgba(251,191,36,0.08)] rounded-xl border border-[#fbbf24]/15">
          <span className="text-lg">💰</span>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 tracking-wider">BALANCE</span>
            <span className="font-['Orbitron'] text-sm md:text-base font-bold text-[#fbbf24]">
              ${balance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Settings Button */}
        <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#12121a] border border-white/10 flex items-center justify-center hover:border-[#a855f7] hover:bg-[#1a1a24] transition-all">
          <span className="material-symbols-outlined text-gray-400 hover:text-white text-lg md:text-xl">settings</span>
        </button>
      </div>
    </header>
  );
}
