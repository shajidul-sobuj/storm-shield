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
    <div className="max-w-4xl mx-auto space-y-6 py-2 animate-fade-in font-sans">
      
      {/* Top Banner: Emergency Status & Assistance Beacon */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-emerald-400">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-mono font-bold tracking-wider uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping"></span>
              Emergency Self-Support Mode · Level 2
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              HELP HAS BEEN ALERTED
            </h1>
            <p className="text-emerald-100 text-base max-w-xl">
              Commander Dr. Maya Lin and the habitat crew have received your telemetry beacon. 
              Stay calm and follow the steps below until assistance arrives.
            </p>
          </div>

          {/* Quick Switch to Helper Mode */}
          {onSwitchToHelperView && (
            <button
              onClick={onSwitchToHelperView}
              className="px-5 py-3 rounded-xl bg-white text-emerald-900 font-bold text-sm shadow hover:bg-emerald-50 transition shrink-0"
            >
              Switch to Helper View →
            </button>
          )}
        </div>

        {/* Responders on the way */}
        {alert && alert.acks && alert.acks.length > 0 && (
          <div className="mt-5 pt-4 border-t border-emerald-500/50 flex flex-wrap gap-2 items-center">
            <span className="text-xs uppercase font-semibold text-emerald-200">Responders en route:</span>
            {alert.acks.map((ack, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-800/80 text-white text-xs font-semibold">
                <span>🏃‍♂️</span> {ack.responder}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dead-Man Check-in Hero Widget */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-amber-400 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Safety Check-In (Dead-Man Switch)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-900 font-bold">
              [Approval A7]
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Tap "I'M OK" to confirm you are conscious
          </h2>
          <p className="text-sm text-slate-600">
            If you do not respond before the timer expires, an urgent audible siren will alert the entire habitat.
          </p>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <div className="text-center">
            <div className={`font-mono text-4xl sm:text-5xl font-black ${
              alertState.secondsRemaining <= 3 ? 'text-rose-600 animate-bounce' : 'text-amber-600'
            }`}>
              {alertState.secondsRemaining}s
            </div>
            <span className="text-xs font-mono uppercase text-slate-400">Time Left</span>
          </div>

          <button
            onClick={handleCheckIn}
            className="px-8 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xl shadow-xl hover:shadow-2xl transition transform active:scale-95 flex items-center gap-2"
          >
            <span>✓</span> I'M OK
          </button>
        </div>
      </div>

      {/* Step Guidance Carousel / Cards */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Immediate Self-Care Guidance</h2>
            <p className="text-xs text-slate-500">Evidence-based clinical stabilization protocols [NIH & NASA HRP]</p>
          </div>

          <button
            onClick={() => handleReadAloud(activeStep)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              isSpeaking
                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
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
                    ? 'border-sky-500 bg-sky-50/50 shadow-md ring-2 ring-sky-500/20'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-base font-bold ${isSelected ? 'text-sky-950' : 'text-slate-800'}`}>
                    {step.title}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Step {idx + 1}/4</span>
                </div>
                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                  {step.instruction}
                </p>
                <div className="pt-2 text-xs text-slate-500 italic flex items-center gap-1.5 border-t border-slate-200/60">
                  <span className="font-semibold text-slate-600">Why:</span> {step.rationale}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-center text-xs text-slate-500">
        <span className="font-semibold text-slate-700">Autonomy Ladder Level 2 · Clinical Prototype:</span> The software displays and speaks guidance. The human acts. No direct medical intervention or device actuation is performed automatically.
      </div>

    </div>
  );
}
