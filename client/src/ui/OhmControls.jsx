import React, { useState } from 'react';
import {
  Zap,
  Power,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  Cable,
  Flame,
  Plus
} from 'lucide-react';
import { VIGraphCanvas } from './VIGraphCanvas.jsx';

export function OhmControls({
  state,
  onSetVoltage,
  onSetResistance,
  onToggleSwitch,
  onSetPreset,
  onClearWires,
  onRecordReading,
  onGenerateReport,
  graphCanvasRef
}) {
  const [activeTab, setActiveTab] = useState('controls'); // 'controls' | 'readings' | 'graph'

  const mistakes = state.mistakes || {};
  const hasError = Object.values(mistakes).some(Boolean);

  const getErrorDescription = () => {
    if (mistakes.shortCircuit) return '⚠️ Short Circuit: Direct low-resistance path bypassing load!';
    if (mistakes.ammeterInParallel) return '⚠️ Ammeter in Parallel: Near-zero internal resistance draws dangerous current!';
    if (mistakes.voltmeterInSeries) return '⚠️ Voltmeter in Series: Huge internal resistance blocks circuit current!';
    if (mistakes.wrongPolarity) return '⚠️ Reverse Polarity: Meter needles deflecting in reverse!';
    if (mistakes.resistorOverheating) return '🔥 Resistor Overheating: Power exceeds safe 2W wattage limit!';
    if (mistakes.openCircuit) return 'ℹ️ Open Circuit: Key switch is open. Close switch to conduct.';
    return null;
  };

  const errorText = getErrorDescription();

  return (
    <div className="absolute top-16 left-3 z-30 w-80 max-w-[calc(100vw-1.5rem)] glass-panel rounded-2xl border border-white/15 shadow-2xl overflow-hidden select-none">
      {/* Tab Switcher */}
      <div className="flex border-b border-white/10 bg-slate-900/60 p-1">
        <button
          onClick={() => setActiveTab('controls')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'controls'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Apparatus</span>
        </button>

        <button
          onClick={() => setActiveTab('readings')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'readings'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Data ({state.readings.length}/5)</span>
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'graph'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>V-I Graph</span>
        </button>
      </div>

      {/* Live Error Banner */}
      {errorText && (
        <div
          className={`px-3 py-2 text-[11px] font-medium flex items-center gap-2 border-b ${
            mistakes.shortCircuit || mistakes.ammeterInParallel || mistakes.resistorOverheating
              ? 'bg-rose-950/70 text-rose-200 border-rose-500/30'
              : 'bg-amber-950/60 text-amber-200 border-amber-500/30'
          }`}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="leading-tight">{errorText}</span>
        </div>
      )}

      {/* Live Measurement Ribbon */}
      <div className="grid grid-cols-3 gap-1 px-3 py-2 bg-slate-950/50 border-b border-white/5 text-center">
        <div>
          <div className="text-[10px] text-slate-400">Voltage</div>
          <div className="text-xs font-mono font-bold text-cyan-400">
            {state.measuredVoltage.toFixed(2)} V
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">Current</div>
          <div className="text-xs font-mono font-bold text-amber-400">
            {state.current.toFixed(3)} A
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">Power</div>
          <div className="text-xs font-mono font-bold text-purple-400">
            {state.power.toFixed(2)} W
          </div>
        </div>
      </div>

      <div className="p-3 max-h-[calc(100vh-18rem)] overflow-y-auto space-y-3.5">
        {/* TAB 1: APPARATUS CONTROLS */}
        {activeTab === 'controls' && (
          <>
            {/* Knife Switch & Power Dial */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="flex items-center gap-2">
                <Power
                  className={`w-4 h-4 ${
                    state.isSwitchClosed ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                />
                <span className="text-xs font-medium text-slate-200">Knife Switch</span>
              </div>
              <button
                onClick={onToggleSwitch}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  state.isSwitchClosed
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {state.isSwitchClosed ? 'CLOSED (ON)' : 'OPEN (OFF)'}
              </button>
            </div>

            {/* Voltage Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Power Supply (V)</span>
                <span className="font-mono text-cyan-400 font-bold">{state.voltage.toFixed(1)} V</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="12.0"
                step="0.5"
                value={state.voltage}
                onChange={(e) => onSetVoltage(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            {/* Resistance Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Test Resistor (R)</span>
                <span className="font-mono text-amber-400 font-bold">{state.resistance} Ω</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[5, 10, 20, 50, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => onSetResistance(val)}
                    className={`py-1 rounded text-[11px] font-mono font-medium transition-all ${
                      state.resistance === val
                        ? 'bg-amber-500/30 border border-amber-500 text-amber-200'
                        : 'glass-pill text-slate-400 hover:text-white'
                    }`}
                  >
                    {val}Ω
                  </button>
                ))}
              </div>
            </div>

            {/* Circuit Presets (For deliberate mistake exploration) */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                <Cable className="w-3 h-3 text-cyan-400" /> Circuit Wiring Presets
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onSetPreset('correct')}
                  className="px-2 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium text-left transition-all"
                >
                  ✓ Standard Series
                </button>
                <button
                  onClick={() => onSetPreset('ammeter_parallel')}
                  className="px-2 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-[11px] font-medium text-left transition-all"
                >
                  ✕ Ammeter in Parallel
                </button>
                <button
                  onClick={() => onSetPreset('voltmeter_series')}
                  className="px-2 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 text-[11px] font-medium text-left transition-all"
                >
                  ✕ Voltmeter in Series
                </button>
                <button
                  onClick={() => onSetPreset('short_circuit')}
                  className="px-2 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-[11px] font-medium text-left transition-all"
                >
                  ✕ Direct Short Circuit
                </button>
                <button
                  onClick={() => onSetPreset('reverse_polarity')}
                  className="px-2 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 text-[11px] font-medium text-left transition-all"
                >
                  ✕ Reverse Polarity
                </button>
                <button
                  onClick={onClearWires}
                  className="px-2 py-1.5 rounded-lg glass-pill text-slate-400 hover:text-white text-[11px] font-medium text-left transition-all flex items-center justify-between"
                >
                  <span>Clear Wires</span>
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: DATA READINGS TABLE */}
        {activeTab === 'readings' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Observation Table</span>
              <button
                onClick={onRecordReading}
                disabled={mistakes.openCircuit || mistakes.shortCircuit}
                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Record Point
              </button>
            </div>

            {state.readings.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-center text-xs text-slate-400">
                Close the switch, vary voltage, and record 5 V-I data pairs.
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 overflow-hidden text-xs">
                <table className="w-full text-left font-mono">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="p-1.5">#</th>
                      <th className="p-1.5">V (V)</th>
                      <th className="p-1.5">I (A)</th>
                      <th className="p-1.5">R (Ω)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-slate-950/70">
                    {state.readings.map((r, i) => (
                      <tr key={r.id || i} className="hover:bg-white/5">
                        <td className="p-1.5 text-slate-400">{i + 1}</td>
                        <td className="p-1.5 text-cyan-300">{r.voltage.toFixed(2)}</td>
                        <td className="p-1.5 text-amber-300">{r.current.toFixed(3)}</td>
                        <td className="p-1.5 text-emerald-300">{r.calculatedResistance.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: V-I GRAPH */}
        {activeTab === 'graph' && (
          <div className="space-y-2">
            <VIGraphCanvas
              readings={state.readings}
              theoreticalR={state.resistance}
              canvasRef={graphCanvasRef}
            />
            <p className="text-[11px] text-slate-400 leading-tight">
              Straight linear slope verifies Ohm's Law (V = IR). Slope equals experimental resistance R.
            </p>
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
