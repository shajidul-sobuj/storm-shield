import React from 'react';
import { X, AlertTriangle, ShieldCheck, Activity, ArrowRight, BookOpen } from 'lucide-react';
import ProvenanceBadge from './ProvenanceBadge.jsx';

export default function RegionDrawer({ region, astronaut, onClose, onLaunchCare, onLaunchRetrace }) {
  if (!region) return null;

  // Determine region status based on astronaut current vitals and symptoms
  const getRegionStatus = () => {
    const symptoms = astronaut.current?.symptoms || [];
    if (region.id === 'cardio' && symptoms.includes('chest-discomfort')) {
      return { status: 'act', label: 'ACT REQUIRED', color: 'text-rose-400 bg-rose-950/80 border-rose-700' };
    }
    if (region.id === 'digestive' && (symptoms.includes('nausea') || symptoms.includes('vomiting'))) {
      return { status: 'watch', label: 'WATCH', color: 'text-amber-400 bg-amber-950/80 border-amber-700' };
    }
    return { status: 'nominal', label: 'NOMINAL', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-700' };
  };

  const statusInfo = getRegionStatus();

  return (
    <div className="bg-space-900 border border-slate-700 rounded-xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-100">{region.name}</h3>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Subject: <span className="text-cyan-400 font-medium">{astronaut.name}</span> ({astronaut.callsign})
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-space-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Spaceflight Hazards Section */}
      <div className="space-y-1.5">
        <div className="text-xs font-mono text-cyan-400 font-semibold uppercase flex items-center justify-between">
          <span>Spaceflight Hazards</span>
          <ProvenanceBadge provenance={region.provenance} sourceId={region.source} compact />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {region.hazards?.map((h, i) => (
            <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-slate-700">
              {h}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-300 leading-relaxed bg-space-950 p-2.5 rounded-lg border border-slate-800">
          {region.hazardEffects}
        </p>
      </div>

      {/* Monitored Metrics for this zone */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-slate-400 uppercase">Monitored Indicators</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {region.keyMetrics?.map((m, idx) => (
            <div key={idx} className="p-2 rounded bg-space-950/70 border border-slate-800/80 text-slate-300 flex items-center justify-between">
              <span>{m}</span>
              <Activity className="w-3 h-3 text-cyan-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Specific Physiological Telemetry for this region */}
      {region.id === 'cardio' && (
        <div className="p-3 rounded-lg bg-space-950 border border-slate-800 space-y-2 text-xs font-mono">
          <div className="text-slate-400 uppercase text-[11px]">Cardiovascular Delta</div>
          <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Blood Pressure:</span>
            <span className="text-slate-100 font-bold">
              {astronaut.current?.bp?.systolic}/{astronaut.current?.bp?.diastolic} mmHg
            </span>
            <span className="text-xs text-amber-400">
              (Base: {astronaut.baseline?.bp?.systolic}/{astronaut.baseline?.bp?.diastolic})
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">Heart Rate:</span>
            <span className="text-slate-100 font-bold">
              {astronaut.current?.hr?.value || astronaut.current?.hr} bpm
            </span>
            <span className="text-xs text-amber-400">
              (Base: {astronaut.baseline?.hr?.value} bpm)
            </span>
          </div>
        </div>
      )}

      {/* Quick Action Triggers */}
      <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
        <button
          onClick={() => onLaunchCare(region.id === 'cardio' ? 'cardio-scare' : 'post-storm-illness')}
          className="flex-1 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Run Guided Care</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onLaunchRetrace(region.id)}
          className="py-2 px-3 rounded-lg bg-space-800 hover:bg-space-700 text-amber-300 border border-amber-600/40 text-xs font-medium transition-colors cursor-pointer"
        >
          Something's wrong here
        </button>
      </div>
    </div>
  );
}
