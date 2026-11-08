import React, { useState, useEffect } from 'react';
import cardioScenario from '../content/scenarios/cardio.json';
import postStormScenario from '../content/scenarios/post-storm.json';
import kitInventory from '../content/kit.json';
import { checkKitAvailability, verifyAllergySafety, createCareLogEntry } from '../engine/care.js';
import ProvenanceBadge from './ProvenanceBadge.jsx';
import { 
  ShieldAlert, 
  Heart, 
  Radiation, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Ban, 
  Box, 
  Check, 
  RotateCcw,
  Info,
  ChevronRight
} from 'lucide-react';

export default function CareMode({ astronaut, activeScenarioId = 'cardio-scare', onLogCareAction }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(activeScenarioId);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [confirmedSteps, setConfirmedSteps] = useState([]);
  const [triageAnswers, setTriageAnswers] = useState({});
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    setSelectedScenarioId(activeScenarioId);
    setCurrentStepIndex(0);
    setConfirmedSteps([]);
  }, [activeScenarioId, astronaut.id]);

  const scenario = selectedScenarioId === 'cardio-scare' ? cardioScenario : postStormScenario;

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const startRecheckTimer = (minutes) => {
    setTimerSeconds(minutes * 60);
    setTimerRunning(true);
  };

  const handleConfirmStep = (step) => {
    if (!confirmedSteps.includes(step.id)) {
      setConfirmedSteps([...confirmedSteps, step.id]);
      const logEntry = createCareLogEntry(
        scenario.id,
        step.id,
        step.title,
        astronaut.id,
        step.needsKit
      );
      onLogCareAction(logEntry);
    }
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Scenario Header & Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-space-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              CLINICAL DECISION SUPPORT
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Patient: <strong className="text-slate-100">{astronaut.name}</strong> ({astronaut.callsign})
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Medical Reviewer: <strong className="text-emerald-400 font-semibold">{scenario.reviewedBy}</strong>
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 mt-1">
            {scenario.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Trigger: {scenario.trigger}
          </p>
        </div>

        {/* Switch Scenarios */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedScenarioId('cardio-scare');
              setCurrentStepIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              selectedScenarioId === 'cardio-scare'
                ? 'bg-rose-950 text-rose-300 border border-rose-700 font-bold'
                : 'bg-space-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Scenario A (Cardio)</span>
          </button>
          <button
            onClick={() => {
              setSelectedScenarioId('post-storm-illness');
              setCurrentStepIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              selectedScenarioId === 'post-storm-illness'
                ? 'bg-amber-950 text-amber-300 border border-amber-700 font-bold'
                : 'bg-space-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radiation className="w-3.5 h-3.5 text-amber-400" />
            <span>Scenario B (Post-Storm)</span>
          </button>
        </div>
      </div>

      {/* Scenario B Specific: CDC Dose Verification & Differential Diagnosis */}
      {selectedScenarioId === 'post-storm-illness' && scenario.doseVerification && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-amber-950/60 to-space-950 border border-amber-600/70 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-600 text-black">
                <Radiation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wide">
                  1. Mandatory CDC Dose Threshold Verification
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Check personal dosimeter before treating as radiation prodrome.
                </p>
              </div>
            </div>
            <ProvenanceBadge provenance="PUBLISHED" sourceId="cdc-ars-clinicians" />
          </div>

          <div className="p-3 rounded-lg bg-space-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
            {scenario.doseVerification.arsThresholdDescription}
          </div>

          {/* Differential Diagnosis List */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-semibold text-amber-300 uppercase">
              Rule Out Non-Radiation Causes First:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {scenario.otherCausesToRuleOut?.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-space-950 border border-slate-800 space-y-1 text-xs">
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>{item.cause}</span>
                    <ProvenanceBadge provenance="PUBLISHED" sourceId={item.source} compact />
                  </div>
                  <p className="text-[11px] text-slate-400">{item.indicator}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Immediate First Response Protocol Card */}
      <div className="p-5 rounded-xl bg-space-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>Immediate First Response Protocol</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Execute before triage</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scenario.firstResponse?.map((fr, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-space-950 border border-slate-800 flex flex-col justify-between text-xs space-y-2">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">
                  {idx + 1}
                </span>
                <p className="text-slate-300 leading-relaxed">{fr.text}</p>
              </div>
              <div className="flex justify-end pt-1">
                <ProvenanceBadge provenance="PUBLISHED" sourceId={fr.source} compact />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Triage Stepper & Interactive Steps Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Step-by-Step Care Guide */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>CLINICAL STEPS ({confirmedSteps.length} of {scenario.steps.length} Confirmed)</span>
            <span>Reviewed by: {scenario.reviewedBy}</span>
          </div>

          <div className="space-y-3">
            {scenario.steps?.map((step, idx) => {
              const isConfirmed = confirmedSteps.includes(step.id);
              const kitCheck = checkKitAvailability(step.needsKit, kitInventory);
              const allergyCheck = verifyAllergySafety(step, astronaut);

              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border transition-all ${
                    !allergyCheck.safe
                      ? 'bg-rose-950/40 border-rose-700/80'
                      : isConfirmed
                      ? 'bg-space-900 border-emerald-600/70'
                      : 'bg-space-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        isConfirmed
                          ? 'bg-emerald-600 text-white'
                          : !allergyCheck.safe
                          ? 'bg-rose-700 text-white'
                          : 'bg-space-800 text-slate-300 border border-slate-700'
                      }`}>
                        {isConfirmed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-100">{step.title}</h4>
                          <ProvenanceBadge provenance="PUBLISHED" sourceId={step.source} compact />
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {step.text}
                        </p>
                      </div>
                    </div>

                    {/* Step Action Button */}
                    <div className="shrink-0">
                      {allergyCheck.safe ? (
                        <button
                          onClick={() => handleConfirmStep(step)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isConfirmed
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                              : 'bg-cyan-600 hover:bg-cyan-500 text-black'
                          }`}
                        >
                          {isConfirmed ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Logged</span>
                            </>
                          ) : (
                            <span>Confirm Executed</span>
                          )}
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono px-2 py-1 rounded bg-rose-950 text-rose-300 border border-rose-700 font-bold">
                          CONTRAINDICATED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Allergy Warning Alert Banner */}
                  {!allergyCheck.safe && (
                    <div className="mt-3 p-2.5 rounded-lg bg-rose-900/80 border border-rose-500 text-rose-100 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
                      <span>{allergyCheck.warning}</span>
                    </div>
                  )}

                  {/* Supply Kit Check Banner */}
                  {step.needsKit?.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Box className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Requires: {step.needsKit.join(', ')}</span>
                      </div>
                      <span className={kitCheck.available ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                        {kitCheck.available ? 'Supplies Verified Onboard' : 'SUPPLY DEPLETED'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Do Not Instructions */}
          <div className="p-4 rounded-xl bg-space-950 border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Ban className="w-4 h-4 text-rose-400" />
              <span>Contraindications & What NOT To Do</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {scenario.doNot?.map((dn, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{dn.text}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Right: Recheck Timer & Hold Plan */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Recheck Timer Card */}
          <div className="p-5 rounded-xl bg-space-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
              <span>RECHECK TIMER</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="text-center py-2">
              <div className="text-4xl font-mono font-extrabold text-slate-100">
                {formatTimer(timerSeconds)}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                Interval: {scenario.recheckMinutes} minutes
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => startRecheckTimer(scenario.recheckMinutes)}
                className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs transition-colors cursor-pointer"
              >
                Start {scenario.recheckMinutes}m Timer
              </button>
              <button
                onClick={() => {
                  setTimerSeconds(0);
                  setTimerRunning(false);
                }}
                className="p-2 rounded-lg bg-space-800 hover:bg-space-700 text-slate-400 hover:text-slate-200 border border-slate-700 cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Worsening Signs to Watch */}
          <div className="p-4 rounded-xl bg-space-900 border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Worsening Signs (Red Flags)</span>
            </div>
            <ul className="space-y-1 text-xs text-slate-300">
              {scenario.worseningSigns?.map((sign, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-400">›</span>
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hold Plan */}
          <div className="p-4 rounded-xl bg-space-900 border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Hold Plan & Telemetry Cache
            </div>
            <ul className="space-y-1 text-xs text-slate-300">
              {scenario.holdPlan?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-cyan-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
