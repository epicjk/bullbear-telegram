// 숫자 포맷팅 유틸리티

/**
 * 가격을 USD 형식으로 포맷팅
 * @param price 가격
 * @param decimals 소수점 자릿수 (기본: 2)
 */
export function formatPrice(price: number, decimals = 2): string {
  return `$${price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * 가격 변화를 부호와 함께 포맷팅
 * @param change 가격 변화량
 * @param decimals 소수점 자릿수 (기본: 2)
 */
export function formatPriceChange(change: number, decimals = 2): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}$${change.toFixed(decimals)}`;
}

/**
 * 퍼센트 변화를 포맷팅
 * @param percent 퍼센트
 * @param decimals 소수점 자릿수 (기본: 3)
 */
export function formatPercent(percent: number, decimals = 3): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(decimals)}%`;
}

/**
 * 잔액을 포맷팅 (천 단위 구분)
 * @param balance 잔액
 */
export function formatBalance(balance: number): string {
  return `$${balance.toLocaleString()}`;
}

/**
 * 시간을 HH:MM:SS 형식으로 포맷팅
 * @param seconds 초
 */
export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 시간을 MM:SS 형식으로 포맷팅
 * @param seconds 초
 */
export function formatTimeShort(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 * @param date Date 객체
 */
export function formatDateKorean(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 상대적 시간 표시 (예: "방금 전", "5분 전")
 * @param timestamp 타임스탬프
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return new Date(timestamp).toLocaleDateString('ko-KR');
}

/**
 * 지갑 주소를 축약하여 표시
 * @param address 지갑 주소
 * @param prefixLength 앞자리 수 (기본: 6)
 * @param suffixLength 뒷자리 수 (기본: 4)
 */
export function shortenAddress(
  address: string,
  prefixLength = 6,
  suffixLength = 4
): string {
  if (address.length <= prefixLength + suffixLength) return address;
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * 큰 숫자를 축약 (K, M, B)
 * @param num 숫자
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}
