import React from 'react';
import { Award, TrendingUp, Calendar, CheckCircle2, X, Zap, Clock, Shield } from 'lucide-react';

export function StudentProfileModal({ isOpen, onClose, attempts = [], studentScore = 95 }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 border border-white/15 text-slate-100 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg glass-pill transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Card */}
        <div className="flex items-center gap-3.5 mb-5 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-cyan-500/20">
            AS
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Aarav Sharma</h3>
            <p className="text-xs text-slate-400 font-mono">Class 11-A • ID: s1 • Class Code: PHYS-101</p>
          </div>
        </div>

        {/* Badges and Mastery */}
        <div className="grid grid-cols-3 gap-2 mb-5 shrink-0">
          <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5 text-center">
            <Award className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-lg font-bold font-mono text-cyan-400">{studentScore}</div>
            <div className="text-[10px] text-slate-400">Total Mastery</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5 text-center">
            <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-lg font-bold font-mono text-emerald-400">+18%</div>
            <div className="text-[10px] text-slate-400">Improvement</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5 text-center">
            <Shield className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <div className="text-lg font-bold font-mono text-purple-400">Rank #2</div>
            <div className="text-[10px] text-slate-400">Class Standing</div>
          </div>
        </div>

        {/* Attempt History List */}
        <div className="overflow-y-auto space-y-2.5 text-xs pr-1">
          <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider">
            Experiment Attempts &amp; Lab Reports
          </h4>

          {attempts.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/50 text-center text-slate-400">
              No previous attempts recorded yet.
            </div>
          ) : (
            attempts.map((att, idx) => (
              <div
                key={att.id || idx}
                className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between hover:bg-slate-900/80 transition-all"
              >
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span className="capitalize">{att.experiment === 'ohm' ? "Ohm's Law Circuit" : 'Simple Pendulum'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                      {att.score}/100
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {att.timeTaken}s
                    </span>
                    <span>Hints used: {att.hintsUsed || 0}</span>
                    <span>Errors: {(att.mistakes || []).length}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-mono">
                    {new Date(att.date || Date.now()).toLocaleDateString()}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">✓ Passed</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
