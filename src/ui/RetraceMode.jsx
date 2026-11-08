import React, { useState } from 'react';
import { 
  Compass, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertOctagon,
  HelpCircle,
  FileText
} from 'lucide-react';
import { processRetraceReport } from '../engine/retrace.js';
import regionsData from '../content/regions.json';
import kitInventory from '../content/kit.json';
import ProvenanceBadge from './ProvenanceBadge.jsx';

export default function RetraceMode({ astronaut, onSwitchToScenario }) {
  const [selectedRegionId, setSelectedRegionId] = useState('cardio');
  const [incidentText, setIncidentText] = useState('Astronaut experienced sudden retrosternal tightness and palpitations after manual airlock hatch inspection.');
  const [onsetMinutes, setOnsetMinutes] = useState(15);
  const [selectedSymptoms, setSelectedSymptoms] = useState(['chest-discomfort']);
  const [actionsTakenInput, setActionsTakenInput] = useState('Administered chewable aspirin 325mg; instructed patient to sit down in airlock');
  const [retraceResult, setRetraceResult] = useState(null);

  const availableSymptoms = [
    'chest-discomfort',
    'shortness-of-breath',
    'syncope',
    'nausea',
    'repeated-vomiting',
    'dizziness',
    'stridor',
    'headache'
  ];

  const handleRunRetrace = (e) => {
    e.preventDefault();
    const actionsArray = actionsTakenInput.split(';').map(a => a.trim()).filter(Boolean);

    const report = {
      description: incidentText,
      onsetMinutes: Number(onsetMinutes),
      symptoms: selectedSymptoms,
      actionsTaken: actionsArray,
      vitals: astronaut.current
    };

    const result = processRetraceReport(report, astronaut, kitInventory);
    setRetraceResult(result);
  };

  const toggleSymptom = (symp) => {
    if (selectedSymptoms.includes(symp)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symp));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symp]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-space-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-950 border border-indigo-700/60 text-indigo-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">Retrace Engine (For the Unexpected)</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                LOSS-MINIMISING PROTOCOL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              For unplanned events or actions outside pre-computed scenarios. Rebuilds the timeline and protects life functions.
            </p>
          </div>
        </div>

        <ProvenanceBadge provenance="PUBLISHED" sourceId="who-primary-survey" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Event Intake Form */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-space-900 border border-slate-800 space-y-4">
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            Incident Telemetry Intake
          </div>

          <form onSubmit={handleRunRetrace} className="space-y-3.5 text-xs">
            
            {/* Subject Astronaut */}
            <div>
              <label className="text-slate-400 block mb-1">Subject Astronaut:</label>
              <div className="p-2 rounded bg-space-950 border border-slate-800 font-medium text-slate-200">
                {astronaut.name} ({astronaut.role})
              </div>
            </div>

            {/* Anatomical Region */}
            <div>
              <label className="text-slate-400 block mb-1">Primary Anatomical Zone:</label>
              <select
                value={selectedRegionId}
                onChange={(e) => setSelectedRegionId(e.target.value)}
                className="w-full px-3 py-2 rounded bg-space-950 border border-slate-700 text-slate-200 font-sans focus:outline-none focus:border-cyan-500"
              >
                {regionsData.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Narrative Description */}
            <div>
              <label className="text-slate-400 block mb-1">What happened? (Narrative):</label>
              <textarea
                rows="3"
                value={incidentText}
                onChange={(e) => setIncidentText(e.target.value)}
                className="w-full px-3 py-2 rounded bg-space-950 border border-slate-700 text-slate-200 font-sans focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* Observed Symptoms */}
            <div>
              <label className="text-slate-400 block mb-1">Observed Symptoms:</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {availableSymptoms.map(symp => {
                  const active = selectedSymptoms.includes(symp);
                  return (
                    <button
                      type="button"
                      key={symp}
                      onClick={() => toggleSymptom(symp)}
                      className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                        active
                          ? 'bg-cyan-900 border border-cyan-500 text-cyan-200'
                          : 'bg-space-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {symp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions Already Taken */}
            <div>
              <label className="text-slate-400 block mb-1">Actions already taken / supplies used (semicolon separated):</label>
              <textarea
                rows="2"
                value={actionsTakenInput}
                onChange={(e) => setActionsTakenInput(e.target.value)}
                className="w-full px-3 py-2 rounded bg-space-950 border border-slate-700 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                placeholder="e.g. given aspirin; resting in seat; applied cold pack"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Process Retrace & Generate Ladder</span>
            </button>
          </form>
        </div>

        {/* Right: Retrace Output & Loss-Minimising Ladder */}
        <div className="lg:col-span-7 space-y-4">
          
          {retraceResult ? (
            <div className="space-y-4 animate-fade-in">
              
              {/* Explicit Low Confidence Disclaimer */}
              <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-600/80 text-xs text-amber-200 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">{retraceResult.confidenceNote}</strong>
                  <span className="text-[11px] text-amber-300/80">
                    Unknowns: {retraceResult.unknowns.join('; ')}
                  </span>
                </div>
              </div>

              {/* Red-Flag Panel */}
              {retraceResult.redFlags.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-950/80 border-2 border-rose-600 space-y-2">
                  <div className="flex items-center gap-2 text-rose-200 font-bold text-xs uppercase tracking-wider">
                    <AlertOctagon className="w-4 h-4 text-rose-400" />
                    <span>EMERGENCY PRIMARY SURVEY RED FLAGS DETECTED</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-rose-100">
                    {retraceResult.redFlags.map((rf, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-mono text-rose-400 font-bold">[{rf.category}]:</span>
                        <span>{rf.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Review & Allergy Conflicts */}
              {retraceResult.actionWarnings.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-950/90 border border-rose-600 space-y-2">
                  <div className="text-xs font-mono font-bold text-rose-200 uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Prior Action Conflicts & Allergy Violations</span>
                  </div>
                  {retraceResult.actionWarnings.map((aw, idx) => (
                    <div key={idx} className="text-xs text-rose-100 p-2.5 rounded bg-rose-900/60 border border-rose-700/80">
                      {aw.issue}
                    </div>
                  ))}
                </div>
              )}

              {/* Closest Planned Scenario Match */}
              {retraceResult.scenarioMatch && (
                <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-700 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-cyan-400">Closest Guided Scenario Match</span>
                    <h4 className="text-sm font-bold text-slate-100">{retraceResult.scenarioMatch.title}</h4>
                    <p className="text-xs text-slate-300">{retraceResult.scenarioMatch.recommendation}</p>
                  </div>
                  <button
                    onClick={() => onSwitchToScenario(retraceResult.scenarioMatch.scenarioId)}
                    className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    <span>Switch to Care Mode</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Loss-Minimising Priority Ladder */}
              <div className="p-5 rounded-xl bg-space-900 border border-slate-800 space-y-3">
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                  Loss-Minimising Priority Ladder (Next Safest Steps)
                </div>

                <div className="space-y-2.5">
                  {retraceResult.ladderSteps.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-space-950 border border-slate-800 flex items-start gap-3 text-xs">
                      <span className="w-5 h-5 rounded-full bg-space-800 text-cyan-400 border border-cyan-800/60 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                        {step.tier}
                      </span>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-200">{step.title}</div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-10 rounded-xl bg-space-900/50 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-2 text-slate-400 text-xs">
              <Compass className="w-8 h-8 text-slate-600" />
              <p>Enter the unexpected incident details on the left and click "Process Retrace".</p>
              <p className="text-[11px] text-slate-400">
                The engine will evaluate red flags, screen for drug allergies, and assemble the lowest-loss stabilization ladder.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
