'use client';

import { RoundResult, BetSide } from './useBullBearGame';

interface VictoryOverlayProps {
  visible: boolean;
  result: RoundResult;
  userBet: BetSide;
  betAmount: number;
  payout: number;
  startPrice: number;
  endPrice: number;
  priceChange: number;
  priceChangePercent: number;
  onClose?: () => void;
}

export function VictoryOverlay({
  visible,
  result,
  userBet,
  betAmount,
  payout,
  startPrice,
  endPrice,
  priceChange,
  priceChangePercent,
  onClose,
}: VictoryOverlayProps) {
  if (!visible) return null;

  const userWon = userBet === result;
  const hasBet = userBet !== null && betAmount > 0;
  const profit = userWon ? payout - betAmount : -betAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
      <div className="relative w-[90%] max-w-md mx-auto">
        {/* Result Card */}
        <div className={`relative rounded-3xl p-6 md:p-8 border-2 ${
          result === 'bull'
            ? 'bg-gradient-to-br from-[#ef4444]/20 to-[#ef4444]/5 border-[#ef4444]'
            : result === 'bear'
            ? 'bg-gradient-to-br from-[#22c55e]/20 to-[#22c55e]/5 border-[#22c55e]'
            : 'bg-gradient-to-br from-[#fbbf24]/20 to-[#fbbf24]/5 border-[#fbbf24]'
        } shadow-2xl`}>
          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <span className="text-white/60 text-xl">×</span>
            </button>
          )}

          {/* Winner Icon */}
          <div className="flex justify-center mb-4">
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center ${
              result === 'bull'
                ? 'bg-[#ef4444]/20 shadow-[0_0_40px_rgba(239,68,68,0.5)]'
                : result === 'bear'
                ? 'bg-[#22c55e]/20 shadow-[0_0_40px_rgba(34,197,94,0.5)]'
                : 'bg-[#fbbf24]/20 shadow-[0_0_40px_rgba(251,191,36,0.5)]'
            } animate-[bounceIn_0.5s_ease-out]`}>
              <span className="text-5xl md:text-6xl">
                {result === 'bull' ? '🐂' : result === 'bear' ? '🐻' : '🤝'}
              </span>
            </div>
          </div>

          {/* Result Text */}
          <h2 className={`text-center font-['Orbitron'] text-2xl md:text-3xl font-black mb-2 ${
            result === 'bull' ? 'text-[#ef4444]' : result === 'bear' ? 'text-[#22c55e]' : 'text-[#fbbf24]'
          }`}>
            {result === 'bull' ? 'BULL WINS!' : result === 'bear' ? 'BEAR WINS!' : 'TIE!'}
          </h2>

          {/* Price Change */}
          <div className="text-center mb-6">
            <div className={`text-lg font-bold ${priceChange >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(3)}%)
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ${startPrice.toFixed(2)} → ${endPrice.toFixed(2)}
            </div>
          </div>

          {/* User Result */}
          {hasBet && (
            <div className={`rounded-xl p-4 mb-4 ${
              userWon
                ? 'bg-[#22c55e]/10 border border-[#22c55e]/30'
                : 'bg-[#ef4444]/10 border border-[#ef4444]/30'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400">YOUR BET</span>
                <span className={`text-xs font-bold ${userWon ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {userWon ? 'WIN!' : 'LOSE'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{userBet === 'bull' ? '🐂' : '🐻'}</span>
                  <span className="font-['Orbitron'] font-bold text-white">{userBet?.toUpperCase()}</span>
                </div>
                <div className="text-right">
                  <div className={`font-['Orbitron'] font-bold ${userWon ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                    {userWon ? '+' : ''}{profit.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {userWon ? `Payout: $${payout.toFixed(2)}` : `Bet: $${betAmount.toFixed(2)}`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Round Timer */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">NEXT ROUND STARTING</p>
            <div className="flex justify-center gap-1">
              {[...Array(3)].map((_, i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
