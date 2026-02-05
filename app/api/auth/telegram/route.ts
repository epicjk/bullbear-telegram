// POST /api/auth/telegram - 텔레그램 initData 검증
import { NextRequest, NextResponse } from 'next/server';
import { 
  validateTelegramInitData, 
  telegramUserToAuthUser, 
  createToken,
  AuthResponse 
} from '@/lib/auth';

export const runtime = 'nodejs'; // crypto 모듈 사용

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    // 1. Request body 파싱
    const body = await request.json();
    const { initData } = body;

    if (!initData || typeof initData !== 'string') {
      return NextResponse.json(
        { success: false, error: 'initData is required' },
        { status: 400 }
      );
    }

    // 2. BOT_TOKEN 확인
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // 3. initData 검증
    const result = validateTelegramInitData(initData, botToken);
    
    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    // 4. AuthUser 생성
    const user = telegramUserToAuthUser(result.user);

    // 5. JWT 토큰 발급
    const token = await createToken(user);

    // 6. 성공 응답
    return NextResponse.json({
      success: true,
      token,
      user,
    });

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
