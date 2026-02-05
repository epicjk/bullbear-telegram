'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLegal } from '@/contexts/LegalContext';

export function AgeConsentModal() {
  const { hasAgreedToTerms, agreeToTerms } = useLegal();
  const [isChecked, setIsChecked] = useState(false);

  if (hasAgreedToTerms) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#1a1a24] border border-[#a855f7]/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#a855f7]/20 to-[#ec4899]/20 px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎰</span>
            <div>
              <h2 className="text-xl font-bold text-white">Welcome to Karma Games</h2>
              <p className="text-sm text-gray-400">Please confirm to continue</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-4">
            <p className="text-sm text-gray-300 leading-relaxed">
              <span className="text-[#ef4444] font-semibold">⚠️ Important:</span> This platform involves real cryptocurrency wagering. 
              You may lose some or all of your funds. Only play with money you can afford to lose.
            </p>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                isChecked 
                  ? 'bg-[#a855f7] border-[#a855f7]' 
                  : 'border-gray-500 group-hover:border-[#a855f7]/50'
              }`}>
                {isChecked && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-300 leading-relaxed">
              I am at least <span className="text-white font-semibold">21 years old</span> and agree to the{' '}
              <Link href="/terms" className="text-[#a855f7] hover:underline" target="_blank">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#a855f7] hover:underline" target="_blank">
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          <button
            onClick={agreeToTerms}
            disabled={!isChecked}
            className={`w-full py-3.5 rounded-xl font-bold text-white transition-all ${
              isChecked
                ? 'bg-gradient-to-r from-[#a855f7] to-[#ec4899] hover:opacity-90 active:scale-[0.98]'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            Continue
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">
            By continuing, you acknowledge that gambling involves risk.
          </p>
        </div>
      </div>
    </div>
  );
}
