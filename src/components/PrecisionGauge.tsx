import React from 'react';

interface PrecisionGaugeProps {
  deltaSeconds: number | null;
  toleranceMs: number;
  consolationMs: number;
  stoppedSeconds: number | null;
  targetSeconds: number;
}

export const PrecisionGauge: React.FC<PrecisionGaugeProps> = ({
  deltaSeconds,
  toleranceMs,
  consolationMs,
  stoppedSeconds,
  targetSeconds,
}) => {
  if (deltaSeconds === null || stoppedSeconds === null) {
    return (
      <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 sm:p-4 text-center">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
          <span>Early (-0.25s)</span>
          <span className="text-amber-400 font-semibold">Target {targetSeconds.toFixed(3)}s</span>
          <span>Late (+0.25s)</span>
        </div>
        <div className="relative h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          {/* Jackpot center zone */}
          <div
            className="absolute top-0 bottom-0 bg-emerald-500/30 border-x border-emerald-400"
            style={{
              left: `calc(50% - ${(toleranceMs / 250) * 50}%)`,
              width: `${(toleranceMs * 2 / 250) * 50}%`,
            }}
          />
          {/* Center needle marker */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-amber-400 -translate-x-1/2" />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Stop within ±{(toleranceMs / 1000).toFixed(3)}s to unlock the ₹100 Jackpot
        </p>
      </div>
    );
  }

  const deltaMs = deltaSeconds * 1000;
  const absDeltaMs = Math.abs(deltaMs);
  const isJackpot = absDeltaMs <= toleranceMs;
  const isConsolation = !isJackpot && absDeltaMs <= consolationMs;

  // Max display range is ±250ms
  const clampedDelta = Math.max(-250, Math.min(250, deltaMs));
  const needlePercent = 50 + (clampedDelta / 250) * 50;

  let deltaLabel = '';
  let statusColor = '';

  if (absDeltaMs === 0) {
    deltaLabel = '0.000s PERFECT BULLSEYE!';
    statusColor = 'text-emerald-400';
  } else if (deltaMs < 0) {
    deltaLabel = `-${(absDeltaMs / 1000).toFixed(3)}s EARLY`;
    statusColor = isJackpot ? 'text-emerald-400' : isConsolation ? 'text-amber-400' : 'text-rose-400';
  } else {
    deltaLabel = `+${(absDeltaMs / 1000).toFixed(3)}s LATE`;
    statusColor = isJackpot ? 'text-emerald-400' : isConsolation ? 'text-amber-400' : 'text-rose-400';
  }

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 transition-all">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
        <span>-0.250s (Early)</span>
        <div className="text-center">
          <span className={`font-bold font-mono text-sm ${statusColor}`}>
            {deltaLabel}
          </span>
          <span className="text-slate-500 text-xs block">
            Stopped at {stoppedSeconds.toFixed(3)}s · Target: {targetSeconds.toFixed(3)}s
          </span>
        </div>
        <span>+0.250s (Late)</span>
      </div>

      <div className="relative h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 my-2">
        {/* Consolation zone */}
        <div
          className="absolute top-0 bottom-0 bg-amber-500/20"
          style={{
            left: `calc(50% - ${(consolationMs / 250) * 50}%)`,
            width: `${(consolationMs * 2 / 250) * 50}%`,
          }}
        />
        {/* Jackpot zone */}
        <div
          className="absolute top-0 bottom-0 bg-emerald-500/40 border-x border-emerald-400/80"
          style={{
            left: `calc(50% - ${(toleranceMs / 250) * 50}%)`,
            width: `${(toleranceMs * 2 / 250) * 50}%`,
          }}
        />
        {/* System Target centerline */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/70 -translate-x-1/2 z-10" />

        {/* User Stop Needle */}
        <div
          className="absolute top-0 bottom-0 w-2 -translate-x-1/2 transition-all duration-300 z-20"
          style={{ left: `${needlePercent}%` }}
        >
          <div
            className={`w-full h-full rounded-full shadow-lg ${
              isJackpot
                ? 'bg-emerald-400 ring-2 ring-emerald-300 shadow-emerald-500/50'
                : isConsolation
                ? 'bg-amber-400 ring-2 ring-amber-300 shadow-amber-500/50'
                : 'bg-rose-500 ring-2 ring-rose-400 shadow-rose-500/50'
            }`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Jackpot (±{(toleranceMs / 1000).toFixed(3)}s): ₹100
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> Consolation (±{(consolationMs / 1000).toFixed(3)}s): ₹15
        </span>
      </div>
    </div>
  );
};
