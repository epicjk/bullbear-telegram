'use client';

import { Modal } from '../ui/Modal';
import { EffectSettings, EffectType, EFFECT_LABELS, DEFAULT_EFFECT_SETTINGS } from '../effects/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  soundVolume: number;
  setSoundVolume: (v: number) => void;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  lang: 'ko' | 'en';
  setLang: (v: 'ko' | 'en') => void;
  betAlertEnabled: boolean;
  setBetAlertEnabled: (v: boolean) => void;
  effectSettings: EffectSettings;
  setEffectSettings: (v: EffectSettings) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  soundEnabled,
  setSoundEnabled,
  soundVolume,
  setSoundVolume,
  isDarkMode,
  setIsDarkMode,
  lang,
  setLang,
  betAlertEnabled,
  setBetAlertEnabled,
  effectSettings,
  setEffectSettings,
}: SettingsModalProps) {
  // effectSettings가 undefined일 경우 기본값 사용
  const safeEffectSettings = effectSettings || DEFAULT_EFFECT_SETTINGS;

  const toggleEffect = (key: EffectType) => {
    setEffectSettings({
      ...safeEffectSettings,
      [key]: !safeEffectSettings[key],
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === 'ko' ? '설정' : 'Settings'}
      icon="⚙️"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Sound Toggle */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
          <div>
            <div className="font-semibold text-white">🔊 {lang === 'ko' ? '사운드' : 'Sound'}</div>
            <div className="text-xs text-gray-500">{lang === 'ko' ? '게임 효과음' : 'Game sound effects'}</div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-12 h-7 rounded-full transition-colors relative ${soundEnabled ? 'bg-[#22c55e]' : 'bg-white/20'}`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${soundEnabled ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        {/* Volume Slider */}
        {soundEnabled && (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            <span className="text-sm">🔈</span>
            <input
              type="range"
              min="0"
              max="100"
              value={soundVolume * 100}
              onChange={e => setSoundVolume(parseInt(e.target.value) / 100)}
              className="flex-1 h-2 rounded-full appearance-none bg-white/20 accent-[#fbbf24]"
            />
            <span className="font-['Orbitron'] text-sm text-[#fbbf24] w-10 text-right">{Math.round(soundVolume * 100)}%</span>
          </div>
        )}

        {/* Bet Alert Toggle */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
          <div>
            <div className="font-semibold text-white">🔔 {lang === 'ko' ? '베팅 알림' : 'Bet Alert'}</div>
            <div className="text-xs text-gray-500">{lang === 'ko' ? '10초 전 베팅 알림' : 'Alert 10s before betting ends'}</div>
          </div>
          <button
            onClick={() => setBetAlertEnabled(!betAlertEnabled)}
            className={`w-12 h-7 rounded-full transition-colors relative ${betAlertEnabled ? 'bg-[#22c55e]' : 'bg-white/20'}`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${betAlertEnabled ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
          <div>
            <div className="font-semibold text-white">{isDarkMode ? '🌙' : '☀️'} {lang === 'ko' ? '테마' : 'Theme'}</div>
            <div className="text-xs text-gray-500">{isDarkMode ? (lang === 'ko' ? '다크 모드' : 'Dark Mode') : (lang === 'ko' ? '라이트 모드' : 'Light Mode')}</div>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-12 h-7 rounded-full transition-colors relative ${!isDarkMode ? 'bg-[#fbbf24]' : 'bg-white/20'}`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${!isDarkMode ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        {/* Language Select */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
          <div>
            <div className="font-semibold text-white">🌐 {lang === 'ko' ? '언어' : 'Language'}</div>
            <div className="text-xs text-gray-500">Language</div>
          </div>
          <select
            value={lang}
            onChange={e => setLang(e.target.value as 'ko' | 'en')}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-[#fbbf24] font-['Orbitron'] text-sm"
          >
            <option value="ko" className="bg-[#12121a]">한국어</option>
            <option value="en" className="bg-[#12121a]">English</option>
          </select>
        </div>

        {/* Effects Section */}
        <div className="pt-3 border-t border-white/10">
          <div className="text-sm font-semibold text-gray-400 mb-2">
            🎨 {lang === 'ko' ? '이펙트 효과' : 'Visual Effects'}
          </div>

          <div className="space-y-1">
            {/* countUp은 항상 활성화되어 설정에서 숨김 */}
            {(Object.keys(EFFECT_LABELS) as EffectType[])
              .filter(key => key !== 'countUp')
              .map(key => (
              <div
                key={key}
                className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{EFFECT_LABELS[key].icon}</span>
                  <div>
                    <div className="font-medium text-white text-xs">
                      {EFFECT_LABELS[key][lang]}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {EFFECT_LABELS[key].description[lang]}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleEffect(key)}
                  className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${safeEffectSettings[key] ? 'bg-[#a855f7]' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${safeEffectSettings[key] ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Section */}
        <div className="pt-3 border-t border-white/10">
          <div className="text-sm font-semibold text-gray-400 mb-2">
            ⚖️ {lang === 'ko' ? '법률 정보' : 'Legal'}
          </div>
          <div className="space-y-2">
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-white text-sm">{lang === 'ko' ? '서비스 이용약관' : 'Terms of Service'}</span>
              <span className="text-gray-500">→</span>
            </a>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-white text-sm">{lang === 'ko' ? '개인정보 처리방침' : 'Privacy Policy'}</span>
              <span className="text-gray-500">→</span>
            </a>
            <a
              href="/disclaimer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-white text-sm">{lang === 'ko' ? '면책조항' : 'Disclaimer'}</span>
              <span className="text-gray-500">→</span>
            </a>
          </div>
        </div>

        {/* Version */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t border-white/5">
          BitBattle <span className="text-[#fbbf24] font-['Orbitron']">v1.0.0</span>
        </div>
      </div>
    </Modal>
  );
}
