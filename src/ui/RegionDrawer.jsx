import React from 'react';
import { X, AlertTriangle, ShieldCheck, Activity, ArrowRight, BookOpen } from 'lucide-react';
import ProvenanceBadge from './ProvenanceBadge.jsx';

export default function RegionDrawer({ region, astronaut, onClose, onLaunchCare, onLaunchRetrace }) {
  if (!region) return null;

  const getVital = (val, fallback) => {
    if (val === undefined || val === null) return fallback;
    if (typeof val === 'object' && val.value !== undefined) return val.value;
    return val;
  };

  const currHr = getVital(astronaut.current?.hr, 74);
  const currSbp = astronaut.current?.bp?.systolic || 120;
  const currDbp = astronaut.current?.bp?.diastolic || 80;
  const currSpo2 = getVital(astronaut.current?.spo2, 98);
  const currRr = getVital(astronaut.current?.rr, 16);
  const symptoms = astronaut.current?.symptoms || [];

  // Determine region status based on astronaut current vitals and symptoms
  const getRegionStatus = () => {
    if (region.id === 'cardio') {
      if (symptoms.includes('chest-discomfort') || currHr >= 120 || currSbp >= 160 || currDbp >= 100) {
        return { status: 'act', label: 'ACT REQUIRED', color: 'text-rose-400 bg-rose-950/60 border-rose-500/50 font-bold' };
      }
      if (currHr >= 100 || currSbp >= 140 || currDbp >= 90) {
        return { status: 'watch', label: 'WATCH', color: 'text-amber-400 bg-amber-950/60 border-amber-500/50 font-bold' };
      }
      return { status: 'nominal', label: 'NOMINAL', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40 font-bold' };
    }
    if (region.id === 'digestive') {
      if (symptoms.includes('repeated-vomiting')) {
        return { status: 'act', label: 'ACT REQUIRED', color: 'text-rose-400 bg-rose-950/60 border-rose-500/50 font-bold' };
      }
      if (symptoms.includes('nausea') || symptoms.includes('vomiting')) {
        return { status: 'watch', label: 'WATCH / PRODROME', color: 'text-amber-400 bg-amber-950/60 border-amber-500/50 font-bold' };
      }
      return { status: 'nominal', label: 'NOMINAL', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40 font-bold' };
    }
    if (region.id === 'respiratory') {
      if (symptoms.includes('shortness-of-breath') || currSpo2 < 90 || currRr >= 28) {
        return { status: 'act', label: 'ACT REQUIRED', color: 'text-rose-400 bg-rose-950/60 border-rose-500/50 font-bold' };
      }
      if (currSpo2 <= 94 || currRr >= 22) {
        return { status: 'watch', label: 'WATCH', color: 'text-amber-400 bg-amber-950/60 border-amber-500/50 font-bold' };
      }
      return { status: 'nominal', label: 'NOMINAL', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40 font-bold' };
    }
    return { status: 'nominal', label: 'NOMINAL', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40 font-bold' };
  };

  const statusInfo = getRegionStatus();

  return (
    <div className={`glass-panel border rounded-2xl p-4 shadow-xl space-y-3 transition-all ${
      statusInfo.status === 'act' 
        ? 'border-rose-500/60 ring-2 ring-rose-500/20' 
        : statusInfo.status === 'watch' 
        ? 'border-amber-500/60 ring-2 ring-amber-500/20' 
        : 'border-slate-700/60'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">{region.name}</h3>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
            Subject: <span className="text-cyan-300 font-bold">{astronaut.name}</span> ({astronaut.callsign})
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          title="Reset to Cardio"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Specific Physiological Telemetry for this region */}
      {region.id === 'cardio' ? (
        <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/60 space-y-1.5 text-xs font-mono">
          <div className="text-rose-400 uppercase text-[10px] font-bold flex items-center justify-between">
            <span>Divergence Telemetry</span>
            <span className="text-rose-400 animate-pulse font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              ACTIVE ALERT
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-slate-950/80 border border-rose-900/40">
              <span className="text-[10px] text-slate-400 block">PULSE RATE</span>
              <span className="text-sm font-bold text-rose-400">
                {currHr} bpm
              </span>
              <span className="text-[9px] text-slate-500 block">Base: {astronaut.baseline?.hr?.value}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/80 border border-rose-900/40">
              <span className="text-[10px] text-slate-400 block">BLOOD PRESS.</span>
              <span className="text-sm font-bold text-rose-400">
                {currSbp}/{currDbp}
              </span>
              <span className="text-[9px] text-slate-500 block">Base: {astronaut.baseline?.bp?.systolic}/{astronaut.baseline?.bp?.diastolic}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">Status Telemetry</div>
          <div className="text-slate-300 font-medium leading-snug">{region.hazardEffects?.slice(0, 95)}...</div>
        </div>
      )}

      {/* Spaceflight Hazards Section */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center justify-between">
          <span>Spaceflight Hazards</span>
          <ProvenanceBadge provenance={region.provenance} sourceId={region.source} compact />
        </div>
        <div className="flex flex-wrap gap-1">
          {region.hazards?.map((h, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60 font-medium">
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Action Triggers */}
      <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
        <button
          onClick={() => onLaunchCare(region.id === 'cardio' ? 'cardio-scare' : 'post-storm-illness')}
          className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
            statusInfo.status === 'act'
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-950/50'
          }`}
        >
          <span>Guided Care</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onLaunchRetrace(region.id)}
          className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
        >
          Retrace
        </button>
      </div>
    </div>
  );
}
