import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Vercel Edge Middleware for language detection
 * - Checks x-vercel-ip-country header for country code
 * - KR → Korean, others → English
 * - Respects existing language preference in cookie
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Check if user already has a language preference cookie
  const existingLang = request.cookies.get('bitbattle_lang')?.value;
  
  if (!existingLang) {
    // Get country from Vercel's IP geolocation header
    const country = request.headers.get('x-vercel-ip-country') || 'US';
    
    // Set language based on country (KR → Korean, others → English)
    const detectedLang = country === 'KR' ? 'ko' : 'en';
    
    // Set cookie for detected language (expires in 1 year)
    response.cookies.set('bitbattle_lang', detectedLang, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    });
    
    // Also set as response header for immediate use
    response.headers.set('x-detected-lang', detectedLang);
  } else {
    // Pass existing preference through header
    response.headers.set('x-detected-lang', existingLang);
  }

  return response;
}

// Only run middleware on bullvsbear pages
export const config = {
  matcher: ['/bullvsbear/:path*'],
};
