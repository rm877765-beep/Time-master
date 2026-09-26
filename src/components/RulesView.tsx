import React from 'react';
import { Target, CheckCircle2, Award, Zap, BrainCircuit, ShieldAlert } from 'lucide-react';

interface RulesViewProps {
  onPlayNow: () => void;
}

export const RulesView: React.FC<RulesViewProps> = ({ onPlayNow }) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Chakra_Petch'] tracking-wide">
          HOW CHRONOPAY WORKS
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
          ChronoPay is an arcade skill challenge based on physiological reaction time and internal rhythm. Pay ₹10 to start the system chronometer, then hit STOP on the exact target time to win ₹100.
        </p>
      </div>

      {/* 3 Step Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-['Chakra_Petch'] text-lg">
            01
          </div>
          <h3 className="text-base font-bold text-white">Commit Your Entry Fee</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Deposit or use your ₹100 Welcome Bonus. Choose your stake tier (Standard ₹10 to win ₹100, or high roller options).
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-['Chakra_Petch'] text-lg">
            02
          </div>
          <h3 className="text-base font-bold text-white">Track the System Target</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The system displays the target time (e.g. 10.000s). Hit START to trigger the high-speed chronometer counting up in milliseconds.
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-['Chakra_Petch'] text-lg">
            03
          </div>
          <h3 className="text-base font-bold text-white">Slam STOP & Win ₹100</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Stop within the target tolerance window to trigger the 10x payout (₹100 credited directly to your passbook). Near misses get ₹15 cashback!
          </p>
        </div>
      </div>

      {/* Payout Matrix */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white font-['Chakra_Petch'] flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>PAYOUT & TOLERANCE MATRIX</span>
          </h3>
        </div>
        <div className="divide-y divide-slate-800 text-xs sm:text-sm">
          <div className="p-4 grid grid-cols-3 font-semibold text-slate-400 bg-slate-950/60">
            <span>Result Category</span>
            <span>Stop Precision Window</span>
            <span className="text-right">Return on ₹10 Entry</span>
          </div>
          <div className="p-4 grid grid-cols-3 items-center">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> System Jackpot
            </span>
            <span className="font-mono text-slate-300">Within ±0.038s of Target</span>
            <span className="font-mono font-bold text-emerald-400 text-right">₹100 (10x Return)</span>
          </div>
          <div className="p-4 grid grid-cols-3 items-center">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Near-Miss Consolation
            </span>
            <span className="font-mono text-slate-300">Within ±0.080s of Target</span>
            <span className="font-mono font-semibold text-amber-300 text-right">₹15 (1.5x Return)</span>
          </div>
          <div className="p-4 grid grid-cols-3 items-center">
            <span className="text-slate-400">Target Missed</span>
            <span className="font-mono text-slate-400">&gt; ±0.080s from Target</span>
            <span className="font-mono text-slate-500 text-right">₹0 (Entry lost)</span>
          </div>
        </div>
      </div>

      {/* Reflex Science Tips */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Chakra_Petch']">
          <BrainCircuit className="w-5 h-5 text-amber-400" />
          <span>PRO TIPS: MASTERING THE 10-SECOND STOP</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="space-y-1">
            <strong className="text-white block font-semibold">1. Compensate for Neural Latency</strong>
            <p className="text-slate-400 leading-relaxed">
              Human visual processing takes approximately 180ms to 240ms between seeing a number and a finger depressing the key. Anticipate the target rather than reacting after you see 10.000.
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-white block font-semibold">2. Establish Internal Metronome Tempo</strong>
            <p className="text-slate-400 leading-relaxed">
              Count in 1-second subdivisions (1-one-thousand, 2-one-thousand) or tap your foot in steady 60 BPM rhythm to land bullseyes even in Blind Clock mode.
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-white block font-semibold">3. Warm up in Free Practice Arena</strong>
            <p className="text-slate-400 leading-relaxed">
              Use Free Practice mode to calibrate your muscle memory and keyboard/screen latency before staking real rupees.
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-white block font-semibold">4. Use the Physical Spacebar</strong>
            <p className="text-slate-400 leading-relaxed">
              Tapping the spacebar provides faster mechanical actuation than mouse clicks or soft touchscreens.
            </p>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center pt-2">
        <button
          onClick={onPlayNow}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-base font-['Chakra_Petch'] uppercase tracking-wider transition-all shadow-xl shadow-amber-950/40 cursor-pointer"
        >
          Enter Game Arena (Pay ₹10 → Win ₹100)
        </button>
      </div>
    </div>
  );
};
