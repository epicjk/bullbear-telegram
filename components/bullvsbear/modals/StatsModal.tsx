'use client';

import { Modal } from '../ui/Modal';
import { BetRecord } from '../useBullBearGame';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bullWins: number;
  bearWins: number;
  todayPnl: number;
  winStreak: number;
  betHistory: BetRecord[];
  lang: 'ko' | 'en';
}

export function StatsModal({
  isOpen,
  onClose,
  bullWins,
  bearWins,
  todayPnl,
  winStreak,
  betHistory,
  lang,
}: StatsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === 'ko' ? '내 통계' : 'My Stats'}
      icon="📈"
    >
      <StatsContent
        bullWins={bullWins}
        bearWins={bearWins}
        todayPnl={todayPnl}
        winStreak={winStreak}
        betHistory={betHistory}
        lang={lang}
      />
    </Modal>
  );
}

interface StatsContentProps {
  bullWins: number;
  bearWins: number;
  todayPnl: number;
  winStreak: number;
  betHistory: BetRecord[];
  lang: 'ko' | 'en';
}

function StatsContent({ bullWins, bearWins, todayPnl, winStreak, betHistory, lang }: StatsContentProps) {
  const wins = betHistory.filter(b => b.result === 'win').length;
  const winRate = betHistory.length > 0 ? (wins / betHistory.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Profile */}
      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#22c55e] flex items-center justify-center text-3xl">
          🎮
        </div>
        <div className="flex-1">
          <div className="font-['Orbitron'] font-bold text-white">Player</div>
          <div className="text-xs text-gray-500">0x...guest</div>
        </div>
        <div className="px-3 py-1 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] rounded-full text-xs font-bold text-black">
          LV.{Math.floor(betHistory.length / 10) + 1}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="font-['Orbitron'] font-bold text-2xl text-[#22c55e]">{bullWins}</div>
          <div className="text-xs text-gray-500">{lang === 'ko' ? 'BULL 승리' : 'BULL Wins'}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="font-['Orbitron'] font-bold text-2xl text-[#ef4444]">{bearWins}</div>
          <div className="text-xs text-gray-500">{lang === 'ko' ? 'BEAR 승리' : 'BEAR Wins'}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className={`font-['Orbitron'] font-bold text-2xl ${todayPnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
            {todayPnl >= 0 ? '+' : ''}${todayPnl.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500">{lang === 'ko' ? '오늘 손익' : 'Today P&L'}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="font-['Orbitron'] font-bold text-2xl text-[#fbbf24]">{winStreak}</div>
          <div className="text-xs text-gray-500">{lang === 'ko' ? '연승' : 'Win Streak'}</div>
        </div>
      </div>

      {/* Win Rate Bar */}
      <div className="bg-white/5 rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">{lang === 'ko' ? '승률' : 'Win Rate'}</span>
          <span className="font-['Orbitron'] text-[#fbbf24]">{winRate.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-[#ef4444] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#22c55e] to-[#4ade80] transition-all duration-500"
            style={{ width: `${winRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22c55e]" /> {wins}W</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]" /> {betHistory.length - wins}L</span>
        </div>
      </div>
    </div>
  );
}
