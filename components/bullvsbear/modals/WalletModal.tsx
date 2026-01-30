'use client';

import { Modal } from '../ui/Modal';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletName: string) => void;
  lang: 'ko' | 'en';
}

const WALLETS = [
  { name: 'MetaMask', icon: '🦊' },
  { name: 'Phantom', icon: '👻' },
  { name: 'OKX', icon: '⭕' },
  { name: 'Coinbase', icon: '🔵' },
  { name: 'Trust', icon: '🛡️' },
  { name: 'Rainbow', icon: '🌈' },
  { name: 'Rabby', icon: '🐰' },
  { name: 'WalletConnect', icon: '🔗' },
];

export function WalletModal({ isOpen, onClose, onConnect, lang }: WalletModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === 'ko' ? '지갑 연결' : 'Connect Wallet'}
      icon="👛"
    >
      <div className="text-center mb-4">
        <p className="text-gray-500 text-sm">
          {lang === 'ko' ? '지갑을 선택하세요' : 'Choose your wallet'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {WALLETS.map(wallet => (
          <button
            key={wallet.name}
            onClick={() => onConnect(wallet.name)}
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#a855f7] transition-all"
          >
            <span className="text-2xl">{wallet.icon}</span>
            <span className="font-semibold text-white">{wallet.name}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onClose}
        className="w-full mt-6 py-3 rounded-xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition-colors"
      >
        {lang === 'ko' ? '취소' : 'Cancel'}
      </button>
    </Modal>
  );
}
