import React from 'react';
import {
  Compass,
  Volume2,
  VolumeX,
  Languages,
  Eye,
  Glasses,
  Smartphone,
  GraduationCap,
  Activity,
  UserCheck
} from 'lucide-react';

export function Header({
  activeExperiment,
  setActiveExperiment,
  xrMode,
  onStartAR,
  onToggleStereo,
  isStereo,
  language,
  setLanguage,
  voiceEnabled,
  setVoiceEnabled,
  onOpenTeacher,
  onOpenDeviceCheck,
  onOpenProfile,
  studentScore
}) {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-3 py-2.5 flex items-center justify-between glass-panel border-b border-white/10 select-none">
      {/* Brand & Experiment Selector */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/30">
            Ψ
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              AR Physics Lab
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                HackHounds
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Mobile Virtual Laboratory</p>
          </div>
        </div>

        {/* Experiment Tabs */}
        <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveExperiment('ohm')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              activeExperiment === 'ohm'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Ohm's Law
          </button>
          <button
            onClick={() => setActiveExperiment('pendulum')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              activeExperiment === 'pendulum'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⏱️ Pendulum
          </button>
        </div>
      </div>

      {/* Action Controls & Badges */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* AR Mode Trigger */}
        <button
          onClick={onStartAR}
          title="Start WebXR AR on Mobile"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all active:scale-95"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Enter AR</span>
          <span className="md:hidden">AR</span>
        </button>

        {/* Stereo Cardboard Toggle */}
        <button
          onClick={onToggleStereo}
          title="Toggle Cardboard VR Split-Screen"
          className={`p-1.5 rounded-lg border text-xs transition-all ${
            isStereo
              ? 'bg-purple-600/30 border-purple-500 text-purple-300'
              : 'glass-pill text-slate-300 hover:text-white'
          }`}
        >
          <Glasses className="w-4 h-4" />
        </button>

        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          title="Switch Language (English / हिन्दी)"
          className="px-2 py-1 glass-pill text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1 rounded-lg"
        >
          <Languages className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
        </button>

        {/* Voice Audio Toggle */}
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          title="AI Voice Tutor Toggle"
          className={`p-1.5 rounded-lg border text-xs transition-all ${
            voiceEnabled
              ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
              : 'glass-pill text-slate-400'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Device Compatibility Check */}
        <button
          onClick={onOpenDeviceCheck}
          title="Device Compatibility Check"
          className="p-1.5 glass-pill text-slate-300 hover:text-white rounded-lg hidden sm:flex"
        >
          <Activity className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Teacher Dashboard */}
        <button
          onClick={onOpenTeacher}
          title="Teacher Dashboard"
          className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
        >
          <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">Teacher</span>
        </button>

        {/* Student Profile Score */}
        <button
          onClick={onOpenProfile}
          title="Student Profile & Score History"
          className="flex items-center gap-1 px-2 py-1 bg-blue-950/60 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-mono font-semibold"
        >
          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>{studentScore}pts</span>
        </button>
      </div>
    </header>
  );
}
