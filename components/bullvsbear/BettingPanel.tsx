'use client';

import { useState, useCallback } from 'react';
import { GamePhase, BetSide } from './useBullBearGame';

interface BettingPanelProps {
  gamePhase: GamePhase;
  currentBet: BetSide;
  betAmount: number;
  potentialPayout: number;
  balance: number;
  onPlaceBet: (side: BetSide, amount: number) => boolean;
  onCancelBet: () => boolean;
  payoutMultiplier: number;
}

export function BettingPanel({
  gamePhase,
  currentBet,
  betAmount,
  potentialPayout,
  balance,
  onPlaceBet,
  onCancelBet,
  payoutMultiplier,
}: BettingPanelProps) {
  const [inputAmount, setInputAmount] = useState<string>('');
  const presets = [10, 50, 100, 500];

  const handleInputChange = (value: string) => {
    // Remove non-numeric characters except decimal
    const cleaned = value.replace(/[^0-9.]/g, '');
    setInputAmount(cleaned);
  };

  const handlePresetClick = (amount: number) => {
    setInputAmount(String(amount));
  };

  const handleMaxClick = () => {
    setInputAmount(String(balance));
  };

  const handleClearClick = () => {
    setInputAmount('');
  };

  const handleBetClick = useCallback((side: BetSide) => {
    const amount = parseFloat(inputAmount) || 0;
    if (amount <= 0 || amount > balance) return;

    const success = onPlaceBet(side, amount);
    if (success) {
      // Optional: clear input after successful bet
    }
  }, [inputAmount, balance, onPlaceBet]);

  const isBettingDisabled = gamePhase !== 'betting';
  const hasBet = currentBet !== null && betAmount > 0;

  return (
    <div className="bg-[#12121a] rounded-xl border border-white/5 p-3 md:p-4 space-y-3">
      {/* Current Bet Display */}
      {hasBet ? (
        <div className={`rounded-xl p-3 border-2 ${
          currentBet === 'bull'
            ? 'bg-gradient-to-br from-[#22c55e]/10 to-[#22c55e]/5 border-[#22c55e]'
            : 'bg-gradient-to-br from-[#ef4444]/10 to-[#ef4444]/5 border-[#ef4444]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">YOUR BET</span>
            {gamePhase === 'betting' && (
              <button
                onClick={onCancelBet}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-2xl ${currentBet === 'bull' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                {currentBet === 'bull' ? '🐂' : '🐻'}
              </span>
              <span className={`font-['Orbitron'] text-lg font-bold ${currentBet === 'bull' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                {currentBet?.toUpperCase()}
              </span>
            </div>
            <div className="text-right">
              <div className="font-['Orbitron'] text-lg font-bold text-white">
                ${betAmount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">
                Potential: <span className="text-[#22c55e]">${potentialPayout.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Bet Input */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">BET AMOUNT</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="text"
                  value={inputAmount}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="0"
                  disabled={isBettingDisabled}
                  className="w-full h-10 md:h-11 bg-[#0a0a0f] border-2 border-white/10 rounded-lg pl-7 pr-3 font-['Orbitron'] text-lg font-bold text-white placeholder-gray-600 focus:border-[#a855f7] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {/* Mobile Balance */}
              <div className="md:hidden flex flex-col items-center justify-center px-3 bg-[#fbbf24]/15 rounded-lg border border-[#fbbf24]/30 min-w-[70px]">
                <span className="text-[10px] text-[#fbbf24]/80 font-semibold">BALANCE</span>
                <span className="font-['Orbitron'] text-sm font-bold text-[#fbbf24]">
                  ${balance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-6 gap-1.5 md:gap-2">
            {presets.map((amount) => (
              <button
                key={amount}
                onClick={() => handlePresetClick(amount)}
                disabled={isBettingDisabled || amount > balance}
                className="py-2 md:py-2.5 bg-[#1a1a24] border border-white/10 rounded-lg text-xs md:text-sm font-semibold text-white hover:bg-[#252530] hover:border-[#a855f7] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ${amount}
              </button>
            ))}
            <button
              onClick={handleMaxClick}
              disabled={isBettingDisabled}
              className="py-2 md:py-2.5 bg-gradient-to-br from-[#fbbf24]/12 to-[#fbbf24]/5 border border-[#fbbf24] rounded-lg text-xs md:text-sm font-semibold text-[#fbbf24] hover:from-[#fbbf24]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              MAX
            </button>
            <button
              onClick={handleClearClick}
              disabled={isBettingDisabled}
              className="py-2 md:py-2.5 bg-gradient-to-br from-red-500/12 to-red-500/5 border border-red-500 rounded-lg text-xs md:text-sm font-semibold text-red-500 hover:from-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              CLR
            </button>
          </div>
        </>
      )}

      {/* Action Buttons */}
      {!hasBet && (
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {/* Bull Button */}
          <button
            onClick={() => handleBetClick('bull')}
            disabled={isBettingDisabled || !inputAmount || parseFloat(inputAmount) <= 0 || parseFloat(inputAmount) > balance}
            className="relative group py-3 md:py-4 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-xl md:rounded-2xl text-white font-bold overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_8px_25px_rgba(34,197,94,0.35)] active:scale-[0.98]"
          >
            {/* Payout Badge */}
            <span className="absolute top-1 right-1 md:top-2 md:right-2 px-1.5 py-0.5 bg-black/30 rounded text-[10px] font-bold">
              {payoutMultiplier}x
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl md:text-2xl">🐂</span>
              <span className="font-['Orbitron'] text-base md:text-lg">BULL</span>
            </div>
            <span className="text-xs opacity-70 hidden md:block">Price will go UP</span>
          </button>

          {/* Bear Button */}
          <button
            onClick={() => handleBetClick('bear')}
            disabled={isBettingDisabled || !inputAmount || parseFloat(inputAmount) <= 0 || parseFloat(inputAmount) > balance}
            className="relative group py-3 md:py-4 bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-xl md:rounded-2xl text-white font-bold overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_8px_25px_rgba(239,68,68,0.35)] active:scale-[0.98]"
          >
            {/* Payout Badge */}
            <span className="absolute top-1 right-1 md:top-2 md:right-2 px-1.5 py-0.5 bg-black/30 rounded text-[10px] font-bold">
              {payoutMultiplier}x
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl md:text-2xl">🐻</span>
              <span className="font-['Orbitron'] text-base md:text-lg">BEAR</span>
            </div>
            <span className="text-xs opacity-70 hidden md:block">Price will go DOWN</span>
          </button>
        </div>
      )}

      {/* Session Stats */}
      <div className="hidden md:grid grid-cols-4 gap-2 pt-2 border-t border-white/5">
        <div className="text-center">
          <div className="text-[10px] text-gray-500">BULL WINS</div>
          <div className="font-['Orbitron'] text-sm font-bold text-[#22c55e]">0</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-500">BEAR WINS</div>
          <div className="font-['Orbitron'] text-sm font-bold text-[#ef4444]">0</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-500">TODAY P&L</div>
          <div className="font-['Orbitron'] text-sm font-bold text-white">$0.00</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-500">ROUNDS</div>
          <div className="font-['Orbitron'] text-sm font-bold text-white">0</div>
        </div>
      </div>
    </div>
  );
}
