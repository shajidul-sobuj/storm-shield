import React, { useState } from 'react';
import { generateFlightSurgeonHandoff } from '../engine/handoff.js';
import { FileText, Copy, Check, Printer, Shield, Radio, AlertTriangle } from 'lucide-react';
import ProvenanceBadge from './ProvenanceBadge.jsx';

export default function HandoffScreen({ astronaut, groundLink, careLogs, stormStatus }) {
  const [copied, setCopied] = useState(false);

  const handoff = generateFlightSurgeonHandoff({
    patient: astronaut,
    groundLinkMode: groundLink,
    careLogs,
    stormStatus,
    missionDay: astronaut.flightDay
  });

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(handoff, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-space-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-800/80 text-cyan-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">Flight Surgeon Medical Handoff</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                NASA EIMO STANDARD
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Condensed 30-second structured clinical briefing for Earth Mission Control.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyJson}
            className="px-3.5 py-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Packet' : 'Copy Telemetry'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* The Printable 1-Page Medical Briefing Document */}
      <div className="p-8 rounded-xl bg-space-900/90 border border-slate-700 shadow-2xl space-y-6 font-sans print:bg-white print:text-black">
        
        {/* Document Header */}
        <div className="border-b-2 border-cyan-500/80 pb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
              NASA HUMAN RESEARCH PROGRAM · EIMO BRIEFING
            </div>
            <h1 className="text-xl font-bold text-slate-100 mt-1">
              PATIENT CLINICAL SUMMARY: {handoff.patient.name.toUpperCase()}
            </h1>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              Callsign: {handoff.patient.callsign} · Role: {handoff.patient.role} · Mission Day: {handoff.meta.missionElapsedDay}
            </div>
          </div>

          <div className="text-right text-xs font-mono space-y-1">
            <div className="flex items-center justify-end gap-1.5">
              <Radio className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-300">Link Status: <strong>{handoff.meta.groundLinkStatus}</strong></span>
            </div>
            <div className="text-slate-400 text-[11px]">Timestamp: {handoff.meta.generatedAt.split('T')[0]} {handoff.meta.generatedAt.split('T')[1].substring(0,8)} UTC</div>
          </div>
        </div>

        {/* Demographics & Space Weather Quick Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3.5 rounded-lg bg-space-950 border border-slate-800 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">BLOOD TYPE:</span>
            <span className="text-slate-100 font-bold">{handoff.patient.bloodType}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">ALLERGIES:</span>
            <span className="text-amber-400 font-bold">{handoff.patient.allergies}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">SPACE WEATHER:</span>
            <span className="text-cyan-400 font-bold">{handoff.spaceWeatherContext.noaaStormLevel} ({handoff.spaceWeatherContext.protonFluxPfu} pfu)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">SHELTER STATUS:</span>
            <span className="text-slate-100 font-bold">{handoff.spaceWeatherContext.shelterProtocolActive ? 'ACTIVE' : 'STANDBY'}</span>
          </div>
        </div>

        {/* Objective Physiological Telemetry Table */}
        <div className="space-y-2">
          <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Objective Physiological Metrics (Baseline vs Current)</span>
            <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-hrp-cardio" compact />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-space-950 text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="p-2.5">Telemetry Parameter</th>
                  <th className="p-2.5">Astronaut Baseline</th>
                  <th className="p-2.5">Current Value</th>
                  <th className="p-2.5">Provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {handoff.clinicalVitalsTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-space-950/50">
                    <td className="p-2.5 font-medium text-slate-200">{row.vital}</td>
                    <td className="p-2.5 text-slate-400">{row.baseline}</td>
                    <td className="p-2.5 font-bold text-slate-100">{row.current}</td>
                    <td className="p-2.5 text-slate-400 text-[10px]">{row.provenance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chief Complaint & Symptoms */}
        <div className="space-y-1.5 text-xs">
          <div className="font-mono text-slate-400 uppercase text-[11px] font-bold">
            Chief Complaint & Observable Symptoms:
          </div>
          <div className="p-3 rounded-lg bg-space-950 border border-slate-800 text-slate-200">
            {handoff.chiefComplaint}
          </div>
        </div>

        {/* Clinical Interventions Logged */}
        <div className="space-y-2 text-xs">
          <div className="font-mono text-slate-400 uppercase text-[11px] font-bold">
            Autonomous Interventions Executed in Flight:
          </div>
          {careLogs.length > 0 ? (
            <div className="space-y-1.5">
              {careLogs.map((log, idx) => (
                <div key={idx} className="p-2.5 rounded bg-space-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-200">{log.actionDescription}</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{log.timestamp.split('T')[1].substring(0,8)} UTC</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded bg-space-950 border border-slate-800 text-slate-400 italic">
              No guided pharmaceutical interventions executed during current watch.
            </div>
          )}
        </div>

        {/* Flight Surgeon Action Prompts */}
        <div className="p-4 rounded-xl bg-space-950 border border-cyan-800/80 space-y-2 text-xs">
          <div className="font-mono font-bold text-cyan-400 uppercase text-[11px]">
            Flight Surgeon Direct Action Prompts (Earth Ground Review):
          </div>
          <ul className="space-y-1 text-slate-300">
            {handoff.surgeonActionRequired.map((act, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">›</span>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-center text-[10px] font-mono text-slate-400">
          STORM SHIELD · STUDENT PROTOTYPE · NASA SPACE APPS CHALLENGE 2026 · ALL CITATIONS VERIFIED
        </div>

      </div>

    </div>
  );
}
