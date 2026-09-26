import React from 'react';
import { Volume2, VolumeX, Plus, Wallet } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  balance: number;
  activeTab: 'ARENA' | 'RULES' | 'LEDGER' | 'STATS';
  setActiveTab: (tab: 'ARENA' | 'RULES' | 'LEDGER' | 'STATS') => void;
  onOpenDeposit: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  balance,
  activeTab,
  setActiveTab,
  onOpenDeposit,
  isMuted,
  setIsMuted,
}) => {
  const handleSoundToggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  return (
    <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <button
        onClick={() => setActiveTab('ARENA')}
        className="text-xl sm:text-2xl font-bold tracking-tight text-white hover:text-amber-400 transition-colors flex items-center gap-2 cursor-pointer"
      >
        <span className="font-['Chakra_Petch'] tracking-wider text-amber-400">CHRONO<span className="text-white">PAY</span></span>
      </button>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('ARENA');
          }}
          className={`hover:text-white transition-colors cursor-pointer ${
            activeTab === 'ARENA' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Game Arena
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('RULES');
          }}
          className={`hover:text-white transition-colors cursor-pointer ${
            activeTab === 'RULES' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Rules & Payouts
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('LEDGER');
          }}
          className={`hover:text-white transition-colors cursor-pointer ${
            activeTab === 'LEDGER' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Passbook
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('STATS');
          }}
          className={`hover:text-white transition-colors cursor-pointer ${
            activeTab === 'STATS' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Reflex Stats
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        {/* Sound toggle button */}
        <button
          onClick={handleSoundToggle}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all cursor-pointer"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Real Wallet Balance Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenDeposit();
          }}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/20 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-white transition-all cursor-pointer shadow-sm group"
        >
          <Wallet className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="font-['JetBrains_Mono'] font-bold text-sm sm:text-base tabular-nums">
            ₹{balance.toFixed(2)}
          </span>
          <span className="flex items-center gap-0.5 text-xs text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded font-medium">
            <Plus className="w-3 h-3" /> Add
          </span>
        </button>
      </div>
    </header>
  );
};
