'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full py-4 px-4 border-t border-white/10 bg-[#0f0b15]/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-400">
        <span className="text-gray-500">© 2026 Karma Games</span>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link 
            href="/terms" 
            className="hover:text-[#a855f7] transition-colors"
          >
            Terms
          </Link>
          <Link 
            href="/privacy" 
            className="hover:text-[#a855f7] transition-colors"
          >
            Privacy
          </Link>
          <Link 
            href="/disclaimer" 
            className="hover:text-[#a855f7] transition-colors"
          >
            Disclaimer
          </Link>
        </div>
      </div>
    </footer>
  );
}
