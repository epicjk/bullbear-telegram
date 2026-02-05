// GET /api/auth/me - 현재 로그인된 사용자 정보 조회
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, AuthUser } from '@/lib/auth';

export const runtime = 'nodejs';

interface MeResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<MeResponse>> {
  try {
    // 1. Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    // 2. 토큰 검증
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // 3. 사용자 정보 반환
    const user: AuthUser = {
      id: payload.sub,
      provider: payload.provider,
      telegramId: payload.telegramId,
      username: payload.username,
      firstName: payload.firstName,
    };

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('Me endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
