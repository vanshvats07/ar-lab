import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Sliders,
  Plus,
  AlertTriangle,
  FileText,
  Activity,
  Award
} from 'lucide-react';
import { PendulumGraphCanvas } from './PendulumGraphCanvas.jsx';

export function PendulumControls({
  length,
  mass,
  angle,
  onSetLength,
  onSetMass,
  onSetAngle,
  onStartSimulation,
  onPauseSimulation,
  onResetSimulation,
  isSimRunning,
  currentOscillations,
  currentAngle,
  mistakes = {},
  onGenerateReport,
  graphCanvasRef
}) {
  const [activeTab, setActiveTab] = useState('apparatus'); // 'apparatus' | 'stopwatch' | 'data'

  // Stopwatch state
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  // Recorded observations: [{ trial, length, mass, angle, time10, period, computedG, error }]
  const [trials, setTrials] = useState([]);

  // Stopwatch interval
  useEffect(() => {
    if (stopwatchRunning) {
      startTimeRef.current = performance.now() - elapsedMs;
      timerRef.current = setInterval(() => {
        setElapsedMs(performance.now() - startTimeRef.current);
      }, 30);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopwatchRunning]);

  const handleStartStopwatch = () => {
    setStopwatchRunning(true);
    if (!isSimRunning) {
      onStartSimulation();
    }
  };

  const handleStopStopwatch = () => {
    setStopwatchRunning(false);
  };

  const handleResetStopwatch = () => {
    setStopwatchRunning(false);
    setElapsedMs(0);
    onResetSimulation();
  };

  // Evaluate current stopwatch measurement
  const measuredTimeSec = elapsedMs / 1000;
  const recordedOsc = Math.max(1, currentOscillations || 10);
  const measuredPeriod = measuredTimeSec > 0 ? measuredTimeSec / recordedOsc : 0;
  const calculatedG =
    measuredPeriod > 0
      ? Number(((4 * Math.PI * Math.PI * length) / (measuredPeriod * measuredPeriod)).toFixed(2))
      : 0;
  const percentError =
    calculatedG > 0 ? Number((Math.abs((calculatedG - 9.81) / 9.81) * 100).toFixed(1)) : 0;

  const handleRecordTrial = () => {
    if (measuredTimeSec < 2) return;

    const newTrial = {
      trial: trials.length + 1,
      length: Number(length.toFixed(2)),
      mass: Math.round(mass * 1000),
      angle: Math.round(angle),
      time10: Number(measuredTimeSec.toFixed(2)),
      period: Number(measuredPeriod.toFixed(2)),
      computedG: calculatedG,
      percentError: percentError
    };

    setTrials([...trials, newTrial]);
  };

  // Error banners
  const getErrorDescription = () => {
    if (mistakes.angleTooLarge) return '⚠️ Angle > 15°: Small-angle approximation sin(θ) ≈ θ is invalid!';
    if (mistakes.singleOscillationTimed) return '⚠️ Single Oscillation: Human reaction time (~0.3s) introduces high error. Time 10 swings!';
    if (mistakes.massConfusion) return '💡 Mass Confusion: Galileo proved pendulum period is independent of bob mass!';
    if (mistakes.stoppedTooEarly) return '⚠️ Timer stopped too early before 5 complete cycles.';
    return null;
  };

  const errorText = getErrorDescription();

  return (
    <div className="absolute top-16 left-3 z-30 w-80 max-w-[calc(100vw-1.5rem)] glass-panel rounded-2xl border border-white/15 shadow-2xl overflow-hidden select-none">
      {/* Tab Switcher */}
      <div className="flex border-b border-white/10 bg-slate-900/60 p-1">
        <button
          onClick={() => setActiveTab('apparatus')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'apparatus'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Apparatus</span>
        </button>

        <button
          onClick={() => setActiveTab('stopwatch')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'stopwatch'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>Stopwatch</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'data'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>L vs T²</span>
        </button>
      </div>

      {/* Error Banner */}
      {errorText && (
        <div className="px-3 py-2 text-[11px] font-medium flex items-center gap-2 border-b bg-amber-950/60 text-amber-200 border-amber-500/30">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="leading-tight">{errorText}</span>
        </div>
      )}

      {/* Live Measurement Ribbon */}
      <div className="grid grid-cols-3 gap-1 px-3 py-2 bg-slate-950/50 border-b border-white/5 text-center font-mono">
        <div>
          <div className="text-[10px] text-slate-400 font-sans">Oscillations</div>
          <div className="text-xs font-bold text-cyan-400">{currentOscillations}/10</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 font-sans">Calc. 'g'</div>
          <div className="text-xs font-bold text-emerald-400">
            {calculatedG > 0 ? `${calculatedG} m/s²` : '--'}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 font-sans">% Error</div>
          <div className="text-xs font-bold text-amber-400">
            {calculatedG > 0 ? `${percentError}%` : '--'}
          </div>
        </div>
      </div>

      <div className="p-3 max-h-[calc(100vh-18rem)] overflow-y-auto space-y-3.5">
        {/* TAB 1: APPARATUS CONTROLS */}
        {activeTab === 'apparatus' && (
          <>
            {/* String Length L Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">String Length (L)</span>
                <span className="font-mono text-cyan-400 font-bold">{length.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="1.40"
                step="0.05"
                value={length}
                onChange={(e) => onSetLength(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.3m</span>
                <span>0.8m</span>
                <span>1.4m</span>
              </div>
            </div>

            {/* Bob Mass Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Bob Mass (m)</span>
                <span className="font-mono text-amber-400 font-bold">{Math.round(mass * 1000)} g</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.20"
                step="0.01"
                value={mass}
                onChange={(e) => onSetMass(parseFloat(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>20g</span>
                <span>100g</span>
                <span>200g</span>
              </div>
            </div>

            {/* Release Angle Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Release Angle (θ)</span>
                <span
                  className={`font-mono font-bold ${
                    angle > 15 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {Math.round(angle)}° {angle > 15 ? '(Too large!)' : '(Safe)'}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                step="1"
                value={angle}
                onChange={(e) => onSetAngle(parseFloat(e.target.value))}
                className={`w-full bg-slate-800 rounded-lg cursor-pointer h-1.5 ${
                  angle > 15 ? 'accent-rose-500' : 'accent-emerald-400'
                }`}
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5°</span>
                <span className="text-emerald-400 font-bold">15° (Limit)</span>
                <span>45°</span>
              </div>
            </div>

            {/* Simulation Play / Pause / Reset Controls */}
            <div className="flex items-center gap-2 pt-1">
              {isSimRunning ? (
                <button
                  onClick={onPauseSimulation}
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Pause className="w-4 h-4" /> Pause Swing
                </button>
              ) : (
                <button
                  onClick={onStartSimulation}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                >
                  <Play className="w-4 h-4" /> Release &amp; Swing
                </button>
              )}

              <button
                onClick={onResetSimulation}
                className="p-2 glass-pill text-slate-400 hover:text-white rounded-xl transition-all"
                title="Reset to Release Position"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* TAB 2: DIGITAL STOPWATCH */}
        {activeTab === 'stopwatch' && (
          <div className="space-y-3">
            {/* Digital Timer Face */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 text-center shadow-inner">
              <div className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 mb-1">
                Precision Stopwatch
              </div>
              <div className="text-3xl font-mono font-bold text-white tracking-wider">
                {measuredTimeSec.toFixed(2)}
                <span className="text-xs text-slate-400 ml-1">s</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Target: 10 Oscillations ({currentOscillations}/10)
              </div>
            </div>

            {/* Stopwatch Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {stopwatchRunning ? (
                <button
                  onClick={handleStopStopwatch}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/20 transition-all"
                >
                  <Pause className="w-4 h-4" /> Stop Timer
                </button>
              ) : (
                <button
                  onClick={handleStartStopwatch}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <Play className="w-4 h-4" /> Start Timer
                </button>
              )}

              <button
                onClick={handleResetStopwatch}
                className="py-2.5 rounded-xl glass-pill text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>

            {/* Record Trial Button */}
            <button
              onClick={handleRecordTrial}
              disabled={measuredTimeSec < 1.0}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> Record Observation ({trials.length} trials)
            </button>
          </div>
        )}

        {/* TAB 3: DATA & L vs T² GRAPH */}
        {activeTab === 'data' && (
          <div className="space-y-3">
            <PendulumGraphCanvas trials={trials} canvasRef={graphCanvasRef} />

            {trials.length > 0 ? (
              <div className="rounded-xl border border-white/10 overflow-hidden text-xs">
                <table className="w-full text-left font-mono">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="p-1.5">L (m)</th>
                      <th className="p-1.5">T₁₀ (s)</th>
                      <th className="p-1.5">T (s)</th>
                      <th className="p-1.5">g (m/s²)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-slate-950/70">
                    {trials.map((t, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="p-1.5 text-cyan-300">{t.length}</td>
                        <td className="p-1.5 text-slate-300">{t.time10}</td>
                        <td className="p-1.5 text-amber-300">{t.period}</td>
                        <td className="p-1.5 text-emerald-300 font-bold">{t.computedG}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 text-center p-3 rounded-xl bg-slate-900/50">
                Record at least 3 trials with different lengths to plot L vs T².
              </p>
            )}
          </div>
        )}

        {/* Final Report Generation Button */}
        <button
          onClick={onGenerateReport}
          className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Lab Report &amp; PDF</span>
        </button>
      </div>
    </div>
  );
}
