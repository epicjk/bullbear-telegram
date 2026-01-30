'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================
// Types
// ============================================================
export type GamePhase = 'betting' | 'countdown' | 'game' | 'result';
export type BetSide = 'bull' | 'bear' | null;
export type RoundResult = 'bull' | 'bear' | 'tie';

export interface PriceData {
  price: number;
  timestamp: number;
}

export interface RoundHistory {
  round: number;
  result: RoundResult;
  startPrice: number;
  endPrice: number;
  startTime: string;  // "HH:MM:SS" 형식
  endTime: string;    // "HH:MM:SS" 형식
  timestamp: number;
}

export interface BetRecord {
  round: number;
  side: BetSide;
  amount: number;
  result: 'win' | 'lose' | 'tie';
  payout: number;
  timestamp: number;
}

// Roadmap 셀 데이터 (HTML과 동일)
export interface RoadmapCell {
  round: number;
  result: RoundResult;
}

// Roadmap 2D 배열 타입: roadmapData[col][row] - 6행 x N열
export type RoadmapData = (RoadmapCell | null)[][];

export interface GameState {
  currentRound: number;
  gamePhase: GamePhase;
  timeRemaining: number;
  currentPrice: number;
  displayPrice: number;  // HTML과 동일: 부드럽게 보간된 가격
  basePrice: number;
  priceHistory: PriceData[];
  priceChange: number;
  priceChangePercent: number;
  userBet: BetSide;
  betAmount: number;
  potentialPayout: number;
  roadmapHistory: RoundHistory[];
  roadmapData: RoadmapData; // HTML과 동일한 2D 배열 구조
  betHistory: BetRecord[];
  bullWins: number;
  bearWins: number;
  todayPnl: number;
  winStreak: number;
  isConnected: boolean;
  isSimulation: boolean;
  gameStartIndex: number;  // HTML과 동일: 게임 시작 시 priceHistory 인덱스
  joinedMidRound: boolean; // 게임 중간에 접속했는지 여부
}

// ============================================================
// Constants (HTML과 동일)
// ============================================================
const ROUND_DURATION = 60;
const BETTING_DURATION = 25;
const COUNTDOWN_DURATION = 5;
const GAME_DURATION = 30;
const PAYOUT_MULTIPLIER = 1.95;
const MAX_ROADMAP_COLUMNS = 35; // HTML과 동일: 최대 35열
const HISTORY_COUNT = 80; // HTML: 초기 히스토리 80개

// ============================================================
// Time-based Round System (Korea Time Sync) - HTML 로직 그대로
// ============================================================
function calculateRoundInfo() {
  const now = new Date();
  // Korea time (UTC+9)
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const koreaTime = new Date(utcTime + (9 * 60 * 60 * 1000));

  // Seconds since midnight (Korea time)
  const hours = koreaTime.getHours();
  const minutes = koreaTime.getMinutes();
  const seconds = koreaTime.getSeconds();
  const secondsSinceMidnight = hours * 3600 + minutes * 60 + seconds;

  // Current round (starts at 1)
  const round = Math.floor(secondsSinceMidnight / ROUND_DURATION) + 1;

  // Seconds into current round
  const secondsIntoRound = secondsSinceMidnight % ROUND_DURATION;

  // Phase and time calculation
  let phase: GamePhase;
  let timeLeft: number;

  if (secondsIntoRound < BETTING_DURATION) {
    // 0-24초: betting
    phase = 'betting';
    timeLeft = BETTING_DURATION - secondsIntoRound;
  } else if (secondsIntoRound < BETTING_DURATION + COUNTDOWN_DURATION) {
    // 25-29초: countdown
    phase = 'countdown';
    timeLeft = (BETTING_DURATION + COUNTDOWN_DURATION) - secondsIntoRound;
  } else {
    // 30-59초: game
    phase = 'game';
    timeLeft = ROUND_DURATION - secondsIntoRound;
  }

  return { round, phase, timeLeft, secondsIntoRound };
}

