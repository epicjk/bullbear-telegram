'use client';

import { useState } from 'react';
import { useLegal } from '@/contexts/LegalContext';

interface BettingDisclaimerModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BettingDisclaimerModal({ isOpen, onConfirm, onCancel }: BettingDisclaimerModalProps) {
  const { agreeToBettingDisclaimer } = useLegal();
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    agreeToBettingDisclaimer();
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#1a1a24] border border-[#fbbf24]/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#fbbf24]/20 to-[#f97316]/20 px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h2 className="text-xl font-bold text-white">Risk Acknowledgment</h2>
              <p className="text-sm text-gray-400">Before placing your first bet</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-4">
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#ef4444]">•</span>
                <span>You may lose 100% of your wagered funds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ef4444]">•</span>
                <span>Cryptocurrency values are highly volatile</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ef4444]">•</span>
                <span>All transactions are final and cannot be reversed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ef4444]">•</span>
                <span>The house maintains an edge on all bets</span>
              </li>
            </ul>
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
                  ? 'bg-[#fbbf24] border-[#fbbf24]' 
                  : 'border-gray-500 group-hover:border-[#fbbf24]/50'
              }`}>
                {isChecked && (
                  <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-300 leading-relaxed">
              I understand that gambling involves risk and I may lose my funds. 
              I confirm this is money I can afford to lose.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-semibold text-gray-300 bg-[#2a2a3a] hover:bg-[#3a3a4a] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isChecked}
            className={`flex-1 py-3 rounded-xl font-bold text-black transition-all ${
              isChecked
                ? 'bg-gradient-to-r from-[#fbbf24] to-[#f97316] hover:opacity-90 active:scale-[0.98]'
                : 'bg-gray-600 cursor-not-allowed opacity-50 text-white'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
