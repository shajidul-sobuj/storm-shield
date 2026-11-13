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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-xl rounded-2xl border-2 shadow-2xl overflow-hidden transition-all duration-300 ${
        alert.escalated 
          ? 'bg-slate-900/95 border-rose-500/80 ring-4 ring-rose-500/20' 
          : 'bg-slate-900/95 border-amber-500/80 ring-4 ring-amber-500/20'
      }`}>
        
        {/* Header Banner */}
        <div className={`px-6 py-4 flex items-center justify-between text-white ${
          alert.escalated ? 'bg-rose-950/90 text-rose-200 border-b border-rose-500/50' : 'bg-amber-950/90 text-amber-200 border-b border-amber-500/50'
        }`}>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                alert.escalated ? 'bg-rose-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                alert.escalated ? 'bg-rose-500' : 'bg-amber-500'
              }`}></span>
            </span>
            <div>
              <h3 className="font-bold tracking-wide uppercase text-sm text-white">
                {alert.escalated ? 'CRITICAL ESCALATION · PATIENT UNRESPONSIVE' : 'CREW MEDICAL BROADCAST'}
              </h3>
              <p className="text-xs text-slate-300 opacity-90">Multi-tab broadcast synchronized via BroadcastChannel</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextMuted = !muted;
                setMuted(nextMuted);
                if (!nextMuted) alertSystem.playAlertSound(alert.escalated);
              }}
              title="Test / Mute Alert Sound"
              className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-xs font-mono text-slate-300 hover:text-white cursor-pointer"
            >
              {muted ? '🔇 Muted' : '🔊 Audio'}
            </button>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-black/40 text-slate-300 border border-slate-700">
              [A6 / A7]
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-slate-200">
          
          {/* Alert Core Details */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold uppercase text-slate-400 font-mono">Initiated By</span>
                <h4 className="text-lg font-bold text-white">{alert.from}</h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold uppercase text-slate-400 font-mono">Location</span>
                <p className="text-sm font-medium text-slate-300">{alert.location}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800">
              <span className="text-xs font-semibold uppercase text-slate-400 font-mono">Telemetry Trigger</span>
              <p className={`text-base font-semibold mt-0.5 ${alert.escalated ? 'text-rose-400' : 'text-amber-400'}`}>
                {alert.reason}
              </p>
            </div>
          </div>

          {/* Dead-man Check-in Timer Display */}
          <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-amber-300">Patient Dead-Man Check-in</span>
              <p className="text-xs text-amber-400/90">Patient must tap "I'm OK" before timer expires</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className={`font-mono text-2xl font-black ${
                  alertState.secondsRemaining <= 3 ? 'text-rose-400 animate-pulse' : 'text-amber-300'
                }`}>
                  {alertState.secondsRemaining}s
                </div>
                <span className="text-[10px] text-slate-400 font-mono">countdown</span>
              </div>
              <button
                onClick={handleCheckIn}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                I'm OK
              </button>
            </div>
          </div>

          {/* Acknowledgements Status */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
              <span className="font-semibold uppercase">Crew Responses ({alert.acks.length})</span>
              <span>{new Date(alert.time).toLocaleTimeString()}</span>
            </div>

            {alert.acks.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-950/60 rounded-lg p-2.5 border border-dashed border-slate-800">
                Awaiting crew acknowledgment... (Open this page in a second browser tab to test multi-crew sync)
              </p>
            ) : (
              <div className="space-y-1.5">
                {alert.acks.map((ack, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-emerald-950/40 border border-emerald-500/40 rounded-lg px-3 py-2 text-emerald-300">
                    <span className="font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      {ack.responder}
                    </span>
                    <span className="font-mono text-emerald-400 text-[11px]">
                      On my way · {new Date(ack.time).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions & Navigation */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2.5 justify-between">
            <div className="flex gap-2">
              <button
                onClick={handleAcknowledge}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>🏃‍♂️</span> On My Way
              </button>
              {onSwitchToSelfSupport && (
                <button
                  onClick={() => {
                    handleDismiss();
                    onSwitchToSelfSupport();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-sm transition cursor-pointer"
                >
                  Self-Support View
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {onSwitchToCare && (
                <button
                  onClick={() => {
                    handleDismiss();
                    onSwitchToCare();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 font-semibold text-sm border border-indigo-500/50 transition cursor-pointer"
                >
                  Open Care Mode →
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-white font-semibold text-xs transition cursor-pointer"
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
