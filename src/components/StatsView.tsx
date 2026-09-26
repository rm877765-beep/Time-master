import React from 'react';
import { UserStats, AttemptRecord } from '../types/game';
import { Trophy, Target, TrendingUp, Zap, Clock } from 'lucide-react';

interface StatsViewProps {
  stats: UserStats;
  onPlayNow: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ stats, onPlayNow }) => {
  const netEarnings = stats.totalWon - stats.totalWagered;
  const isProfitable = netEarnings >= 0;
  const winRate = stats.gamesPlayed > 0 ? ((stats.jackpotsWon / stats.gamesPlayed) * 100).toFixed(1) : '0.0';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-['Chakra_Petch']">
            CHRONO REFLEX ANALYTICS
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tracking your biological reaction latency and millisecond precision against the system.
          </p>
        </div>
        <button
          onClick={onPlayNow}
          className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider font-['Chakra_Petch'] transition-all shadow-md cursor-pointer"
        >
          Play New Round (₹10)
        </button>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Target className="w-4 h-4 text-amber-400" />
            <span>Best Stop Delta</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {stats.bestDeltaSeconds !== null ? `±${stats.bestDeltaSeconds.toFixed(3)}s` : '---'}
          </div>
          <div className="text-[11px] text-slate-500">Closest ever to target</div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Jackpots Hit</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats.jackpotsWon} <span className="text-xs text-slate-400 font-sans">({winRate}%)</span>
          </div>
          <div className="text-[11px] text-slate-500">{stats.gamesPlayed} attempts played</div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Total Won</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ₹{stats.totalWon.toFixed(0)}
          </div>
          <div className="text-[11px] text-slate-500">From ₹{stats.totalWagered.toFixed(0)} wagered</div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Net Skill Earnings</span>
          </div>
          <div className={`text-2xl font-bold font-mono ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isProfitable ? '+' : ''}₹{netEarnings.toFixed(0)}
          </div>
          <div className="text-[11px] text-slate-500">{stats.consolationsWon} near-miss cashbacks</div>
        </div>
      </div>

      {/* Recent Attempts History Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Chakra_Petch'] flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Recent Attempts History</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">Last 20 Stops</span>
        </div>

        {stats.recentAttempts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No attempts recorded yet. Play your first round to log precision reflex metrics!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {stats.recentAttempts.map((att: AttemptRecord) => {
              const deltaMs = att.deltaSeconds * 1000;
              const isFast = att.deltaSeconds > 0;
              return (
                <div key={att.id} className="p-4 flex items-center justify-between hover:bg-slate-850/50 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white">
                        Stopped: {att.stoppedSeconds.toFixed(3)}s
                      </span>
                      <span className="text-slate-500 text-xs font-mono">
                        (Target: {att.targetSeconds.toFixed(3)}s)
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{new Date(att.timestamp).toLocaleTimeString()}</span>
                      <span>·</span>
                      <span className="uppercase text-[10px] text-amber-400/90 font-medium">{att.mode.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono font-bold text-sm ${
                      att.isJackpot
                        ? 'text-emerald-400'
                        : att.isConsolation
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}>
                      {att.absDeltaMs === 0
                        ? '0.000s PERFECT'
                        : `${isFast ? '+' : '-'}${Math.abs(deltaMs).toFixed(1)}ms`}
                    </div>
                    <div className="text-xs font-mono">
                      {att.isJackpot ? (
                        <span className="text-emerald-400 font-bold">+₹{att.payout} (WON!)</span>
                      ) : att.isConsolation ? (
                        <span className="text-amber-300">+₹{att.payout} (Consolation)</span>
                      ) : (
                        <span className="text-slate-500">-₹{att.entryFee}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
