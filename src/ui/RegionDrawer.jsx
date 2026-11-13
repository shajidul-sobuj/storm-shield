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
        return { status: 'act', label: 'ACT REQUIRED', color: 'text-rose-700 bg-rose-50 border-rose-300 font-bold' };
      }
      if (currHr >= 100 || currSbp >= 140 || currDbp >= 90) {
        return { status: 'watch', label: 'WATCH', color: 'text-amber-800 bg-amber-50 border-amber-300 font-bold' };
      }
      return { status: 'nominal', label: 'NOMINAL', color: 'text-emerald-800 bg-emerald-50 border-emerald-300 font-bold' };
    }
    if (region.id === 'digestive') {
      if (symptoms.includes('repeated-vomiting')) {
        return { status: 'act', label: 'ACT REQUIRED', color: 'text-rose-700 bg-rose-50 border-rose-300 font-bold' };
      }
      if (symptoms.includes('nausea') || symptoms.includes('vomiting')) {
        return { status: 'watch', label: 'WATCH / PRODROME', color: 'text-amber-800 bg-amber-50 border-amber-300 font-bold' };
      }
      return { status: 'nominal', label: 'NOMINAL', color: 'text-emerald-800 bg-emerald-50 border-emerald-300 font-bold' };
    }
    if (region.id === 'respiratory') {
      if (symptoms.includes('shortness-of-breath') || currSpo2 < 90 || currRr >= 28) {
        return { status: 'act', label: 'ACT REQUIRED', color: 'text-rose-700 bg-rose-50 border-rose-300 font-bold' };
      }
      if (currSpo2 <= 94 || currRr >= 22) {
        return { status: 'watch', label: 'WATCH', color: 'text-amber-800 bg-amber-50 border-amber-300 font-bold' };
      }
      return { status: 'nominal', label: 'NOMINAL', color: 'text-emerald-800 bg-emerald-50 border-emerald-300 font-bold' };
    }
    return { status: 'nominal', label: 'NOMINAL', color: 'text-emerald-800 bg-emerald-50 border-emerald-300 font-bold' };
  };

  const statusInfo = getRegionStatus();

  return (
    <div className={`bg-white border rounded-2xl p-4 shadow-xs space-y-3 transition-all ${
      statusInfo.status === 'act' 
        ? 'border-rose-300 ring-2 ring-rose-400/20' 
        : statusInfo.status === 'watch' 
        ? 'border-amber-300 ring-2 ring-amber-400/20' 
        : 'border-slate-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{region.name}</h3>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
            Subject: <span className="text-sky-700 font-bold">{astronaut.name}</span> ({astronaut.callsign})
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Reset to Cardio"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Specific Physiological Telemetry for this region */}
      {region.id === 'cardio' ? (
        <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5 text-xs font-mono">
          <div className="text-rose-800 uppercase text-[10px] font-bold flex items-center justify-between">
            <span>Divergence Telemetry</span>
            <span className="text-rose-600 animate-pulse font-bold">● ACTIVE ALERT</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-1.5 rounded bg-white border border-rose-100">
              <span className="text-[10px] text-slate-500 block">PULSE RATE</span>
              <span className="text-sm font-bold text-rose-700">
                {currHr} bpm
              </span>
              <span className="text-[9px] text-slate-500 block">Base: {astronaut.baseline?.hr?.value}</span>
            </div>
            <div className="p-1.5 rounded bg-white border border-rose-100">
              <span className="text-[10px] text-slate-500 block">BLOOD PRESS.</span>
              <span className="text-sm font-bold text-rose-700">
                {currSbp}/{currDbp}
              </span>
              <span className="text-[9px] text-slate-500 block">Base: {astronaut.baseline?.bp?.systolic}/{astronaut.baseline?.bp?.diastolic}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Status Telemetry</div>
          <div className="text-slate-800 font-semibold">{region.hazardEffects?.slice(0, 95)}...</div>
        </div>
      )}

      {/* Spaceflight Hazards Section */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono text-slate-500 font-bold uppercase flex items-center justify-between">
          <span>Spaceflight Hazards</span>
          <ProvenanceBadge provenance={region.provenance} sourceId={region.source} compact />
        </div>
        <div className="flex flex-wrap gap-1">
          {region.hazards?.map((h, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Action Triggers */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onLaunchCare(region.id === 'cardio' ? 'cardio-scare' : 'post-storm-illness')}
          className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
            statusInfo.status === 'act'
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-sky-600 hover:bg-sky-700 text-white'
          }`}
        >
          <span>Guided Care</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onLaunchRetrace(region.id)}
          className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
        >
          Retrace
        </button>
      </div>
    </div>
  );
}
