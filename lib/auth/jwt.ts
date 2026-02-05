// JWT 유틸리티 (jose 사용 - Edge Runtime 호환)
import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from 'jose';
import { AuthUser, JWTPayload } from './types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'bullbear-secret-key-change-in-production'
);

const JWT_ISSUER = 'bullbear';
const JWT_EXPIRATION = '7d'; // 7일

export async function createToken(user: AuthUser): Promise<string> {
  const payload: Partial<JWTPayload> = {
    sub: user.id,
    provider: user.provider,
    telegramId: user.telegramId,
    username: user.username,
    firstName: user.firstName,
  };

  const token = await new SignJWT(payload as unknown as JoseJWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
    });
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}
