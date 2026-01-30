import { GAME_CONFIG } from '../constants/theme';

/**
 * 승률 계산
 */
export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 50;
  return Math.round((wins / total) * 100);
}

/**
 * 잠재적 수익 계산
 */
export function calculatePotentialWin(betAmount: number, multiplier = GAME_CONFIG.winMultiplier): number {
  return betAmount * multiplier;
}

/**
 * 순수익 계산 (배당금 - 베팅금액)
 */
export function calculateNetProfit(betAmount: number, multiplier = GAME_CONFIG.winMultiplier): number {
  return betAmount * (multiplier - 1);
}

/**
 * 베팅 금액 파싱 (문자열 -> 숫자)
 */
export function parseBetAmount(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * 베팅 금액 유효성 검사
 */
export function validateBetAmount(
  amount: number,
  balance: number,
  min = GAME_CONFIG.minBet,
  max = GAME_CONFIG.maxBet
): { valid: boolean; error?: string } {
  if (amount < min) {
    return { valid: false, error: `최소 베팅 금액은 $${min}입니다` };
  }
  if (amount > max) {
    return { valid: false, error: `최대 베팅 금액은 $${max.toLocaleString()}입니다` };
  }
  if (amount > balance) {
    return { valid: false, error: '잔액이 부족합니다' };
  }
  return { valid: true };
}

/**
 * 현재 한국 시간 기준 라운드 번호 계산
 */
export function calculateCurrentRound(): number {
  const now = new Date();
  const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));

  // 2024년 1월 1일 00:00:00 KST 기준
  const epoch = new Date('2024-01-01T00:00:00+09:00');
  const diffMs = koreaTime.getTime() - epoch.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  return Math.floor(diffSeconds / GAME_CONFIG.roundDuration) + 1;
}

/**
 * 라운드 시작 시간 계산 (Unix timestamp)
 */
export function calculateRoundStartTime(round: number): number {
  const epoch = new Date('2024-01-01T00:00:00+09:00').getTime();
  return epoch + (round - 1) * GAME_CONFIG.roundDuration * 1000;
}

/**
 * 현재 라운드 내 남은 시간 계산
 */
export function calculateTimeRemaining(
  phase: 'betting' | 'countdown' | 'game'
): number {
  const now = new Date();
  const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const secondsInRound = koreaTime.getSeconds();

  switch (phase) {
    case 'betting':
      return Math.max(0, GAME_CONFIG.bettingDuration - secondsInRound);
    case 'countdown':
      return Math.max(0, GAME_CONFIG.bettingDuration + GAME_CONFIG.countdownDuration - secondsInRound);
    case 'game':
      return Math.max(0, GAME_CONFIG.roundDuration - secondsInRound);
    default:
      return 0;
  }
}

/**
 * 게임 결과 판정
 * @param startPrice 시작 가격
 * @param endPrice 종료 가격
 * @param precision 비교 정밀도 (소수점 자릿수)
 */
export function determineGameResult(
  startPrice: number,
  endPrice: number,
  precision = 2
): 'bull' | 'bear' | 'tie' {
  const roundedStart = parseFloat(startPrice.toFixed(precision));
  const roundedEnd = parseFloat(endPrice.toFixed(precision));

  if (roundedEnd > roundedStart) return 'bull';
  if (roundedEnd < roundedStart) return 'bear';
  return 'tie';
}

/**
 * 스트릭 계산 (연속 승/패)
 */
export function calculateStreak(
  results: Array<{ result: 'bull' | 'bear' | 'tie'; userBet?: 'bull' | 'bear' | null }>
): { type: 'win' | 'lose' | 'none'; count: number } {
  if (results.length === 0) return { type: 'none', count: 0 };

  let streak = 0;
  let streakType: 'win' | 'lose' | 'none' = 'none';

  for (let i = results.length - 1; i >= 0; i--) {
    const { result, userBet } = results[i];

    if (!userBet) continue;

    const isWin = userBet === result;

    if (streakType === 'none') {
      streakType = isWin ? 'win' : 'lose';
      streak = 1;
    } else if ((isWin && streakType === 'win') || (!isWin && streakType === 'lose')) {
      streak++;
    } else {
      break;
    }
  }

  return { type: streakType, count: streak };
}

/**
 * 최근 결과에서 BULL/BEAR 비율 계산
 */
export function calculateResultRatio(
  results: Array<{ result: 'bull' | 'bear' | 'tie' }>,
  lastN?: number
): { bull: number; bear: number; tie: number } {
  const subset = lastN ? results.slice(-lastN) : results;
  const total = subset.length;

  if (total === 0) {
    return { bull: 0, bear: 0, tie: 0 };
  }

  const counts = subset.reduce(
    (acc, { result }) => {
      acc[result]++;
      return acc;
    },
    { bull: 0, bear: 0, tie: 0 }
  );

  return {
    bull: Math.round((counts.bull / total) * 100),
    bear: Math.round((counts.bear / total) * 100),
    tie: Math.round((counts.tie / total) * 100),
  };
}
