import React, { useState, useEffect } from 'react';
import { alertSystem } from '../engine/alerts.js';

export default function SelfSupport({ astronaut, onSwitchToHelperView }) {
  const [alertState, setAlertState] = useState({
    activeAlert: alertSystem.activeAlert,
    secondsRemaining: alertSystem.checkInSecondsRemaining,
    history: alertSystem.alertHistory
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    return alertSystem.subscribe(setAlertState);
  }, []);

  const alert = alertState.activeAlert;

  const steps = [
    {
      title: "1. Assume Semi-Recumbent Posture",
      instruction: "Rest seated at a 45-degree angle. Loosen any restrictive collar, suit straps, or harness. Do not lie completely flat in microgravity.",
      rationale: "Reduces cephalad venous pressure and eases cardiac workload."
    },
    {
      title: "2. Cease All Physical Exertion",
      instruction: "Stop all activities immediately. Keep your hands resting in your lap. Avoid speaking or moving unless essential.",
      rationale: "Lowers myocardial oxygen demand."
    },
    {
      title: "3. Slow, Controlled Breathing",
      instruction: "Inhale slowly through your nose for 4 seconds; exhale gently through pursed lips for 6 seconds.",
      rationale: "Prevents hyperventilation and stabilizes blood gas exchange."
    },
    {
      title: "4. Keep Bio-Monitor Sensors Snug",
      instruction: "Verify that the chest module and pulse oximeter finger clip remain firmly in place for continuous telemetry relay.",
      rationale: "Ensures mission control and crew have uninterrupted vital signals."
    }
  ];

  const handleReadAloud = (stepIndex = activeStep) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const current = steps[stepIndex];
    const utterance = new SpeechSynthesisUtterance(
      `Step ${stepIndex + 1}. ${current.title}. ${current.instruction}`
    );
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCheckIn = () => {
    alertSystem.recordCheckIn();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2 animate-fade-in font-sans text-slate-200">
      
      {/* Top Banner: Emergency Status & Assistance Beacon */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-emerald-500/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-xs font-mono font-bold tracking-wider uppercase text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              Emergency Self-Support Mode · Level 2
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
              HELP HAS BEEN ALERTED
            </h1>
            <p className="text-emerald-200/90 text-sm sm:text-base max-w-xl">
              Commander Dr. Maya Lin and the habitat crew have received your telemetry beacon. 
              Stay calm and follow the steps below until assistance arrives.
            </p>
          </div>

          {/* Quick Switch to Helper Mode */}
          {onSwitchToHelperView && (
            <button
              onClick={onSwitchToHelperView}
              className="px-5 py-3 rounded-xl bg-white text-emerald-950 font-bold text-sm shadow-xl hover:bg-slate-100 transition shrink-0 cursor-pointer"
            >
              Switch to Helper View →
            </button>
          )}
        </div>

        {/* Responders on the way */}
        {alert && alert.acks && alert.acks.length > 0 && (
          <div className="mt-5 pt-4 border-t border-emerald-500/30 flex flex-wrap gap-2 items-center">
            <span className="text-xs uppercase font-semibold text-emerald-300">Responders en route:</span>
            {alert.acks.map((ack, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-900/80 border border-emerald-500/40 text-white text-xs font-semibold">
                <span>🏃‍♂️</span> {ack.responder}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dead-Man Check-in Hero Widget */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border-2 border-amber-500/60 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Safety Check-In (Dead-Man Switch)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold">
              [Approval A7]
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            Tap "I'M OK" to confirm you are conscious
          </h2>
          <p className="text-sm text-slate-300">
            If you do not respond before the timer expires, an urgent audible siren will alert the entire habitat.
          </p>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <div className="text-center">
            <div className={`font-mono text-4xl sm:text-5xl font-black ${
              alertState.secondsRemaining <= 3 ? 'text-rose-400 animate-bounce' : 'text-amber-400'
            }`}>
              {alertState.secondsRemaining}s
            </div>
            <span className="text-xs font-mono uppercase text-slate-400">Time Left</span>
          </div>

          <button
            onClick={handleCheckIn}
            className="px-8 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-xl shadow-xl shadow-emerald-950/60 transition transform active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>✓</span> I'M OK
          </button>
        </div>
      </div>

      {/* Step Guidance Carousel / Cards */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Immediate Self-Care Guidance</h2>
            <p className="text-xs text-slate-400 mt-0.5">Evidence-based clinical stabilization protocols [NIH & NASA HRP]</p>
          </div>

          <button
            onClick={() => handleReadAloud(activeStep)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              isSpeaking
                ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                : 'bg-cyan-950/70 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-500/40'
            }`}
          >
            <span>{isSpeaking ? '⏹ Stop Voice' : '🔊 Read Step Aloud'}</span>
          </button>
        </div>

        {/* Steps List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, idx) => {
            const isSelected = activeStep === idx;
            return (
              <div
                key={idx}
                onClick={() => {
                  setActiveStep(idx);
                  if (isSpeaking) handleReadAloud(idx);
                }}
                className={`p-5 rounded-xl border-2 cursor-pointer transition text-left space-y-2 ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/60 shadow-lg ring-2 ring-cyan-400/20'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-base font-bold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                    {step.title}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Step {idx + 1}/4</span>
                </div>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                  {step.instruction}
                </p>
                <div className="pt-2 text-xs text-slate-400 italic flex items-center gap-1.5 border-t border-slate-800">
                  <span className="font-semibold text-slate-300">Why:</span> {step.rationale}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center text-xs text-slate-400">
        <span className="font-semibold text-slate-300">Autonomy Ladder Level 2 · Clinical Prototype:</span> The software displays and speaks guidance. The human acts. No direct medical intervention or device actuation is performed automatically.
      </div>

    </div>
  );
}
