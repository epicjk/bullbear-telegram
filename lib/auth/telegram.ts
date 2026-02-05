// 텔레그램 initData 검증 로직
import { createHmac } from 'crypto';
import { TelegramUser, AuthUser } from './types';

const AUTH_DATE_MAX_AGE = 5 * 60; // 5분 (초)

interface ParsedInitData {
  hash: string;
  dataCheckString: string;
  authDate: number;
  user?: TelegramUser;
  queryId?: string;
  startParam?: string;
}

/**
 * initData 파싱
 * query string 형태로 오는 initData를 파싱
 */
export function parseInitData(initData: string): ParsedInitData | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    const authDateStr = params.get('auth_date');

    if (!hash || !authDateStr) {
      return null;
    }

    const authDate = parseInt(authDateStr, 10);
    if (isNaN(authDate)) {
      return null;
    }

    // user 파싱 (JSON 문자열)
    let user: TelegramUser | undefined;
    const userStr = params.get('user');
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch {
        // user 파싱 실패해도 진행
      }
    }

    // data_check_string 생성: hash 제외, 알파벳 순 정렬, \n 구분
    const entries: [string, string][] = [];
    params.forEach((value, key) => {
      if (key !== 'hash') {
        entries.push([key, value]);
      }
    });
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

    return {
      hash,
      dataCheckString,
      authDate,
      user,
      queryId: params.get('query_id') || undefined,
      startParam: params.get('start_param') || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * HMAC-SHA256 검증
 * 1. secret_key = HMAC-SHA256("WebAppData", BOT_TOKEN)
 * 2. computed_hash = HMAC-SHA256(data_check_string, secret_key)
 * 3. computed_hash === hash 비교
 */
export function verifyHash(dataCheckString: string, hash: string, botToken: string): boolean {
  // secret_key = HMAC-SHA256("WebAppData", BOT_TOKEN)
  const secretKey = createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  // computed_hash = HMAC-SHA256(data_check_string, secret_key)
  const computedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return computedHash === hash;
}

/**
 * auth_date 유효성 검사
 * 너무 오래된 요청 거부
 */
export function isAuthDateValid(authDate: number, maxAge: number = AUTH_DATE_MAX_AGE): boolean {
  const now = Math.floor(Date.now() / 1000);
  return (now - authDate) <= maxAge;
}

/**
 * 전체 검증 프로세스
 */
export function validateTelegramInitData(
  initData: string,
  botToken: string
): { valid: true; user: TelegramUser } | { valid: false; error: string } {
  // 1. 파싱
  const parsed = parseInitData(initData);
  if (!parsed) {
    return { valid: false, error: 'Invalid initData format' };
  }

  // 2. hash 검증
  if (!verifyHash(parsed.dataCheckString, parsed.hash, botToken)) {
    return { valid: false, error: 'Invalid hash' };
  }

  // 3. auth_date 검증
  if (!isAuthDateValid(parsed.authDate)) {
    return { valid: false, error: 'Auth date expired' };
  }

  // 4. user 필수
  if (!parsed.user) {
    return { valid: false, error: 'User data missing' };
  }

  return { valid: true, user: parsed.user };
}

/**
 * TelegramUser를 AuthUser로 변환
 */
export function telegramUserToAuthUser(telegramUser: TelegramUser): AuthUser {
  return {
    id: `tg_${telegramUser.id}`,
    provider: 'telegram',
    telegramId: telegramUser.id,
    username: telegramUser.username,
    firstName: telegramUser.first_name,
    lastName: telegramUser.last_name,
    isPremium: telegramUser.is_premium,
    photoUrl: telegramUser.photo_url,
    languageCode: telegramUser.language_code,
  };
}
