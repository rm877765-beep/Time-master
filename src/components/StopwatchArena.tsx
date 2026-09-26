import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameMode, Difficulty, DifficultyConfig, StakeTier, AttemptRecord } from '../types/game';
import { sound } from '../utils/audio';
import { PrecisionGauge } from './PrecisionGauge';
import { Play, Square, RotateCcw, Sparkles, Trophy, Zap, AlertCircle } from 'lucide-react';

interface StopwatchArenaProps {
  balance: number;
  onDeductFee: (fee: number, title: string) => boolean;
  onCreditPayout: (payout: number, title: string, isJackpot: boolean) => void;
  onRecordAttempt: (attempt: AttemptRecord) => void;
  onOpenDeposit: () => void;
}

const STAKE_TIERS: StakeTier[] = [
  { id: '10_rupees', name: 'Standard ₹10', entryFee: 10, jackpotPayout: 100, consolationPayout: 15 },
  { id: '25_rupees', name: 'High Roller ₹25', entryFee: 25, jackpotPayout: 250, consolationPayout: 40 },
  { id: '50_rupees', name: 'Jackpot Max ₹50', entryFee: 50, jackpotPayout: 500, consolationPayout: 80 },
];

const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  ARCADE: {
    name: 'Arcade Standard',
    toleranceMs: 38, // ±0.038s
    consolationToleranceMs: 80, // ±0.080s
    description: '±0.038s window. Balanced authentic carnival challenge.',
  },
  PRO: {
    name: 'Master Reflex',
    toleranceMs: 20, // ±0.020s
    consolationToleranceMs: 50, // ±0.050s
    description: '±0.020s window. Ultra-tight surgical precision.',
  },
  CASUAL: {
    name: 'Casual Friendly',
    toleranceMs: 65, // ±0.065s
    consolationToleranceMs: 120, // ±0.120s
    description: '±0.065s window. Great for building timing muscle memory.',
  },
};

