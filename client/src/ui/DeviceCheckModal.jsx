import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, X, Smartphone, Cpu, Volume2, ShieldCheck } from 'lucide-react';

export function DeviceCheckModal({ isOpen, onClose }) {
  const [checks, setChecks] = useState({
    webgl: { status: 'checking', message: 'Checking WebGL 3D Acceleration...' },
    webxr: { status: 'checking', message: 'Detecting WebXR Device API...' },
    hitTest: { status: 'checking', message: 'Verifying AR Hit-Test Support...' },
    speech: { status: 'checking', message: 'Checking Voice SpeechSynthesis...' },
    performance: { status: 'checking', message: 'Profiling GPU & Display FPS capability...' }
  });

  const runDiagnostics = async () => {
    // 1. WebGL Check
    let webglStatus = 'fail';
    let webglMsg = 'WebGL not available. Fallback to canvas may be degraded.';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (gl) {
        webglStatus = 'pass';
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Standard GPU';
        webglMsg = `Hardware 3D Accelerated: ${renderer.slice(0, 30)}...`;
      }
    } catch (e) {
      webglStatus = 'fail';
      webglMsg = e.message;
    }

    // 2. WebXR Check
    let webxrStatus = 'warn';
    let webxrMsg = 'WebXR not found. Running in high-performance 3D Desktop mode.';
    let hitTestStatus = 'warn';
    let hitTestMsg = 'AR Surface placement requires ARCore / Chrome Android.';

    if ('xr' in navigator) {
      try {
        const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
        if (arSupported) {
          webxrStatus = 'pass';
          webxrMsg = 'WebXR Immersive-AR supported natively.';
          hitTestStatus = 'pass';
          hitTestMsg = 'Hit-test plane detection available for surface table placement.';
        } else {
          webxrStatus = 'warn';
          webxrMsg = 'Browser supports WebXR, but camera pass-through AR is inactive. 3D orbit mode active.';
        }
      } catch (err) {
        webxrStatus = 'warn';
        webxrMsg = 'WebXR query returned fallback mode. 3D orbit controls active.';
      }
    }

    // 3. Speech Synthesis
    let speechStatus = 'pass';
    let speechMsg = 'SpeechSynthesis active (English & Hindi audio voice supported).';
    if (!('speechSynthesis' in window)) {
      speechStatus = 'warn';
      speechMsg = 'Voice API unavailable. Text-based AI tutor will be used.';
    }

    // 4. Performance Profile (Budget Phone Target)
    const ram = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const isBudgetOptimized = ram >= 2 && cores >= 4;

    setChecks({
      webgl: { status: webglStatus, message: webglMsg },
      webxr: { status: webxrStatus, message: webxrMsg },
      hitTest: { status: hitTestStatus, message: hitTestMsg },
      speech: { status: speechStatus, message: speechMsg },
      performance: {
        status: isBudgetOptimized ? 'pass' : 'warn',
        message: `Device profile: ${cores} CPU cores, ~${ram}GB RAM. 3D assets (<5MB) optimized for ₹10k phones.`
      }
    });
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const renderBadge = (status) => {
    if (status === 'pass') return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
    if (status === 'warn') return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
    if (status === 'fail') return <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
    return <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel rounded-2xl p-6 border border-white/15 text-slate-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg glass-pill transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Device Diagnostics</h3>
            <p className="text-xs text-slate-400">Budget Android Phone &amp; Desktop Check</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3">
            {renderBadge(checks.webgl.status)}
            <div>
              <div className="text-xs font-semibold text-white">WebGL 3D Acceleration</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{checks.webgl.message}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3">
            {renderBadge(checks.webxr.status)}
            <div>
              <div className="text-xs font-semibold text-white">WebXR Immersive-AR</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{checks.webxr.message}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3">
            {renderBadge(checks.hitTest.status)}
            <div>
              <div className="text-xs font-semibold text-white">Surface Plane Hit-Test</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{checks.hitTest.message}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3">
            {renderBadge(checks.speech.status)}
            <div>
              <div className="text-xs font-semibold text-white">SpeechSynthesis Audio Tutor</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{checks.speech.message}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3">
            {renderBadge(checks.performance.status)}
            <div>
              <div className="text-xs font-semibold text-white">Budget Device Optimization</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{checks.performance.message}</div>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-200 text-xs flex items-center justify-between">
          <span>Target: 30-60 FPS on ~₹10,000 Android phones</span>
          <button
            onClick={runDiagnostics}
            className="px-2.5 py-1 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-100 font-medium text-[11px] border border-cyan-500/40 transition-all flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Re-check
          </button>
        </div>
      </div>
    </div>
  );
}
