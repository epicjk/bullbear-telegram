'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useBullBearGame, GamePhase, BetSide, RoundHistory, BetRecord, RoadmapCell, RoadmapData, RoundResult } from './useBullBearGame';

// 리팩토링된 모듈 import
import { sounds, initAudio, startGameMusic, stopGameMusic } from './hooks/useSound';
import { COLORS, GAME_CONFIG, getThemeColors } from './constants/theme';
import { hapticImpact, hapticNotification, hapticSelection } from '@/lib/telegram';
import { useLanguage, LanguageToggle } from '@/lib/i18n';
import { translations, Language } from '@/lib/translations';
import { SettingsModal, HistoryModal, StatsModal, HowToPlayModal, WalletModal, RoundDetailModal } from './modals';
import { formatPrice, formatPriceChange, formatPercent, formatBalance } from './utils/formatters';
import { useLegal } from '@/contexts/LegalContext';
import { BettingDisclaimerModal } from '@/components/legal';
import { EffectSettings, DEFAULT_EFFECT_SETTINGS } from './effects/types';
import { GlowPulse, WaveSweep, RadialShockwave, Confetti, CountUp, Heartbeat } from './effects';
import { AIBattleMode, UserBotBet, FollowState, BotState, AI_BOTS, generateBotPrediction, BOT_PAYOUT_MULTIPLIER, getActualMultiplier } from './AIBattle';

// Game Mode Type
type GameMode = 'direct' | 'aiBattle';

interface BullBearGameProps {
  balance: number;
  onBalanceChange?: (newBalance: number) => void;
}

// Toast Types
type ToastType = 'win' | 'lose' | 'tie' | 'bull' | 'bear' | 'info' | 'warning';
interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  amount?: number;
}

