'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LegalContextType {
  hasAgreedToTerms: boolean;
  hasAgreedToBettingDisclaimer: boolean;
  agreeToTerms: () => void;
  agreeToBettingDisclaimer: () => void;
  resetBettingDisclaimer: () => void;
}

const LegalContext = createContext<LegalContextType | null>(null);

const TERMS_AGREEMENT_KEY = 'karma_terms_agreed';
const BETTING_DISCLAIMER_KEY = 'karma_betting_disclaimer_session';

export function LegalProvider({ children }: { children: ReactNode }) {
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(true); // Default true to avoid flash
  const [hasAgreedToBettingDisclaimer, setHasAgreedToBettingDisclaimer] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const termsAgreed = localStorage.getItem(TERMS_AGREEMENT_KEY) === 'true';
    const bettingAgreed = sessionStorage.getItem(BETTING_DISCLAIMER_KEY) === 'true';
    
    setHasAgreedToTerms(termsAgreed);
    setHasAgreedToBettingDisclaimer(bettingAgreed);
    setIsHydrated(true);
  }, []);

  const agreeToTerms = () => {
    localStorage.setItem(TERMS_AGREEMENT_KEY, 'true');
    setHasAgreedToTerms(true);
  };

  const agreeToBettingDisclaimer = () => {
    sessionStorage.setItem(BETTING_DISCLAIMER_KEY, 'true');
    setHasAgreedToBettingDisclaimer(true);
  };

  const resetBettingDisclaimer = () => {
    sessionStorage.removeItem(BETTING_DISCLAIMER_KEY);
    setHasAgreedToBettingDisclaimer(false);
  };

  // Don't show modals until hydrated
  const value = {
    hasAgreedToTerms: isHydrated ? hasAgreedToTerms : true,
    hasAgreedToBettingDisclaimer: isHydrated ? hasAgreedToBettingDisclaimer : true,
    agreeToTerms,
    agreeToBettingDisclaimer,
    resetBettingDisclaimer,
  };

  return (
    <LegalContext.Provider value={value}>
      {children}
    </LegalContext.Provider>
  );
}

export function useLegal() {
  const context = useContext(LegalContext);
  if (!context) {
    throw new Error('useLegal must be used within a LegalProvider');
  }
  return context;
}
