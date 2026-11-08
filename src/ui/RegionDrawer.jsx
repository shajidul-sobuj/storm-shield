import React from 'react';
import { X, AlertTriangle, ShieldCheck, Activity, ArrowRight, BookOpen } from 'lucide-react';
import ProvenanceBadge from './ProvenanceBadge.jsx';

export default function RegionDrawer({ region, astronaut, onClose, onLaunchCare, onLaunchRetrace }) {
  if (!region) return null;

  // Determine region status based on astronaut current vitals and symptoms
  const getRegionStatus = () => {
    const symptoms = astronaut.current?.symptoms || [];
    if (region.id === 'cardio' && symptoms.includes('chest-discomfort')) {
      return { status: 'act', label: 'ACT REQUIRED', color: 'text-rose-700 bg-rose-50 border-rose-300 font-bold' };
    }
    if (region.id === 'digestive' && (symptoms.includes('nausea') || symptoms.includes('vomiting'))) {
      return { status: 'watch', label: 'WATCH', color: 'text-amber-800 bg-amber-50 border-amber-300 font-bold' };
    }
    return { status: 'nominal', label: 'NOMINAL', color: 'text-emerald-800 bg-emerald-50 border-emerald-300 font-bold' };
  };

  const statusInfo = getRegionStatus();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">{region.name}</h3>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Subject: <span className="text-sky-700 font-bold">{astronaut.name}</span> ({astronaut.callsign})
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Spaceflight Hazards Section */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-sky-700 font-bold uppercase flex items-center justify-between">
          <span>Spaceflight Hazards</span>
          <ProvenanceBadge provenance={region.provenance} sourceId={region.source} compact />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {region.hazards?.map((h, i) => (
            <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
              {h}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
          {region.hazardEffects}
        </p>
      </div>

      {/* Monitored Metrics for this zone */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-slate-500 font-bold uppercase">Monitored Physiological Indicators</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {region.keyMetrics?.map((m, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-between font-medium">
              <span>{m}</span>
              <Activity className="w-3.5 h-3.5 text-sky-600" />
            </div>
          ))}
        </div>
      </div>

      {/* Specific Physiological Telemetry for this region */}
      {region.id === 'cardio' && (
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
          <div className="text-slate-500 uppercase text-[11px] font-bold">Cardiovascular Divergence Telemetry</div>
          <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
            <span className="text-slate-600">Blood Pressure:</span>
            <span className="text-slate-900 font-bold">
              {astronaut.current?.bp?.systolic}/{astronaut.current?.bp?.diastolic} mmHg
            </span>
            <span className="text-xs text-rose-600 font-bold">
              (Base: {astronaut.baseline?.bp?.systolic}/{astronaut.baseline?.bp?.diastolic})
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-slate-600">Heart Rate:</span>
            <span className="text-slate-900 font-bold">
              {astronaut.current?.hr?.value || astronaut.current?.hr} bpm
            </span>
            <span className="text-xs text-rose-600 font-bold">
              (Base: {astronaut.baseline?.hr?.value} bpm)
            </span>
          </div>
        </div>
      )}

      {/* Quick Action Triggers */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
        <button
          onClick={() => onLaunchCare(region.id === 'cardio' ? 'cardio-scare' : 'post-storm-illness')}
          className="flex-1 py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <span>Run Guided Care</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onLaunchRetrace(region.id)}
          className="py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
        >
          Something's wrong here
        </button>
      </div>
    </div>
  );
}
