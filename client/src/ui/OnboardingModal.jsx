import React from 'react';
import { Smartphone, CheckCircle2, Sparkles, ArrowRight, X } from 'lucide-react';

export function OnboardingModal({ isOpen, onClose, onSelectExperiment }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 border border-white/15 text-slate-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg glass-pill transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Welcome to AR Physics Lab
            </h2>
            <p className="text-xs text-slate-400">By HackHounds • Ready in &lt; 30 seconds</p>
          </div>
        </div>

        {/* 3 Steps */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs mt-0.5">
              1
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Choose Your Lab Experiment</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Select Ohm's Law circuit or Simple Pendulum. Full interactive 3D physics runs directly in your browser.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs mt-0.5">
              2
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Surface Placement (WebXR AR)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                On mobile, tap "Enter AR", pan your phone slowly over your floor or table, and tap the glowing blue ring to place the lab bench!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs mt-0.5">
              3
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Make Mistakes & Learn with AI</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Accidentally short-circuit the battery or exceed 15° pendulum swing? Our Socratic AI tutor detects errors and gives step-by-step hints in English or Hindi!
              </p>
            </div>
          </div>
        </div>

        {/* Quick Selection Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              onSelectExperiment('ohm');
              onClose();
            }}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-gradient-to-b from-blue-600/30 to-blue-900/40 hover:from-blue-600/50 hover:to-blue-900/60 border border-blue-500/40 text-white font-semibold text-xs transition-all active:scale-95 group"
          >
            <span className="text-xl mb-1 group-hover:scale-110 transition-transform">⚡</span>
            <span>Ohm's Law Circuit</span>
            <span className="text-[10px] text-blue-300 font-normal mt-0.5">V-I Curve &amp; Resistors</span>
          </button>

          <button
            onClick={() => {
              onSelectExperiment('pendulum');
              onClose();
            }}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-gradient-to-b from-cyan-600/30 to-cyan-900/40 hover:from-cyan-600/50 hover:to-cyan-900/60 border border-cyan-500/40 text-white font-semibold text-xs transition-all active:scale-95 group"
          >
            <span className="text-xl mb-1 group-hover:scale-110 transition-transform">⏱️</span>
            <span>Simple Pendulum</span>
            <span className="text-[10px] text-cyan-300 font-normal mt-0.5">Calculate Gravity (g)</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-[11px] text-slate-400 hover:text-white underline underline-offset-2 transition-colors"
          >
            Skip tutorial and start immediately
          </button>
        </div>
      </div>
    </div>
  );
}
