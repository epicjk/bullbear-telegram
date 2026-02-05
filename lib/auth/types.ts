// 인증 관련 타입 정의

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramInitData {
  query_id?: string;
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  start_param?: string;
}

export interface AuthUser {
  id: string;
  provider: 'telegram' | 'app';
  telegramId?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  isPremium?: boolean;
  photoUrl?: string;
  languageCode?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
}

export interface JWTPayload {
  sub: string;           // user id
  provider: 'telegram' | 'app';
  telegramId?: number;
  username?: string;
  firstName?: string;
  iat: number;
  exp: number;
}
