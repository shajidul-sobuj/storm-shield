import React, { useState, useEffect } from 'react';
import { alertSystem } from '../engine/alerts.js';

export default function CrewAlertModal({ currentCrewId = 'crew-1', onSwitchToCare, onSwitchToSelfSupport }) {
  const [alertState, setAlertState] = useState({
    activeAlert: alertSystem.activeAlert,
    secondsRemaining: alertSystem.checkInSecondsRemaining,
    history: alertSystem.alertHistory
  });
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    return alertSystem.subscribe(setAlertState);
  }, []);

  const alert = alertState.activeAlert;
  if (!alert) return null;

  const handleAcknowledge = () => {
    const responderName = currentCrewId === 'crew-1' ? 'Dr. Maya Lin (Commander)' : 'Sofia Rossi (Crew-3)';
    alertSystem.acknowledgeAlert(responderName);
  };

  const handleCheckIn = () => {
    alertSystem.recordCheckIn();
  };

  const handleDismiss = () => {
    alertSystem.dismissAlert(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-xl rounded-2xl border-2 shadow-2xl overflow-hidden transition-all duration-300 ${
        alert.escalated 
          ? 'bg-rose-50 border-rose-600 ring-4 ring-rose-500/20' 
          : 'bg-white border-amber-500 ring-4 ring-amber-500/20'
      }`}>
        
        {/* Header Banner */}
        <div className={`px-6 py-4 flex items-center justify-between text-white ${
          alert.escalated ? 'bg-rose-600' : 'bg-amber-600'
        }`}>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <div>
              <h3 className="font-bold tracking-wide uppercase text-sm">
                {alert.escalated ? 'CRITICAL ESCALATION · PATIENT UNRESPONSIVE' : 'CREW MEDICAL BROADCAST'}
              </h3>
              <p className="text-xs text-amber-100 opacity-90">Multi-tab broadcast synchronized via BroadcastChannel</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMuted(!muted);
                if (!muted) alertSystem.playAlertSound(alert.escalated);
              }}
              title="Test / Mute Alert Sound"
              className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-xs font-mono"
            >
              {muted ? '🔇 Muted' : '🔊 Audio'}
            </button>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-black/20">
              [A6 / A7]
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-slate-800">
          
          {/* Alert Core Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">Initiated By</span>
                <h4 className="text-lg font-bold text-slate-900">{alert.from}</h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold uppercase text-slate-400">Location</span>
                <p className="text-sm font-medium text-slate-700">{alert.location}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200">
              <span className="text-xs font-semibold uppercase text-slate-400">Telemetry Trigger</span>
              <p className={`text-base font-semibold mt-0.5 ${alert.escalated ? 'text-rose-700' : 'text-amber-800'}`}>
                {alert.reason}
              </p>
            </div>
          </div>

          {/* Dead-man Check-in Timer Display */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-amber-900">Patient Dead-Man Check-in</span>
              <p className="text-xs text-amber-700">Patient must tap "I'm OK" before timer expires</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className={`font-mono text-2xl font-black ${
                  alertState.secondsRemaining <= 3 ? 'text-rose-600 animate-pulse' : 'text-amber-900'
                }`}>
                  {alertState.secondsRemaining}s
                </div>
                <span className="text-[10px] text-slate-500 font-mono">countdown</span>
              </div>
              <button
                onClick={handleCheckIn}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
              >
                I'm OK
              </button>
            </div>
          </div>

          {/* Acknowledgements Status */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="font-semibold uppercase">Crew Responses ({alert.acks.length})</span>
              <span className="font-mono">{new Date(alert.time).toLocaleTimeString()}</span>
            </div>

            {alert.acks.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 rounded-lg p-2.5 border border-dashed border-slate-200">
                Awaiting crew acknowledgment... (Open this page in a second browser tab to test multi-crew sync)
              </p>
            ) : (
              <div className="space-y-1.5">
                {alert.acks.map((ack, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-emerald-900">
                    <span className="font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {ack.responder}
                    </span>
                    <span className="font-mono text-emerald-700">
                      On my way · {new Date(ack.time).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions & Navigation */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2.5 justify-between">
            <div className="flex gap-2">
              <button
                onClick={handleAcknowledge}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition flex items-center gap-2 active:scale-95"
              >
                <span>🏃‍♂️</span> On My Way
              </button>
              {onSwitchToSelfSupport && (
                <button
                  onClick={() => {
                    onSwitchToSelfSupport();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition"
                >
                  Self-Support View
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {onSwitchToCare && (
                <button
                  onClick={() => {
                    onSwitchToCare();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm border border-indigo-200 transition"
                >
                  Open Care Mode →
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition"
              >
                Dismiss / Stabilized
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
