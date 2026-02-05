'use client';

import { useTonConnect } from '@/hooks/useTonConnect';
import { X, Wallet, ArrowRight, Shield } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORTED_WALLETS = [
  {
    name: 'Tonkeeper',
    icon: '🔵',
    description: 'Popular TON wallet',
    deepLink: 'tonkeeper://',
  },
  {
    name: 'MyTonWallet',
    icon: '💎',
    description: 'Web & Mobile wallet',
    deepLink: 'mytonwallet://',
  },
  {
    name: 'OpenMask',
    icon: '🎭',
    description: 'Browser extension',
    deepLink: 'openmask://',
  },
];

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, isConnected } = useTonConnect();

  if (!isOpen || isConnected) return null;

  const handleConnect = async () => {
    await connect();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm bg-[#1a1625] border border-[#2d2640] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2d2640]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Connect Wallet</h3>
              <p className="text-gray-400 text-xs">Choose your TON wallet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wallet List */}
        <div className="p-4 space-y-2">
          {SUPPORTED_WALLETS.map((wallet) => (
            <button
              key={wallet.name}
              onClick={handleConnect}
              className="w-full flex items-center justify-between p-3 bg-[#0f0b15]/50 hover:bg-[#2d2640] border border-[#2d2640] rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{wallet.icon}</span>
                <div className="text-left">
                  <p className="text-white font-medium">{wallet.name}</p>
                  <p className="text-gray-400 text-xs">{wallet.description}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
            </button>
          ))}
        </div>

        {/* Connect All Button */}
        <div className="p-4 pt-0">
          <button
            onClick={handleConnect}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold hover:opacity-90 transition-all"
          >
            Connect with TON Connect
          </button>
        </div>

        {/* Security Notice */}
        <div className="px-4 pb-4">
          <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg">
            <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-blue-300 text-xs">
              TON Connect ensures secure wallet connection. Your keys never leave your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
