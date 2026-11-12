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
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Retrace Engine (For the Unexpected)</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                LOSS-MINIMISING PROTOCOL
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                [Approval A4: Pending Medical Review]
              </span>
            </div>
            <p className="text-xs text-slate-500">
              For unplanned events or actions outside pre-computed scenarios. Rebuilds the timeline and protects life functions. Always labelled LOW CONFIDENCE.
            </p>
          </div>
        </div>

        <ProvenanceBadge provenance="PUBLISHED" sourceId="who-primary-survey" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Event Intake Form */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="text-xs font-mono font-bold text-sky-700 uppercase tracking-wider border-b border-slate-100 pb-2">
            Incident Telemetry Intake
          </div>

          <form onSubmit={handleRunRetrace} className="space-y-3.5 text-xs">
            
            {/* Subject Astronaut */}
            <div>
              <label className="text-slate-600 font-medium block mb-1">Subject Astronaut:</label>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
                {astronaut.name} ({astronaut.role})
              </div>
            </div>

            {/* Anatomical Region */}
            <div>
              <label className="text-slate-600 font-medium block mb-1">Primary Anatomical Zone:</label>
              <select
                value={selectedRegionId}
                onChange={(e) => setSelectedRegionId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white transition-all cursor-pointer"
              >
                {regionsData.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Narrative Description */}
            <div>
              <label className="text-slate-600 font-medium block mb-1">What happened? (Narrative):</label>
              <textarea
                rows="3"
                value={incidentText}
                onChange={(e) => setIncidentText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white transition-all"
                required
              />
            </div>

            {/* Observed Symptoms */}
            <div>
              <label className="text-slate-600 font-medium block mb-1">Observed Symptoms:</label>
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
                          ? 'bg-sky-50 border border-sky-300 text-sky-800 font-semibold shadow-2xs'
                          : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
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
              <label className="text-slate-600 font-medium block mb-1">Actions already taken / supplies used (semicolon separated):</label>
              <textarea
                rows="2"
                value={actionsTakenInput}
                onChange={(e) => setActionsTakenInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white transition-all"
                placeholder="e.g. given aspirin; resting in seat; applied cold pack"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
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
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">{retraceResult.confidenceNote}</strong>
                  <span className="text-[11px] text-amber-800">
                    Unknowns: {retraceResult.unknowns.join('; ')}
                  </span>
                </div>
              </div>

              {/* Red-Flag Panel */}
              {retraceResult.redFlags.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-400 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
                    <AlertOctagon className="w-4 h-4 text-rose-600" />
                    <span>EMERGENCY PRIMARY SURVEY RED FLAGS DETECTED</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-rose-950">
                    {retraceResult.redFlags.map((rf, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-mono text-rose-700 font-bold">[{rf.category}]:</span>
                        <span>{rf.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Review & Allergy Conflicts */}
              {retraceResult.actionWarnings.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-100 border border-rose-400 space-y-2 shadow-xs">
                  <div className="text-xs font-mono font-bold text-rose-900 uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-700" />
                    <span>Prior Action Conflicts & Allergy Violations</span>
                  </div>
                  {retraceResult.actionWarnings.map((aw, idx) => (
                    <div key={idx} className="text-xs text-rose-950 p-2.5 rounded-lg bg-white border border-rose-300 font-medium">
                      {aw.issue}
                    </div>
                  ))}
                </div>
              )}

              {/* Closest Planned Scenario Match */}
              {retraceResult.scenarioMatch && (
                <div className="p-4 rounded-xl bg-sky-50 border border-sky-300 flex items-center justify-between gap-4 shadow-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-sky-700 font-bold">Closest Guided Scenario Match</span>
                    <h4 className="text-sm font-bold text-slate-900">{retraceResult.scenarioMatch.title}</h4>
                    <p className="text-xs text-slate-600">{retraceResult.scenarioMatch.recommendation}</p>
                  </div>
                  <button
                    onClick={() => onSwitchToScenario(retraceResult.scenarioMatch.scenarioId)}
                    className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Switch to Care Mode</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Loss-Minimising Priority Ladder */}
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="text-xs font-mono font-bold text-sky-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Loss-Minimising Priority Ladder (Next Safest Steps)
                </div>

                <div className="space-y-2.5">
                  {retraceResult.ladderSteps.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
                      <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                        {step.tier}
                      </span>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900">{step.title}</div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-10 rounded-xl bg-white border border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-2 text-slate-600 text-xs shadow-xs">
              <Compass className="w-8 h-8 text-slate-400" />
              <p className="font-medium text-slate-700">Enter the unexpected incident details on the left and click "Process Retrace".</p>
              <p className="text-[11px] text-slate-500">
                The engine will evaluate red flags, screen for drug allergies, and assemble the lowest-loss stabilization ladder.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