// ============================================================
// Main BullBearGame Component
// ============================================================
export function BullBearGame({ balance: initialBalance, onBalanceChange }: BullBearGameProps) {
  const router = useRouter();
  const [balance, setBalance] = useState(initialBalance);
  const [showResult, setShowResult] = useState(false);
  const [betInput, setBetInput] = useState('$0');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Language from global context
  const { lang, setLang, toggleLang } = useLanguage();
  
  // Game Mode State
  const [gameMode, setGameMode] = useState<GameMode>('direct');
  const [userBotBet, setUserBotBet] = useState<UserBotBet | null>(null);
  const [lastRoundResult, setLastRoundResult] = useState<'bull' | 'bear' | 'tie' | null>(null);
  
  // AI Battle - Follow State
  const [followState, setFollowState] = useState<FollowState | null>(null);
  const [followBetPlaced, setFollowBetPlaced] = useState(false); // 현재 라운드에 팔로우 베팅이 완료되었는지
  const followBetRef = useRef<{ round: number; amount: number; prediction: 'bull' | 'bear' } | null>(null);
  
  // Bot States (managed in BullBearGame for result processing)
  const [botStates, setBotStates] = useState<Map<string, BotState>>(() => {
    const initial = new Map<string, BotState>();
    AI_BOTS.forEach(bot => {
      initial.set(bot.id, {
        id: bot.id,
        prediction: null,
        winStreak: 0,
        loseStreak: 0,
        totalWins: Math.floor(Math.random() * 50) + 10,
        totalLosses: Math.floor(Math.random() * 50) + 10,
      });
    });
    return initial;
  });
  
  // Settings State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.7);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [betAlertEnabled, setBetAlertEnabled] = useState(true);
  const [effectSettings, setEffectSettings] = useState<EffectSettings>(DEFAULT_EFFECT_SETTINGS);

  // Effect trigger states
  const [winTrigger, setWinTrigger] = useState(false);
  const [isCurrentlyWinning, setIsCurrentlyWinning] = useState(false);
  const [newHistoryRound, setNewHistoryRound] = useState<number | null>(null); // 새로 추가된 히스토리 라운드
  const prevHistoryLengthRef = useRef(0);

  // Modal State
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);
  const [roundDetailOpen, setRoundDetailOpen] = useState(false);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Legal / Disclaimer State
  const { hasAgreedToBettingDisclaimer } = useLegal();
  const [showBettingDisclaimer, setShowBettingDisclaimer] = useState(false);
  const [pendingBet, setPendingBet] = useState<{ side: BetSide; amount?: number } | null>(null);

  // Victory Overlay State - HTML과 동일한 승리 연출
  const [victoryVisible, setVictoryVisible] = useState(false);
  const [victoryShrinking, setVictoryShrinking] = useState(false);
  const [victoryWinAmount, setVictoryWinAmount] = useState(0);
  const [victoryResult, setVictoryResult] = useState<'bull' | 'bear' | 'tie'>('bull');
  const [victoryClosePrice, setVictoryClosePrice] = useState(0); // 라운드 종가 저장
  const [victoryRound, setVictoryRound] = useState(0); // 라운드 번호 저장
  const victoryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const coinSoundIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // 승리 시 잔액 업데이트를 위한 정보 저장 (오버레이 닫힐 때 사용)
  const pendingWinRef = useRef<{ totalPayout: number; netProfit: number } | null>(null);

  // Base Price Reveal Overlay State - 게임 시작 시 베이스 가격 공개 연출
  const [baseRevealVisible, setBaseRevealVisible] = useState(false);
  const [baseRevealShrinking, setBaseRevealShrinking] = useState(false);
  const baseRevealTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPhaseForRevealRef = useRef<string>('');

  // 이전 베팅 정보 저장 (라운드 전환 시 결과 처리용)
  const prevBetRef = useRef<{ userBet: 'bull' | 'bear' | null; betAmount: number; round: number }>({
    userBet: null,
    betAmount: 0,
    round: 0,
  });
  const lastGamePhaseRef = useRef<string>('betting');

  // localStorage에서 베팅 정보 복원 (새로고침 시)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bitbattle_currentBet');
      if (saved) {
        const parsed = JSON.parse(saved);
        prevBetRef.current = { userBet: parsed.side, betAmount: parsed.amount, round: parsed.round };
      }
    } catch {
      // ignore
    }
  }, []);

  // 마지막 완료된 베팅 정보 (REPEAT/x2 버튼용)
  const [lastCompletedBet, setLastCompletedBet] = useState<{ side: 'bull' | 'bear' | null; amount: number }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bitbattle_lastCompletedBet');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return { side: null, amount: 0 };
        }
      }
    }
    return { side: null, amount: 0 };
  });

  // Toast State
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // 베팅 알림 State
  const [showBetAlert, setShowBetAlert] = useState(false);
  const betAlertShownRef = useRef(false);

  // 오늘 손익 State (세션 통계용)
  const [todayPnl, setTodayPnl] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bitbattle_todayPnl');
      const savedDate = localStorage.getItem('bitbattle_todayPnlDate');
      const today = new Date().toDateString();
      // 날짜가 다르면 리셋
      if (savedDate !== today) {
        localStorage.setItem('bitbattle_todayPnl', '0');
        localStorage.setItem('bitbattle_todayPnlDate', today);
        return 0;
      }
      return saved ? parseFloat(saved) : 0;
    }
    return 0;
  });

  const game = useBullBearGame();

  // Generate bot predictions at round start (betting phase begins)
  useEffect(() => {
    if (game.gamePhase === 'betting' && game.timeRemaining >= 24) {
      // 새 라운드 시작 - 팔로우 베팅 리셋
      setFollowBetPlaced(false);
      
      // 봇 예측 생성
      const recentResults = game.roadmapHistory.slice(-10).map(r => r.result);
      setBotStates(prev => {
        const newStates = new Map(prev);
        AI_BOTS.forEach(bot => {
          const state = newStates.get(bot.id)!;
          const prediction = generateBotPrediction(bot, recentResults, game.priceChange);
          newStates.set(bot.id, {
            ...state,
            prediction,
          });
        });
        return newStates;
      });
    }
  }, [game.gamePhase, game.timeRemaining, game.roadmapHistory, game.priceChange]);
  
  // Auto-bet for followed bot (at betting phase start, after predictions are generated)
  useEffect(() => {
    if (game.gamePhase === 'betting' && game.timeRemaining >= 20 && game.timeRemaining <= 23 && followState && !followBetPlaced) {
      const followingBotState = botStates.get(followState.botId);
      if (!followingBotState || !followingBotState.prediction) return;
      
      // 잔액 확인
      if (balance < followState.betPerRound) {
        // 잔액 부족 - 팔로우 중단
        showToast('warning', lang === 'ko' ? '잔액 부족! 팔로우가 중단되었습니다.' : 'Insufficient balance! Follow stopped.');
        playSound(sounds.cancelBet);
        setFollowState(null);
        return;
      }
      
      // 자동 베팅 처리
      const betAmount = followState.betPerRound;
      const prediction = followingBotState.prediction;
      
      // 잔액에서 차감
      const newBalance = balance - betAmount;
      setBalance(newBalance);
      onBalanceChange?.(newBalance);
      localStorage.setItem('bitbattle_balance', newBalance.toString());
      
      // 팔로우 베팅 정보 저장
      followBetRef.current = {
        round: game.currentRound,
        amount: betAmount,
        prediction: prediction,
      };
      setFollowBetPlaced(true);
      
      // 효과음 + 토스트
      playSound(sounds.placeBet);
      hapticImpact('light');
      showToast('info', lang === 'ko' 
        ? `🤖 자동 베팅: ${prediction === 'bull' ? '🐂 BULL' : '🐻 BEAR'} $${betAmount}` 
        : `🤖 Auto-bet: ${prediction === 'bull' ? '🐂 BULL' : '🐻 BEAR'} $${betAmount}`);
    }
  }, [game.gamePhase, game.timeRemaining, game.currentRound, followState, followBetPlaced, botStates, balance, lang]);
  
  // Update bot states on round result
  useEffect(() => {
    if (lastRoundResult && game.gamePhase === 'betting') {
      setBotStates(prev => {
        const newStates = new Map(prev);
        newStates.forEach((state, botId) => {
          if (state.prediction === lastRoundResult) {
            // 봇이 맞춤
            newStates.set(botId, {
              ...state,
              totalWins: state.totalWins + 1,
              winStreak: state.winStreak + 1,
              loseStreak: 0,
            });
          } else if (state.prediction !== null && lastRoundResult !== 'tie') {
            // 봇이 틀림
            newStates.set(botId, {
              ...state,
              totalLosses: state.totalLosses + 1,
              loseStreak: state.loseStreak + 1,
              winStreak: 0,
            });
          }
        });
        return newStates;
      });
    }
  }, [lastRoundResult, game.gamePhase]);

  // Toast 함수들
  const showToast = useCallback((type: ToastType, message: string, amount?: number, duration = 3000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message, amount }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // 반응형 레이아웃: 모든 기기에서 화면 전체 사용
  useEffect(() => {
    const MOBILE_BREAKPOINT = 768;
    const TABLET_BREAKPOINT = 1024;

    const calculateLayout = () => {
      const windowWidth = window.innerWidth;

      // 기기 타입 감지
      const mobile = windowWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      setScale(1); // scale 사용 안함 - 순수 반응형
    };

    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedSound = localStorage.getItem('bitbattle_sound');
    const savedVolume = localStorage.getItem('bitbattle_volume');
    const savedTheme = localStorage.getItem('bitbattle_theme');
    // lang is now managed by LanguageProvider, skip loading here
    // const savedLang = localStorage.getItem('bitbattle_lang');
    const savedWallet = localStorage.getItem('bitbattle_wallet');
    const savedBetAlert = localStorage.getItem('bitbattle_betAlert');
    const savedEffects = localStorage.getItem('bitbattle_effects');

    if (savedSound !== null) setSoundEnabled(savedSound !== 'false');
    if (savedVolume !== null) setSoundVolume(parseFloat(savedVolume));
    if (savedTheme !== null) setIsDarkMode(savedTheme !== 'light');
    // lang is managed by LanguageProvider
    // if (savedLang !== null) setLang(savedLang as 'ko' | 'en');
    if (savedBetAlert !== null) setBetAlertEnabled(savedBetAlert !== 'false');
    if (savedEffects) {
      try {
        setEffectSettings(JSON.parse(savedEffects));
      } catch (e) {
        // ignore parse error
      }
    }
    if (savedWallet) {
      setIsWalletConnected(true);
      setWalletAddress(savedWallet);
      // 저장된 잔액 복구 (없으면 데모 잔액 $10,000)
      const savedBalance = localStorage.getItem('bitbattle_balance');
      if (savedBalance) {
        const parsedBalance = parseInt(savedBalance);
        setBalance(parsedBalance);
        onBalanceChange?.(parsedBalance);
      } else {
        setBalance(10000);
        onBalanceChange?.(10000);
      }
    }
    // 마지막 베팅 금액 복구
    const lastBet = localStorage.getItem('bitbattle_lastBet');
    if (lastBet) {
      setBetInput(`$${parseInt(lastBet).toLocaleString()}`);
    }
  }, [onBalanceChange]);

  // Save settings to localStorage (lang is managed by LanguageProvider)
  useEffect(() => {
    localStorage.setItem('bitbattle_sound', String(soundEnabled));
    localStorage.setItem('bitbattle_volume', String(soundVolume));
    localStorage.setItem('bitbattle_theme', isDarkMode ? 'dark' : 'light');
    // lang is saved by LanguageProvider, no need to save here
    localStorage.setItem('bitbattle_betAlert', String(betAlertEnabled));
    localStorage.setItem('bitbattle_effects', JSON.stringify(effectSettings));
  }, [soundEnabled, soundVolume, isDarkMode, betAlertEnabled, effectSettings]);

  // Play sound helper
  const playSound = useCallback((soundFn: (vol: number) => void) => {
    if (soundEnabled) soundFn(soundVolume);
  }, [soundEnabled, soundVolume]);

  // 데모 모드 잔액 상수
  const DEMO_BALANCE = 10000;

  // 지갑 연결 함수 - 데모 모드로 $10,000 잔액 설정
  const connectWallet = useCallback((walletName: string) => {
    // 저장된 지갑 주소가 있으면 재사용, 없으면 새로 생성
    const savedWallet = localStorage.getItem('bitbattle_wallet');
    const mockAddress = savedWallet || ('0x' + Math.random().toString(16).slice(2, 6) + '...' + Math.random().toString(16).slice(2, 6));
    setIsWalletConnected(true);
    setWalletAddress(mockAddress);

    // 저장된 잔액 확인 (pending bet 결과가 반영된 잔액)
    const savedBalance = localStorage.getItem('bitbattle_balance');
    const initialBalance = savedBalance ? parseFloat(savedBalance) : DEMO_BALANCE;

    setBalance(initialBalance);
    onBalanceChange?.(initialBalance);
    localStorage.setItem('bitbattle_wallet', mockAddress);
    localStorage.setItem('bitbattle_balance', initialBalance.toString());
    setWalletModalOpen(false);
    playSound(sounds.placeBet);

    // pending bet 결과 확인 (disconnect 중 게임 결과가 나온 경우)
    const pendingBetStr = localStorage.getItem('bitbattle_pending_bet');
    if (pendingBetStr) {
      try {
        const pendingBet = JSON.parse(pendingBetStr);
        // 해당 라운드 결과 확인
        const roundResult = game.roadmapHistory.find(r => r.round === pendingBet.round);
        if (roundResult) {
          // 결과가 이미 나왔다면 처리
          const userWon = pendingBet.userBet === roundResult.result;
          const isTie = roundResult.result === 'tie';

          if (userWon) {
            const payout = pendingBet.betAmount * 1.95;
            const newBalance = initialBalance + payout;
            setBalance(newBalance);
            onBalanceChange?.(newBalance);
            localStorage.setItem('bitbattle_balance', newBalance.toString());
            showToast('win', `Round #${pendingBet.round} Win!`, payout - pendingBet.betAmount, 3000);
          } else if (!isTie) {
            // 패배: 베팅금액은 이미 차감된 상태
            showToast('lose', `Round #${pendingBet.round} Lost`, pendingBet.betAmount, 3000);
          }
          // pending bet 삭제
          localStorage.removeItem('bitbattle_pending_bet');
        }
      } catch (e) {
        console.error('Failed to process pending bet:', e);
        localStorage.removeItem('bitbattle_pending_bet');
      }
    }
  }, [playSound, onBalanceChange, game.roadmapHistory, showToast]);

  // 지갑 연결 해제
  const disconnectWallet = useCallback(() => {
    // 진행 중인 베팅이 있으면 localStorage에 저장 (나중에 결과 처리용)
    if (prevBetRef.current.userBet && prevBetRef.current.betAmount > 0) {
      const pendingBet = {
        ...prevBetRef.current,
        basePrice: game.basePrice,
        walletAddress: walletAddress,
        disconnectedAt: Date.now(),
      };
      localStorage.setItem('bitbattle_pending_bet', JSON.stringify(pendingBet));
    }

    // 화면에서 베팅 UI 숨기기 위해 리셋
    prevBetRef.current = { userBet: null, betAmount: 0, round: 0 };
    game.resetBet();
    setBetInput('$0');

    setIsWalletConnected(false);
    setWalletAddress('');
    setTodayPnl(0); // 오늘 손익 리셋
    // 지갑 주소는 유지 (재연결 시 같은 주소로 기록 불러오기)
    // localStorage.removeItem('bitbattle_wallet'); // 삭제하지 않음
    localStorage.removeItem('bitbattle_balance');
    localStorage.removeItem('bitbattle_todayPnl');
    localStorage.removeItem('bitbattle_todayPnlDate');
  }, [game.basePrice, game.resetBet, walletAddress]);

  // Parse bet input value
  const parseBetValue = (value: string) => {
    return parseInt(value.replace(/[^0-9]/g, '')) || 0;
  };

  // Format bet value for display
  const formatBetValue = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Handle preset button click - HTML과 동일한 로직
  // C: 초기화, 숫자: 누적 추가, MAX: 최대 베팅
  const handlePreset = (action: string) => {
    playSound(sounds.click);
    const currentValue = parseBetValue(betInput);
    // 사용 가능한 총 금액 = 현재 잔고 + 이미 베팅한 금액 (HTML과 동일)
    const availableTotal = balance + game.betAmount;

    if (action === 'clear') {
      // CLEAR: 금액 초기화
      setBetInput('$0');
    } else if (action === 'max') {
      // MAX: 사용 가능한 총 금액과 최대 베팅 한도(10000) 중 작은 값
      const maxBet = Math.min(availableTotal, 10000);
      setBetInput(formatBetValue(maxBet));
      // 마지막 베팅 금액 기억
      if (maxBet > 0) {
        localStorage.setItem('bitbattle_lastBet', maxBet.toString());
      }
    } else {
      // 누적 방식: 기존 금액 + 버튼 금액 (사용 가능한 총 금액 한도 내)
      const addAmount = parseInt(action);
      const newValue = Math.min(currentValue + addAmount, Math.min(availableTotal, 10000));
      setBetInput(formatBetValue(newValue));
      // 마지막 베팅 금액 기억
      if (newValue > 0) {
        localStorage.setItem('bitbattle_lastBet', newValue.toString());
      }
    }
  };

  // Handle bet input change
  const handleBetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(value) || 0;
    setBetInput(formatBetValue(Math.min(numValue, balance, 10000)));
  };

  // Execute the actual bet placement
  const executeBet = (side: BetSide, overrideAmount?: number) => {
    const amount = overrideAmount !== undefined ? overrideAmount : parseBetValue(betInput);
    if (amount <= 0) return;

    // 이미 베팅한 경우, 차액만 잔고에서 차감
    const diff = amount - game.betAmount;
    if (diff > balance) return; // 잔고 부족

    const success = game.placeBet(side, amount);
    if (success) {
      playSound(sounds.placeBet);
      hapticImpact('medium'); // 📳 베팅 시 진동
      const newBalance = balance - diff;
      setBalance(newBalance);
      onBalanceChange?.(newBalance);
      // 잔액 저장
      localStorage.setItem('bitbattle_balance', newBalance.toString());
      // 마지막 베팅 금액 저장
      localStorage.setItem('bitbattle_lastBet', amount.toString());
      // 마지막 완료된 베팅 저장 (REPEAT/x2 버튼용)
      const completedBet = { side, amount };
      setLastCompletedBet(completedBet);
      localStorage.setItem('bitbattle_lastCompletedBet', JSON.stringify(completedBet));
    }
  };

  // Place bet - HTML과 동일한 로직
  // overrideAmount: REPEAT/x2 버튼에서 직접 금액을 전달할 때 사용
  const handlePlaceBet = (side: BetSide, overrideAmount?: number) => {
    if (game.gamePhase !== 'betting') return;

    const amount = overrideAmount !== undefined ? overrideAmount : parseBetValue(betInput);
    if (amount <= 0) return;

    // Check if user has agreed to betting disclaimer this session
    if (!hasAgreedToBettingDisclaimer) {
      setPendingBet({ side, amount: overrideAmount });
      setShowBettingDisclaimer(true);
      return;
    }

    executeBet(side, overrideAmount);
  };

  // Handle betting disclaimer confirmation
  const handleBettingDisclaimerConfirm = () => {
    setShowBettingDisclaimer(false);
    if (pendingBet) {
      executeBet(pendingBet.side, pendingBet.amount);
      setPendingBet(null);
    }
  };

  const handleBettingDisclaimerCancel = () => {
    setShowBettingDisclaimer(false);
    setPendingBet(null);
  };

  // Cancel bet
  const handleCancelBet = () => {
    if (game.betAmount > 0) {
      playSound(sounds.cancelBet);
      const newBalance = balance + game.betAmount;
      setBalance(newBalance);
      onBalanceChange?.(newBalance);
      // 잔액 저장
      localStorage.setItem('bitbattle_balance', newBalance.toString());
      game.cancelBet();
    }
  };

  // REPEAT 버튼 - 이전 베팅과 같은 방향, 같은 금액으로 베팅
  const handleRepeatBet = () => {
    if (game.gamePhase !== 'betting') return;
    if (!lastCompletedBet.side || lastCompletedBet.amount <= 0) return;

    const amount = Math.min(lastCompletedBet.amount, balance + game.betAmount, 10000);
    if (amount <= 0) return;

    // betInput 업데이트 (UI 표시용)
    setBetInput(`$${amount.toLocaleString()}`);
    // 금액을 직접 전달하여 즉시 베팅 실행
    handlePlaceBet(lastCompletedBet.side!, amount);
  };

  // x2 버튼 - 이전 베팅과 같은 방향, 2배 금액으로 베팅
  const handleDoubleBet = () => {
    if (game.gamePhase !== 'betting') return;
    if (!lastCompletedBet.side || lastCompletedBet.amount <= 0) return;

    const doubledAmount = lastCompletedBet.amount * 2;
    const amount = Math.min(doubledAmount, balance + game.betAmount, 10000);
    if (amount <= 0) return;

    // betInput 업데이트 (UI 표시용)
    setBetInput(`$${amount.toLocaleString()}`);
    // 금액을 직접 전달하여 즉시 베팅 실행
    handlePlaceBet(lastCompletedBet.side!, amount);
  };

  // Draw chart on canvas - HTML과 동일한 방식으로 50ms(20 FPS)마다 다시 그림
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lastDrawTime = 0;
    const FRAME_INTERVAL = 50; // 50ms = 20 FPS (HTML과 동일)

    const drawChart = (currentTime: number) => {
      // 50ms마다 그리기 (20 FPS)
      if (currentTime - lastDrawTime < FRAME_INTERVAL) {
        animationId = requestAnimationFrame(drawChart);
        return;
      }
      lastDrawTime = currentTime;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;
      const bottomAxisHeight = 25;
      const chartHeight = height - bottomAxisHeight;
      const chartTop = 0;
      const rightAxisWidth = isMobile ? 50 : 70; // 모바일: 50px, 데스크탑: 70px
      const chartWidth = width - rightAxisWidth;
      const mascotPadding = isMobile ? 30 : 50; // 모바일: 30px, 데스크탑: 50px
      const drawWidth = chartWidth - mascotPadding;

      ctx.clearRect(0, 0, width, height);

      // 데이터 준비 - 모바일은 30초(150개), 데스크탑은 60초(300개)
      const maxDataPoints = isMobile ? 150 : 300;
      const recentHistory = game.priceHistory.slice(-maxDataPoints);
      const data = recentHistory.map(p => p.price).filter(p => p && p > 1000);
      if (data.length < 2) {
        animationId = requestAnimationFrame(drawChart);
        return;
      }

      // HTML과 동일: 게임 페이즈에서는 basePrice 항상 포함
      const isGamePhase = game.gamePhase === 'game' || game.gamePhase === 'countdown';
      let min: number, max: number;

      if (isGamePhase && game.basePrice > 0) {
        const dataMin = Math.min(...data);
        const dataMax = Math.max(...data);
        // basePrice가 차트 중앙에 가깝도록 충분한 여백 추가
        const priceRange = Math.max(dataMax - dataMin, 20);
        const padding = priceRange * 0.3; // 30% 여백
        min = Math.min(dataMin, game.basePrice) - padding;
        max = Math.max(dataMax, game.basePrice) + padding;
      } else {
        const dataMin = Math.min(...data);
        const dataMax = Math.max(...data);
        const padding = Math.max(7, (dataMax - dataMin) * 0.1);
        min = dataMin - padding;
        max = dataMax + padding;
      }
      const range = max - min || 1;

      // HTML과 동일: 승패에 따른 배경색
      if (isGamePhase && game.basePrice > 0 && game.userBet) {
        const curPrice = data[data.length - 1];
        const isWinning = (game.userBet === 'bull' && curPrice > game.basePrice) ||
                          (game.userBet === 'bear' && curPrice < game.basePrice);
        const isTie = Math.abs(curPrice - game.basePrice) < 0.01;

        if (isTie) {
          ctx.fillStyle = isDarkMode ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.1)';
        } else if (isWinning) {
          ctx.fillStyle = isDarkMode ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.15)';
        } else {
          ctx.fillStyle = isDarkMode ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.15)';
        }
      } else {
        ctx.fillStyle = isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,1)';
      }
      ctx.fillRect(0, 0, chartWidth, chartHeight);

      // Grid lines + 우측 가격 라벨
      ctx.strokeStyle = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 1;
      ctx.font = isMobile ? '8px Orbitron' : '10px Orbitron';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      const priceSteps = 6;
      for (let i = 0; i <= priceSteps; i++) {
        const y = (chartHeight / priceSteps) * i;
        const price = max - (range / priceSteps) * i;

        ctx.strokeStyle = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.fillText(price.toFixed(2), width - 5, y);
      }

      // HTML과 동일: Base line (게임 중에만 표시)
      // countdown 페이즈에서는 베이스라인 숨김 (NO MORE BET 화면)
      // 게임 중간에 접속했으면 베이스라인 숨김 (다음 라운드부터 표시)
      let baseX = 0;
      let baseY = 0; // basePrice의 실제 Y 좌표 (승패 기준선)
      const showBaseLine = game.gamePhase === 'game' && game.basePrice > 0 && !game.joinedMidRound;

      // gameStartIndex를 recentHistory 기준으로 조정 (전체 히스토리에서 slice한 만큼 빼기)
      const sliceOffset = game.priceHistory.length - recentHistory.length;
      const adjustedGameStartIndex = game.gameStartIndex >= 0 ? game.gameStartIndex - sliceOffset : -1;

      if (showBaseLine) {
        // basePrice의 Y 좌표 계산 (승패 판정 기준) - 이게 실제 기준선!
        baseY = chartHeight - ((game.basePrice - min) / range) * chartHeight;

        // adjustedGameStartIndex로 START 점 X 위치 계산
        if (data.length > 1 && adjustedGameStartIndex >= 0) {
          const clampedIndex = Math.min(Math.max(adjustedGameStartIndex, 0), data.length - 1);
          baseX = (clampedIndex / (data.length - 1)) * drawWidth;
        } else if (adjustedGameStartIndex < 0) {
          // 차트 밖으로 나간 경우
          baseX = 0;
        }

        // 베이스라인 수평 점선 - 실제 basePrice 기준으로 그리기!
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(Math.max(baseX, 0), baseY);
        ctx.lineTo(chartWidth, baseY);
        ctx.stroke();
        ctx.setLineDash([]);

        // START 수직선과 dot은 차트 안에 있을 때만 표시
        if (baseX > 0) {
          // Base 시작점 수직선 (게임 시작 지점 표시)
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(baseX, 0);
          ctx.lineTo(baseX, chartHeight);
          ctx.stroke();
          ctx.setLineDash([]);

          // START 교차점을 basePrice 기준선 위에 그리기
          ctx.beginPath();
          ctx.arc(baseX, baseY, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // "START" 라벨 (상단)
          ctx.fillStyle = '#22c55e';
          ctx.font = '8px Orbitron';
          ctx.textAlign = 'center';
          ctx.fillText('START', Math.max(baseX, 25), 10);
        }

        // 베이스 가격 라벨 (우측, 베이스라인 끝에 표시) - basePrice Y 위치에 표시
        ctx.fillStyle = isDarkMode ? '#0a0a0f' : '#f0f2f5';
        ctx.fillRect(chartWidth + 2, baseY - 10, rightAxisWidth - 4, 20);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1;
        ctx.strokeRect(chartWidth + 2, baseY - 10, rightAxisWidth - 4, 20);
        ctx.fillStyle = '#22c55e';
        ctx.font = isMobile ? 'bold 8px Orbitron' : 'bold 10px Orbitron';
        ctx.textAlign = 'right';
        ctx.fillText(game.basePrice.toFixed(2), width - 5, baseY + 4);
      }

      // 차트 라인 색상 (중간 접속 시에는 기본 오렌지색)
      const curPrice = data[data.length - 1];
      const isUp = isGamePhase && !game.joinedMidRound ? curPrice > game.basePrice : true;
      const lineColor = (isGamePhase && !game.joinedMidRound) ? (isUp ? '#22c55e' : '#ef4444') : '#f7931a';

      // 차트 라인 그리기
      // gameStartIndex 위치에서는 반드시 basePrice를 사용 (29초 종가 기준)
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = lineColor;

      let lastX = 0, lastY = 0;
      data.forEach((price, i) => {
        const x = (i / (data.length - 1)) * drawWidth;
        // adjustedGameStartIndex 위치에서는 basePrice 사용 (차트가 정확히 베이스라인을 지나도록)
        let actualPrice = price;
        if (showBaseLine && adjustedGameStartIndex >= 0 && i === adjustedGameStartIndex && game.basePrice > 0) {
          actualPrice = game.basePrice;
        }
        const y = chartHeight - ((actualPrice - min) / range) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        lastX = x;
        lastY = y;
      });
      ctx.stroke();

      // Fill gradient
      ctx.lineTo(lastX, chartHeight);
      ctx.lineTo(0, chartHeight);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, chartHeight);
      if (isGamePhase) {
        grad.addColorStop(0, isUp ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)');
        grad.addColorStop(1, 'transparent');
      } else {
        grad.addColorStop(0, 'rgba(247,147,26,0.1)');
        grad.addColorStop(1, 'transparent');
      }
      ctx.fillStyle = grad;
      ctx.fill();

      // 현재가 수평선 + 라벨
      const curPriceY = chartHeight - ((curPrice - min) / range) * chartHeight;
      const priceColor = isGamePhase ? (isUp ? '#22c55e' : '#ef4444') : '#f7931a';

      ctx.strokeStyle = priceColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(lastX, curPriceY);
      ctx.lineTo(chartWidth, curPriceY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 현재가 라벨 박스
      ctx.fillStyle = priceColor;
      ctx.fillRect(chartWidth + 2, curPriceY - 10, rightAxisWidth - 4, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = isMobile ? 'bold 8px Orbitron' : 'bold 10px Orbitron';
      ctx.textAlign = 'right';
      ctx.fillText(curPrice.toFixed(2), width - 5, curPriceY);

      // 하단 시간축
      ctx.fillStyle = isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(240,242,245,0.95)';
      ctx.fillRect(0, chartHeight, chartWidth, bottomAxisHeight);

      ctx.font = '9px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748b';

      // 모바일: 3개 (좌측, 중앙, 우측), 데스크탑: 5개
      const timeLabels = isMobile ? 2 : 5;
      for (let i = 0; i <= timeLabels; i++) {
        const x = (drawWidth / timeLabels) * i;
        const idx = Math.floor((recentHistory.length - 1) * (i / timeLabels));
        if (recentHistory[idx]) {
          const date = new Date(recentHistory[idx].timestamp);
          // 모바일: 24시간 형식, 데스크탑: 오전/오후 형식
          const timeStr = isMobile
            ? date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
            : date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

          // 세로 그리드
          ctx.strokeStyle = 'rgba(255,255,255,0.03)';
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, chartHeight);
          ctx.stroke();

          ctx.fillStyle = '#64748b';
          // 모바일 좌측 라벨은 약간 오른쪽으로 (잘리지 않게)
          const labelX = (isMobile && i === 0) ? x + 25 : x;
          ctx.fillText(timeStr, labelX, chartHeight + 15);
        }
      }

      // START 라인 하단에 시작 시간 표시 (XX:XX:30)
      if (isGamePhase && game.basePrice > 0 && baseX > 0) {
        // 현재 라운드의 시작 시간 계산 (항상 30초)
        const now = new Date();
        const roundStartSec = (game.currentRound - 1) * 60 + 30; // 30초에 게임 시작
        const todayMidnight = new Date(now);
        todayMidnight.setHours(0, 0, 0, 0);
        const startTime = new Date(todayMidnight.getTime() + roundStartSec * 1000);
        // 모바일: 24시간 형식, 데스크탑: 오전/오후 형식
        const startTimeStr = isMobile
          ? startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
          : startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // 시작 시간 라벨 (기존 X축 레이블 바로 아래, 초록색으로 강조)
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 8px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(startTimeStr, Math.max(baseX, 35), chartHeight + 23);
      }

      // Mascot animation (게임 중에만)
      if (isGamePhase) {
        const mascot = isUp ? '🐂' : '🐻';
        const time = Date.now();
        const runBounce = Math.sin(time / 60) * 4;
        const runLean = Math.sin(time / 100) * 3;
        const mascotX = lastX + 25;
        const mascotY = lastY;

        ctx.save();
        ctx.shadowColor = isUp ? '#22c55e' : '#ef4444';
        ctx.shadowBlur = 25;
        ctx.translate(mascotX, mascotY + runBounce);
        ctx.scale(-1, 1); // 수평 반전
        ctx.rotate(runLean * Math.PI / 180);
        ctx.font = '41px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(mascot, 0, 0);
        ctx.restore();

        // Dust particles
        ctx.shadowBlur = 0;
        for (let i = 0; i < 3; i++) {
          const dustAge = (time + i * 100) % 300;
          const dustAlpha = 1 - dustAge / 300;
          const dustX = lastX - dustAge / 10 - i * 8;
          const dustY = lastY + 15 + Math.sin(dustAge / 50 + i) * 5;

          ctx.fillStyle = `rgba(255,255,255,${dustAlpha * 0.4})`;
          ctx.beginPath();
          ctx.arc(dustX, dustY, 2 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Speed lines
        ctx.strokeStyle = isUp ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const lineY = lastY - 10 + i * 10;
          const lineLen = 15 + Math.random() * 10;
          ctx.beginPath();
          ctx.moveTo(lastX - 5, lineY);
          ctx.lineTo(lastX - 5 - lineLen, lineY);
          ctx.stroke();
        }
      }

      animationId = requestAnimationFrame(drawChart);
    };

    animationId = requestAnimationFrame(drawChart);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [game.priceHistory, game.basePrice, game.priceChange, game.gamePhase, game.gameStartIndex, game.userBet, game.currentRound, isDarkMode]);

  // Victory overlay close function - HTML과 동일
  const closeVictoryOverlay = useCallback(() => {
    if (victoryTimeoutRef.current) {
      clearTimeout(victoryTimeoutRef.current);
    }
    // 폭죽 애니메이션 중지
    setWinTrigger(false);
    setVictoryShrinking(true);
    setTimeout(() => {
      setVictoryVisible(false);
      setVictoryShrinking(false);
      setShowResult(false);

      // 오버레이가 완전히 닫힌 후 잔액 업데이트 + 코인 사운드 (1초 동안)
      if (pendingWinRef.current) {
        const { totalPayout, netProfit } = pendingWinRef.current;

        // 잔액 업데이트
        setBalance(prev => {
          const newBalance = prev + totalPayout;
          onBalanceChange?.(newBalance);
          localStorage.setItem('bitbattle_balance', newBalance.toString());
          return newBalance;
        });

        // 오늘 손익 업데이트
        setTodayPnl(prev => {
          const newPnl = prev + netProfit;
          localStorage.setItem('bitbattle_todayPnl', newPnl.toString());
          localStorage.setItem('bitbattle_todayPnlDate', new Date().toDateString());
          return newPnl;
        });

        // 슬롯머신 코인 카운팅 사운드 재생 (1초 동안)
        if (soundEnabled) {
          const coinInterval = sounds.coinCount(soundVolume);
          if (coinInterval) {
            coinSoundIntervalRef.current = coinInterval;
            // 1초 후 사운드 종료
            setTimeout(() => {
              if (coinSoundIntervalRef.current) {
                clearInterval(coinSoundIntervalRef.current);
                coinSoundIntervalRef.current = null;
                sounds.coinCountEnd(soundVolume); // 마무리 사운드
              }
            }, 1000);
          }
        }

        // pendingWin 리셋
        pendingWinRef.current = null;
      }
    }, 300);
  }, [soundEnabled, soundVolume, onBalanceChange]);

  // 베팅 정보 저장 (game 페이즈 동안)
  useEffect(() => {
    if (game.gamePhase === 'game' && game.userBet && game.betAmount > 0) {
      prevBetRef.current = {
        userBet: game.userBet,
        betAmount: game.betAmount,
        round: game.currentRound,
      };
    }
  }, [game.gamePhase, game.userBet, game.betAmount, game.currentRound]);

  // 새 라운드 시작 시 알림음 재생 (game → betting 전환)
  useEffect(() => {
    const currentPhase = game.gamePhase;
    const prevPhase = lastGamePhaseRef.current;

    // game → betting 전환 감지 (새 라운드 시작)
    if (prevPhase === 'game' && currentPhase === 'betting') {
      // 새 라운드 시작 알림음만 재생 ("띠링~")
      playSound(sounds.roundStart);
    }

    lastGamePhaseRef.current = currentPhase;
  }, [game.gamePhase, soundEnabled, soundVolume]);

  // Result handling + Victory Overlay - roadmapHistory 업데이트 시 결과 처리
  // roadmapHistory가 실제로 업데이트된 후에 토스트를 표시하여 정확한 결과를 보여줌
  const prevRoadmapLengthRef = useRef(game.roadmapHistory.length);
  const processedRoundsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const currentLength = game.roadmapHistory.length;
    const prevLength = prevRoadmapLengthRef.current;

    // roadmapHistory에 새 항목이 추가되었을 때만 처리
    if (currentLength > prevLength && currentLength > 0) {
      const lastRoadmap = game.roadmapHistory[currentLength - 1];

      // 이미 처리한 라운드인지 확인 (중복 처리 방지)
      if (lastRoadmap && !processedRoundsRef.current.has(lastRoadmap.round)) {
        processedRoundsRef.current.add(lastRoadmap.round);

        // 너무 많은 라운드가 저장되지 않도록 정리
        if (processedRoundsRef.current.size > 50) {
          const rounds = Array.from(processedRoundsRef.current).sort((a, b) => a - b);
          rounds.slice(0, 25).forEach(r => processedRoundsRef.current.delete(r));
        }

        const roundResult = lastRoadmap.result;
        const closePrice = lastRoadmap.endPrice;
        const savedBet = prevBetRef.current;
        
        // AI Battle 모드용 마지막 라운드 결과 업데이트
        setLastRoundResult(roundResult);
        
        // ============ 팔로우 베팅 결과 정산 ============
        const savedFollowBet = followBetRef.current;
        if (savedFollowBet && savedFollowBet.round === lastRoadmap.round) {
          const followWon = savedFollowBet.prediction === roundResult;
          const isTie = roundResult === 'tie';
          
          // 고정 배당률 1.95배 (5% 수수료) - 직접 베팅과 동일
          const multiplier = BOT_PAYOUT_MULTIPLIER; // 1.95
          
          if (isTie) {
            // TIE: 베팅금액 환불
            const newBalance = balance + savedFollowBet.amount;
            setBalance(newBalance);
            onBalanceChange?.(newBalance);
            localStorage.setItem('bitbattle_balance', newBalance.toString());
            showToast('tie', lang === 'ko' ? '🤖 TIE! 베팅금 환불' : '🤖 TIE! Bet Refunded', savedFollowBet.amount, 3000);
            playSound(sounds.tie);
          } else if (followWon) {
            // 승리: 고정 1.95배 배당 (5% 수수료)
            const netProfit = savedFollowBet.amount * (multiplier - 1);
            const totalPayout = savedFollowBet.amount * multiplier;
            
            // 잔액 업데이트
            setBalance(prev => {
              const newBal = prev + totalPayout;
              onBalanceChange?.(newBal);
              localStorage.setItem('bitbattle_balance', newBal.toString());
              return newBal;
            });
            
            // 오늘 손익 업데이트
            setTodayPnl(prev => {
              const newPnl = prev + netProfit;
              localStorage.setItem('bitbattle_todayPnl', newPnl.toString());
              localStorage.setItem('bitbattle_todayPnlDate', new Date().toDateString());
              return newPnl;
            });
            
            // 승리 효과 (직접 베팅과 동일)
            hapticNotification('success');
            if (savedFollowBet.prediction === 'bull') {
              playSound(sounds.bullWin);
            } else {
              playSound(sounds.bearWin);
            }
            
            // 승리 토스트
            showToast('win', lang === 'ko' ? '🤖 봇 베팅 승리!' : '🤖 Bot Bet Won!', netProfit, 4000);
            
            // 코인 카운팅 사운드
            if (soundEnabled) {
              const coinInterval = sounds.coinCount(soundVolume);
              if (coinInterval) {
                setTimeout(() => {
                  clearInterval(coinInterval);
                  sounds.coinCountEnd(soundVolume);
                }, 1000);
              }
            }
          } else {
            // 패배: 베팅금액은 이미 차감됨
            // 오늘 손익 업데이트
            setTodayPnl(prev => {
              const newPnl = prev - savedFollowBet.amount;
              localStorage.setItem('bitbattle_todayPnl', newPnl.toString());
              localStorage.setItem('bitbattle_todayPnlDate', new Date().toDateString());
              return newPnl;
            });
            
            // 패배 효과 (직접 베팅과 동일)
            playSound(sounds.lose);
            hapticNotification('error');
            
            setTimeout(() => {
              showToast('lose', lang === 'ko' ? '🤖 봇 베팅 패배' : '🤖 Bot Bet Lost', savedFollowBet.amount, 3000);
            }, 500);
          }
          
          // 팔로우 베팅 정보 리셋
          followBetRef.current = null;
        }

        // 1. 라운드 결과 토스트 (BULL WIN / BEAR WIN / TIE) - 항상 표시
        if (roundResult === 'bull') {
          showToast('bull', `Round #${lastRoadmap.round}`, closePrice, 4000);
          playSound(sounds.bullWin);
        } else if (roundResult === 'bear') {
          showToast('bear', `Round #${lastRoadmap.round}`, closePrice, 4000);
          playSound(sounds.bearWin);
        } else if (roundResult === 'tie') {
          showToast('tie', `Round #${lastRoadmap.round} - TIE`, closePrice, 4000);
          playSound(sounds.tie);
        }

        // 2. 유저 베팅 결과 처리 (해당 라운드에 베팅했을 경우)
        if (savedBet.userBet && savedBet.betAmount > 0 && savedBet.round === lastRoadmap.round) {
          const userWon = savedBet.userBet === roundResult;
          const isTie = roundResult === 'tie';

          if (isTie) {
            // TIE: 베팅금액 환불 (손익 변동 없음)
            const newBalance = balance + savedBet.betAmount;
            setBalance(newBalance);
            onBalanceChange?.(newBalance);
            localStorage.setItem('bitbattle_balance', newBalance.toString());
            showToast('tie', 'TIE! Bet Refunded', savedBet.betAmount, 3000);
            playSound(sounds.tie);
          } else if (userWon) {
            // 승리: 순이익 = 베팅금액 * 0.95 (총 수령 = 베팅금액 * 1.95)
            const netProfit = savedBet.betAmount * 0.95;
            const totalPayout = savedBet.betAmount * 1.95;

            // 잔액 업데이트는 오버레이가 닫힐 때 실행 (pendingWinRef에 저장)
            pendingWinRef.current = { totalPayout, netProfit };

            // 승리 사운드 재생 (베팅한 방향에 따라)
            if (savedBet.userBet === 'bull') {
              playSound(sounds.bullWin);
            } else {
              playSound(sounds.bearWin);
            }

            // Victory Overlay 표시
            hapticNotification('success'); // 📳 승리 진동
            setVictoryResult(savedBet.userBet);
            setVictoryWinAmount(netProfit);
            setVictoryClosePrice(closePrice); // 종가 저장
            setVictoryRound(lastRoadmap.round); // 라운드 번호 저장
            setVictoryVisible(true);
            setVictoryShrinking(false);
            setShowResult(true);

            // 이펙트 트리거 (Confetti, RadialShockwave)
            setWinTrigger(true);
            // 트리거 리셋은 오버레이 닫힐 때 함께 처리됨

            // 1.5초 후 자동 축소 & 닫기
            victoryTimeoutRef.current = setTimeout(() => {
              // 폭죽 애니메이션도 함께 중지
              setWinTrigger(false);
              setVictoryShrinking(true);
              setTimeout(() => {
                setVictoryVisible(false);
                setVictoryShrinking(false);
                setShowResult(false);

                // 오버레이가 완전히 닫힌 후 잔액 업데이트 + 코인 사운드 (1초 동안)
                if (pendingWinRef.current) {
                  const { totalPayout: tp, netProfit: np } = pendingWinRef.current;

                  // 잔액 업데이트
                  setBalance(prev => {
                    const newBal = prev + tp;
                    onBalanceChange?.(newBal);
                    localStorage.setItem('bitbattle_balance', newBal.toString());
                    return newBal;
                  });

                  // 오늘 손익 업데이트
                  setTodayPnl(prev => {
                    const newPnl = prev + np;
                    localStorage.setItem('bitbattle_todayPnl', newPnl.toString());
                    localStorage.setItem('bitbattle_todayPnlDate', new Date().toDateString());
                    return newPnl;
                  });

                  // 슬롯머신 코인 카운팅 사운드 재생 (1초 동안)
                  if (soundEnabled) {
                    const coinInterval = sounds.coinCount(soundVolume);
                    if (coinInterval) {
                      coinSoundIntervalRef.current = coinInterval;
                      setTimeout(() => {
                        if (coinSoundIntervalRef.current) {
                          clearInterval(coinSoundIntervalRef.current);
                          coinSoundIntervalRef.current = null;
                          sounds.coinCountEnd(soundVolume);
                        }
                      }, 1000);
                    }
                  }

                  pendingWinRef.current = null;
                }
              }, 300);
            }, 1500);
          } else {
            // 패배: 베팅금액은 이미 차감됨
            // 오늘 손익 업데이트 (패배)
            const newPnl = todayPnl - savedBet.betAmount;
            setTodayPnl(newPnl);
            localStorage.setItem('bitbattle_todayPnl', newPnl.toString());
            localStorage.setItem('bitbattle_todayPnlDate', new Date().toDateString());

            // 패배 사운드 재생
            playSound(sounds.lose);
            hapticNotification('error'); // 📳 패배 진동

            setTimeout(() => {
              showToast('lose', 'You Lost', savedBet.betAmount, 3000);
            }, 500);
          }

          // 베팅 정보 리셋
          prevBetRef.current = { userBet: null, betAmount: 0, round: 0 };
          setBetInput('$0');
          // game 객체의 베팅 상태도 리셋 (화면에 표시되는 "내 베팅" 카드 초기화)
          game.resetBet();
          // 베팅 알림 리셋
          betAlertShownRef.current = false;
        }
      }
    }

    // roadmapHistory 길이 업데이트
    prevRoadmapLengthRef.current = currentLength;

    // Cleanup timeout on unmount
    return () => {
      if (victoryTimeoutRef.current) {
        clearTimeout(victoryTimeoutRef.current);
      }
    };
  }, [game.roadmapHistory, game.currentRound, game.resetBet, showResult, balance, todayPnl, onBalanceChange, playSound, showToast, soundEnabled, soundVolume]);

  // 히스토리 업데이트 감지 - 새 결과 추가 시 애니메이션 트리거
  useEffect(() => {
    const currentLength = game.roadmapHistory.length;
    if (currentLength > prevHistoryLengthRef.current && prevHistoryLengthRef.current > 0) {
      // 새 히스토리가 추가됨
      const latestRound = game.roadmapHistory[currentLength - 1]?.round;
      if (latestRound) {
        setNewHistoryRound(latestRound);
        // 1초 후 애니메이션 상태 리셋
        setTimeout(() => setNewHistoryRound(null), 1000);
      }
    }
    prevHistoryLengthRef.current = currentLength;
  }, [game.roadmapHistory]);

  // 베팅 알림 (10초 남았을 때) - betAlertEnabled 설정에 따라
  useEffect(() => {
    if (betAlertEnabled && game.gamePhase === 'betting' && game.timeRemaining === 10 && !game.userBet && !betAlertShownRef.current) {
      betAlertShownRef.current = true;
      setShowBetAlert(true);
      playSound(sounds.click); // 알림음
      // 진동
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
      // 3초 후 자동 닫기
      setTimeout(() => setShowBetAlert(false), 3000);
    }
  }, [game.gamePhase, game.timeRemaining, game.userBet, playSound, betAlertEnabled]);

  // 베팅 기록을 localStorage에 저장 (지갑 주소 기반)
  useEffect(() => {
    if (walletAddress && game.betHistory.length > 0) {
      try {
        const storageKey = `bitbattle_history_${walletAddress}`;
        const existing = localStorage.getItem(storageKey);
        let allRecords: typeof game.betHistory = [];

        if (existing) {
          allRecords = JSON.parse(existing);
        }

        // 현재 세션의 새 기록만 추가 (중복 방지)
        const existingKeys = new Set(allRecords.map(r => `${r.round}-${r.timestamp}`));
        const newRecords = game.betHistory.filter(r => !existingKeys.has(`${r.round}-${r.timestamp}`));

        if (newRecords.length > 0) {
          allRecords = [...allRecords, ...newRecords];
          // 최대 1000개 기록 유지
          if (allRecords.length > 1000) {
            allRecords = allRecords.slice(-1000);
          }
          localStorage.setItem(storageKey, JSON.stringify(allRecords));
        }
      } catch (e) {
        console.error('Failed to save bet history:', e);
      }
    }
  }, [game.betHistory, walletAddress]);

  // 게임 중 배경음악 (30초 game 페이즈 동안) + 이펙트용 isCurrentlyWinning 상태 업데이트
  // 이기고 있으면 신나는 갤럽 음악, 지고 있으면 라흐마니노프 스타일 우울한 음악
  useEffect(() => {
    // 베팅이 있고 game 페이즈일 때만 음악 재생
    if (game.gamePhase === 'game' && prevBetRef.current.userBet && prevBetRef.current.betAmount > 0) {
      const userBet = prevBetRef.current.userBet;
      // 현재 이기고 있는지 확인
      const currentPrice = game.displayPrice;
      const basePrice = game.basePrice;
      const priceUp = currentPrice > basePrice;
      const isWinning = (userBet === 'bull' && priceUp) || (userBet === 'bear' && !priceUp);

      // 이펙트용 상태 업데이트
      setIsCurrentlyWinning(isWinning);

      // 음악 시작 (isWinning 상태에 따라)
      if (soundEnabled) {
        startGameMusic(isWinning, soundVolume);
      }
    } else {
      // game 페이즈 아니거나 베팅 없으면 음악 중지 및 이펙트 상태 리셋
      setIsCurrentlyWinning(false);
      stopGameMusic();
    }

    // cleanup: 컴포넌트 언마운트나 의존성 변경 시 음악 중지
    return () => {
      stopGameMusic();
    };
  }, [game.gamePhase, game.displayPrice, game.basePrice, soundEnabled, soundVolume]);

  // Countdown sound
  useEffect(() => {
    if (game.gamePhase === 'countdown' && game.timeRemaining <= 5) {
      playSound((vol) => sounds.countdown(game.timeRemaining, vol));
    }
  }, [game.gamePhase, game.timeRemaining, playSound]);

  // Base Price Reveal - countdown -> game 전환 시 표시
  useEffect(() => {
    if (game.gamePhase === 'game' && lastPhaseForRevealRef.current === 'countdown') {
      // 게임 시작! Base Price Reveal 표시
      setBaseRevealVisible(true);
      setBaseRevealShrinking(false);

      // 3초 후 축소 애니메이션 시작
      baseRevealTimeoutRef.current = setTimeout(() => {
        setBaseRevealShrinking(true);
        // 0.8초 후 완전히 숨김
        setTimeout(() => {
          setBaseRevealVisible(false);
          setBaseRevealShrinking(false);
        }, 800);
      }, 3000);
    }
    lastPhaseForRevealRef.current = game.gamePhase;

    return () => {
      if (baseRevealTimeoutRef.current) {
        clearTimeout(baseRevealTimeoutRef.current);
      }
    };
  }, [game.gamePhase]);

  // Base Reveal 닫기 함수
  const closeBaseReveal = useCallback(() => {
    if (baseRevealTimeoutRef.current) {
      clearTimeout(baseRevealTimeoutRef.current);
    }
    setBaseRevealShrinking(true);
    setTimeout(() => {
      setBaseRevealVisible(false);
      setBaseRevealShrinking(false);
    }, 300);
  }, []);

  // Use translations from global translations file
  const t = {
    yourBet: translations.betting.yourBet[lang],
    noPosition: translations.betting.noPosition[lang],
    potentialWin: translations.betting.potentialWin[lang],
    placeBet: translations.betting.placeBet[lang],
    priceUp: translations.betting.priceUp[lang],
    priceDown: translations.betting.priceDown[lang],
    sessionStats: translations.stats.sessionStats[lang],
    bullWins: translations.stats.bullWins[lang],
    bearWins: translations.stats.bearWins[lang],
    todayPnl: translations.stats.todayPnl[lang],
    totalRounds: translations.stats.totalRounds[lang],
    winRate: translations.stats.winRate[lang],
    cancel: translations.common.cancel[lang],
    minBet: translations.betting.minBet[lang],
    maxBet: translations.betting.maxBet[lang],
    balance: translations.common.balance[lang],
  };
  const result = game.priceChange > 0 ? 'bull' : game.priceChange < 0 ? 'bear' : 'tie';
  const userWon = game.userBet === result;

  // Theme colors
  const bgColor = isDarkMode ? '#0a0a0f' : '#f0f2f5';
  const cardColor = isDarkMode ? '#12121a' : '#ffffff';
  const cardBorder = isDarkMode ? 'border-white/5' : 'border-black/10';
  const textColor = isDarkMode ? 'text-white' : 'text-[#1a1a2e]';
  const mutedColor = isDarkMode ? 'text-gray-500' : 'text-gray-600';

  return (
    <div className={`h-[100dvh] font-['Rajdhani'] ${textColor} overflow-hidden transition-colors duration-300`} style={{ backgroundColor: bgColor, height: '100dvh', minHeight: '-webkit-fill-available' }}>
      {/* Background Grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: isDarkMode
            ? 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)'
            : 'linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* 레이아웃 컨테이너 - 반응형 풀스크린 */}
      <div
        ref={containerRef}
        className="relative z-10 flex flex-col w-full h-full"
      >
        {/* ============ HEADER ============ */}
        <header className={`flex items-center justify-between ${isMobile ? 'px-3 py-2.5 safe-area-inset-top' : 'px-4 md:px-6 lg:px-8 py-3'} backdrop-blur-md border-b ${cardBorder} flex-shrink-0`} style={{ backgroundColor: isDarkMode ? 'rgba(10,10,15,0.9)' : 'rgba(255,255,255,0.95)' }}>
          {/* Logo Section - 오비탈 로고 + BITBATTLE 그라데이션 효과 */}
          <div className={`flex items-center ${isMobile ? 'gap-2.5' : 'gap-4'}`}>
            {/* 오비탈 로고 - HTML과 동일 */}
            <div className={`relative ${isMobile ? 'w-[32px] h-[32px]' : 'w-[52px] h-[52px]'}`}>
              {/* 궤도들 */}
              <div className="absolute inset-0 rounded-full border-2 border-white/15 animate-[spin_8s_linear_infinite]" />
              <div className="absolute rounded-full border-2 border-white/15 animate-[spin_6s_linear_infinite_reverse]" style={{ width: '75%', height: '75%', top: '12.5%', left: '12.5%' }} />
              <div className="absolute rounded-full border-2 border-white/15 animate-[spin_4s_linear_infinite]" style={{ width: '50%', height: '50%', top: '25%', left: '25%' }} />
              {/* 중앙 BTC 아이콘 */}
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isMobile ? 'w-3.5 h-3.5 text-[9px]' : 'w-6 h-6 text-sm'} rounded-full flex items-center justify-center text-white font-black`}
                style={{
                  background: 'linear-gradient(135deg, #f7931a, #ffab40)',
                  boxShadow: '0 0 20px rgba(247, 147, 26, 0.6)',
                  animation: 'centerPulse 2s ease-in-out infinite'
                }}
              >
                ₿
              </div>
              {/* 궤도 위의 행성들 */}
              <div
                className={`absolute ${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full bg-[#22c55e] top-0 left-1/2 -translate-x-1/2`}
                style={{
                  boxShadow: '0 0 8px #22c55e',
                  animation: 'planetOrbit 3s linear infinite',
                  transformOrigin: isMobile ? '50% 16px' : '50% 26px'
                }}
              />
              <div
                className={`absolute ${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full bg-[#ef4444] bottom-0 left-1/2 -translate-x-1/2`}
                style={{
                  boxShadow: '0 0 8px #ef4444',
                  animation: 'planetOrbit 3s linear infinite',
                  animationDelay: '-1.5s',
                  transformOrigin: isMobile ? '50% -16px' : '50% -26px'
                }}
              />
            </div>
            {/* BITBATTLE 텍스트 - 그라데이션 애니메이션 효과 */}
            <span
              className={`font-['Orbitron'] font-black ${isMobile ? 'text-base tracking-[1.5px]' : 'text-[2rem] tracking-[3px]'}`}
              style={{
                background: 'linear-gradient(90deg, #22c55e, #fbbf24, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% auto',
                animation: 'logoShine 4s linear infinite'
              }}
            >
              BITBATTLE
            </span>
          </div>

          {/* Round Info - 40% 크기 증가 */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center ${isMobile ? 'gap-1.5 rounded-lg px-2 py-1' : 'gap-4 rounded-xl px-7 py-3'} border ${cardBorder}`} style={{ backgroundColor: cardColor }}>
              {/* 연결 상태 표시 - 연결 양호: 초록, 불량: 빨강 */}
              <div className={`${isMobile ? 'w-2 h-2' : 'w-4 h-4'} rounded-full ${game.isConnected ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`} style={{ boxShadow: game.isConnected ? '0 0 12px #22c55e' : '0 0 12px #ef4444', animation: 'pulse 1.5s infinite' }} />
              <div className="text-center">
                {/* 40% 증가: xs->base, xl->2xl */}
                <div className={`${isMobile ? 'text-[8px]' : 'text-base'} ${mutedColor} tracking-[2px]`}>ROUND</div>
                <div className={`font-['Orbitron'] font-black ${isMobile ? 'text-sm' : 'text-[1.75rem]'} text-[#fbbf24]`}>#{game.currentRound}</div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className={`flex items-center ${isMobile ? 'gap-1.5' : 'gap-3'}`}>
            {/* 잔고 표시 (지갑 연결 시) - 모바일에서 숨김 (햄버거 메뉴로 이동) */}
            {isWalletConnected && !isMobile && (
              <div
                className="flex items-center gap-2 px-4 h-12 rounded-xl border border-[#fbbf24]/15"
                style={{ background: `linear-gradient(135deg, ${cardColor}, rgba(251, 191, 36, 0.08))` }}
              >
                <span className="text-lg">💰</span>
                <span className={`text-sm ${mutedColor}`}>{t.balance}</span>
                <CountUp
                  value={balance}
                  enabled={effectSettings.countUp}
                  duration={1000}
                  prefix="$"
                  decimals={0}
                  className="font-['Orbitron'] font-bold text-base text-[#fbbf24]"
                />
              </div>
            )}
            {/* 소리 온/오프 + 볼륨바 - 데스크탑만 */}
            {!isMobile && (
              <div className="relative group">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-12 h-12 text-xl rounded-xl border ${cardBorder} flex items-center justify-center hover:border-[#a855f7] hover:-translate-y-0.5 transition-all ${soundEnabled ? 'text-[#22c55e]' : 'text-gray-500'}`}
                  style={{ backgroundColor: cardColor }}
                >
                  {soundEnabled ? '🔊' : '🔇'}
                </button>
                {/* 볼륨바 - 사운드 켜진 상태에서 hover시 나타남 */}
                {soundEnabled && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 z-50">
                    <div className="px-4 py-3 rounded-xl border border-white/10 shadow-xl" style={{ backgroundColor: cardColor }}>
                      <div className="flex items-center gap-3 w-[180px]">
                        <span className="text-sm">🔈</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={soundVolume * 100}
                          onChange={e => setSoundVolume(parseInt(e.target.value) / 100)}
                          className="flex-1 h-2 rounded-full appearance-none bg-white/20 accent-[#fbbf24] cursor-pointer"
                        />
                        <span className="font-['Orbitron'] text-xs text-[#fbbf24] w-8 text-right">{Math.round(soundVolume * 100)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* 언어/지갑 버튼 - 데스크탑만 (모바일은 햄버거 메뉴로 이동) */}
            {!isMobile && (
              <>
                <button
                  onClick={toggleLang}
                  className={`w-12 h-12 text-xl rounded-xl border ${cardBorder} flex items-center justify-center font-bold hover:border-[#a855f7] hover:-translate-y-0.5 transition-all`}
                  style={{ backgroundColor: cardColor }}
                  title={lang === 'ko' ? 'Switch to English' : '한국어로 변경'}
                >
                  {lang === 'ko' ? '🇰🇷' : '🇺🇸'}
                </button>
                <button
                  onClick={() => isWalletConnected ? disconnectWallet() : setWalletModalOpen(true)}
                  className={`px-7 py-3 text-base rounded-xl font-['Orbitron'] font-bold text-white tracking-wider hover:-translate-y-0.5 transition-all ${
                    isWalletConnected
                      ? 'bg-gradient-to-r from-[#166534] to-[#22c55e] hover:shadow-[0_10px_30px_rgba(34,197,94,0.4)]'
                      : 'bg-gradient-to-r from-[#a855f7] to-[#ec4899] hover:shadow-[0_10px_30px_rgba(168,85,247,0.4)]'
                  }`}
                >
                  {isWalletConnected ? walletAddress : 'CONNECT'}
                </button>
              </>
            )}
            {/* 모바일 햄버거 메뉴 버튼 */}
            {isMobile && (
              <button
                onClick={() => { playSound(sounds.click); setMenuOpen(!menuOpen); }}
                className="w-9 h-9 rounded-lg border flex flex-col items-center justify-center gap-[4px] hover:border-[#fbbf24] transition-all"
                style={{ backgroundColor: cardColor, borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <span className={`w-5 h-[2px] bg-white/80 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
                <span className={`w-5 h-[2px] bg-white/80 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`w-5 h-[2px] bg-white/80 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
              </button>
            )}
          </div>
        </header>

        {/* ============ GAME MODE TOGGLE - 풀너비 탭 스타일 ============ */}
        <div className={`w-full ${isMobile ? 'px-2 pt-0.5 pb-0.5' : 'px-4 pt-0.5 pb-0.5'}`}>
          <div
            className={`grid grid-cols-2 w-full ${isMobile ? 'p-0.5 rounded-lg gap-0.5' : 'p-1 rounded-xl gap-1'} border ${cardBorder}`}
            style={{ backgroundColor: cardColor }}
          >
            <button
              onClick={() => { playSound(sounds.click); setGameMode('direct'); }}
              className={`${isMobile ? 'py-2.5 text-xs' : 'py-3 text-sm'} rounded-lg font-['Orbitron'] font-bold transition-all ${
                gameMode === 'direct'
                  ? 'bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white shadow-lg'
                  : `${textColor} hover:bg-white/5`
              }`}
            >
              {translations.gameMode.directBetting[lang]}
            </button>
            <button
              onClick={() => { playSound(sounds.click); setGameMode('aiBattle'); }}
              className={`${isMobile ? 'py-2.5 text-xs' : 'py-3 text-sm'} rounded-lg font-['Orbitron'] font-bold transition-all ${
                gameMode === 'aiBattle'
                  ? 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white shadow-lg'
                  : `${textColor} hover:bg-white/5`
              }`}
            >
              {translations.gameMode.aiBattle[lang]}
            </button>
          </div>
        </div>

        {/* ============ MAIN CONTENT ============ */}
        {/* 반응형: 모바일 flex 세로 스택, 태블릿/데스크탑 65:35 그리드 (차트 65%, 베팅 35%) */}
        <main
          className={`flex-1 ${isMobile ? 'flex flex-col' : 'grid grid-cols-[65fr_35fr]'} gap-1 sm:gap-3 lg:gap-4 ${isMobile ? 'px-1 pt-0.5 pb-1' : 'p-3 lg:p-4'} overflow-hidden`}
        >
          {/* Left Section - Chart & Roadmap */}
          <div className={`flex flex-col gap-1 sm:gap-2 min-h-0 min-w-0 overflow-hidden`} style={isMobile ? { flex: '40 1 0%' } : {}}>
            {/* Chart Card */}
            <div className={`rounded-lg sm:rounded-xl border ${cardBorder} flex flex-col min-h-0 flex-1`} style={{ backgroundColor: cardColor }}>
              {/* Chart Header - 반응형 (모바일 10% 축소, 전체 10% 축소 + 패딩 20% 축소) */}
              <div className={`relative flex items-center justify-between ${isMobile ? 'px-1.5 py-0.5' : 'px-2 sm:px-3 lg:px-5 py-1.5 sm:py-2'} border-b ${cardBorder} flex-shrink-0`}>
                {/* Left: BTC Info + Price */}
                <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-6">
                  {/* BTC Icon + Label */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className={`${isMobile ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-xs sm:text-base lg:text-lg'} rounded-lg bg-gradient-to-br from-[#f7931a] to-[#ffab40] flex items-center justify-center text-white font-bold shadow-lg`}>₿</div>
                    <div className={isMobile ? 'hidden' : ''}>
                      <h3 className={`font-['Orbitron'] font-bold text-xs lg:text-base ${textColor}`}>BTC/USDT</h3>
                      <p className={`text-[9px] lg:text-[11px] ${mutedColor}`}>Real-time Price</p>
                    </div>
                  </div>
                  {/* Price Display - 반응형 (모바일 10% 축소) */}
                  <div className={`font-['Orbitron'] font-bold ${isMobile ? 'text-sm' : 'text-base sm:text-lg lg:text-[1.8rem]'} italic ${
                    game.gamePhase === 'game' || game.gamePhase === 'countdown'
                      ? (game.priceChange >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]')
                      : 'text-[#fbbf24]'
                  }`}>
                    ${game.displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Binance Badge - 우측 고정 (절대 위치) - 10% 축소 + 패딩 20% 축소 */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-y-1/2 items-center gap-1.5 px-4 py-2 rounded-full border-2 border-[#f3ba2f] bg-transparent">
                  <div className="w-5 h-5 rounded-full bg-[#f3ba2f] flex items-center justify-center text-black font-bold text-[11px]">₿</div>
                  <span className="font-['Orbitron'] text-[#f3ba2f] text-xs font-bold tracking-wide">Powered by BINANCE</span>
                </div>

                {/* Right: 연결점 + Phase Badge + Timer - 반응형 (10% 축소 + 패딩 20% 축소) */}
                <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-1.5 sm:gap-2 lg:gap-4'}`}>
                  {/* 연결 상태 점 */}
                  <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3'} rounded-full ${game.isConnected ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`} style={{ boxShadow: game.isConnected ? '0 0 10px #22c55e' : '0 0 10px #ef4444' }} />
                  {/* Phase Badge - 반응형 (10% 축소 + 패딩 20% 축소) */}
                  <div className={`${isMobile ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 sm:px-3 lg:px-5 py-1 sm:py-1.5 text-[11px] sm:text-xs'} rounded-full font-['Orbitron'] font-bold tracking-wider ${
                    game.gamePhase === 'countdown' ? 'bg-[#ef4444] text-white' :
                    'bg-[#22c55e] text-white'
                  }`}>
                    {game.gamePhase === 'betting' ? 'BETTING' :
                     game.gamePhase === 'countdown' ? 'LOCKING' :
                     game.gamePhase === 'game' ? 'LIVE' : 'RESULT'}
                  </div>
                  {/* Timer Box - 반응형 (10% 축소) */}
                  <div
                    className={`font-['Orbitron'] font-black ${isMobile ? 'text-base' : 'text-lg sm:text-xl lg:text-[1.8rem]'} rounded-lg flex items-center justify-center ${
                      game.gamePhase === 'countdown' ? 'bg-[#1a1a2e] border-2 border-[#ef4444] text-[#ef4444]' :
                      'bg-[#1a1a2e] border-2 border-[#22c55e] text-[#22c55e]'
                    }`}
                    style={{ width: isMobile ? '45px' : '80px', height: isMobile ? '25px' : '40px' }}
                  >
                    {game.timeRemaining}
                  </div>
                </div>
              </div>

              {/* Chart Container */}
              <div className="flex-1 relative min-h-0 rounded-lg">
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                />

                {/* Game Timer Overlay - 게임 진행 중에만 표시 (countdown 제외) */}
                {game.gamePhase === 'game' && (
                  <div className={`absolute ${isMobile ? 'top-2' : 'top-5'} left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10`}>
                    {/* Timer Circle - 모바일 50% 축소 */}
                    <div
                      className={`relative flex items-center justify-center ${isMobile ? 'w-[35px] h-[35px] border-2' : 'w-[70px] h-[70px] md:w-[80px] md:h-[80px] border-4'} rounded-full ${
                        game.timeRemaining <= 10
                          ? 'border-[#ef4444] animate-pulse'
                          : 'border-[#06b6d4]'
                      }`}
                      style={{
                        background: 'rgba(0,0,0,0.9)',
                        boxShadow: game.timeRemaining <= 10
                          ? '0 0 35px rgba(239,68,68,0.5)'
                          : '0 0 30px rgba(6,182,212,0.5), inset 0 0 20px rgba(6,182,212,0.1)',
                      }}
                    >
                      <div className={`font-['Orbitron'] font-black ${isMobile ? 'text-[1rem]' : 'text-[2rem] md:text-[2.2rem]'} ${
                        game.timeRemaining <= 10 ? 'text-[#ef4444]' : 'text-white'
                      }`}>
                        {game.timeRemaining}
                      </div>
                    </div>

                    {/* Progress Bar - 모바일 50% 축소 */}
                    <div className={`${isMobile ? 'w-[50px] h-[3px] mt-1.5' : 'w-[100px] md:w-[120px] h-[6px] mt-3'} rounded-[3px] overflow-hidden bg-white/10`}>
                      <div
                        className="h-full rounded-[3px] transition-all duration-1000"
                        style={{
                          width: `${((30 - game.timeRemaining) / 30) * 100}%`,
                          background: 'linear-gradient(90deg, #22c55e, #fbbf24, #ef4444)',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Last Bet Overlay - 베팅 마지막 3초 경고 (숫자만, NO MORE BET과 동일한 스타일) */}
                {game.gamePhase === 'betting' && game.timeRemaining <= 3 && game.timeRemaining > 0 && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center z-[15] rounded-lg pointer-events-none"
                    style={{ background: 'rgba(0,0,0,0.6)' }}
                  >
                    <div className={`font-['Orbitron'] font-black ${isMobile ? 'text-[4rem]' : 'text-[8rem]'} text-[#ef4444]`}>
                      {game.timeRemaining}
                    </div>
                    <div className={`font-['Orbitron'] ${isMobile ? 'text-sm mt-3 tracking-[3px]' : 'text-lg mt-6 tracking-[6px]'} text-gray-400`}>
                      LAST BET
                    </div>
                  </div>
                )}

                {/* Countdown Overlay (NO MORE BET) - 배경과 자연스럽게 연결 */}
                {game.gamePhase === 'countdown' && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center z-20 rounded-lg"
                    style={{
                      background: 'rgba(0,0,0,0.6)',
                    }}
                  >
                    <div className={`font-['Orbitron'] font-black ${isMobile ? 'text-[4rem]' : 'text-[8rem]'} text-[#ef4444]`}>
                      {game.timeRemaining}
                    </div>
                    <div className={`font-['Orbitron'] ${isMobile ? 'text-sm mt-3 tracking-[3px]' : 'text-lg mt-6 tracking-[6px]'} text-gray-400`}>
                      NO MORE BET
                    </div>
                  </div>
                )}

                {/* Base Price Reveal Overlay - 게임 시작 시 베이스 가격 공개 */}
                {baseRevealVisible && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center z-[100] cursor-pointer rounded-xl"
                    style={{
                      background: 'rgba(0,0,0,0.7)',
                      backdropFilter: 'blur(3px)',
                    }}
                    onClick={closeBaseReveal}
                  >
                    {/* Round Number - 모바일 50% 축소 */}
                    <div
                      className={`font-['Orbitron'] ${isMobile ? 'text-[0.5rem] mb-2' : 'text-[1rem] md:text-[1.5rem] mb-4'} font-bold text-[#fbbf24]`}
                      style={{
                        opacity: baseRevealShrinking ? 0 : 1,
                        animation: baseRevealShrinking ? 'baseRevealFadeOut 0.6s ease-in forwards' : 'baseRevealFadeIn 0.5s ease-out forwards'
                      }}
                    >
                      Round #{game.currentRound}
                    </div>

                    {/* BASE PRICE Label - 모바일 50% 축소 */}
                    <div
                      className={`font-['Orbitron'] ${isMobile ? 'text-[0.35rem] tracking-[2px] mb-1' : 'text-[0.7rem] md:text-[1rem] tracking-[4px] mb-2'} text-gray-400`}
                      style={{
                        opacity: baseRevealShrinking ? 0 : 1,
                        animation: baseRevealShrinking ? 'baseRevealFadeOut 0.6s ease-in forwards' : 'baseRevealFadeIn 0.5s ease-out 0.2s forwards'
                      }}
                    >
                      BASE PRICE
                    </div>

                    {/* Base Price Value - 모바일 50% 축소 */}
                    <div
                      className={`font-['Orbitron'] ${isMobile ? 'text-[1rem]' : 'text-[2rem] md:text-[3rem]'} font-black text-[#22c55e]`}
                      style={{
                        textShadow: '0 0 40px rgba(34,197,94,0.4)',
                        animation: baseRevealShrinking
                          ? 'baseRevealShrinkToChart 0.8s ease-in-out forwards'
                          : 'baseRevealPrice 0.8s ease-out 0.4s forwards',
                        opacity: baseRevealShrinking ? 1 : 0,
                      }}
                    >
                      ${game.basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    {/* GAME IS NOW LIVE Badge - 모바일 50% 축소 */}
                    <div
                      className={`flex items-center ${isMobile ? 'gap-1 mt-2 px-2 py-1' : 'gap-2 mt-4 px-4 py-2'} bg-[rgba(34,197,94,0.2)] border border-[#22c55e] rounded-full`}
                      style={{
                        opacity: baseRevealShrinking ? 0 : 1,
                        animation: baseRevealShrinking ? 'baseRevealFadeOut 0.6s ease-in forwards' : 'baseRevealFadeIn 0.5s ease-out 0.6s forwards'
                      }}
                    >
                      <div
                        className={`${isMobile ? 'w-1 h-1' : 'w-2 h-2'} bg-[#22c55e] rounded-full`}
                        style={{ animation: 'livePulse 1s infinite' }}
                      />
                      <span className={`font-['Orbitron'] ${isMobile ? 'text-[0.35rem] tracking-[1px]' : 'text-[0.7rem] tracking-[2px]'} text-[#22c55e]`}>
                        GAME IS NOW LIVE
                      </span>
                    </div>

                    {/* Tap to Close - 모바일 50% 축소 */}
                    <div
                      className={`absolute ${isMobile ? 'bottom-2' : 'bottom-5'} font-['Orbitron'] ${isMobile ? 'text-[0.3rem] tracking-[1px]' : 'text-[0.6rem] tracking-[2px]'} text-white/50`}
                      style={{ animation: 'tapBlink 1.5s infinite' }}
                    >
                      TAP TO CLOSE
                    </div>
                  </div>
                )}

                {/* Victory Overlay - 유저 승리 시 전체 화면 팝업 */}
                {victoryVisible && (
                  <div
                    className="fixed inset-0 flex flex-col items-center justify-center z-[900] cursor-pointer"
                    style={{
                      background: 'rgba(0,0,0,0.9)',
                      opacity: victoryShrinking ? 0 : 1,
                      transition: 'opacity 0.3s ease-out'
                    }}
                    onClick={closeVictoryOverlay}
                  >
                    {/* YOU WIN! 큰 텍스트 - 모바일 50% 축소 */}
                    {victoryWinAmount > 0 && (
                      <div
                        className={`font-['Orbitron'] font-black ${isMobile ? 'text-[1.75rem] mb-2' : 'text-[3.5rem] md:text-[5rem] mb-4'} text-white`}
                        style={{
                          textShadow: '0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.4)',
                          animation: 'winAmountPop 0.4s ease-out'
                        }}
                      >
                        🎉 YOU WIN! 🎉
                      </div>
                    )}

                    {/* Win Amount - 모바일 50% 축소 */}
                    {victoryWinAmount > 0 && (
                      <div
                        className={`font-['Orbitron'] font-black ${isMobile ? 'text-[1.5rem] mb-2' : 'text-[3rem] md:text-[4rem] mb-4'} text-[#fbbf24]`}
                        style={{
                          textShadow: '0 0 30px #fbbf24, 0 0 60px #fbbf24',
                          animation: 'winAmountPop 0.5s ease-out 0.1s both'
                        }}
                      >
                        +${victoryWinAmount.toFixed(2)}
                      </div>
                    )}

                    {/* Large Mascot - 모바일 50% 축소 */}
                    <div
                      className={`${isMobile ? 'text-[5rem]' : 'text-[10rem] md:text-[14rem]'}`}
                      style={{
                        color: victoryResult === 'bull' ? '#22c55e' : victoryResult === 'bear' ? '#ef4444' : '#fbbf24',
                        filter: `drop-shadow(0 0 ${isMobile ? '40px' : '80px'} ${victoryResult === 'bull' ? '#22c55e' : victoryResult === 'bear' ? '#ef4444' : '#fbbf24'})`,
                        animation: victoryShrinking
                          ? 'shrinkAway 0.8s ease-in forwards'
                          : 'victoryBounce 0.6s ease-out'
                      }}
                    >
                      {victoryResult === 'bull' ? '🐂' : victoryResult === 'bear' ? '🐻' : '🤝'}
                    </div>

                    {/* Victory Text - 모바일 50% 축소 */}
                    <div
                      className={`font-['Orbitron'] font-black ${isMobile ? 'text-[1rem] mt-2 tracking-[4px]' : 'text-[2rem] md:text-[2.5rem] mt-4 tracking-[8px]'} ${
                        victoryResult === 'bull' ? 'text-[#22c55e]' :
                        victoryResult === 'bear' ? 'text-[#ef4444]' :
                        'text-[#fbbf24]'
                      }`}
                      style={{
                        textShadow: `0 0 40px ${victoryResult === 'bull' ? '#22c55e' : victoryResult === 'bear' ? '#ef4444' : '#fbbf24'}`,
                        animation: 'victoryPulse 0.3s infinite'
                      }}
                    >
                      {victoryResult === 'bull' ? 'BULL WIN!' : victoryResult === 'bear' ? 'BEAR WIN!' : 'TIE!'}
                    </div>

                    {/* Round Details - 모바일 50% 축소 */}
                    <div
                      className={`font-['Orbitron'] ${isMobile ? 'text-[0.5rem] mt-1.5 tracking-[1px]' : 'text-[1rem] md:text-[1.1rem] mt-3 tracking-[2px]'} text-white/70`}
                    >
                      Round #{victoryRound} · ${victoryClosePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    {/* Tap to Close - 모바일 50% 축소 */}
                    <div
                      className={`absolute ${isMobile ? 'bottom-[25px]' : 'bottom-[50px]'} font-['Orbitron'] ${isMobile ? 'text-[0.4rem] tracking-[1px]' : 'text-[0.8rem] tracking-[2px]'} text-white/50`}
                      style={{ animation: 'tapBlink 1.5s infinite' }}
                    >
                      TAP TO CLOSE
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Roadmap Card - 데스크탑에서만 이 위치에 표시 (모바일은 별도 섹션) */}
            {!isMobile && (
            <div className={`rounded-lg sm:rounded-xl border ${cardBorder} p-4 flex-shrink-0`} style={{ backgroundColor: cardColor }}>
              <div className={`flex items-center justify-between ${isMobile ? 'mb-1.5' : 'mb-4'}`}>
                <div className="flex items-center gap-2">
                  <span className={`${isMobile ? 'text-sm' : 'text-xl'} font-bold ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>📊 HISTORY</span>
                </div>
                <div className="flex items-center gap-2 md:hidden">
                  <span className="text-[#f3ba2f] text-sm">₿</span>
                  <span className="text-[#f3ba2f] text-xs">BINANCE</span>
                </div>
                <div className={`flex items-center ${isMobile ? 'gap-3' : 'gap-5'}`}>
                  <span className={`text-[#22c55e] ${isMobile ? 'text-sm' : 'text-lg'}`}>🐂 <span className={`font-['Orbitron'] font-bold ${isMobile ? 'text-sm' : 'text-xl'}`}>{game.bullWins}</span></span>
                  <span className={`text-[#ef4444] ${isMobile ? 'text-sm' : 'text-lg'}`}>🐻 <span className={`font-['Orbitron'] font-bold ${isMobile ? 'text-sm' : 'text-xl'}`}>{game.bearWins}</span></span>
                </div>
              </div>

              {/* 로드맵 렌더링: 모바일에서 작은 DOT */}
              <div className="overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
                <div
                  className="grid gap-[2px]"
                  style={{
                    gridTemplateRows: isMobile ? 'repeat(4, 20px)' : 'repeat(6, 29px)',
                    gridAutoFlow: 'column',
                    gridAutoColumns: isMobile ? '20px' : '29px',
                    minWidth: 'fit-content',
                  }}
                >
                  {/* 모바일: 20열 x 4행, 데스크탑: 35열 x 6행 */}
                  {Array.from({ length: isMobile ? 20 : 35 }).flatMap((_, colIdx) =>
                    Array.from({ length: isMobile ? 4 : 6 }).map((_, rowIdx) => {
                      const cell = game.roadmapData[colIdx]?.[rowIdx] || null;
                      const dotSize = isMobile ? 'w-[20px] h-[20px]' : 'w-[29px] h-[29px]';
                      const fontSize = isMobile ? 'text-[0.4rem]' : 'text-[0.5rem]';
                      const isNewCell = cell && cell.round === newHistoryRound;
                      return (
                        <div
                          key={`${colIdx}-${rowIdx}`}
                          className={`rounded-full flex items-center justify-center font-['Orbitron'] font-bold transition-all ${
                            cell
                              ? cell.result === 'bull'
                                ? `${dotSize} bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white ${fontSize} shadow-[0_0_8px_rgba(34,197,94,0.4)] hover:scale-110 cursor-pointer`
                                : cell.result === 'bear'
                                ? `${dotSize} bg-gradient-to-br from-[#ef4444] to-[#dc2626] text-white ${fontSize} shadow-[0_0_8px_rgba(239,68,68,0.4)] hover:scale-110 cursor-pointer`
                                : `${dotSize} bg-gradient-to-br from-[#6B7280] to-[#4B5563] border-2 border-[#9CA3AF] text-white ${fontSize} shadow-[0_0_8px_rgba(107,114,128,0.4)] hover:scale-110 cursor-pointer`
                              : `${dotSize} ${isDarkMode ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-black/[0.02] border border-black/[0.06]'}`
                          }`}
                          style={isNewCell ? {
                            animation: 'historySlideIn 0.5s ease-out',
                          } : undefined}
                          title={cell ? `Round #${cell.round}: ${cell.result.toUpperCase()}` : undefined}
                          onClick={() => {
                            if (cell) {
                              playSound(sounds.click);
                              setSelectedRound(cell.round);
                              setRoundDetailOpen(true);
                            }
                          }}
                        >
                          {cell && !isMobile && cell.round}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
            )}
          </div>

          {/* 모바일 전용: 히스토리 섹션 (15% 영역) */}
          {isMobile && (
            <div className="rounded-lg border px-2 pt-1 pb-0.5 flex-shrink-0" style={{ backgroundColor: cardColor, borderColor: 'rgba(255,255,255,0.1)', flex: '12 1 0%' }}>
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white/80">📊 HISTORY</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-gray-500">powered by</span>
                  <span className="text-[#f3ba2f] text-[10px]">₿</span>
                  <span className="text-[#f3ba2f] text-[10px] font-semibold">BINANCE</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* BULL/BEAR 카운트는 웹과 동일하게 80개 기준 */}
                  <span className="text-[#22c55e] text-xs">🐂 <span className="font-['Orbitron'] font-bold text-xs">{game.bullWins}</span></span>
                  <span className="text-[#ef4444] text-xs">🐻 <span className="font-['Orbitron'] font-bold text-xs">{game.bearWins}</span></span>
                </div>
              </div>
              {/* 모바일 로드맵: 웹과 동일한 바카라 스타일 (roadmapData 사용) */}
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
                <div
                  className="grid gap-[1px]"
                  style={{
                    gridTemplateRows: 'repeat(4, 12px)',
                    gridAutoFlow: 'column',
                    gridAutoColumns: '12px',
                    minWidth: 'fit-content',
                  }}
                >
                  {/* 웹과 동일: roadmapData 사용, 모바일은 4행 */}
                  {Array.from({ length: game.roadmapData.length }).flatMap((_, colIdx) =>
                    Array.from({ length: 4 }).map((_, rowIdx) => {
                      const cell = game.roadmapData[colIdx]?.[rowIdx] || null;
                      const isNewCell = cell && cell.round === newHistoryRound;

                      return (
                        <div
                          key={`mobile-${colIdx}-${rowIdx}`}
                          className={`w-[12px] h-[12px] rounded-full flex items-center justify-center transition-all ${
                            cell
                              ? cell.result === 'bull'
                                ? 'bg-gradient-to-br from-[#22c55e] to-[#16a34a] shadow-[0_0_3px_rgba(34,197,94,0.4)] cursor-pointer'
                                : cell.result === 'bear'
                                ? 'bg-gradient-to-br from-[#ef4444] to-[#dc2626] shadow-[0_0_3px_rgba(239,68,68,0.4)] cursor-pointer'
                                : 'bg-gradient-to-br from-[#6B7280] to-[#4B5563] border border-[#9CA3AF] cursor-pointer'
                              : 'bg-white/[0.04] border border-white/[0.06]'
                          }`}
                          style={isNewCell ? { animation: 'historySlideIn 0.5s ease-out' } : undefined}
                          title={cell ? `Round #${cell.round}` : undefined}
                          onClick={() => {
                            if (cell) {
                              playSound(sounds.click);
                              setSelectedRound(cell.round);
                              setRoundDetailOpen(true);
                            }
                          }}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Right Section - Betting Panel - 반응형 (모바일: 33% 영역) */}
          <div className={`flex flex-col gap-1 sm:gap-2.5 min-h-0 min-w-0 overflow-hidden`} style={isMobile ? { flex: '48 1 0%' } : {}}>
            
            {/* ============ AI BATTLE MODE ============ */}
            {gameMode === 'aiBattle' ? (
              <AIBattleMode
                balance={balance}
                gamePhase={game.gamePhase}
                timeRemaining={game.timeRemaining}
                currentRound={game.currentRound}
                recentResults={game.roadmapHistory.slice(-10).map(r => r.result)}
                priceChange={game.priceChange}
                lastRoundResult={lastRoundResult}
                isDarkMode={isDarkMode}
                isMobile={isMobile}
                followState={followState}
                onStartFollow={(botId, betPerRound) => {
                  if (betPerRound > balance) {
                    showToast('warning', lang === 'ko' ? '잔액이 부족합니다' : 'Insufficient balance');
                    return;
                  }
                  setFollowState({ botId, betPerRound });
                  playSound(sounds.placeBet);
                  hapticImpact('medium');
                  const bot = AI_BOTS.find(b => b.id === botId);
                  showToast('info', lang === 'ko' 
                    ? `🤖 ${bot?.name} 팔로우 시작! $${betPerRound}/라운드` 
                    : `🤖 Following ${bot?.name}! $${betPerRound}/round`);
                }}
                onStopFollow={() => {
                  setFollowState(null);
                  setFollowBetPlaced(false);
                  followBetRef.current = null;
                  playSound(sounds.cancelBet);
                  showToast('info', lang === 'ko' ? '팔로우가 중단되었습니다' : 'Follow stopped');
                }}
                botStates={botStates}
                playSound={playSound}
              />
            ) : (
            /* ============ DIRECT BETTING MODE ============ */
            <>
            {/* Current Bet Card - 모바일: 확장 버전 (50-60% 확대) */}
            {isMobile ? (
              <div
                className={`relative rounded-lg overflow-hidden ${
                  game.userBet === 'bull' ? 'border border-[#22c55e]/60' :
                  game.userBet === 'bear' ? 'border border-[#ef4444]/60' :
                  'border border-white/10'
                }`}
                style={{
                  padding: '6px 10px',
                  background: game.userBet
                    ? `linear-gradient(135deg, ${game.userBet === 'bull' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}, ${cardColor})`
                    : `linear-gradient(135deg, ${cardColor}, #1a1a24)`,
                  boxShadow: game.userBet
                    ? `0 0 10px ${game.userBet === 'bull' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`
                    : 'none',
                }}
              >
                <div className="flex items-center justify-between">
                  {/* Left: 이모지 + 베팅금액 */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl">
                      {game.userBet ? (game.userBet === 'bull' ? '🐂' : '🐻') : '➖'}
                    </span>
                    <div className={`font-['Orbitron'] font-bold text-lg ${
                      game.userBet === 'bull' ? 'text-[#22c55e]' :
                      game.userBet === 'bear' ? 'text-[#ef4444]' :
                      mutedColor
                    }`}>
                      ${game.betAmount.toLocaleString()}
                    </div>
                    {/* Cancel 버튼 - 베팅 페이즈에서만 */}
                    {game.userBet && game.gamePhase === 'betting' && (
                      <button
                        onClick={handleCancelBet}
                        className="w-5 h-5 rounded bg-[#ef4444]/20 border border-[#ef4444]/50 text-[#ef4444] text-[10px] font-bold active:scale-95 flex items-center justify-center ml-0.5"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Right: 예상 수익 라벨 + 금액 */}
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] text-white/50 tracking-wider">{t.potentialWin}</span>
                    <div className="font-['Orbitron'] font-bold text-base text-[#fbbf24]">
                      ${(game.betAmount * game.PAYOUT_MULTIPLIER).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* 데스크탑 풀 버전 */
              <div
                className={`relative rounded-xl ${
                  game.userBet === 'bull' ? 'border-2 border-[#22c55e]' :
                  game.userBet === 'bear' ? 'border-2 border-[#ef4444]' :
                  'border border-white/10'
                }`}
                style={{
                  padding: '12px 14px 14px',
                  background: game.userBet
                    ? `linear-gradient(135deg, ${cardColor}, ${game.userBet === 'bull' ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)'})`
                    : `linear-gradient(135deg, ${cardColor}, #1a1a24)`,
                  boxShadow: game.userBet
                    ? `0 0 25px ${game.userBet === 'bull' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}, inset 0 0 30px ${game.userBet === 'bull' ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)'}`
                    : 'none'
                }}
              >
                {/* 상단 그라데이션 라인 */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-50"
                  style={{
                    background: game.userBet
                      ? `linear-gradient(90deg, transparent, ${game.userBet === 'bull' ? '#22c55e' : '#ef4444'}, transparent)`
                      : 'linear-gradient(90deg, transparent, #64748b, transparent)'
                  }}
                />
                {/* Header */}
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-[1rem] ${mutedColor} tracking-[2px] font-semibold`}>{t.yourBet}</span>
                  <div className={`flex items-center gap-1.5 font-['Orbitron'] text-[1rem] font-black ${
                    game.userBet === 'bull' ? 'text-[#22c55e]' :
                    game.userBet === 'bear' ? 'text-[#ef4444]' :
                    mutedColor
                  }`}>
                    {game.userBet ? (
                      <>
                        <span className="text-xl">{game.userBet === 'bull' ? '🐂' : '🐻'}</span>
                        <span>{game.userBet.toUpperCase()}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">➖</span>
                        <span>{t.noPosition}</span>
                      </>
                    )}
                  </div>
                </div>
                {/* Body */}
                <div className="flex justify-between items-center">
                  <div className={`font-['Orbitron'] font-black text-[2rem] ${textColor}`}>
                    ${game.betAmount.toLocaleString()}
                  </div>
                  <div className="text-right">
                    <div className={`text-[0.8rem] ${mutedColor}`}>{t.potentialWin}</div>
                    <div className="font-['Orbitron'] font-bold text-[1.35rem] text-[#fbbf24]">
                      ${(game.betAmount * game.PAYOUT_MULTIPLIER).toFixed(2)}
                    </div>
                  </div>
                </div>
                {/* Cancel Button */}
                <div className="mt-3 h-[42px]">
                  {game.userBet && game.gamePhase === 'betting' ? (
                    <button
                      onClick={handleCancelBet}
                      className="w-full h-full py-2.5 rounded-lg bg-[#ef4444]/15 border border-[#ef4444] text-[#ef4444] font-['Orbitron'] text-[0.8rem] font-semibold hover:bg-[#ef4444]/30 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>✕</span>
                      <span>{t.cancel}</span>
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            {/* Betting Card - 모바일 컴팩트 (30% 축소) */}
            <div className={`rounded-lg sm:rounded-xl border ${cardBorder}`} style={{ padding: isMobile ? '6px 10px' : '18px 18px', backgroundColor: cardColor }}>
              {/* Title - 모바일에서 숨김 */}
              {!isMobile && (
                <div className={`font-['Orbitron'] text-[1.1rem] tracking-[2px] ${mutedColor} mb-3 text-center font-semibold`}>
                  💰 {t.placeBet}
                </div>
              )}

              {/* 베팅 금액 입력 - 모바일에서 30% 축소 */}
              <div
                className={`w-full ${isMobile ? 'py-1 px-2' : 'py-3 px-4'} rounded-lg border-2 border-white/10 text-center font-['Orbitron'] ${isMobile ? 'text-base' : 'text-[1.7rem]'} font-bold ${textColor} ${isMobile ? 'mb-1' : 'mb-3'} focus-within:border-[#a855f7] transition-colors`}
                style={{ backgroundColor: bgColor }}
              >
                ${parseBetValue(betInput).toLocaleString()}
              </div>

              {/* Preset Buttons - REPEAT/x2와 동일한 크기 */}
              <div className={`grid ${isMobile ? 'gap-1 mb-1' : 'gap-2 mb-2'}`} style={{ gridTemplateColumns: '0.6fr 1fr 1fr 1fr 1fr' }}>
                <button
                  onClick={() => handlePreset('clear')}
                  className={`${isMobile ? 'py-0.5' : 'py-2'} rounded-[8px] font-['Orbitron'] ${isMobile ? 'text-[10px]' : 'text-[0.95rem]'} font-semibold transition-all active:scale-95 hover:-translate-y-0.5`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.1))',
                    border: '1px solid #ef4444',
                    color: '#ef4444'
                  }}
                  disabled={game.gamePhase !== 'betting'}
                >
                  C
                </button>
                {['10', '100', '1000'].map(val => (
                  <button
                    key={val}
                    onClick={() => handlePreset(val)}
                    className={`${isMobile ? 'py-0.5' : 'py-2'} rounded-[8px] font-['Orbitron'] ${isMobile ? 'text-[10px]' : 'text-[0.95rem]'} font-semibold transition-all active:scale-95 hover:-translate-y-0.5 hover:border-[#a855f7] hover:text-[#a855f7] hover:bg-[rgba(168,85,247,0.15)]`}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: isDarkMode ? '#fff' : '#1a1a2e'
                    }}
                    disabled={game.gamePhase !== 'betting'}
                  >
                    +${val === '1000' ? '1K' : val}
                  </button>
                ))}
                <button
                  onClick={() => handlePreset('max')}
                  className={`${isMobile ? 'py-0.5' : 'py-2'} rounded-[8px] font-['Orbitron'] ${isMobile ? 'text-[10px]' : 'text-[0.95rem]'} font-semibold transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.1))',
                    border: '1px solid #fbbf24',
                    color: '#fbbf24'
                  }}
                  disabled={game.gamePhase !== 'betting'}
                >
                  MAX
                </button>
              </div>

              {/* Quick Repeat Buttons - REPEAT / x2 - 모바일에서 30% 축소 */}
              <div className={`grid grid-cols-2 ${isMobile ? 'gap-1 mb-1' : 'gap-2 mb-2'}`}>
                <button
                  onClick={handleRepeatBet}
                  disabled={game.gamePhase !== 'betting' || !lastCompletedBet.side || lastCompletedBet.amount <= 0}
                  className={`${isMobile ? 'py-0.5 text-[10px]' : 'py-2 text-[0.95rem]'} rounded-[8px] font-['Orbitron'] font-semibold transition-all active:scale-95 hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed`}
                  style={{
                    background: lastCompletedBet.side === 'bull'
                      ? 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.08))'
                      : lastCompletedBet.side === 'bear'
                        ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08))'
                        : 'rgba(255,255,255,0.04)',
                    border: lastCompletedBet.side === 'bull'
                      ? '1px solid rgba(34,197,94,0.5)'
                      : lastCompletedBet.side === 'bear'
                        ? '1px solid rgba(239,68,68,0.5)'
                        : '1px solid rgba(255,255,255,0.08)',
                    color: lastCompletedBet.side === 'bull'
                      ? '#22c55e'
                      : lastCompletedBet.side === 'bear'
                        ? '#ef4444'
                        : isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
                  }}
                  title={lastCompletedBet.side ? `${lastCompletedBet.side.toUpperCase()} $${lastCompletedBet.amount}` : ''}
                >
                  🔄 REPEAT {lastCompletedBet.amount > 0 ? `$${lastCompletedBet.amount}` : ''}
                </button>
                <button
                  onClick={handleDoubleBet}
                  disabled={game.gamePhase !== 'betting' || !lastCompletedBet.side || lastCompletedBet.amount <= 0}
                  className={`${isMobile ? 'py-0.5 text-[10px]' : 'py-2 text-[0.95rem]'} rounded-[8px] font-['Orbitron'] font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed`}
                  style={{
                    background: lastCompletedBet.side === 'bull'
                      ? 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.08))'
                      : lastCompletedBet.side === 'bear'
                        ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08))'
                        : 'rgba(255,255,255,0.04)',
                    border: lastCompletedBet.side === 'bull'
                      ? '1px solid rgba(34,197,94,0.5)'
                      : lastCompletedBet.side === 'bear'
                        ? '1px solid rgba(239,68,68,0.5)'
                        : '1px solid rgba(255,255,255,0.08)',
                    color: lastCompletedBet.side === 'bull'
                      ? '#22c55e'
                      : lastCompletedBet.side === 'bear'
                        ? '#ef4444'
                        : isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
                  }}
                  title={lastCompletedBet.side ? `${lastCompletedBet.side.toUpperCase()} $${lastCompletedBet.amount * 2}` : ''}
                >
                  ⚡ x2 {lastCompletedBet.amount > 0 ? `$${Math.min(lastCompletedBet.amount * 2, 10000)}` : ''}
                </button>
              </div>

              {/* Range Text - 모바일에서 숨김 */}
              {!isMobile && (
                <div className={`flex justify-between text-[1rem] ${mutedColor} mb-3 px-1`}>
                  <span>{t.minBet}</span>
                  <span>{t.maxBet}</span>
                </div>
              )}

              {/* Action Buttons - 모바일에서 30% 축소 */}
              <div className={`grid grid-cols-2 ${isMobile ? 'gap-1.5' : 'gap-2 sm:gap-2.5'}`}>
                <button
                  onClick={() => handlePlaceBet('bull')}
                  disabled={game.gamePhase !== 'betting' || parseBetValue(betInput) <= 0}
                  className={`relative rounded-xl sm:rounded-[14px] border-2 sm:border-[3px] border-[rgba(34,197,94,0.3)] flex flex-col items-center justify-center gap-0 sm:gap-1 transition-all duration-300 disabled:opacity-35 disabled:cursor-not-allowed overflow-hidden group active:scale-95 hover:-translate-y-1 hover:scale-[1.03] hover:border-[#22c55e] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] ${game.gamePhase === 'betting' && game.timeRemaining <= 5 && game.timeRemaining > 0 ? 'animate-[urgentBlink_0.4s_ease-in-out_infinite]' : ''}`}
                  style={{
                    padding: isMobile ? '6px 6px 4px' : '14px 12px 12px',
                    background: 'linear-gradient(145deg, #14532d, #166534, #22c55e)',
                    boxShadow: '0 8px 32px rgba(34,197,94,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <span className={`absolute ${isMobile ? 'top-1 right-1' : 'top-1.5 right-1.5 sm:top-2 sm:right-2'} font-['Orbitron'] text-[8px] sm:text-xs font-bold text-white/80 bg-black/30 px-1 py-0.5 rounded`}>
                    x{game.PAYOUT_MULTIPLIER}
                  </span>
                  <span className={`${isMobile ? 'text-2xl' : 'text-3xl sm:text-4xl lg:text-5xl'} filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] group-hover:scale-110 transition-transform`}>🐂</span>
                  <span className={`font-['Orbitron'] font-black ${isMobile ? 'text-sm' : 'text-lg sm:text-xl lg:text-[1.95rem]'} text-white`}>BULL</span>
                  <span className={`${isMobile ? 'text-[10px]' : 'text-xs sm:text-sm lg:text-[0.97rem]'} opacity-70 text-white`}>{t.priceUp}</span>
                </button>
                <button
                  onClick={() => handlePlaceBet('bear')}
                  disabled={game.gamePhase !== 'betting' || parseBetValue(betInput) <= 0}
                  className={`relative rounded-xl sm:rounded-[14px] border-2 sm:border-[3px] border-[rgba(239,68,68,0.3)] flex flex-col items-center justify-center gap-0 sm:gap-1 transition-all duration-300 disabled:opacity-35 disabled:cursor-not-allowed overflow-hidden group active:scale-95 hover:-translate-y-1 hover:scale-[1.03] hover:border-[#ef4444] hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] ${game.gamePhase === 'betting' && game.timeRemaining <= 5 && game.timeRemaining > 0 ? 'animate-[urgentBlink_0.4s_ease-in-out_infinite]' : ''}`}
                  style={{
                    padding: isMobile ? '6px 6px 4px' : '14px 12px 12px',
                    background: 'linear-gradient(145deg, #7f1d1d, #991b1b, #ef4444)',
                    boxShadow: '0 8px 32px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <span className={`absolute ${isMobile ? 'top-1 right-1' : 'top-1.5 right-1.5 sm:top-2 sm:right-2'} font-['Orbitron'] text-[8px] sm:text-xs font-bold text-white/80 bg-black/30 px-1 py-0.5 rounded`}>
                    x{game.PAYOUT_MULTIPLIER}
                  </span>
                  <span className={`${isMobile ? 'text-2xl' : 'text-3xl sm:text-4xl lg:text-5xl'} filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] group-hover:scale-110 transition-transform`}>🐻</span>
                  <span className={`font-['Orbitron'] font-black ${isMobile ? 'text-sm' : 'text-lg sm:text-xl lg:text-[1.95rem]'} text-white`}>BEAR</span>
                  <span className={`${isMobile ? 'text-[10px]' : 'text-xs sm:text-sm lg:text-[0.97rem]'} opacity-70 text-white`}>{t.priceDown}</span>
                </button>
              </div>
            </div>

            {/* Stats Card - 모바일에서 숨김, 데스크탑에서만 표시 */}
            <div className={`rounded-xl border ${cardBorder} flex-1 flex-col ${isMobile ? 'hidden' : 'flex'}`} style={{ padding: '6px 12px', backgroundColor: cardColor }}>
              {/* Title */}
              <div className={`font-['Orbitron'] text-[1.15rem] tracking-[2px] ${mutedColor} flex items-center gap-1.5 font-semibold`}>
                📈 {t.sessionStats}
              </div>

              {/* 빈 줄 */}
              <div className="h-4" />

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-1">
                <div className="rounded-[7px] p-1 text-center border border-white/[0.03] hover:border-white/[0.08] hover:-translate-y-0.5 transition-all" style={{ backgroundColor: bgColor }}>
                  <div className={`text-[0.98rem] ${mutedColor} tracking-wider`}>{t.bullWins}</div>
                  <div className="font-['Orbitron'] font-bold text-[1.85rem] text-[#22c55e]">{game.bullWins}</div>
                </div>
                <div className="rounded-[7px] p-1 text-center border border-white/[0.03] hover:border-white/[0.08] hover:-translate-y-0.5 transition-all" style={{ backgroundColor: bgColor }}>
                  <div className={`text-[0.98rem] ${mutedColor} tracking-wider`}>{t.bearWins}</div>
                  <div className="font-['Orbitron'] font-bold text-[1.85rem] text-[#ef4444]">{game.bearWins}</div>
                </div>
                <div className="rounded-[7px] p-1 text-center border border-white/[0.03] hover:border-white/[0.08] hover:-translate-y-0.5 transition-all" style={{ backgroundColor: bgColor }}>
                  <div className={`text-[0.98rem] ${mutedColor} tracking-wider`}>{t.todayPnl}</div>
                  <div className={`font-['Orbitron'] font-bold text-[1.85rem] ${todayPnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                    <CountUp
                      value={Math.abs(todayPnl)}
                      enabled={effectSettings.countUp}
                      prefix={todayPnl >= 0 ? '+$' : '-$'}
                      decimals={2}
                    />
                  </div>
                </div>
                <div className="rounded-[7px] p-1 text-center border border-white/[0.03] hover:border-white/[0.08] hover:-translate-y-0.5 transition-all" style={{ backgroundColor: bgColor }}>
                  <div className={`text-[0.98rem] ${mutedColor} tracking-wider`}>{t.totalRounds}</div>
                  <div className={`font-['Orbitron'] font-bold text-[1.85rem] ${textColor}`}>{game.bullWins + game.bearWins}</div>
                </div>
              </div>

              {/* 빈 줄 */}
              <div className="h-4" />

              {/* 승률 Bar */}
              <div className="pt-1 border-t border-white/5 w-full">
                <div className={`flex justify-between text-[0.98rem] ${mutedColor} mb-0.5 tracking-wider w-full`}>
                  <span>{t.winRate}</span>
                  <span className="font-['Orbitron']">
                    {game.bullWins + game.bearWins > 0 ? Math.round((game.bullWins / (game.bullWins + game.bearWins)) * 100) : 50}% / {game.bullWins + game.bearWins > 0 ? Math.round((game.bearWins / (game.bullWins + game.bearWins)) * 100) : 50}%
                  </span>
                </div>
                {/* 승률 바 */}
                <div className="h-2.5 rounded-[5px] overflow-hidden flex w-full" style={{ backgroundColor: bgColor, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)' }}>
                  <div
                    className="rounded-l-[5px] transition-all duration-500"
                    style={{
                      width: `${game.bullWins + game.bearWins > 0 ? (game.bullWins / (game.bullWins + game.bearWins)) * 100 : 50}%`,
                      background: 'linear-gradient(90deg, #16a34a, #22c55e, #4ade80)'
                    }}
                  />
                  <div
                    className="rounded-r-[5px] transition-all duration-500"
                    style={{
                      width: `${game.bullWins + game.bearWins > 0 ? (game.bearWins / (game.bullWins + game.bearWins)) * 100 : 50}%`,
                      background: 'linear-gradient(90deg, #f87171, #ef4444, #dc2626)'
                    }}
                  />
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        </main>
      </div>

      {/* ============ MENU ============ */}
      {/* 배경 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-[898] transition-all duration-300 ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* 모바일: 우측 사이드 드로어 */}
      {isMobile ? (
        <div
          className={`fixed top-0 right-0 h-full w-[240px] z-[899] transition-transform duration-300 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ backgroundColor: isDarkMode ? '#0a0a0f' : '#ffffff' }}
        >
          {/* 드로어 헤더 */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <span className="font-['Orbitron'] font-bold text-sm text-[#fbbf24]">MENU</span>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-8 h-8 rounded-md flex items-center justify-center text-white/50 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* 지갑 연결 섹션 */}
          <div className="px-4 py-3 border-b border-white/10">
            <button
              onClick={() => {
                playSound(sounds.click);
                if (isWalletConnected) {
                  disconnectWallet();
                } else {
                  setWalletModalOpen(true);
                }
                setMenuOpen(false);
              }}
              className={`w-full py-2.5 rounded-lg font-['Orbitron'] font-bold text-sm text-white transition-all ${
                isWalletConnected
                  ? 'bg-gradient-to-r from-[#166534] to-[#22c55e]'
                  : 'bg-gradient-to-r from-[#a855f7] to-[#ec4899]'
              }`}
            >
              {isWalletConnected ? `🔗 ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '🔗 CONNECT WALLET'}
            </button>
            {isWalletConnected && (
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-xs text-white/50">{lang === 'ko' ? '잔액' : 'Balance'}</span>
                <span className="font-['Orbitron'] font-bold text-sm text-[#fbbf24]">${balance.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* 언어 변경 */}
          <div className="px-4 py-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">🌐 {lang === 'ko' ? '언어' : 'Language'}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => { playSound(sounds.click); setLang('ko'); }}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${lang === 'ko' ? 'bg-[#fbbf24] text-black' : 'bg-white/10 text-white/60'}`}
                >
                  한국어
                </button>
                <button
                  onClick={() => { playSound(sounds.click); setLang('en'); }}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${lang === 'en' ? 'bg-[#fbbf24] text-black' : 'bg-white/10 text-white/60'}`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          {/* 메뉴 아이템 */}
          <div className="flex flex-col py-2">
            {[
              { icon: '📈', label: lang === 'ko' ? '내 통계' : 'My Stats', onClick: () => { setStatsOpen(true); setMenuOpen(false); } },
              { icon: '⚙️', label: lang === 'ko' ? '설정' : 'Settings', onClick: () => { setSettingsOpen(true); setMenuOpen(false); } },
              { icon: '❓', label: lang === 'ko' ? '플레이 방법' : 'How to Play', onClick: () => { setHowToOpen(true); setMenuOpen(false); } },
              { icon: '📊', label: lang === 'ko' ? '게임 기록' : 'Game History', onClick: () => {
                if (isWalletConnected) {
                  setHistoryOpen(true);
                } else {
                  showToast('warning', lang === 'ko' ? '지갑을 먼저 연결해주세요' : 'Please connect wallet first');
                  setWalletModalOpen(true);
                }
                setMenuOpen(false);
              } },
              { icon: '🏆', label: lang === 'ko' ? '리더보드' : 'Leaderboard', onClick: () => { setMenuOpen(false); }, disabled: true },
              { icon: '💬', label: lang === 'ko' ? '채팅' : 'Chat', onClick: () => { setMenuOpen(false); }, disabled: true },
            ].map((item, i) => (
              <button
                key={i}
                className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${item.disabled ? 'opacity-40' : 'hover:bg-white/5 active:bg-white/10'}`}
                onClick={() => { if (!item.disabled) { playSound(sounds.click); item.onClick(); } }}
                disabled={item.disabled}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`font-['Rajdhani'] text-sm font-medium ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
                  {item.label}
                  {item.disabled && <span className="ml-2 text-[10px] text-white/30">(Coming Soon)</span>}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* 데스크탑: 기존 FAB 스타일 메뉴 */
        <>
          <div className={`fixed bottom-[100px] right-[30px] flex flex-col gap-3 z-[899] transition-all duration-300 ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            {[
              { icon: '🏆', label: lang === 'ko' ? '리더보드' : 'Leaderboard', onClick: () => { setMenuOpen(false); } },
              { icon: '📈', label: lang === 'ko' ? '내 통계' : 'My Stats', onClick: () => { setStatsOpen(true); setMenuOpen(false); } },
              { icon: '💬', label: lang === 'ko' ? '채팅' : 'Chat', onClick: () => { setMenuOpen(false); } },
              { icon: '⚙️', label: lang === 'ko' ? '설정' : 'Settings', onClick: () => { setSettingsOpen(true); setMenuOpen(false); } },
              { icon: '❓', label: lang === 'ko' ? '플레이 방법' : 'How to Play', onClick: () => { setHowToOpen(true); setMenuOpen(false); } },
              { icon: '📊', label: lang === 'ko' ? '게임 기록' : 'Game History', onClick: () => {
                if (isWalletConnected) {
                  setHistoryOpen(true);
                } else {
                  showToast('warning', lang === 'ko' ? '지갑을 먼저 연결해주세요' : 'Please connect wallet first');
                  setWalletModalOpen(true);
                }
                setMenuOpen(false);
              } },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-end gap-3 cursor-pointer"
                onClick={() => { playSound(sounds.click); item.onClick(); }}
                style={{
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? 'translateY(0) translateX(0)' : 'translateY(20px) translateX(20px)',
                  transition: `all 0.3s ease ${(i + 1) * 50}ms`,
                }}
              >
                <span
                  className="px-[14px] py-2 rounded-lg font-['Orbitron'] text-[0.75rem] font-semibold whitespace-nowrap"
                  style={{
                    background: isDarkMode ? '#12121a' : '#ffffff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: isDarkMode ? '#ffffff' : '#1a1a2e',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  }}
                >
                  {item.label}
                </span>
                <div
                  className="w-[46px] h-[46px] rounded-full flex items-center justify-center text-[1.2rem] transition-all duration-200 hover:scale-110 hover:border-[#fbbf24] hover:shadow-[0_4px_20px_rgba(251,191,36,0.3)]"
                  style={{
                    background: isDarkMode ? '#12121a' : '#ffffff',
                    border: '2px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  }}
                >
                  {item.icon}
                </div>
              </div>
            ))}
          </div>

          {/* FAB 버튼 - 데스크탑에서만 */}
          <button
            onClick={() => { playSound(sounds.click); setMenuOpen(!menuOpen); }}
            className={`fixed bottom-[30px] right-[30px] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 z-[900] ${menuOpen ? 'rotate-45' : ''}`}
            style={{
              background: isDarkMode ? '#12121a' : '#ffffff',
              border: '2px solid transparent',
              backgroundImage: `linear-gradient(${isDarkMode ? '#12121a' : '#ffffff'}, ${isDarkMode ? '#12121a' : '#ffffff'}), linear-gradient(135deg, #fbbf24, #22c55e)`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 20px rgba(251,191,36,0.3)',
            }}
          >
            {!menuOpen && (
              <span
                className="absolute w-full h-full rounded-full border-2 border-[#fbbf24] pointer-events-none"
                style={{ animation: 'menuPulse 2s ease-out infinite' }}
              />
            )}
            <span
              className="text-xl font-bold transition-all"
              style={{
                color: '#fbbf24',
                textShadow: '0 0 10px #fbbf24, 0 0 20px rgba(251,191,36,0.5)',
              }}
            >
              {menuOpen ? '✕' : '+'}
            </span>
          </button>
        </>
      )}

      {/* ============ MODALS ============ */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        soundVolume={soundVolume}
        setSoundVolume={setSoundVolume}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        lang={lang}
        setLang={setLang}
        betAlertEnabled={betAlertEnabled}
        setBetAlertEnabled={setBetAlertEnabled}
        effectSettings={effectSettings}
        setEffectSettings={setEffectSettings}
      />

      <HistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        betHistory={game.betHistory}
        lang={lang}
        walletAddress={walletAddress}
      />

      <StatsModal
        isOpen={statsOpen}
        onClose={() => setStatsOpen(false)}
        bullWins={game.bullWins}
        bearWins={game.bearWins}
        todayPnl={todayPnl}
        winStreak={game.winStreak}
        betHistory={game.betHistory}
        lang={lang}
      />

      <HowToPlayModal
        isOpen={howToOpen}
        onClose={() => setHowToOpen(false)}
        lang={lang}
      />

      {/* Round Detail Modal */}
      <RoundDetailModal
        isOpen={roundDetailOpen}
        roundNum={selectedRound}
        roadmapHistory={game.roadmapHistory}
        roadmapData={game.roadmapData}
        lang={lang}
        onClose={() => {
          setRoundDetailOpen(false);
          setSelectedRound(null);
        }}
      />

      {/* ============ WALLET MODAL ============ */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onConnect={connectWallet}
        lang={lang}
      />

      {/* ============ BETTING DISCLAIMER MODAL ============ */}
      <BettingDisclaimerModal
        isOpen={showBettingDisclaimer}
        onConfirm={handleBettingDisclaimerConfirm}
        onCancel={handleBettingDisclaimerCancel}
      />

      {/* ============ TOAST CONTAINER ============ */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`
              pointer-events-auto cursor-pointer
              ${toast.type === 'win' ? 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] shadow-[0_0_30px_rgba(34,197,94,0.5)]' :
                toast.type === 'lose' ? 'bg-gradient-to-r from-[#ef4444] to-[#dc2626] shadow-[0_0_20px_rgba(239,68,68,0.4)]' :
                toast.type === 'tie' ? 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] shadow-[0_0_20px_rgba(251,191,36,0.4)]' :
                toast.type === 'bull' ? 'bg-gradient-to-r from-[#22c55e]/90 to-[#16a34a]/90 shadow-[0_0_30px_rgba(34,197,94,0.6)]' :
                toast.type === 'bear' ? 'bg-gradient-to-r from-[#ef4444]/90 to-[#dc2626]/90 shadow-[0_0_30px_rgba(239,68,68,0.6)]' :
                'bg-[#3b82f6]/90'}
              border-2
              ${toast.type === 'win' ? 'border-[#4ade80]' :
                toast.type === 'lose' ? 'border-[#f87171]' :
                toast.type === 'tie' ? 'border-[#fcd34d]' :
                toast.type === 'bull' ? 'border-[#22c55e]' :
                toast.type === 'bear' ? 'border-[#ef4444]' :
                'border-[#3b82f6]'}
              rounded-xl backdrop-blur-sm
              animate-[toastSlideIn_0.3s_ease-out]
              ${toast.type === 'win' ? 'animate-[winToastBounce_0.5s_ease-out]' : ''}
              min-w-[200px]
            `}
          >
            {toast.type === 'win' ? (
              <div className="p-4 flex flex-col items-center gap-2 relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <span className="text-4xl animate-bounce">🎉</span>
                  <span className="text-2xl font-['Orbitron'] font-black text-white drop-shadow-lg">
                    {toast.message}
                  </span>
                  <span className="text-4xl animate-bounce">🎉</span>
                </div>
                {toast.amount !== undefined && (
                  <div
                    className="text-3xl font-['Orbitron'] font-black text-white animate-[winAmountPulse_0.5s_ease-out]"
                    style={{ textShadow: '0 0 20px rgba(255,255,255,0.8)' }}
                  >
                    +${toast.amount.toFixed(2)}
                  </div>
                )}
              </div>
            ) : (toast.type === 'bull' || toast.type === 'bear') ? (
              <div className="p-4 flex items-center gap-4">
                <span className="text-5xl">{toast.type === 'bull' ? '🐂' : '🐻'}</span>
                <div className="flex flex-col">
                  <span className="text-lg font-['Orbitron'] font-bold text-white">
                    {toast.message} · {toast.type.toUpperCase()} WIN!
                  </span>
                  {toast.amount !== undefined && (
                    <span className="text-sm text-white/80">
                      Close: ${toast.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 flex items-center gap-3">
                <span className="text-2xl">
                  {toast.type === 'lose' ? '😢' : toast.type === 'tie' ? '🔄' : 'ℹ'}
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold text-white">{toast.message}</span>
                  {toast.amount !== undefined && (
                    <span className="text-sm text-white/80">
                      {toast.type === 'lose' ? '-' : toast.type === 'tie' ? '+' : ''}${Math.abs(toast.amount).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ============ BET ALERT POPUP (10초 경고) - ROUND 아래에 표시 ============ */}
      {/* BET ALERT - 모바일 30% 축소 */}
      {showBetAlert && (
        <div
          className={`fixed ${isMobile ? 'top-[60px]' : 'top-[90px]'} left-1/2 -translate-x-1/2 z-[9998] bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] ${isMobile ? 'rounded-xl p-2.5' : 'rounded-2xl p-6'} shadow-[0_0_50px_rgba(251,191,36,0.6)] animate-[winToastBounce_0.5s_ease-out] cursor-pointer`}
          onClick={() => setShowBetAlert(false)}
        >
          <div className="text-center">
            <div className={`${isMobile ? 'text-lg mb-0.5' : 'text-4xl mb-2'}`}>⏰</div>
            <div className={`font-['Orbitron'] font-bold ${isMobile ? 'text-sm' : 'text-xl'} text-black mb-0.5`}>
              {lang === 'ko' ? '베팅 시간!' : 'Time to Bet!'}
            </div>
            <div className={`text-black/70 ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
              {lang === 'ko' ? '10초 남았습니다' : '10 seconds remaining'}
            </div>
          </div>
        </div>
      )}

      {/* ============ VISUAL EFFECTS ============ */}
      {/* Glow Pulse - 게임 중 이기고 있을 때 배경 오라 */}
      <GlowPulse
        isWinning={isCurrentlyWinning && game.gamePhase === 'game'}
        enabled={effectSettings.glowPulse}
      />

      {/* Wave Sweep - 게임 중 이기고 있을 때 그린 라인 스윕 */}
      <WaveSweep
        isWinning={isCurrentlyWinning && game.gamePhase === 'game'}
        enabled={effectSettings.waveSweep}
      />

      {/* Radial Shockwave - 비활성화 (가운데 원 효과 제거) */}
      {/* <RadialShockwave
        trigger={winTrigger}
        enabled={effectSettings.radialShockwave}
      /> */}

      {/* Confetti - 승리 시 폭죽 효과 */}
      <Confetti
        trigger={winTrigger}
        enabled={effectSettings.confetti}
        isBigWin={victoryWinAmount >= 100}
      />

      {/* Heartbeat - 마지막 5초 긴장감 효과 */}
      <Heartbeat
        active={game.gamePhase === 'game' && game.timeRemaining <= 5 && game.userBet !== null}
        secondsLeft={game.timeRemaining}
        enabled={effectSettings.heartbeat}
        soundEnabled={soundEnabled}
        soundVolume={soundVolume}
      />

      {/* CSS Keyframes */}
      <style jsx global>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes logoShine {
          to { background-position: 200% center; }
        }
        @keyframes centerPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(247, 147, 26, 0.6); }
          50% { box-shadow: 0 0 35px rgba(247, 147, 26, 0.9); }
        }
        @keyframes planetOrbit {
          to { transform: translateX(-50%) rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 12px #22c55e; }
          50% { opacity: 0.5; }
        }
        @keyframes glowPulse {
          0%   { opacity: 0.06; }
          50%  { opacity: 0.12; }
          100% { opacity: 0.06; }
        }
        @keyframes waveSweep {
          0% { transform: translateY(120%); opacity: 0; }
          10% { opacity: 0.25; }
          100% { transform: translateY(-120%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
