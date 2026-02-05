'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { translations, Language } from '@/lib/translations';

// ============================================================
// Types
// ============================================================
export type BotStyle = 'based-ape' | 'liquidator' | 'full-degen';
export type BotBias = 'long' | 'short' | 'neutral';
export type BotPrediction = 'bull' | 'bear' | null;

export interface AIBot {
  id: string;
  name: string;
  emoji: string;
  style: BotStyle;
  bias: BotBias;
  description: { ko: string; en: string };
}

export interface BotState {
  id: string;
  prediction: BotPrediction;
  winStreak: number;
  loseStreak: number;
  totalWins: number;
  totalLosses: number;
}

export interface UserBotBet {
  botId: string;
  amount: number;
}

// 팔로우 상태
export interface FollowState {
  botId: string;
  betPerRound: number;
}

// ============================================================
// Constants
// ============================================================
// 모든 봇 동일 배당률: 1.95배 (5% 수수료)
// 직접 베팅과 동일하게 통일
export const BOT_PAYOUT_MULTIPLIER = 1.95;
export const BOT_FEE_PERCENT = 5; // 5% 고정 수수료

// 봇 승률 계산 함수 (실시간 업데이트용)
export function calculateBotWinRate(state: BotState): number {
  const totalGames = state.totalWins + state.totalLosses;
  if (totalGames === 0) return 50; // 게임 기록 없으면 기본 50%
  return (state.totalWins / totalGames) * 100;
}

// 봇 상태로부터 배수 반환 (고정 1.95배)
export function getActualMultiplier(_state: BotState): number {
  // 모든 봇 동일 배당률 - 승률과 무관하게 1.95배 고정
  return BOT_PAYOUT_MULTIPLIER;
}

export const AI_BOTS: AIBot[] = [
  {
    id: 'based-ape',
    name: 'BASED APE',
    emoji: '🦍',
    style: 'based-ape',
    bias: 'long',
    description: {
      ko: 'APE IN OR STAY POOR',
      en: 'APE IN OR STAY POOR'
    }
  },
  {
    id: 'liquidator',
    name: 'LIQUIDATOR',
    emoji: '☠️',
    style: 'liquidator',
    bias: 'short',
    description: {
      ko: 'YOUR LONGS ARE MY GAINS',
      en: 'YOUR LONGS ARE MY GAINS'
    }
  },
  {
    id: 'full-degen',
    name: 'FULL DEGEN',
    emoji: '🎲',
    style: 'full-degen',
    bias: 'neutral',
    description: {
      ko: 'SIR, THIS IS A CASINO',
      en: 'SIR, THIS IS A CASINO'
    }
  },
];

// ============================================================
// Bot Prediction Logic
// ============================================================
export function generateBotPrediction(
  bot: AIBot,
  recentResults: ('bull' | 'bear' | 'tie')[],
  priceChange: number
): BotPrediction {
  const lastThree = recentResults.slice(-3);
  const consecutiveBulls = lastThree.filter(r => r === 'bull').length;
  
  switch (bot.style) {
    case 'based-ape':
      // 🦍 BASED APE: 강한 상승 편향 (70% Bull), 연속 상승에 더 세게
      let bullChance = 0.7;
      if (consecutiveBulls >= 2) {
        bullChance = 0.85; // 연속 상승이면 더 세게 불
      }
      return Math.random() < bullChance ? 'bull' : 'bear';
      
    case 'liquidator':
      // ☠️ LIQUIDATOR: 하락 편향 (65% Bear), 급등 후 숏
      let bearChance = 0.65;
      // 가격이 급등했으면 (과열) 더 강하게 베어
      if (priceChange > 0.5 || consecutiveBulls >= 2) {
        bearChance = 0.80;
      }
      return Math.random() < bearChance ? 'bear' : 'bull';
      
    case 'full-degen':
      // 🎲 FULL DEGEN: 완전 랜덤 50/50
      return Math.random() < 0.5 ? 'bull' : 'bear';
      
    default:
      return Math.random() < 0.5 ? 'bull' : 'bear';
  }
}

