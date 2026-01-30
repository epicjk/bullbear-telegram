'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';

type LeaderboardTab = 'profit' | 'winrate' | 'games';

interface LeaderboardItem {
  rank: number;
  name: string;
  avatar: string;
  profit: number;
  winrate: number;
  games: number;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ko' | 'en';
  isDarkMode: boolean;
}

// 샘플 리더보드 데이터
const sampleLeaderboard: LeaderboardItem[] = [
  { rank: 1, name: 'CryptoKing', avatar: '👑', profit: 12580, winrate: 78, games: 342 },
  { rank: 2, name: 'BullMaster', avatar: '🐂', profit: 9840, winrate: 72, games: 289 },
  { rank: 3, name: 'DiamondHands', avatar: '💎', profit: 8320, winrate: 68, games: 456 },
  { rank: 4, name: 'MoonShot', avatar: '🚀', profit: 7150, winrate: 65, games: 521 },
  { rank: 5, name: 'WhaleTrade', avatar: '🐋', profit: 6890, winrate: 64, games: 198 },
  { rank: 6, name: 'BitHunter', avatar: '🎯', profit: 5420, winrate: 61, games: 387 },
  { rank: 7, name: 'GreenCandle', avatar: '🕯️', profit: 4980, winrate: 59, games: 445 },
  { rank: 8, name: 'SatoshiFan', avatar: '₿', profit: 4210, winrate: 57, games: 312 },
  { rank: 9, name: 'TradePro', avatar: '📈', profit: 3650, winrate: 55, games: 567 },
  { rank: 10, name: 'LuckyBear', avatar: '🐻', profit: 2980, winrate: 53, games: 234 },
];

const translations = {
  ko: {
    title: '리더보드',
    profit: '수익',
    winrate: '승률',
    games: '게임수',
  },
  en: {
    title: 'Leaderboard',
    profit: 'Profit',
    winrate: 'Win Rate',
    games: 'Games',
  },
};

export function LeaderboardModal({ isOpen, onClose, lang, isDarkMode }: LeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('profit');
  const t = translations[lang];

  // 탭에 따라 정렬
  const sortedData = [...sampleLeaderboard].sort((a, b) => {
    if (activeTab === 'profit') return b.profit - a.profit;
    if (activeTab === 'winrate') return b.winrate - a.winrate;
    return b.games - a.games;
  });

  const getValue = (item: LeaderboardItem) => {
    if (activeTab === 'profit') return `+$${item.profit.toLocaleString()}`;
    if (activeTab === 'winrate') return `${item.winrate}%`;
    return item.games.toLocaleString();
  };

  const top3 = sortedData.slice(0, 3);
  const rest = sortedData.slice(3);

  const cardBg = isDarkMode ? 'rgba(18, 18, 26, 0.98)' : 'rgba(255, 255, 255, 0.98)';
  const textColor = isDarkMode ? 'text-white' : 'text-[#1a1a2e]';
  const mutedColor = isDarkMode ? 'text-gray-500' : 'text-gray-400';
  const borderColor = isDarkMode ? 'border-white/10' : 'border-black/10';
  const hoverBg = isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`🏆 ${t.title}`} icon="">
      {/* Tabs */}
      <div className={`flex border-b ${borderColor} -mx-6 px-5`}>
        {(['profit', 'winrate', 'games'] as LeaderboardTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3.5 text-center font-['Rajdhani'] text-sm font-semibold transition-all border-b-2 ${
              activeTab === tab
                ? 'text-[#fbbf24] border-[#fbbf24]'
                : `${mutedColor} border-transparent ${hoverBg}`
            }`}
          >
            {t[tab]}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="pt-4 max-h-[60vh] overflow-y-auto">
        {/* TOP 3 */}
        <div className="flex justify-center items-end gap-4 py-5 mb-4">
          {/* 2nd Place */}
          <div className="text-center w-[90px] order-1">
            <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-xl relative"
                 style={{ background: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)' }}>
              {top3[1]?.avatar}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#12121a] border-2 border-[#C0C0C0] flex items-center justify-center">
                <span className="font-['Orbitron'] text-[0.6rem] font-bold text-[#C0C0C0]">2</span>
              </div>
            </div>
            <div className={`text-xs font-semibold ${textColor} mb-0.5`}>{top3[1]?.name}</div>
            <div className="font-['Orbitron'] text-[0.7rem] font-bold text-[#22c55e]">{top3[1] && getValue(top3[1])}</div>
          </div>

          {/* 1st Place */}
          <div className="text-center w-[90px] order-2">
            <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl relative"
                 style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)' }}>
              {top3[0]?.avatar}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#12121a] border-2 border-[#FFD700] flex items-center justify-center">
                <span className="font-['Orbitron'] text-[0.6rem] font-bold text-[#FFD700]">1</span>
              </div>
            </div>
            <div className={`text-xs font-semibold ${textColor} mb-0.5`}>{top3[0]?.name}</div>
            <div className="font-['Orbitron'] text-[0.7rem] font-bold text-[#22c55e]">{top3[0] && getValue(top3[0])}</div>
          </div>

          {/* 3rd Place */}
          <div className="text-center w-[90px] order-3">
            <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-xl relative"
                 style={{ background: 'linear-gradient(135deg, #CD7F32, #8B4513)' }}>
              {top3[2]?.avatar}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#12121a] border-2 border-[#CD7F32] flex items-center justify-center">
                <span className="font-['Orbitron'] text-[0.6rem] font-bold text-[#CD7F32]">3</span>
              </div>
            </div>
            <div className={`text-xs font-semibold ${textColor} mb-0.5`}>{top3[2]?.name}</div>
            <div className="font-['Orbitron'] text-[0.7rem] font-bold text-[#22c55e]">{top3[2] && getValue(top3[2])}</div>
          </div>
        </div>

        {/* Rest of the list */}
        <div className="flex flex-col gap-2">
          {rest.map((item, idx) => (
            <div
              key={item.rank}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${hoverBg}`}
              style={{ background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
            >
              <div className={`w-7 font-['Orbitron'] text-sm font-bold ${mutedColor} text-center`}>
                {idx + 4}
              </div>
              <div className="flex-1 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                     style={{ background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}>
                  {item.avatar}
                </div>
                <div className={`text-sm font-semibold ${textColor}`}>{item.name}</div>
              </div>
              <div className="font-['Orbitron'] text-sm font-bold text-[#22c55e]">{getValue(item)}</div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