// ============================================================
// Hook
// ============================================================
export function useBullBearGame() {
  const [state, setState] = useState<GameState>({
    currentRound: 1,
    gamePhase: 'betting',
    timeRemaining: BETTING_DURATION,
    currentPrice: 0,
    displayPrice: 0,  // HTML과 동일: 부드럽게 보간된 가격
    basePrice: 0,
    priceHistory: [],
    priceChange: 0,
    priceChangePercent: 0,
    userBet: null,
    betAmount: 0,
    potentialPayout: 0,
    roadmapHistory: [],
    roadmapData: [], // HTML과 동일한 2D 배열: [col][row]
    betHistory: [],
    bullWins: 0,
    bearWins: 0,
    todayPnl: 0,
    winStreak: 0,
    isConnected: false,
    isSimulation: true,
    gameStartIndex: 0,  // HTML과 동일: 게임 시작 시 priceHistory 인덱스
    joinedMidRound: false, // 게임 중간에 접속했는지 여부
  });

  // Refs (HTML과 동일한 변수 구조)
  // 시뮬레이션 기본 가격 - 0으로 시작하고 첫 API 호출 시 실제 가격으로 설정
  const simulationBasePriceRef = useRef(0);
  const lastPhaseRef = useRef<GamePhase>('betting');
  const lastRoundRef = useRef(1);
  const basePriceLockedRef = useRef(false);
  const roundStartPriceRef = useRef(0);
  const roundStartTimeRef = useRef('');  // 라운드 시작 시간 (HH:MM:SS)
  const pendingResultRef = useRef(false);
  const secondPricesRef = useRef<Record<number, number>>({});
  const initializedRef = useRef(false);

  // HTML과 동일: 부드러운 가격 이동을 위한 refs
  const lastBinancePriceRef = useRef(0);  // 실제 Binance API 가격
  const lastPriceUpdateRef = useRef(0);   // 마지막 API 업데이트 시간
  const displayPriceRef = useRef(0);      // 화면에 표시되는 보간된 가격
  const gameStartTimestampRef = useRef(0); // 게임 시작 시점 타임스탬프 (ms)
  const apiBasePriceRef = useRef(0);      // API에서 가져온 29초 캔들 종가 (실제 베이스라인)

  // 현재 한국 시간을 HH:MM:SS 형식으로 반환
  const getKoreaTimeString = useCallback(() => {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const koreaTime = new Date(utcTime + (9 * 60 * 60 * 1000));
    return koreaTime.toTimeString().split(' ')[0]; // "HH:MM:SS"
  }, []);

  // ============================================================
  // Simulation Price Update (HTML 로직 그대로)
  // ============================================================
  const updateSimulationPrice = useCallback(() => {
    // 아직 실제 가격을 받지 못했으면 0 반환 (API 호출 대기)
    if (simulationBasePriceRef.current === 0) {
      return 0;
    }

    const simChange = (Math.random() - 0.5) * 8; // ±$4 변동
    simulationBasePriceRef.current += simChange;

    // 범위 제한 (현재 가격 ±10% 범위)
    const basePrice = simulationBasePriceRef.current;
    if (basePrice < 80000) {
      simulationBasePriceRef.current = 80000 + Math.random() * 100;
    }
    if (basePrice > 120000) {
      simulationBasePriceRef.current = 120000 - Math.random() * 100;
    }

    return simulationBasePriceRef.current;
  }, []);

  // ============================================================
  // Price Fetching - API 호출 (1초마다) - HTML과 동일
  // ============================================================
  const fetchPrice = useCallback(async () => {
    // 시뮬레이션 가격 먼저 업데이트 (API 실패해도 게임 진행)
    const simPrice = updateSimulationPrice();
    let usedSimulation = true;
    let finalPrice = simPrice > 0 ? simPrice : 0;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const price = parseFloat(data.price);

        if (price > 0) {
          finalPrice = price;
          usedSimulation = false;
          simulationBasePriceRef.current = price;
        }
      }
    } catch {
      if (simulationBasePriceRef.current === 0) {
        simulationBasePriceRef.current = 94000;
      }
    }

    // HTML과 동일: lastBinancePrice와 lastPriceUpdate 업데이트
    if (finalPrice > 0) {
      lastBinancePriceRef.current = finalPrice;
      lastPriceUpdateRef.current = Date.now();

      // displayPrice가 0이면 초기화
      if (displayPriceRef.current === 0) {
        displayPriceRef.current = finalPrice;
      }
    }

    // 초 단위로 가격 저장 (결과 판정용)
    const second = Math.floor(Date.now() / 1000);
    secondPricesRef.current[second] = finalPrice;

    // 오래된 데이터 정리 (2분)
    const cutoff = second - 120;
    Object.keys(secondPricesRef.current).forEach(key => {
      if (parseInt(key) < cutoff) delete secondPricesRef.current[parseInt(key)];
    });

    // 연결 상태만 업데이트 (가격은 updateDisplayPrice에서 처리)
    setState(prev => ({
      ...prev,
      currentPrice: finalPrice,
      isConnected: true,
      isSimulation: usedSimulation,
    }));

    return finalPrice;
  }, [updateSimulationPrice]);

  // ============================================================
  // Display Price Update - 부드러운 보간 (200ms마다) - HTML과 동일
  // ============================================================
  const updateDisplayPrice = useCallback(() => {
    if (lastBinancePriceRef.current === 0) return;

    const targetPrice = lastBinancePriceRef.current;
    const timeSinceUpdate = Date.now() - lastPriceUpdateRef.current;

    if (timeSinceUpdate < 200) {
      // 최근에 실제 데이터 받음 - 실제 가격으로 30% 속도로 수렴
      const convergenceSpeed = 0.3;
      displayPriceRef.current = displayPriceRef.current + (targetPrice - displayPriceRef.current) * convergenceSpeed;
    } else {
      // 데이터 없음 - 가짜 움직임 생성 (±$10~15 범위)
      const maxFakeMove = 10 + Math.random() * 5;
      const fakeChange = (Math.random() - 0.5) * maxFakeMove * 0.3;
      displayPriceRef.current += fakeChange;

      // 실제 가격에서 너무 멀어지면 되돌리기
      const drift = displayPriceRef.current - targetPrice;
      if (Math.abs(drift) > 15) {
        displayPriceRef.current -= drift * 0.1;
      }
    }

    const currentDisplayPrice = displayPriceRef.current;

    const now = Date.now();

    setState(prev => {
      // priceHistory에 추가 (HTML: 200ms마다, 최대 300개)
      const newHistory = [...prev.priceHistory, { price: currentDisplayPrice, timestamp: now }];

      // 300개 유지 (약 1분 - 200ms * 300 = 60초)
      while (newHistory.length > 300) {
        newHistory.shift();
      }

      // gameStartIndex를 타임스탬프 기반으로 실시간 계산
      // 게임 시작 타임스탬프에 가장 가까운 데이터 포인트의 인덱스 찾기
      let gameStartIndex = -1;
      if (gameStartTimestampRef.current > 0 && newHistory.length > 0) {
        // 타임스탬프가 gameStartTimestamp보다 크거나 같은 첫 번째 인덱스 찾기
        for (let i = 0; i < newHistory.length; i++) {
          if (newHistory[i].timestamp >= gameStartTimestampRef.current) {
            gameStartIndex = i;
            break;
          }
        }
        // 못 찾으면 이미 차트 밖으로 나간 것 (-1 유지)
      }

      // basePrice가 있을 때만 변화량 계산
      const priceChange = prev.basePrice > 0 ? currentDisplayPrice - prev.basePrice : 0;
      const priceChangePercent = prev.basePrice > 0 ? (priceChange / prev.basePrice) * 100 : 0;

      return {
        ...prev,
        displayPrice: currentDisplayPrice,
        priceHistory: newHistory,
        priceChange,
        priceChangePercent,
        gameStartIndex,
      };
    });
  }, []);

  // ============================================================
  // Place Bet
  // ============================================================
  const placeBet = useCallback((side: BetSide, amount: number) => {
    if (state.gamePhase !== 'betting') return false;
    if (!side || amount <= 0) return false;

    // localStorage에 현재 베팅 저장 (새로고침 시 복원용)
    // basePrice도 함께 저장 (게임 시작 시 설정될 예정이지만, 복원 시 빠른 로드를 위해)
    const currentRound = state.currentRound;
    const betData = {
      side,
      amount,
      round: currentRound,
      timestamp: Date.now(),
      basePrice: state.basePrice // 현재는 0일 수 있음, countdown→game 전환 시 업데이트됨
    };
    localStorage.setItem('bitbattle_currentBet', JSON.stringify(betData));

    setState(prev => ({
      ...prev,
      userBet: side,
      betAmount: amount,
      potentialPayout: amount * PAYOUT_MULTIPLIER,
    }));

    return true;
  }, [state.gamePhase, state.currentRound, state.basePrice]);

  // ============================================================
  // Cancel Bet
  // ============================================================
  const cancelBet = useCallback(() => {
    if (state.gamePhase !== 'betting') return false;

    // localStorage에서 베팅 정보 삭제
    localStorage.removeItem('bitbattle_currentBet');

    setState(prev => ({
      ...prev,
      userBet: null,
      betAmount: 0,
      potentialPayout: 0,
    }));

    return true;
  }, [state.gamePhase]);

  // Reset bet (라운드 종료 시 사용 - gamePhase 상관없이 리셋)
  const resetBet = useCallback(() => {
    // localStorage에서 베팅 정보 삭제
    localStorage.removeItem('bitbattle_currentBet');

    setState(prev => ({
      ...prev,
      userBet: null,
      betAmount: 0,
      potentialPayout: 0,
    }));
  }, []);

  // ============================================================
  // Binance API에서 특정 초의 캔들 종가 가져오기
  // second: 29 (게임 시작 시점) 또는 59 (게임 종료 시점)
  // ============================================================
  const fetchSecondClosePrice = useCallback(async (second: 29 | 59): Promise<number> => {
    try {
      // 한국 시간 기준으로 현재 분의 특정 초 타임스탬프 계산
      const now = Date.now();
      const koreaOffset = 9 * 60 * 60 * 1000;
      const utcTime = now + (new Date().getTimezoneOffset() * 60000);
      const koreaTime = utcTime + koreaOffset;

      // 한국 시간 기준 현재 초
      const koreaDate = new Date(koreaTime);
      const currentSecondKST = koreaDate.getSeconds();

      // 한국 시간 기준 현재 분의 시작 (UTC 타임스탬프)
      // 현재 분의 :00 초 시점 계산
      const currentMinuteStartKST = koreaTime - (currentSecondKST * 1000) - (koreaTime % 1000);
      // UTC 타임스탬프로 변환
      const currentMinuteStartUTC = currentMinuteStartKST - koreaOffset - (new Date().getTimezoneOffset() * 60000);

      // 목표 초의 UTC 타임스탬프
      const targetTimestamp = currentMinuteStartUTC + (second * 1000);

      const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1s&startTime=${targetTimestamp}&limit=1`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          // 캔들의 종가 (index 4)
          const closePrice = parseFloat(String(data[0][4]));
          if (closePrice > 0) {
            return closePrice;
          }
        }
      }
    } catch (e) {
      console.error(`Failed to fetch ${second}s candle close price:`, e);
    }

    // 실패 시 현재 API 가격 반환
    return lastBinancePriceRef.current || 0;
  }, []);

  // ============================================================
  // Generate Initial History (빈 상태로 시작, 실제 데이터는 API로 로드)
  // ============================================================
  const generateInitialHistory = useCallback((currentRound: number) => {
    // 빈 히스토리로 시작 (실제 데이터는 loadRealHistoryFromBinance에서 로드)
    const tempHistory: { round: number; result: RoundResult }[] = [];

    // 빈 상태 반환 - 실제 데이터는 비동기로 로드됨
    return {
      history: [] as RoundHistory[],
      roadmapData: [] as RoadmapData,
      bullCount: 0,
      bearCount: 0
    };
  }, []);

  // ============================================================
  // Binance API로 초기 차트 가격 히스토리 로드 (최근 10초)
  // ============================================================
  const loadInitialPriceHistory = useCallback(async () => {
    try {
      // 먼저 현재 가격 가져오기
      let currentPrice = 0;
      try {
        const tickerRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        if (tickerRes.ok) {
          const tickerData = await tickerRes.json();
          currentPrice = parseFloat(tickerData.price);
        }
      } catch {
        // 실패 시 무시
      }

      const fetchStartTime = Date.now();
      const apiStartTime = fetchStartTime - 10000; // 10초 전

      const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1s&startTime=${apiStartTime}&endTime=${fetchStartTime}&limit=10`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          // API 응답 후 현재 시간 기준으로 타임스탬프 재계산
          const now = Date.now();
          const priceHistory: PriceData[] = [];

          // 1초 단위 가격 데이터 추출 (시가, 고가, 저가, 종가)
          const candles: { open: number; high: number; low: number; close: number }[] = [];
          data.forEach((candle: number[]) => {
            candles.push({
              open: parseFloat(String(candle[1])),
              high: parseFloat(String(candle[2])),
              low: parseFloat(String(candle[3])),
              close: parseFloat(String(candle[4])),
            });
          });

          // 현재 가격이 없으면 마지막 캔들의 종가 사용
          if (!currentPrice && candles.length > 0) {
            currentPrice = candles[candles.length - 1].close;
          }

          // 마지막 캔들 종가와 현재 가격의 차이 계산
          const lastCandleClose = candles.length > 0 ? candles[candles.length - 1].close : currentPrice;
          const priceDiff = currentPrice - lastCandleClose;

          // 200ms 간격으로 50개 데이터 생성 (10초)
          // 각 초 내에서 OHLC를 활용해 자연스러운 움직임 생성
          const totalDuration = 10000;
          const dataCount = 50;

          for (let i = 0; i < dataCount; i++) {
            const timestamp = now - totalDuration + (i * 200);

            // 해당 시점의 캔들 인덱스 (0~9)
            const candleIndex = Math.min(Math.floor(i / 5), candles.length - 1);
            const candle = candles[candleIndex];

            if (candle) {
              // 초 내에서의 위치 (0~4, 5개 데이터 포인트)
              const posInSecond = i % 5;

              // 전체 진행률 (0~1) - 마지막으로 갈수록 현재 가격에 가까워지도록 보정
              const overallProgress = i / (dataCount - 1);
              // 점진적으로 현재 가격 방향으로 보정 (마지막 30%에서 급격히)
              const correction = priceDiff * Math.pow(overallProgress, 3);

              // OHLC 기반 자연스러운 가격 움직임 생성
              let price: number;
              const range = candle.high - candle.low;
              const volatility = Math.max(range, 1); // 최소 $1 변동성

              if (posInSecond === 0) {
                price = candle.open + (Math.random() - 0.5) * volatility * 0.3;
              } else if (posInSecond === 4) {
                price = candle.close + (Math.random() - 0.5) * volatility * 0.2;
              } else {
                const progress = posInSecond / 4;
                const basePrice = candle.open + (candle.close - candle.open) * progress;
                const bias = (Math.random() - 0.5) * 2;
                const deviation = bias > 0
                  ? (candle.high - basePrice) * Math.abs(bias) * 0.7
                  : (basePrice - candle.low) * Math.abs(bias) * 0.7;
                price = basePrice + (bias > 0 ? deviation : -deviation);
                price = Math.max(candle.low, Math.min(candle.high, price));
              }

              // 현재 가격 방향으로 점진적 보정
              price += correction;

              // 추가 미세 노이즈
              const microNoise = (Math.random() - 0.5) * 0.5;
              price += microNoise;

              priceHistory.push({ price, timestamp });
            }
          }

          // 연속성을 위해 스무딩 적용
          for (let i = 1; i < priceHistory.length - 1; i++) {
            const prev = priceHistory[i - 1].price;
            const curr = priceHistory[i].price;
            const next = priceHistory[i + 1].price;
            priceHistory[i].price = prev * 0.2 + curr * 0.6 + next * 0.2;
          }

          // 마지막 몇 개 데이터를 현재 가격으로 수렴
          if (currentPrice > 0 && priceHistory.length > 5) {
            const lastIdx = priceHistory.length - 1;
            for (let i = 0; i < 5; i++) {
              const idx = lastIdx - 4 + i;
              const progress = i / 4;
              const targetPrice = priceHistory[lastIdx - 4].price + (currentPrice - priceHistory[lastIdx - 4].price) * progress;
              priceHistory[idx].price = targetPrice + (Math.random() - 0.5) * 0.3;
            }
          }

          if (priceHistory.length > 0) {
            // 현재 가격으로 업데이트
            const lastPrice = currentPrice || priceHistory[priceHistory.length - 1].price;
            displayPriceRef.current = lastPrice;
            lastBinancePriceRef.current = lastPrice;

            setState(prev => ({
              ...prev,
              priceHistory,
              currentPrice: lastPrice,
              displayPrice: lastPrice,
            }));
          }
        }
      }
    } catch (e) {
      console.error('Failed to load initial price history:', e);
    }
  }, []);

  // ============================================================
  // Binance API로 실제 과거 히스토리 로드 (80개 라운드)
  // ============================================================
  const loadRealHistoryFromBinance = useCallback(async (currentRound: number) => {
    try {
      // 한국 시간 기준 오늘 자정 타임스탬프 계산
      const now = new Date();
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const koreaTime = new Date(utcTime + (9 * 60 * 60 * 1000));
      const todayMidnight = new Date(koreaTime);
      todayMidnight.setHours(0, 0, 0, 0);
      const midnightTimestamp = todayMidnight.getTime() - (9 * 60 * 60 * 1000) - (now.getTimezoneOffset() * 60000);

      // 최근 80개 라운드의 데이터 로드 (29초 종가와 59초 종가)
      const historyCount = Math.min(HISTORY_COUNT, currentRound - 1);
      const tempHistory: { round: number; result: RoundResult; startPrice: number; endPrice: number }[] = [];
      const startRound = Math.max(1, currentRound - historyCount);

      // Binance API limit이 1000이므로 약 16분(1000초)씩 나눠서 호출
      // 80개 라운드 = 80분 = 4800초 필요, 5번 호출로 나눔
      const BATCH_SIZE = 16; // 한 번에 16개 라운드 (약 960초 데이터)
      const allData: number[][] = [];

      for (let batchStart = startRound; batchStart < currentRound; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, currentRound);
        const batchStartTimestamp = midnightTimestamp + ((batchStart - 1) * 60 + 29) * 1000;
        const batchEndTimestamp = midnightTimestamp + ((batchEnd - 1) * 60 + 59) * 1000;

        const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1s&startTime=${batchStartTimestamp}&endTime=${batchEndTimestamp + 999}&limit=1000`;

        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              allData.push(...data);
            }
          }
        } catch {
          // 개별 배치 실패는 무시하고 계속 진행
        }

        // Rate limit 방지를 위한 짧은 딜레이
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (allData.length > 0) {
        // 각 라운드의 29초 종가와 59초 종가 추출
        for (let roundNum = startRound; roundNum < currentRound; roundNum++) {
          const base29Timestamp = midnightTimestamp + ((roundNum - 1) * 60 + 29) * 1000;
          const end59Timestamp = midnightTimestamp + ((roundNum - 1) * 60 + 59) * 1000;

          // 29초 캔들 찾기 (정확한 시간 또는 가장 가까운 이전 캔들)
          let candle29 = allData.find((c: number[]) => c[0] >= base29Timestamp && c[0] < base29Timestamp + 1000);
          if (!candle29) {
            // 29초 이전의 가장 가까운 캔들 찾기
            const beforeCandles = allData.filter((c: number[]) => c[0] < base29Timestamp && c[0] >= base29Timestamp - 5000);
            if (beforeCandles.length > 0) {
              candle29 = beforeCandles[beforeCandles.length - 1];
            }
          }

          // 59초 캔들 찾기 (정확한 시간 또는 가장 가까운 이전 캔들)
          let candle59 = allData.find((c: number[]) => c[0] >= end59Timestamp && c[0] < end59Timestamp + 1000);
          if (!candle59) {
            // 59초 이전의 가장 가까운 캔들 찾기
            const beforeCandles = allData.filter((c: number[]) => c[0] < end59Timestamp && c[0] >= end59Timestamp - 5000);
            if (beforeCandles.length > 0) {
              candle59 = beforeCandles[beforeCandles.length - 1];
            }
          }

          // 둘 다 없으면 랜덤으로 생성 (데이터 누락 시)
          if (!candle29 || !candle59) {
            const randomResult: RoundResult = Math.random() > 0.5 ? 'bull' : 'bear';
            tempHistory.push({ round: roundNum, result: randomResult, startPrice: 0, endPrice: 0 });
          } else {
            const startPrice = parseFloat(String(candle29[4])); // 29초 종가
            const endPrice = parseFloat(String(candle59[4])); // 59초 종가

            // 소수점 2자리 반올림 비교
            const start2d = Math.round(startPrice * 100) / 100;
            const end2d = Math.round(endPrice * 100) / 100;

            let result: RoundResult;
            if (start2d === end2d) {
              result = 'tie';
            } else if (end2d > start2d) {
              result = 'bull';
            } else {
              result = 'bear';
            }

            tempHistory.push({ round: roundNum, result, startPrice, endPrice });
          }
        }
      }

      // roadmapData 2D 배열 생성
      let bullCount = 0;
      let bearCount = 0;
      const roadmapData: RoadmapData = [];

      tempHistory.forEach(entry => {
        if (entry.result === 'bull') bullCount++;
        else if (entry.result === 'bear') bearCount++;

        const cell: RoadmapCell = { round: entry.round, result: entry.result };

        if (roadmapData.length === 0) {
          roadmapData.push([cell, null, null, null, null, null]);
        } else {
          const lastCol = roadmapData[roadmapData.length - 1];
          let lastFilledRow = -1;
          for (let i = 0; i < 6; i++) {
            if (lastCol[i] !== null) lastFilledRow = i;
          }

          const lastEntry = lastCol[lastFilledRow];
          const lastRes = lastEntry ? lastEntry.result : null;

          if (entry.result === lastRes) {
            if (lastFilledRow < 5) {
              lastCol[lastFilledRow + 1] = cell;
            } else {
              roadmapData.push([null, null, null, null, null, cell]);
            }
          } else {
            while (roadmapData.length > 0 && roadmapData[roadmapData.length - 1][0] === null) {
              roadmapData.pop();
            }
            roadmapData.push([cell, null, null, null, null, null]);
          }
        }
      });

      while (roadmapData.length > MAX_ROADMAP_COLUMNS) {
        roadmapData.shift();
      }

      // roadmapHistory 생성
      const history: RoundHistory[] = tempHistory.map((entry, idx) => {
        const roundStartSecond = (entry.round - 1) * ROUND_DURATION;
        const startHour = Math.floor(roundStartSecond / 3600) % 24;
        const startMin = Math.floor((roundStartSecond % 3600) / 60);
        const startSec = (roundStartSecond % 60) + BETTING_DURATION + COUNTDOWN_DURATION - 1; // 29초

        const formatTime = (h: number, m: number, s: number) =>
          `${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

        return {
          round: entry.round,
          result: entry.result,
          startPrice: entry.startPrice,
          endPrice: entry.endPrice,
          startTime: formatTime(startHour, startMin, startSec % 60),
          endTime: formatTime(startHour, (startMin + Math.floor((startSec + 30) / 60)) % 60, (startSec + 30) % 60),
          timestamp: Date.now() - (tempHistory.length - idx) * 60000,
        };
      });

      // 상태 업데이트
      setState(prev => ({
        ...prev,
        roadmapHistory: history,
        roadmapData: roadmapData,
        bullWins: bullCount,
        bearWins: bearCount,
      }));

    } catch (error) {
      console.error('Failed to load history from Binance:', error);
      // 실패 시 빈 상태 유지
    }
  }, []);

  // ============================================================
  // 누락된 라운드 동기화 (탭이 다시 활성화될 때)
  // ============================================================
  const syncMissingRounds = useCallback(async (currentRound: number) => {
    try {
      // 현재 히스토리에서 마지막 라운드 번호 찾기
      const lastHistoryRound = state.roadmapHistory.length > 0
        ? Math.max(...state.roadmapHistory.map(h => h.round))
        : currentRound - 80;

      // 누락된 라운드가 없으면 리턴
      if (lastHistoryRound >= currentRound - 1) return;

      const now = new Date();
      const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
      const koreaNow = new Date(utcNow + (9 * 60 * 60 * 1000));
      const midnightKorea = new Date(koreaNow);
      midnightKorea.setHours(0, 0, 0, 0);
      const midnightTimestamp = midnightKorea.getTime() - (9 * 60 * 60 * 1000);

      // 누락된 라운드 범위
      const startRound = lastHistoryRound + 1;
      const endRound = currentRound;

      if (startRound >= endRound) return;

      // Binance API에서 누락된 라운드 데이터 가져오기
      const batchStartTimestamp = midnightTimestamp + ((startRound - 1) * 60 + 29) * 1000;
      const batchEndTimestamp = midnightTimestamp + ((endRound - 1) * 60 + 59) * 1000;

      const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1s&startTime=${batchStartTimestamp}&endTime=${batchEndTimestamp + 999}&limit=1000`;
      const response = await fetch(url);

      if (!response.ok) return;

      const allData = await response.json();
      if (!allData || allData.length === 0) return;

      const newEntries: { round: number; result: RoundResult; startPrice: number; endPrice: number }[] = [];

      for (let roundNum = startRound; roundNum < endRound; roundNum++) {
        const base29Timestamp = midnightTimestamp + ((roundNum - 1) * 60 + 29) * 1000;
        const end59Timestamp = midnightTimestamp + ((roundNum - 1) * 60 + 59) * 1000;

        let candle29 = allData.find((c: number[]) => c[0] >= base29Timestamp && c[0] < base29Timestamp + 1000);
        if (!candle29) {
          const beforeCandles = allData.filter((c: number[]) => c[0] < base29Timestamp && c[0] >= base29Timestamp - 5000);
          if (beforeCandles.length > 0) candle29 = beforeCandles[beforeCandles.length - 1];
        }

        let candle59 = allData.find((c: number[]) => c[0] >= end59Timestamp && c[0] < end59Timestamp + 1000);
        if (!candle59) {
          const beforeCandles = allData.filter((c: number[]) => c[0] < end59Timestamp && c[0] >= end59Timestamp - 5000);
          if (beforeCandles.length > 0) candle59 = beforeCandles[beforeCandles.length - 1];
        }

        if (candle29 && candle59) {
          const startPrice = parseFloat(String(candle29[4]));
          const endPrice = parseFloat(String(candle59[4]));
          const start2d = Math.round(startPrice * 100) / 100;
          const end2d = Math.round(endPrice * 100) / 100;

          let result: RoundResult;
          if (start2d === end2d) result = 'tie';
          else if (end2d > start2d) result = 'bull';
          else result = 'bear';

          newEntries.push({ round: roundNum, result, startPrice, endPrice });
        } else {
          // 데이터 누락 시 랜덤 결과
          newEntries.push({
            round: roundNum,
            result: Math.random() > 0.5 ? 'bull' : 'bear',
            startPrice: 0,
            endPrice: 0
          });
        }
      }

      if (newEntries.length === 0) return;

      // 상태 업데이트
      setState(prev => {
        // 기존 히스토리에 새 엔트리 추가
        const newRoadmapHistory = [...prev.roadmapHistory];
        let newBullWins = prev.bullWins;
        let newBearWins = prev.bearWins;

        newEntries.forEach(entry => {
          // 중복 체크
          if (newRoadmapHistory.some(h => h.round === entry.round)) return;

          const roundStartSecond = (entry.round - 1) * ROUND_DURATION;
          const startHour = Math.floor(roundStartSecond / 3600) % 24;
          const startMin = Math.floor((roundStartSecond % 3600) / 60);
          const startSec = (roundStartSecond % 60) + BETTING_DURATION + COUNTDOWN_DURATION - 1;

          const formatTime = (h: number, m: number, s: number) =>
            `${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

          newRoadmapHistory.push({
            round: entry.round,
            result: entry.result,
            startPrice: entry.startPrice,
            endPrice: entry.endPrice,
            startTime: formatTime(startHour, startMin, startSec),
            endTime: formatTime(startHour, (startMin + Math.floor((startSec + 30) / 60)) % 60, (startSec + 30) % 60),
            timestamp: Date.now(),
          });

          if (entry.result === 'bull') newBullWins++;
          else if (entry.result === 'bear') newBearWins++;
        });

        // 라운드 순서대로 정렬
        newRoadmapHistory.sort((a, b) => a.round - b.round);

        // 최근 100개만 유지
        while (newRoadmapHistory.length > 100) newRoadmapHistory.shift();

        // roadmapData 2D 배열 재생성
        const newRoadmapData: RoadmapData = [];
        newRoadmapHistory.forEach(entry => {
          const cell: RoadmapCell = { round: entry.round, result: entry.result };

          if (newRoadmapData.length === 0) {
            newRoadmapData.push([cell, null, null, null, null, null]);
          } else {
            const lastCol = newRoadmapData[newRoadmapData.length - 1];
            let lastFilledRow = -1;
            for (let i = 0; i < 6; i++) {
              if (lastCol[i] !== null) lastFilledRow = i;
            }
            const lastEntry = lastCol[lastFilledRow];
            const lastRes = lastEntry ? lastEntry.result : null;

            if (entry.result === lastRes) {
              if (lastFilledRow < 5) {
                lastCol[lastFilledRow + 1] = cell;
              } else {
                newRoadmapData.push([null, null, null, null, null, cell]);
              }
            } else {
              while (newRoadmapData.length > 0 && newRoadmapData[newRoadmapData.length - 1][0] === null) {
                newRoadmapData.pop();
              }
              newRoadmapData.push([cell, null, null, null, null, null]);
            }
          }
        });

        while (newRoadmapData.length > MAX_ROADMAP_COLUMNS) {
          newRoadmapData.shift();
        }

        return {
          ...prev,
          roadmapHistory: newRoadmapHistory,
          roadmapData: newRoadmapData,
          bullWins: newBullWins,
          bearWins: newBearWins,
        };
      });

    } catch (error) {
      console.error('Failed to sync missing rounds:', error);
    }
  }, [state.roadmapHistory]);

  // ============================================================
  // Visibility Change Handler (탭 활성화 시 동기화)
  // ============================================================
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const info = calculateRoundInfo();
        // 탭이 다시 활성화되면 누락된 라운드 동기화
        syncMissingRounds(info.round);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncMissingRounds]);

  // ============================================================
  // Main Game Loop (HTML 로직 그대로 이식)
  // ============================================================
  useEffect(() => {
    // 초기화
    const info = calculateRoundInfo();
    lastPhaseRef.current = info.phase;
    lastRoundRef.current = info.round;
    basePriceLockedRef.current = info.phase !== 'betting';

    // 초기 히스토리 로드 (한 번만) - Binance API에서 실제 데이터 가져오기
    if (!initializedRef.current) {
      initializedRef.current = true;

      // 게임 중간에 접속한 경우 (이미 game 페이즈) 처리
      const isAlreadyInGame = info.phase === 'game';
      const now = Date.now();

      if (isAlreadyInGame) {
        const initialPrice = simulationBasePriceRef.current;
        roundStartPriceRef.current = initialPrice;
        gameStartTimestampRef.current = now - ((30 - info.timeLeft) * 1000); // 게임 시작 시점 추정
      }

      // localStorage에서 저장된 베팅 정보 복원
      let savedBet: { side: BetSide; amount: number; round: number; basePrice?: number; gameStartTimestamp?: number } | null = null;
      try {
        const savedBetStr = localStorage.getItem('bitbattle_currentBet');
        if (savedBetStr) {
          const parsed = JSON.parse(savedBetStr);
          // 현재 라운드와 같거나 (베팅 페이즈), 게임 중인 라운드와 같으면 복원
          if (parsed.round === info.round) {
            savedBet = parsed;
          } else {
            // 다른 라운드의 베팅이면 삭제 (이미 지난 라운드)
            localStorage.removeItem('bitbattle_currentBet');
          }
        }
      } catch {
        localStorage.removeItem('bitbattle_currentBet');
      }

      // 저장된 베팅이 있으면 -> 사용자가 이 라운드의 시작을 경험했음
      // 따라서 joinedMidRound: false로 설정하여 베이스라인이 보이도록 함
      const hasSavedBet = savedBet !== null;
      // 저장된 basePrice가 있으면 사용, 없으면 게임 중인 경우에만 임시 가격 사용
      const savedBasePrice = savedBet?.basePrice && savedBet.basePrice > 0
        ? savedBet.basePrice
        : (isAlreadyInGame ? simulationBasePriceRef.current : 0);
      // 저장된 gameStartTimestamp가 있으면 복원
      const savedGameStartTimestamp = savedBet?.gameStartTimestamp && savedBet.gameStartTimestamp > 0
        ? savedBet.gameStartTimestamp
        : (isAlreadyInGame ? now - ((30 - info.timeLeft) * 1000) : 0);

      // 임시 초기 상태 설정 (API 로드 전)
      // 저장된 베팅이 있으면 -> 사용자가 라운드 시작을 경험했으므로 joinedMidRound: false
      // 저장된 베팅이 없고 게임 중이면 -> 중간에 접속했으므로 joinedMidRound: true
      setState(prev => ({
        ...prev,
        currentRound: info.round,
        gamePhase: info.phase,
        timeRemaining: info.timeLeft,
        // basePrice: 저장된 값 우선, 없으면 게임 중일 때만 임시 가격
        basePrice: savedBasePrice,
        // 저장된 베팅이 있으면 라운드 시작을 경험한 것이므로 false
        // 저장된 베팅이 없고 게임 중이면 중간 접속이므로 true
        joinedMidRound: hasSavedBet ? false : isAlreadyInGame,
        // 저장된 베팅 정보 복원
        userBet: savedBet?.side || null,
        betAmount: savedBet?.amount || 0,
        potentialPayout: savedBet ? savedBet.amount * PAYOUT_MULTIPLIER : 0,
      }));

      // 저장된 basePrice가 있으면 refs도 업데이트
      if (savedBasePrice > 0) {
        roundStartPriceRef.current = savedBasePrice;
        apiBasePriceRef.current = savedBasePrice;
      }
      // 저장된 gameStartTimestamp가 있으면 ref도 업데이트
      if (savedGameStartTimestamp > 0) {
        gameStartTimestampRef.current = savedGameStartTimestamp;
      }

      // 비동기로 실제 가격 히스토리 로드 (차트용)
      loadInitialPriceHistory().then(() => {
        // 가격 히스토리 로드 후 gameStartIndex 재계산
        if (isAlreadyInGame) {
          setState(prev => {
            // gameStartTimestamp 기반으로 gameStartIndex 계산
            let gameStartIndex = -1;
            if (gameStartTimestampRef.current > 0 && prev.priceHistory.length > 0) {
              for (let i = 0; i < prev.priceHistory.length; i++) {
                if (prev.priceHistory[i].timestamp >= gameStartTimestampRef.current) {
                  gameStartIndex = i;
                  break;
                }
              }
            }
            // fallback: 시간 기반 계산
            if (gameStartIndex < 0) {
              gameStartIndex = Math.max(0, prev.priceHistory.length - Math.floor((30 - info.timeLeft) * 5));
            }

            // 저장된 basePrice가 있으면 유지, 없으면 현재 가격 사용
            const newBasePrice = savedBasePrice > 0 ? savedBasePrice : (prev.currentPrice || simulationBasePriceRef.current);

            // 저장된 basePrice가 있으면 gameStartIndex 위치의 가격을 basePrice로 설정
            // 이렇게 해야 차트 라인이 basePrice 위치를 지나감
            const newHistory = [...prev.priceHistory];
            if (savedBasePrice > 0 && gameStartIndex >= 0 && gameStartIndex < newHistory.length) {
              newHistory[gameStartIndex] = {
                ...newHistory[gameStartIndex],
                price: savedBasePrice
              };
            }

            return {
              ...prev,
              priceHistory: newHistory,
              gameStartIndex,
              basePrice: newBasePrice,
            };
          });
        }
      });

      // 비동기로 라운드 히스토리 로드 (로드맵용)
      loadRealHistoryFromBinance(info.round);
    } else {
      // 게임 중간에 접속한 경우 (이미 game 페이즈) basePrice 설정
      const isAlreadyInGame = info.phase === 'game';

      setState(prev => {
        // 게임 중인데 basePrice가 없으면 현재 가격으로 설정
        const needsBasePrice = isAlreadyInGame && prev.basePrice === 0;
        if (needsBasePrice) {
          roundStartPriceRef.current = prev.currentPrice || simulationBasePriceRef.current;
          gameStartTimestampRef.current = Date.now() - ((30 - info.timeLeft) * 1000);
        }

        return {
          ...prev,
          currentRound: info.round,
          gamePhase: info.phase,
          timeRemaining: info.timeLeft,
          basePrice: needsBasePrice ? (prev.currentPrice || simulationBasePriceRef.current) : prev.basePrice,
          gameStartIndex: needsBasePrice ? Math.max(0, prev.priceHistory.length - Math.floor((30 - info.timeLeft) * 5)) : prev.gameStartIndex,
        };
      });
    }

    // 가격 업데이트 시작 (1초마다 API 호출)
    fetchPrice();
    const priceInterval = setInterval(fetchPrice, 1000);

    // HTML과 동일: 200ms마다 displayPrice 업데이트 (부드러운 보간)
    const displayPriceInterval = setInterval(updateDisplayPrice, 200);

    // 라운드 결과 처리를 위한 별도 변수
    let pendingRoundResult: {
      round: number;
      startPrice: number;
      endPrice: number;
      startTime: string;
      endTime: string;
      userBet: BetSide | null;
      betAmount: number;
    } | null = null;

    // 메인 게임 루프 (100ms 정밀도)
    const gameInterval = setInterval(() => {
      const info = calculateRoundInfo();

      setState(prev => {
        let newState = { ...prev };

        // 라운드 변경 체크
        if (info.round !== lastRoundRef.current) {
          // 이전 라운드 결과 처리 준비
          if (!pendingResultRef.current && roundStartPriceRef.current > 0) {
            pendingResultRef.current = true;
            const now = new Date();
            const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
            const koreaTime = new Date(utcTime + (9 * 60 * 60 * 1000));
            const endTimeStr = koreaTime.toTimeString().split(' ')[0];

            // 결과를 아직 처리하지 않음 - 59초 종가 API 응답 후 처리
            const roundToProcess = lastRoundRef.current;
            const startPriceToProcess = roundStartPriceRef.current;
            const startTimeToProcess = roundStartTimeRef.current || endTimeStr;
            // 유저 베팅 정보도 저장 (라운드 초기화 전에)
            const userBetToProcess = prev.userBet;
            const betAmountToProcess = prev.betAmount;

            // Binance API에서 실제 59초 캔들 종가 가져오기 (비동기)
            // 약간의 지연 후 호출 (캔들 데이터가 확실히 생성되도록)
            setTimeout(() => {
              fetchSecondClosePrice(59).then(apiEndPrice => {
                if (apiEndPrice > 0) {
                  // API에서 가져온 59초 종가로 결과 설정
                  pendingRoundResult = {
                    round: roundToProcess,
                    startPrice: startPriceToProcess,
                    endPrice: apiEndPrice,
                    startTime: startTimeToProcess,
                    endTime: endTimeStr,
                    userBet: userBetToProcess,
                    betAmount: betAmountToProcess,
                  };
                } else {
                  // API 실패 시 현재 가격 사용 (fallback)
                  pendingRoundResult = {
                    round: roundToProcess,
                    startPrice: startPriceToProcess,
                    endPrice: prev.currentPrice,
                    startTime: startTimeToProcess,
                    endTime: endTimeStr,
                    userBet: userBetToProcess,
                    betAmount: betAmountToProcess,
                  };
                }
              });
            }, 500);
          }

          // 새 라운드 시작
          lastRoundRef.current = info.round;
          lastPhaseRef.current = info.phase;
          basePriceLockedRef.current = false;
          roundStartPriceRef.current = 0;
          pendingResultRef.current = false;
          gameStartTimestampRef.current = 0; // 게임 시작 타임스탬프 리셋

          newState = {
            ...newState,
            currentRound: info.round,
            gamePhase: info.phase,
            timeRemaining: info.timeLeft,
            basePrice: 0,
            priceChange: 0,
            priceChangePercent: 0,
            userBet: null,
            betAmount: 0,
            potentialPayout: 0,
          };
        }

        // 이전 라운드 결과 처리 (API 응답 후 pendingRoundResult가 설정되면 처리)
        if (pendingRoundResult) {
            // 소수점 2자리까지 반올림하여 비교 (29초 종가 vs 59초 종가)
            const startPrice2d = Math.round(pendingRoundResult.startPrice * 100) / 100;
            const endPrice2d = Math.round(pendingRoundResult.endPrice * 100) / 100;
            const priceChange = endPrice2d - startPrice2d;
            // TIE 판정: 소수점 2자리까지 완벽하게 일치해야 TIE
            const isTie = startPrice2d === endPrice2d;
            const result: RoundResult = isTie ? 'tie' : (priceChange > 0 ? 'bull' : 'bear');

            const newRoadmapHistory = [...prev.roadmapHistory, {
              round: pendingRoundResult.round,
              result,
              startPrice: pendingRoundResult.startPrice,
              endPrice: pendingRoundResult.endPrice,
              startTime: pendingRoundResult.startTime,
              endTime: pendingRoundResult.endTime,
              timestamp: Date.now(),
            }];
            while (newRoadmapHistory.length > 100) newRoadmapHistory.shift();

            // roadmapData 2D 배열 업데이트 (HTML과 동일한 로직)
            const newRoadmapData: RoadmapData = prev.roadmapData.map(col => [...col]);
            const cell: RoadmapCell = { round: pendingRoundResult.round, result };

            if (newRoadmapData.length === 0) {
              newRoadmapData.push([cell, null, null, null, null, null]);
            } else {
              const lastCol = newRoadmapData[newRoadmapData.length - 1];
              let lastFilledRow = -1;
              for (let i = 0; i < 6; i++) {
                if (lastCol[i] !== null) lastFilledRow = i;
              }
              const lastEntry = lastCol[lastFilledRow];
              const lastRes = lastEntry ? lastEntry.result : null;

              if (result === lastRes) {
                if (lastFilledRow < 5) {
                  lastCol[lastFilledRow + 1] = cell;
                } else {
                  newRoadmapData.push([null, null, null, null, null, cell]);
                }
              } else {
                while (newRoadmapData.length > 0 && newRoadmapData[newRoadmapData.length - 1][0] === null) {
                  newRoadmapData.pop();
                }
                newRoadmapData.push([cell, null, null, null, null, null]);
              }
            }

            while (newRoadmapData.length > MAX_ROADMAP_COLUMNS) {
              newRoadmapData.shift();
            }

            let newBullWins = prev.bullWins;
            let newBearWins = prev.bearWins;
            if (result === 'bull') newBullWins++;
            else if (result === 'bear') newBearWins++;

            // 유저 베팅 처리 (pendingRoundResult에서 저장해둔 베팅 정보 사용)
            let newTodayPnl = prev.todayPnl;
            let newWinStreak = prev.winStreak;
            let newBetHistory = prev.betHistory;

            if (pendingRoundResult.userBet && pendingRoundResult.betAmount > 0) {
              const userWon = pendingRoundResult.userBet === result;
              const isTieResult = result === 'tie';
              const payout = userWon ? pendingRoundResult.betAmount * PAYOUT_MULTIPLIER : (isTieResult ? pendingRoundResult.betAmount : 0);
              const profit = userWon ? payout - pendingRoundResult.betAmount : (isTieResult ? 0 : -pendingRoundResult.betAmount);

              newTodayPnl += profit;
              newWinStreak = userWon ? newWinStreak + 1 : 0;

              newBetHistory = [...prev.betHistory, {
                round: pendingRoundResult.round,
                side: pendingRoundResult.userBet,
                amount: pendingRoundResult.betAmount,
                result: isTieResult ? 'tie' : (userWon ? 'win' : 'lose'),
                payout,
                timestamp: Date.now(),
              }];
            }

            newState = {
              ...newState,
              roadmapHistory: newRoadmapHistory,
              roadmapData: newRoadmapData,
              bullWins: newBullWins,
              bearWins: newBearWins,
              todayPnl: newTodayPnl,
              winStreak: newWinStreak,
              betHistory: newBetHistory,
            };

            pendingRoundResult = null;
        }

        // 페이즈 변경 체크 (라운드 변경이 아닌 경우에만)
        if (info.round === lastRoundRef.current && info.phase !== lastPhaseRef.current) {
          // betting → countdown: 베팅 락 (아직 base price 설정 안함)
          if (info.phase === 'countdown' && lastPhaseRef.current === 'betting') {
            // countdown 시작 - 베팅 락만 하고 base price는 아직 설정 안함
            // 29초 종가를 base line으로 사용해야 하므로 countdown → game 전환 시 설정
            basePriceLockedRef.current = true;
          }
          // countdown → game: 게임 시작 (29초 종가를 base price로 설정)
          else if (info.phase === 'game' && lastPhaseRef.current === 'countdown') {
            basePriceLockedRef.current = true;

            // 시작 시간 기록 (29초)
            const now = new Date();
            const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
            const koreaTime = new Date(utcTime + (9 * 60 * 60 * 1000));
            roundStartTimeRef.current = koreaTime.toTimeString().split(' ')[0];

            // 게임 시작 타임스탬프 저장 (타임스탬프 기반으로 인덱스 계산)
            gameStartTimestampRef.current = Date.now();

            // 현재 priceHistory에서 해당 타임스탬프에 가장 가까운 인덱스 계산
            let gameStartIndex = prev.priceHistory.length - 1;
            if (prev.priceHistory.length > 0) {
              for (let i = prev.priceHistory.length - 1; i >= 0; i--) {
                if (prev.priceHistory[i].timestamp <= gameStartTimestampRef.current) {
                  gameStartIndex = i;
                  break;
                }
              }
            }

            // 임시로 현재 가격으로 설정 (API 응답 전까지 사용)
            const tempBasePrice = prev.currentPrice;
            roundStartPriceRef.current = tempBasePrice;
            apiBasePriceRef.current = tempBasePrice;

            // Binance API에서 실제 29초 캔들 종가 가져오기 (비동기)
            fetchSecondClosePrice(29).then(apiBasePrice => {
              if (apiBasePrice > 0) {
                // API에서 가져온 실제 29초 종가로 업데이트
                apiBasePriceRef.current = apiBasePrice;
                roundStartPriceRef.current = apiBasePrice;

                // localStorage에 저장된 베팅의 basePrice와 gameStartTimestamp도 업데이트
                try {
                  const savedBetStr = localStorage.getItem('bitbattle_currentBet');
                  if (savedBetStr) {
                    const savedBet = JSON.parse(savedBetStr);
                    if (savedBet.round === info.round) {
                      savedBet.basePrice = apiBasePrice;
                      savedBet.gameStartTimestamp = gameStartTimestampRef.current;
                      localStorage.setItem('bitbattle_currentBet', JSON.stringify(savedBet));
                    }
                  }
                } catch {
                  // 무시
                }

                setState(prevState => {
                  // gameStartIndex 위치의 가격을 basePrice로 강제 설정
                  // 이렇게 하면 차트 라인이 반드시 basePrice를 지나감
                  const newHistory = [...prevState.priceHistory];
                  if (prevState.gameStartIndex >= 0 && prevState.gameStartIndex < newHistory.length) {
                    newHistory[prevState.gameStartIndex] = {
                      ...newHistory[prevState.gameStartIndex],
                      price: apiBasePrice
                    };
                  }
                  return {
                    ...prevState,
                    basePrice: apiBasePrice,
                    priceHistory: newHistory,
                  };
                });
              }
            });

            newState = {
              ...newState,
              basePrice: tempBasePrice, // 임시로 현재 가격, API 응답 후 업데이트됨
              gameStartIndex,
              joinedMidRound: false, // 직접 라운드 시작을 경험했으므로 false
            };
          }

          lastPhaseRef.current = info.phase;
        }

        // 기본 상태 업데이트
        newState = {
          ...newState,
          currentRound: info.round,
          gamePhase: info.phase,
          timeRemaining: info.timeLeft,
        };

        // basePrice가 있으면 변화량 계산
        if (newState.basePrice > 0) {
          newState.priceChange = newState.currentPrice - newState.basePrice;
          newState.priceChangePercent = (newState.priceChange / newState.basePrice) * 100;
        }

        return newState;
      });
    }, 100);

    return () => {
      clearInterval(priceInterval);
      clearInterval(displayPriceInterval);
      clearInterval(gameInterval);
    };
  }, [fetchPrice, updateDisplayPrice, generateInitialHistory, loadRealHistoryFromBinance, loadInitialPriceHistory, fetchSecondClosePrice]);

  return {
    ...state,
    placeBet,
    cancelBet,
    resetBet,
    PAYOUT_MULTIPLIER,
    BETTING_DURATION,
    COUNTDOWN_DURATION,
    GAME_DURATION,
  };
}