// ============================================================
// AI Battle Mode Component Props
// ============================================================
interface AIBattleModeProps {
  balance: number;
  gamePhase: string;
  timeRemaining: number;
  currentRound: number;
  recentResults: ('bull' | 'bear' | 'tie')[];
  priceChange: number;
  lastRoundResult: 'bull' | 'bear' | 'tie' | null;
  isDarkMode: boolean;
  isMobile: boolean;
  // 팔로우 관련
  followState: FollowState | null;
  onStartFollow: (botId: string, betPerRound: number) => void;
  onStopFollow: () => void;
  // 기존 봇 상태 (외부에서 관리)
  botStates: Map<string, BotState>;
  playSound: (sound: any) => void;
}

// ============================================================
// AI Battle Mode Component
// ============================================================
export function AIBattleMode({
  balance,
  gamePhase,
  timeRemaining,
  currentRound,
  recentResults,
  priceChange,
  lastRoundResult,
  isDarkMode,
  isMobile,
  followState,
  onStartFollow,
  onStopFollow,
  botStates,
  playSound,
}: AIBattleModeProps) {
  const { lang } = useLanguage();
  const t = translations.aiBattle || {};
  
  // 팔로우 모달 상태
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [selectedBotForFollow, setSelectedBotForFollow] = useState<string | null>(null);
  const [followBetAmount, setFollowBetAmount] = useState<string>('$10');
  
  // 이긴 봇들 ID 저장 (결과 표시용)
  const [winningBotIds, setWinningBotIds] = useState<Set<string>>(new Set());
  
  // Process round results - 이긴 봇 하이라이트
  useEffect(() => {
    if (lastRoundResult && gamePhase === 'betting') {
      const winners = new Set<string>();
      
      botStates.forEach((state, botId) => {
        if (state.prediction === lastRoundResult) {
          winners.add(botId);
        }
      });
      
      if (winners.size > 0) {
        setWinningBotIds(winners);
        // 8초 후 효과 제거
        setTimeout(() => {
          setWinningBotIds(new Set());
        }, 8000);
      }
    }
  }, [lastRoundResult, gamePhase, botStates]);
  
  // Parse bet value
  const parseBetValue = (value: string): number => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };
  
  // Handle follow button click
  const handleFollowClick = (botId: string) => {
    setSelectedBotForFollow(botId);
    setFollowBetAmount('$10');
    setShowFollowModal(true);
  };
  
  // Handle start following
  const handleStartFollow = () => {
    if (!selectedBotForFollow) return;
    const amount = parseBetValue(followBetAmount);
    if (amount <= 0 || amount > balance) return;
    
    onStartFollow(selectedBotForFollow, amount);
    setShowFollowModal(false);
    setSelectedBotForFollow(null);
    setFollowBetAmount('$10');
  };
  
  // Quick bet amounts
  const handleQuickBet = (amount: number) => {
    if (amount === -1) {
      // MAX
      setFollowBetAmount(`$${Math.min(balance, 10000)}`);
    } else {
      setFollowBetAmount(`$${Math.min(amount, balance, 10000)}`);
    }
  };
  
  // Theme colors
  const bgColor = isDarkMode ? '#0a0a0f' : '#f8f9fa';
  const cardColor = isDarkMode ? '#13131a' : '#ffffff';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const mutedColor = isDarkMode ? 'text-white/50' : 'text-gray-500';
  const cardBorder = isDarkMode ? 'border-white/10' : 'border-gray-200';
  
  // Get bot by ID
  const getBot = (id: string): AIBot | undefined => AI_BOTS.find(b => b.id === id);
  const selectedBot = selectedBotForFollow ? getBot(selectedBotForFollow) : null;
  const selectedBotState = selectedBotForFollow ? botStates.get(selectedBotForFollow) : null;
  const followingBot = followState ? getBot(followState.botId) : null;
  const followingBotState = followState ? botStates.get(followState.botId) : null;
  
  return (
    <div className="flex flex-col gap-1 h-full">
      {/* Header */}
      <div className={`flex items-center justify-between px-2 py-1.5 rounded-lg border ${cardBorder}`} style={{ backgroundColor: cardColor }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <span className={`font-['Orbitron'] font-bold ${isMobile ? 'text-sm' : 'text-lg'} ${textColor}`}>
            {lang === 'ko' ? 'AI 배틀' : 'AI BATTLE'}
          </span>
        </div>
        <div className={`font-['Orbitron'] text-xs ${mutedColor}`}>
          {lang === 'ko' ? '봇을 팔로우하세요!' : 'Follow a bot!'}
        </div>
      </div>
      
      {/* 팔로우 상태 표시 (팔로우 중일 때) */}
      {followState && followingBot && followingBotState && (
        <div
          className={`relative rounded-lg overflow-hidden border-2 ${
            followingBotState.prediction === 'bull' ? 'border-[#22c55e]' : 'border-[#ef4444]'
          }`}
          style={{
            padding: isMobile ? '4px 8px' : '8px 12px',
            background: `linear-gradient(135deg, ${
              followingBotState.prediction === 'bull' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'
            }, ${cardColor})`,
          }}
        >
          <div className="flex items-center justify-between overflow-hidden">
            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
              <span className={`${isMobile ? 'text-xl' : 'text-2xl'} flex-shrink-0`}>{followingBot.emoji}</span>
              <div className="min-w-0 overflow-hidden">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`font-['Orbitron'] font-bold ${isMobile ? 'text-xs' : 'text-sm'} ${textColor} truncate`}>
                    {followingBot.name}
                  </span>
                  <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    followingBotState.prediction === 'bull' 
                      ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/50' 
                      : 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/50'
                  }`}>
                    {followingBotState.prediction === 'bull' ? '🐂' : '🐻'}
                  </span>
                </div>
                <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} ${mutedColor} mt-0.5 truncate`}>
                  {lang === 'ko' ? '팔로우 중' : 'Following'} · ${followState.betPerRound}/{lang === 'ko' ? '라운드' : 'round'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* 예상 수익 */}
              <div className="text-right">
                <div className={`${isMobile ? 'text-[8px]' : 'text-[10px]'} ${mutedColor}`}>{lang === 'ko' ? '수익' : 'Win'}</div>
                <div className={`font-['Orbitron'] font-bold ${isMobile ? 'text-xs' : 'text-sm'} text-[#fbbf24]`}>
                  ${(followState.betPerRound * BOT_PAYOUT_MULTIPLIER).toFixed(2)}
                </div>
              </div>
              {/* STOP 버튼 */}
              <button
                onClick={onStopFollow}
                className={`${isMobile ? 'px-2.5 py-1.5' : 'px-3 py-2'} rounded-lg bg-[#ef4444] text-white font-['Orbitron'] font-bold ${isMobile ? 'text-[10px]' : 'text-xs'} hover:bg-[#dc2626] transition-colors active:scale-95`}
              >
                STOP
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Bot Cards Grid - 반응형: 모바일 가로3개, 데스크톱 세로1열 */}
      <div className={`grid grid-cols-3 md:grid-cols-1 md:w-full ${isMobile ? 'gap-0.5' : 'gap-1.5 md:gap-2'}`}>
        {AI_BOTS.map(bot => {
          const state = botStates.get(bot.id);
          if (!state) return null;
          
          const isFollowing = followState?.botId === bot.id;
          const totalGames = state.totalWins + state.totalLosses;
          // 실시간 승률 계산
          const winRate = totalGames > 0
            ? Math.round((state.totalWins / totalGames) * 100)
            : 50;
          
          // 이긴 봇인지 확인
          const isWinner = winningBotIds.has(bot.id);
          
          return (
            <div
              key={bot.id}
              className={`relative rounded-lg md:rounded-xl border transition-all overflow-hidden ${
                isWinner
                  ? 'border-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                  : isFollowing
                    ? 'border-[#fbbf24] bg-[#fbbf24]/10'
                    : state.prediction === 'bull'
                      ? 'border-[#22c55e]/30'
                      : state.prediction === 'bear'
                        ? 'border-[#ef4444]/30'
                        : cardBorder
              }`}
              style={{
                padding: isMobile ? '4px' : '8px',
                backgroundColor: isWinner ? 'rgba(34, 197, 94, 0.1)' : (isFollowing ? `${cardColor}` : cardColor),
              }}
            >
              {/* Prediction Badge */}
              {state.prediction && (
                <div className={`absolute ${isMobile ? 'top-0.5 right-0.5' : 'top-1 right-1'} px-1 py-0.5 rounded ${isMobile ? 'text-[8px]' : 'text-[10px]'} font-bold ${
                  state.prediction === 'bull'
                    ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                    : 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30'
                }`}>
                  {state.prediction === 'bull' ? '🐂' : '🐻'}
                </div>
              )}
              
              {/* Bot Info */}
              <div className="flex items-center gap-1.5 md:gap-3 mb-1 md:mb-2 overflow-hidden">
                <span className={`${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'} flex-shrink-0`}>{bot.emoji}</span>
                <div className="text-left flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-1">
                    <span className={`font-['Orbitron'] font-bold ${isMobile ? 'text-[10px]' : 'text-xs md:text-lg'} ${textColor} truncate block`}>
                      {bot.name}
                    </span>
                  </div>
                  <div className={`${isMobile ? 'text-[8px]' : 'text-[10px] md:text-sm'} ${mutedColor} truncate block`}>
                    {bot.description[lang]}
                  </div>
                </div>
              </div>
              
              {/* Stats - 실시간 승률 표시 */}
              <div className={`flex items-center justify-between ${isMobile ? 'text-[8px]' : 'text-[10px] md:text-base'} mb-0.5 md:mb-1 overflow-hidden`}>
                <div className="flex items-center gap-0.5 md:gap-1 min-w-0 flex-shrink overflow-hidden">
                  <span className={`${mutedColor} truncate`}>
                    {lang === 'ko' ? '승률' : 'Win'}: <span className={winRate >= 50 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>{winRate}%</span>
                  </span>
                  {/* 전적 표시 */}
                  {totalGames > 0 && (
                    <span className={`${mutedColor} truncate ml-1`}>
                      ({state.totalWins}W/{state.totalLosses}L)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {state.winStreak > 0 && (
                    <span className={`text-[#22c55e] ${isMobile ? 'text-[10px]' : 'text-xs md:text-sm'}`}>🔥{state.winStreak}</span>
                  )}
                  {state.loseStreak > 2 && (
                    <span className={`text-[#ef4444] ${isMobile ? 'text-[10px]' : 'text-xs md:text-sm'}`}>💀{state.loseStreak}</span>
                  )}
                </div>
              </div>
              
              {/* 배당률 (고정 1.95배) */}
              <div className={`flex items-center justify-between py-0.5 md:py-1 px-1 md:px-2 rounded ${isMobile ? 'mb-0.5' : 'mb-1 md:mb-2'} overflow-hidden`} style={{ backgroundColor: bgColor }}>
                <span className={`${isMobile ? 'text-[8px]' : 'text-[10px] md:text-xs'} ${mutedColor} truncate`}>
                  {lang === 'ko' ? '배당' : 'Payout'}
                </span>
                <span className={`font-['Orbitron'] font-bold ${isMobile ? 'text-xs' : 'text-sm md:text-lg'} text-[#fbbf24] flex-shrink-0`}>
                  x{BOT_PAYOUT_MULTIPLIER}
                </span>
              </div>
              
              {/* Follow Button */}
              <button
                onClick={() => handleFollowClick(bot.id)}
                disabled={isFollowing || !state.prediction}
                className={`w-full ${isMobile ? 'py-1' : 'py-1.5 md:py-2'} rounded-lg font-['Orbitron'] font-bold ${isMobile ? 'text-[10px]' : 'text-xs md:text-base'} transition-all active:scale-[0.98] overflow-hidden truncate ${
                  isFollowing
                    ? 'bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/50 cursor-default'
                    : !state.prediction
                      ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white hover:shadow-lg'
                }`}
              >
                {isFollowing ? (lang === 'ko' ? '팔로우 중' : 'Following') : (lang === 'ko' ? '팔로우' : 'Follow')}
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Follow Modal */}
      {showFollowModal && selectedBot && selectedBotState && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[800]"
            onClick={() => setShowFollowModal(false)}
          />
          
          {/* Modal */}
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[801] w-[90%] max-w-[360px] rounded-xl border border-white/10"
            style={{ backgroundColor: cardColor }}
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{selectedBot.emoji}</span>
                  <div>
                    <div className={`font-['Orbitron'] font-bold text-lg ${textColor}`}>
                      {selectedBot.name}
                    </div>
                    <div className={`text-xs ${selectedBotState.prediction === 'bull' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                      {selectedBotState.prediction === 'bull' ? '🐂 BULL 예측' : '🐻 BEAR 예측'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowFollowModal(false)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${mutedColor} hover:text-white transition-colors`}
                >
                  ✕
                </button>
              </div>
              
              {/* Info Box */}
              <div className={`py-3 px-4 rounded-lg mb-4 border ${cardBorder}`} style={{ backgroundColor: bgColor }}>
                <div className="flex items-center justify-between mb-2">
                  <span className={mutedColor}>{lang === 'ko' ? '배당률' : 'Payout'}</span>
                  <span className="font-['Orbitron'] font-bold text-xl text-[#fbbf24]">
                    x{BOT_PAYOUT_MULTIPLIER}
                  </span>
                </div>
                <div className={`text-xs ${mutedColor}`}>
                  {lang === 'ko' 
                    ? '이 봇의 예측을 따라 매 라운드 자동으로 베팅됩니다.' 
                    : 'Auto-bet each round following this bot\'s prediction.'}
                </div>
              </div>
              
              {/* Bet Input */}
              <div className="mb-4">
                <label className={`block text-xs ${mutedColor} mb-2`}>
                  {lang === 'ko' ? '라운드당 베팅 금액' : 'Bet Amount per Round'}
                </label>
                <input
                  type="text"
                  value={followBetAmount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setFollowBetAmount(val ? `$${val}` : '$0');
                  }}
                  className={`w-full px-4 py-3 rounded-lg text-center font-['Orbitron'] font-bold text-2xl ${textColor} border ${cardBorder} focus:border-[#fbbf24] outline-none transition-colors`}
                  style={{ backgroundColor: bgColor }}
                />
              </div>
              
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-6 gap-1 mb-4">
                {[5, 10, 25, 50].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleQuickBet(val)}
                    className={`py-2 rounded-lg font-['Orbitron'] text-xs font-semibold transition-all active:scale-95 border ${cardBorder} hover:border-[#fbbf24]/50`}
                    style={{ backgroundColor: bgColor, color: isDarkMode ? '#fbbf24' : '#d97706' }}
                  >
                    ${val}
                  </button>
                ))}
                <button
                  onClick={() => handleQuickBet(100)}
                  className={`py-2 rounded-lg font-['Orbitron'] text-xs font-semibold transition-all active:scale-95 border ${cardBorder} hover:border-[#fbbf24]/50`}
                  style={{ backgroundColor: bgColor, color: isDarkMode ? '#fbbf24' : '#d97706' }}
                >
                  $100
                </button>
                <button
                  onClick={() => handleQuickBet(-1)}
                  className={`py-2 rounded-lg font-['Orbitron'] text-xs font-semibold transition-all active:scale-95 border ${cardBorder} hover:border-[#fbbf24]/50`}
                  style={{ backgroundColor: bgColor, color: isDarkMode ? '#fbbf24' : '#d97706' }}
                >
                  MAX
                </button>
              </div>
              
              {/* Potential Win */}
              <div className={`flex items-center justify-between py-2 px-3 rounded-lg mb-4 border ${cardBorder}`}>
                <span className={mutedColor}>{lang === 'ko' ? '예상 수익' : 'Potential Win'}</span>
                <span className="font-['Orbitron'] font-bold text-lg text-[#22c55e]">
                  ${(parseBetValue(followBetAmount) * BOT_PAYOUT_MULTIPLIER).toFixed(2)}
                </span>
              </div>
              
              {/* Confirm Button */}
              <button
                onClick={handleStartFollow}
                disabled={parseBetValue(followBetAmount) <= 0 || parseBetValue(followBetAmount) > balance}
                className="w-full py-4 rounded-xl font-['Orbitron'] font-bold text-lg text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#a855f7] to-[#ec4899] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
              >
                {lang === 'ko' ? '팔로우 시작' : 'Start Following'}
              </button>
              
              {/* Warning */}
              <div className={`text-[10px] ${mutedColor} text-center mt-3`}>
                {lang === 'ko' 
                  ? '⚠️ 잔액 부족 시 자동으로 팔로우가 중단됩니다.' 
                  : '⚠️ Auto-follow stops when balance is insufficient.'}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