export const StopwatchArena: React.FC<StopwatchArenaProps> = ({
  balance,
  onDeductFee,
  onCreditPayout,
  onRecordAttempt,
  onOpenDeposit,
}) => {
  // Game Configuration State
  const [mode, setMode] = useState<GameMode>('CLASSIC_10S');
  const [selectedStake, setSelectedStake] = useState<StakeTier>(STAKE_TIERS[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>('ARCADE');

  // Gameplay State
  const [targetSeconds, setTargetSeconds] = useState<number>(10.000);
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'STOPPED'>('IDLE');
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [lastAttempt, setLastAttempt] = useState<AttemptRecord | null>(null);

  // References for precision animation frame
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastTickSecondRef = useRef<number>(0);

  // Generate target based on mode
  const setupTarget = useCallback((targetMode: GameMode) => {
    if (targetMode === 'CLASSIC_10S') {
      setTargetSeconds(10.000);
    } else if (targetMode === 'SYSTEM_ROULETTE') {
      // Pick random system targets: 5.000s, 7.500s, 8.000s, 9.990s, 11.000s, 12.500s
      const systemTargets = [5.000, 6.500, 7.777, 8.500, 10.000, 11.250, 12.000];
      const randomTarget = systemTargets[Math.floor(Math.random() * systemTargets.length)];
      setTargetSeconds(randomTarget);
    } else if (targetMode === 'BLIND_CLOCK') {
      setTargetSeconds(8.000); // 8.000s blind test
    } else {
      setTargetSeconds(10.000);
    }
  }, []);

  // Update target when mode changes
  useEffect(() => {
    if (gameState === 'IDLE') {
      setupTarget(mode);
    }
  }, [mode, gameState, setupTarget]);

  // Clean animation frame on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const diffConfig = DIFFICULTIES[difficulty];
  const isPractice = mode === 'PRACTICE';
  const currentFee = isPractice ? 0 : selectedStake.entryFee;
  const currentJackpot = isPractice ? 0 : selectedStake.jackpotPayout;
  const currentConsolation = isPractice ? 0 : selectedStake.consolationPayout;

  // Start the timer
  const handleStart = () => {
    // If real money, verify balance
    if (!isPractice) {
      if (balance < currentFee) {
        sound.playMiss();
        onOpenDeposit();
        return;
      }
      const success = onDeductFee(currentFee, `Entry Fee: ₹${currentFee} (Target: ${targetSeconds.toFixed(3)}s)`);
      if (!success) {
        onOpenDeposit();
        return;
      }
      sound.playCoin();
    } else {
      sound.playClick();
    }

    // Set target if roulette
    if (mode === 'SYSTEM_ROULETTE') {
      setupTarget('SYSTEM_ROULETTE');
    }

    setElapsedMs(0);
    setLastAttempt(null);
    setGameState('RUNNING');
    lastTickSecondRef.current = 0;

    // High precision start
    startTimeRef.current = performance.now();

    const loop = (now: number) => {
      const currentElapsed = now - startTimeRef.current;
      setElapsedMs(currentElapsed);

      // Sound tick feedback when getting closer to target (last 2 seconds)
      const targetMs = targetSeconds * 1000;
      const remainingMs = targetMs - currentElapsed;

      if (remainingMs > 0 && remainingMs <= 2500) {
        const currentIntSecond = Math.floor(currentElapsed / 350);
        if (currentIntSecond !== lastTickSecondRef.current) {
          lastTickSecondRef.current = currentIntSecond;
          sound.playTick(900 + (2500 - remainingMs) * 0.4);
        }
      }

      // Max run cap (target + 5 seconds) to prevent infinite running
      if (currentElapsed > targetMs + 5000) {
        handleStop(currentElapsed);
        return;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  // Stop the timer
  const handleStop = (finalElapsed?: number) => {
    if (gameState !== 'RUNNING') return;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const exactElapsedMs = finalElapsed !== undefined ? finalElapsed : performance.now() - startTimeRef.current;
    setElapsedMs(exactElapsedMs);
    setGameState('STOPPED');
    sound.playSlam();

    // Haptics if available
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(60);
    }

    const stoppedSec = exactElapsedMs / 1000;
    const deltaSec = stoppedSec - targetSeconds;
    const absDeltaMs = Math.abs(deltaSec * 1000);

    const isJackpot = absDeltaMs <= diffConfig.toleranceMs;
    const isConsolation = !isJackpot && absDeltaMs <= diffConfig.consolationToleranceMs;

    let payout = 0;
    if (isJackpot) {
      payout = isPractice ? 0 : currentJackpot;
      sound.playJackpot();
      if (!isPractice) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#FFFFFF'],
        });
        onCreditPayout(payout, `🏆 Jackpot Win! Stopped at ${stoppedSec.toFixed(3)}s (Target: ${targetSeconds.toFixed(3)}s)`, true);
      }
    } else if (isConsolation) {
      payout = isPractice ? 0 : currentConsolation;
      sound.playConsolation();
      if (!isPractice) {
        onCreditPayout(payout, `🥈 Near-Miss Consolation! Stopped at ${stoppedSec.toFixed(3)}s`, false);
      }
    } else {
      sound.playMiss();
    }

    const attempt: AttemptRecord = {
      id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      mode,
      targetSeconds,
      stoppedSeconds: stoppedSec,
      deltaSeconds: deltaSec,
      absDeltaMs,
      isJackpot,
      isConsolation,
      entryFee: currentFee,
      payout,
      netGain: payout - currentFee,
    };

    setLastAttempt(attempt);
    onRecordAttempt(attempt);
  };

  const handleReset = () => {
    sound.playClick();
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setGameState('IDLE');
    setElapsedMs(0);
    setLastAttempt(null);
    setupTarget(mode);
  };

  // Keyboard shortcut: Spacebar to Start/Stop, R to Reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'IDLE' || gameState === 'STOPPED') {
          handleStart();
        } else if (gameState === 'RUNNING') {
          handleStop();
        }
      } else if (e.code === 'KeyR' && gameState === 'STOPPED') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, balance, currentFee, mode, targetSeconds]);

  // Format digital stopwatch display
  const totalSeconds = elapsedMs / 1000;
  const wholeSeconds = Math.floor(totalSeconds);
  const milliseconds = Math.floor(elapsedMs % 1000);

  // Blind mode blackout condition
  const isBlindHidden = mode === 'BLIND_CLOCK' && gameState === 'RUNNING' && elapsedMs > 3000;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Banner / System Notice */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-wide">
              SYSTEM TARGET: <span className="font-mono text-amber-400 font-extrabold text-lg">{targetSeconds.toFixed(3)}s</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isPractice ? 'Free Practice Arena · Refine your millisecond reflex' : `Entry Fee: ₹${currentFee} · Win ₹${currentJackpot} on exact target stop`}
          </p>
        </div>

        {/* Stake summary badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Jackpot Prize</span>
            <span className="text-lg font-bold font-mono text-emerald-400">
              {isPractice ? 'Practice (₹0)' : `₹${currentJackpot}`}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Consolation</span>
            <span className="text-sm font-semibold font-mono text-amber-300">
              {isPractice ? 'Practice' : `₹${currentConsolation}`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Digital Chronometer Dashboard */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-800 p-6 sm:p-10 arcade-bevel text-center">
        {/* Ambient background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Mode & Target Status Pill-free Header */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-mono tracking-wider mb-6">
          <span className="uppercase text-amber-400 font-bold">{mode.replace('_', ' ')}</span>
          <span aria-hidden="true">·</span>
          <span>TOLERANCE: ±{(diffConfig.toleranceMs / 1000).toFixed(3)}s</span>
          <span aria-hidden="true">·</span>
          <span>TARGET: {targetSeconds.toFixed(3)}s</span>
        </div>

        {/* High-Precision Digital Time Readout */}
        <div className="my-6 sm:my-8">
          {isBlindHidden ? (
            <div className="h-32 sm:h-44 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-400 animate-spin flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-amber-400 font-['Chakra_Petch'] text-2xl sm:text-3xl font-bold tracking-widest uppercase animate-pulse">
                [ BLIND SENSING ]
              </p>
              <p className="text-xs text-slate-400 font-mono">Digits hidden after 3.0s — Trust your internal rhythm!</p>
            </div>
          ) : (
            <div className="flex items-baseline justify-center font-['JetBrains_Mono'] tracking-tight select-none">
              {/* Seconds */}
              <span className={`text-6xl sm:text-8xl md:text-9xl font-extrabold tabular-nums transition-colors ${
                gameState === 'RUNNING'
                  ? 'text-white arcade-glow-amber'
                  : lastAttempt?.isJackpot
                  ? 'text-emerald-400 arcade-glow-emerald'
                  : lastAttempt?.isConsolation
                  ? 'text-amber-400 arcade-glow-amber'
                  : gameState === 'STOPPED'
                  ? 'text-slate-300'
                  : 'text-slate-400'
              }`}>
                {String(wholeSeconds).padStart(2, '0')}
              </span>

              {/* Decimal separator */}
              <span className="text-4xl sm:text-7xl font-bold text-amber-500/70 px-1 sm:px-2">.</span>

              {/* Milliseconds */}
              <span className={`text-4xl sm:text-7xl md:text-8xl font-bold tabular-nums transition-colors ${
                gameState === 'RUNNING'
                  ? 'text-amber-400'
                  : lastAttempt?.isJackpot
                  ? 'text-emerald-300'
                  : lastAttempt?.isConsolation
                  ? 'text-amber-300'
                  : gameState === 'STOPPED'
                  ? 'text-slate-400'
                  : 'text-slate-600'
              }`}>
                {String(milliseconds).padStart(3, '0')}
              </span>
            </div>
          )}
        </div>

        {/* Live Precision Gauge & Delta Visualizer */}
        <div className="max-w-xl mx-auto my-6">
          <PrecisionGauge
            deltaSeconds={lastAttempt ? lastAttempt.deltaSeconds : null}
            toleranceMs={diffConfig.toleranceMs}
            consolationMs={diffConfig.consolationToleranceMs}
            stoppedSeconds={lastAttempt ? lastAttempt.stoppedSeconds : null}
            targetSeconds={targetSeconds}
          />
        </div>

        {/* Result Outcome Callout */}
        {gameState === 'STOPPED' && lastAttempt && (
          <div className="my-6 max-w-lg mx-auto">
            {lastAttempt.isJackpot ? (
              <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 shadow-xl shadow-emerald-900/30 animate-bounce">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-['Chakra_Petch'] font-bold text-xl sm:text-2xl">
                  <Trophy className="w-6 h-6 text-amber-400" />
                  <span>JACKPOT CRACKED!</span>
                </div>
                <p className="text-sm text-emerald-200 mt-1">
                  {isPractice ? 'Flawless stop in Practice Mode!' : `You won ₹${lastAttempt.payout} credited directly to your passbook!`}
                </p>
                <div className="text-xs text-emerald-400/90 font-mono mt-2">
                  Stopped at {lastAttempt.stoppedSeconds.toFixed(3)}s · Target: {lastAttempt.targetSeconds.toFixed(3)}s (Delta: {lastAttempt.absDeltaMs.toFixed(1)}ms)
                </div>
              </div>
            ) : lastAttempt.isConsolation ? (
              <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 shadow-lg shadow-amber-950/40">
                <div className="flex items-center justify-center gap-2 text-amber-400 font-['Chakra_Petch'] font-bold text-lg">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>NEAR-MISS CONSOLATION!</span>
                </div>
                <p className="text-sm text-amber-200 mt-1">
                  {isPractice ? 'Very close! Off by just a sliver.' : `Missed jackpot by ${(lastAttempt.absDeltaMs - diffConfig.toleranceMs).toFixed(1)}ms! Earned ₹${lastAttempt.payout} cashback.`}
                </p>
                <div className="text-xs text-amber-400/80 font-mono mt-2">
                  Stopped at {lastAttempt.stoppedSeconds.toFixed(3)}s (Delta: {lastAttempt.deltaSeconds > 0 ? '+' : ''}{lastAttempt.deltaSeconds.toFixed(3)}s)
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="text-slate-300 font-semibold text-base">
                  {lastAttempt.deltaSeconds < 0 ? 'Stopped Early!' : 'Stopped Late!'}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Stopped at {lastAttempt.stoppedSeconds.toFixed(3)}s (Missed target by {Math.abs(lastAttempt.deltaSeconds).toFixed(3)}s).
                  Need within ±{(diffConfig.toleranceMs / 1000).toFixed(3)}s for ₹{currentJackpot}.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Giant Tactile Arcade Action Button */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4">
          {gameState === 'RUNNING' ? (
            <button
              onClick={() => handleStop()}
              className="w-full max-w-md py-6 sm:py-8 px-8 rounded-2xl bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 active:translate-y-1 text-white font-['Chakra_Petch'] text-2xl sm:text-3xl font-extrabold tracking-wider shadow-2xl shadow-rose-900/50 cursor-pointer border-t-2 border-rose-300 transition-all flex items-center justify-center gap-3 animate-pulse"
            >
              <Square className="w-7 h-7 fill-white" />
              <span>STOP TIME NOW!</span>
            </button>
          ) : (
            <div className="w-full max-w-md space-y-3">
              <button
                onClick={handleStart}
                className="w-full py-6 sm:py-7 px-8 rounded-2xl bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 active:translate-y-1 text-slate-950 font-['Chakra_Petch'] text-2xl sm:text-3xl font-extrabold tracking-wider shadow-2xl shadow-amber-950/60 cursor-pointer border-t-2 border-amber-300 transition-all flex items-center justify-center gap-3"
              >
                <Play className="w-7 h-7 fill-slate-950" />
                <span>
                  {gameState === 'STOPPED'
                    ? (isPractice ? 'RETRY FREE PRACTICE' : `PLAY AGAIN (PAY ₹${currentFee})`)
                    : (isPractice ? 'START PRACTICE' : `PAY ₹${currentFee} & START`)}
                </span>
              </button>

              {gameState === 'STOPPED' && (
                <button
                  onClick={handleReset}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-medium cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Chronometer to 00.000 (Hotkey: R)</span>
                </button>
              )}
            </div>
          )}

          {/* Quick Keyboard Hint */}
          <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
            <span>PRO TIP: Tap anywhere or press <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700">SPACEBAR</kbd> to Start and Stop</span>
          </p>
        </div>
      </div>

      {/* Mode & Wager Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Game Mode Selector */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Game Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (gameState === 'RUNNING') return;
                sound.playClick();
                setMode('CLASSIC_10S');
              }}
              className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer ${
                mode === 'CLASSIC_10S'
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-white">Classic 10.000s</div>
              <div className="text-[10px] text-slate-400">Carnival 10s stop</div>
            </button>

            <button
              onClick={() => {
                if (gameState === 'RUNNING') return;
                sound.playClick();
                setMode('SYSTEM_ROULETTE');
              }}
              className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer ${
                mode === 'SYSTEM_ROULETTE'
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-white">Target Roulette</div>
              <div className="text-[10px] text-slate-400">Random system goal</div>
            </button>

            <button
              onClick={() => {
                if (gameState === 'RUNNING') return;
                sound.playClick();
                setMode('BLIND_CLOCK');
              }}
              className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer ${
                mode === 'BLIND_CLOCK'
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-white">Blind Clock</div>
              <div className="text-[10px] text-slate-400">Digits blur at 3.0s</div>
            </button>

            <button
              onClick={() => {
                if (gameState === 'RUNNING') return;
                sound.playClick();
                setMode('PRACTICE');
              }}
              className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer ${
                mode === 'PRACTICE'
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-white">Free Practice</div>
              <div className="text-[10px] text-slate-400">No rupees wagered</div>
            </button>
          </div>
        </div>

        {/* Stake Tier Selector */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Stake & Payout Tier (10x Win)
          </label>
          <div className="space-y-2">
            {STAKE_TIERS.map((tier) => (
              <button
                key={tier.id}
                disabled={mode === 'PRACTICE'}
                onClick={() => {
                  if (gameState === 'RUNNING') return;
                  sound.playClick();
                  setSelectedStake(tier);
                }}
                className={`w-full p-2.5 rounded-xl text-left border flex items-center justify-between text-xs font-medium transition-all cursor-pointer ${
                  mode === 'PRACTICE'
                    ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
                    : selectedStake.id === tier.id
                    ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div>
                  <span className="font-bold text-white">Pay ₹{tier.entryFee}</span>
                  <span className="text-[11px] text-slate-400 ml-2">→ Win ₹{tier.jackpotPayout}</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  10x Return
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Window Selector */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Target Precision Tolerance
          </label>
          <div className="space-y-2">
            {(Object.keys(DIFFICULTIES) as Difficulty[]).map((key) => {
              const diff = DIFFICULTIES[key];
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (gameState === 'RUNNING') return;
                    sound.playClick();
                    setDifficulty(key);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer ${
                    difficulty === key
                      ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{diff.name}</span>
                    <span className="text-[11px] font-mono text-amber-300">±{(diff.toleranceMs / 1000).toFixed(3)}s</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{diff.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Balance notice if low */}
      {balance < currentFee && !isPractice && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Wallet balance is below entry fee (₹{balance.toFixed(2)})</p>
              <p className="text-xs text-amber-200/70">Top up with simulated UPI to continue competing for the ₹{currentJackpot} jackpot.</p>
            </div>
          </div>
          <button
            onClick={onOpenDeposit}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors shadow-sm"
          >
            Add Cash
          </button>
        </div>
      )}
    </div>
  );
};
