import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  HelpCircle,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Wrench,
  Bot
} from 'lucide-react';
import { getClientRuleFeedback } from '../tutor/offlineRules.js';

export function TutorPanel({
  experiment,
  experimentState,
  lastAction,
  language,
  voiceEnabled,
  onHighlightComponent,
  onHintUsed
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [hintLevel, setHintLevel] = useState(1);
  const [tutorMessage, setTutorMessage] = useState(
    language === 'hi'
      ? 'नमस्ते! मैं आपका एआई भौतिकी शिक्षक हूँ। प्रयोग शुरू करें या कोई प्रश्न पूछें।'
      : 'Hello! I am your AI Socratic Physics Tutor. Begin your experiment or ask me for guidance!'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [activeError, setActiveError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Read aloud using browser SpeechSynthesis
  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // stop current utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  };

  const fetchTutorAdvice = async (level = hintLevel) => {
    setIsLoading(true);
    if (onHintUsed) onHintUsed();

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experiment,
          state: experimentState,
          lastAction: lastAction || '',
          hintLevel: level,
          language
        })
      });

      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();
      setTutorMessage(data.message);
      setActiveError(data.detected_error);

      if (data.highlight_component && onHighlightComponent) {
        onHighlightComponent(data.highlight_component);
      }

      speakText(data.message);
    } catch (err) {
      console.warn('Using client offline rule fallback:', err);
      // Offline fallback
      const fallback = getClientRuleFeedback(experiment, experimentState, level, language);
      setTutorMessage(fallback.message);
      setActiveError(fallback.detected_error);

      if (fallback.highlight_component && onHighlightComponent) {
        onHighlightComponent(fallback.highlight_component);
      }

      speakText(fallback.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically trigger guidance when an error is newly detected
  useEffect(() => {
    const mistakes = experimentState.mistakes || {};
    const hasMistake = Object.values(mistakes).some(Boolean);
    if (hasMistake) {
      fetchTutorAdvice(hintLevel);
    }
  }, [
    experimentState.mistakes?.angleTooLarge,
    experimentState.mistakes?.singleOscillationTimed,
    experimentState.mistakes?.massConfusion,
    experimentState.mistakes?.ammeterInParallel,
    experimentState.mistakes?.voltmeterInSeries,
    experimentState.mistakes?.shortCircuit,
    experimentState.mistakes?.wrongPolarity,
    experimentState.mistakes?.resistorOverheating
  ]);

  // When language switches, re-trigger current level
  useEffect(() => {
    fetchTutorAdvice(hintLevel);
  }, [language]);

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-96 select-none transition-all">
      <div className="glass-panel rounded-2xl border border-white/15 shadow-2xl overflow-hidden">
        {/* Header Drawer Toggle */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="px-3.5 py-2.5 bg-gradient-to-r from-blue-950/80 to-slate-900/90 flex items-center justify-between cursor-pointer border-b border-white/10 hover:bg-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Bot className="w-4 h-4 animate-float" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                AI Socratic Tutor
                {isSpeaking && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <div className="text-[10px] text-cyan-300">
                {language === 'hi' ? 'सॉक्रेटीस भौतिकी शिक्षक' : 'Self-Correction & Hints'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {activeError && (
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-medium flex items-center gap-1 border border-rose-500/30">
                <AlertTriangle className="w-3 h-3 text-rose-400" /> Issue
              </span>
            )}
            <button className="text-slate-400 hover:text-white p-1">
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isOpen && (
          <div className="p-3.5 space-y-3">
            {/* Tutor Speech Bubble */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-slate-200 relative min-h-[60px] flex items-center">
              {isLoading ? (
                <div className="flex items-center gap-2 text-cyan-400">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Analyzing experiment physics state...</span>
                </div>
              ) : (
                <p className="leading-relaxed">{tutorMessage}</p>
              )}
            </div>

            {/* Hint Level Controls */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 flex justify-between items-center">
                <span>Hint Progression</span>
                <span className="text-cyan-400">Level {hintLevel} of 3</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    setHintLevel(1);
                    fetchTutorAdvice(1);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 border transition-all ${
                    hintLevel === 1
                      ? 'bg-blue-600/30 border-blue-500 text-blue-200 shadow-sm'
                      : 'glass-pill text-slate-400 hover:text-white'
                  }`}
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>1. Nudge</span>
                </button>

                <button
                  onClick={() => {
                    setHintLevel(2);
                    fetchTutorAdvice(2);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 border transition-all ${
                    hintLevel === 2
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm'
                      : 'glass-pill text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3 h-3" />
                  <span>2. Explain</span>
                </button>

                <button
                  onClick={() => {
                    setHintLevel(3);
                    fetchTutorAdvice(3);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 border transition-all ${
                    hintLevel === 3
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 shadow-sm'
                      : 'glass-pill text-slate-400 hover:text-white'
                  }`}
                >
                  <Wrench className="w-3 h-3" />
                  <span>3. Fix</span>
                </button>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <button
                onClick={() => speakText(tutorMessage)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Repeat Voice</span>
              </button>

              <button
                onClick={() => fetchTutorAdvice(hintLevel)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Ask Help</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
