import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Activity, 
  Droplet, 
  Thermometer, 
  Moon, 
  Smile, 
  Radiation, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Wind,
  Wifi,
  Sparkles,
  LifeBuoy
} from 'lucide-react';
import ProvenanceBadge from './ProvenanceBadge.jsx';
import LiveTelemetryDeck from './LiveTelemetryDeck.jsx';
import { assessAstronaut } from '../engine/assess.js';
import { mockBioMonitor } from '../device/mockBioMonitor.js';
import { AnomalyTracker } from '../engine/anomaly.js';
import { alertSystem } from '../engine/alerts.js';

export default function Overview({ 
  astronaut, 
  groundLink, 
  stormStatus, 
  onLaunchCare, 
  onLaunchRetrace, 
  onLaunchSelfSupport,
  onOpenStorm,
  onUpdateVitals
}) {
  const assessment = assessAstronaut(astronaut.current, astronaut.baseline);

  // Live Wearable State
  const [liveSample, setLiveSample] = useState(() => mockBioMonitor.generateSample());
  const [isAnomalyActive, setIsAnomalyActive] = useState(false);
  const [anomalyProgress, setAnomalyProgress] = useState({ count: 0, status: 'nominal', reason: null });
  const trackerRef = useRef(new AnomalyTracker({ persistenceWindow: 3 }));

  useEffect(() => {
    mockBioMonitor.setAstronaut(astronaut);
    trackerRef.current.reset();
    setIsAnomalyActive(false);
    setAnomalyProgress({ count: 0, status: 'nominal', reason: null });

    const unsubscribe = mockBioMonitor.subscribe((sample) => {
      setLiveSample(sample);
      const res = trackerRef.current.processSample(sample, astronaut.baseline);
      setAnomalyProgress({
        count: res.consecutiveActCount,
        status: res.persistedStatus,
        reason: res.reason
      });

      // If Persistence Rule triggers Act, automatically raise crew alert!
      if (res.persistenceSatisfied && !alertSystem.activeAlert) {
        alertSystem.raiseAlert({
          from: `${astronaut.name} (${astronaut.callsign})`,
          kind: 'medical',
          reason: `Bio-Monitor Sustained Anomaly: ${res.reason}`,
          location: 'Crew Quarters / Hab A',
          checkInSeconds: 10
        });
      }
    });

    mockBioMonitor.startStreaming(null, 1500);

    return () => {
      unsubscribe();
    };
  }, [astronaut.id]);

  const handleToggleAnomaly = () => {
    const nextState = !isAnomalyActive;
    setIsAnomalyActive(nextState);
    mockBioMonitor.triggerScriptedAnomaly(nextState);
    if (!nextState) {
      trackerRef.current.reset();
      setAnomalyProgress({ count: 0, status: 'nominal', reason: null });
    }
  };

  const currentBP = astronaut.current?.bp || { systolic: 120, diastolic: 80 };
  const baseBP = astronaut.baseline?.bp || { systolic: 120, diastolic: 80 };
  const bpDeltaSys = currentBP.systolic - baseBP.systolic;
  const bpDeltaDia = currentBP.diastolic - baseBP.diastolic;

  const currentHR = typeof astronaut.current?.hr === 'object' ? astronaut.current.hr.value : astronaut.current.hr || 70;
  const baseHR = astronaut.baseline?.hr?.value || 70;
  const hrDelta = currentHR - baseHR;

  const currentGlucose = typeof astronaut.current?.glucose === 'object' ? astronaut.current.glucose.value : astronaut.current.glucose || 90;
  const baseGlucose = astronaut.baseline?.glucose?.value || 90;

  const currentTemp = typeof astronaut.current?.temp === 'object' ? astronaut.current.temp.value : astronaut.current.temp || 36.6;
  const baseTemp = astronaut.baseline?.temp?.value || 36.6;

  const currentSleep = typeof astronaut.current?.sleep === 'object' ? astronaut.current.sleep.value : astronaut.current.sleep || 7.0;
  const baseSleep = astronaut.baseline?.sleep?.value || 7.0;

  const currentMood = typeof astronaut.current?.mood === 'object' ? astronaut.current.mood.value : astronaut.current.mood || 4.0;

  const currentSpo2 = astronaut.current?.spo2?.value || 98;
  const baseSpo2 = astronaut.baseline?.spo2?.value || 98;

  const currentRr = astronaut.current?.rr?.value || 15;
  const baseRr = astronaut.baseline?.rr?.value || 14;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Active Medical & Environmental Alert Banner */}
      {assessment.status === 'act' ? (
        <div className="p-5 rounded-xl bg-rose-50 border-2 border-rose-400 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-rose-600 text-white shadow-xs shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900 border border-rose-300">
                  ACTION REQUIRED · HIGH PRIORITY
                </span>
                <span className="text-xs text-rose-800 font-mono">
                  Ground link: <strong>{groundLink}</strong>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-100 text-rose-800 border border-rose-300 font-bold">
                  [A1 / A7]
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {assessment.primaryReason}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Autonomy Ladder Level 2 Decision Support: Follow clinical step guidance below. The human acts.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 flex-wrap">
            <button
              onClick={() => onLaunchCare('cardio-scare')}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>Launch Care Mode (Scenario A)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {onLaunchSelfSupport && (
              <button
                onClick={onLaunchSelfSupport}
                className="px-3.5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs flex items-center gap-1.5"
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>Patient Self-Support</span>
              </button>
            )}
            <button
              onClick={() => onLaunchRetrace()}
              className="px-3.5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs border border-slate-300 font-medium cursor-pointer shadow-2xs"
            >
              Retrace
            </button>
          </div>
        </div>
      ) : assessment.status === 'watch' ? (
        <div className="p-5 rounded-xl bg-amber-50 border border-amber-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-amber-500 text-white shadow-xs shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300">
                  WATCH STATUS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                  [A2 / A3]
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                {assessment.primaryReason}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Telemetry shows baseline divergence. Continue scheduled monitoring and hydration protocol.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onLaunchCare('post-storm-illness')}
              className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Evaluate Post-Storm (Scenario B)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {onLaunchSelfSupport && (
              <button
                onClick={onLaunchSelfSupport}
                className="px-3 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold"
              >
                Self-Support
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-slate-700">
              <strong className="text-slate-900">{astronaut.name}</strong> telemetry is fully nominal across all 8 physiological metrics.
            </span>
          </div>
          <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            ALL SYSTEMS NOMINAL
          </span>
        </div>
      )}

      {/* INTERACTIVE REAL-TIME TELEMETRY & PATIENT SIMULATOR DECK */}
      {onUpdateVitals && (
        <LiveTelemetryDeck
          astronaut={astronaut}
          onUpdateVitals={onUpdateVitals}
          onLaunchCare={onLaunchCare}
        />
      )}

      {/* FEATURED: CSA Bio-Monitor Wearable Live Stream & Scripted Anomaly Trigger */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl border border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] font-bold">
                <Wifi className="w-3 h-3 animate-pulse" />
                <span>LIVE WEARABLE TELEMETRY (CSA BIO-MONITOR ADAPTER)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-400/30">
                ANCHORED · 1.5s TICK
              </span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Smart Vest Stream · {astronaut.name}</span>
              <span className="text-xs font-mono text-slate-400">({astronaut.callsign})</span>
            </h3>
            <p className="text-xs text-slate-300">
              Continuous vitals stream anchored to personalized baseline. Enforces statistical persistence ($N=3$) before alerting.
            </p>
          </div>

          {/* Interactive Trigger Button for Judges */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleToggleAnomaly}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 ${
                isAnomalyActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isAnomalyActive ? 'Reset Wearable Drift' : 'Simulate Scripted Anomaly (Drift)'}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 pt-5">
          
          {/* Live Heart Rate */}
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Heart className={`w-3.5 h-3.5 text-rose-500 ${liveSample.hr > 100 ? 'animate-ping' : ''}`} />
                Live HR
              </span>
              <span className="font-mono text-[10px] text-slate-500">{liveSample.ecg}</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-black font-mono ${
                liveSample.hr >= 100 ? 'text-rose-400' : 'text-white'
              }`}>
                {liveSample.hr}
              </span>
              <span className="text-xs text-slate-400 font-mono">bpm</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Base: {astronaut.baseline.hr?.value || 65} bpm
            </div>
          </div>

          {/* Live SpO2 */}
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-sky-400" />
                SpO2 (Pulse Ox)
              </span>
              <span className="font-mono text-[10px] text-slate-500">Vest PPG</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-black font-mono ${
                liveSample.spo2 < 93 ? 'text-rose-400' : 'text-white'
              }`}>
                {liveSample.spo2}%
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Norm: 95-100%
            </div>
          </div>

          {/* Live Blood Pressure Estimate */}
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                BP Estimate
              </span>
              <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 font-bold">
                ESTIMATE
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-black font-mono ${
                liveSample.sbpEstimate >= 140 ? 'text-rose-400' : 'text-white'
              }`}>
                {liveSample.sbpEstimate}/{liveSample.dbpEstimate}
              </span>
              <span className="text-xs text-slate-400 font-mono">mmHg</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Pulse transit estimate
            </div>
          </div>

          {/* Live Respiration Rate */}
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                Breathing (RR)
              </span>
              <span className="font-mono text-[10px] text-slate-500">Thoracic</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-black font-mono ${
                liveSample.rr >= 22 ? 'text-amber-400' : 'text-white'
              }`}>
                {liveSample.rr}
              </span>
              <span className="text-xs text-slate-400 font-mono">brpm</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Norm: 12-20
            </div>
          </div>

          {/* Live Skin Temperature */}
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700 col-span-2 sm:col-span-4 lg:col-span-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                Skin Temp
              </span>
              <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-sky-500/20 text-sky-300">
                SKIN ≠ CORE
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-white">
                {liveSample.skinTemp}°C
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Probe quality: {Math.round(liveSample.quality * 100)}%
            </div>
          </div>

        </div>

        {/* Persistence Rule Status Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono font-medium">Persistence Gate (Approval A7):</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((step) => {
                const filled = anomalyProgress.count >= step;
                return (
                  <span
                    key={step}
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-[11px] font-bold ${
                      filled
                        ? anomalyProgress.count >= 3
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-amber-500 text-white'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {step}
                  </span>
                );
              })}
            </div>
            <span className="text-slate-300 text-[11px]">
              {anomalyProgress.count === 0 && 'Nominal baseline envelope'}
              {anomalyProgress.count === 1 && 'Spike detected (sample 1/3) · Suppressing alert'}
              {anomalyProgress.count === 2 && 'Sustained divergence (sample 2/3) · Suppressing alert'}
              {anomalyProgress.count >= 3 && 'Persistence verified (sample 3/3) · Crew alert activated!'}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            {isAnomalyActive ? 'Scripted Anomaly: RUNNING' : 'Scripted Anomaly: STANDBY'}
          </div>
        </div>
      </div>

      {/* 8 Core Vital Telemetry Indicators Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-500 font-bold">
          <span>ALL 8 CLINICAL INDICATORS (CHALLENGE STATEMENT + WEARABLES)</span>
          <span>SUBJECT: {astronaut.name.toUpperCase()} · [A3]</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Blood Pressure */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>Blood Pressure</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">ESTIMATE</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold font-mono text-slate-900">
                  {currentBP.systolic}/{currentBP.diastolic}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-1">mmHg</span>
              </div>
              <div className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                bpDeltaSys > 15 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {bpDeltaSys > 0 ? `+${bpDeltaSys}` : bpDeltaSys}/{bpDeltaDia > 0 ? `+${bpDeltaDia}` : bpDeltaDia}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between bg-slate-50 p-1.5 rounded">
              <span>Base:</span>
              <span className="font-mono font-bold text-slate-800">{baseBP.systolic}/{baseBP.diastolic}</span>
            </div>
          </div>

          {/* 2. Heart Rate */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>Heart Rate</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-hrp-cardio" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold font-mono text-slate-900">
                  {currentHR}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-1">bpm</span>
              </div>
              <div className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                hrDelta > 15 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {hrDelta > 0 ? `+${hrDelta}` : hrDelta} bpm
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between bg-slate-50 p-1.5 rounded">
              <span>Base:</span>
              <span className="font-mono font-bold text-slate-800">{baseHR} bpm</span>
            </div>
          </div>

          {/* 3. Blood Oxygen (SpO2) */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Droplet className="w-4 h-4 text-sky-500" />
                <span>Blood Oxygen</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="csa-biomonitor" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold font-mono text-slate-900">
                  {currentSpo2}%
                </span>
              </div>
              <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                currentSpo2 < 93 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {currentSpo2 < 93 ? 'LOW' : 'NORMAL'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between bg-slate-50 p-1.5 rounded">
              <span>Base:</span>
              <span className="font-mono font-bold text-slate-800">{baseSpo2}%</span>
            </div>
          </div>

          {/* 4. Respiration Rate (RR) */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Wind className="w-4 h-4 text-teal-600" />
                <span>Breathing Rate</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="csa-biomonitor" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold font-mono text-slate-900">
                  {currentRr}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-1">brpm</span>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                Norm: 12-20
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between bg-slate-50 p-1.5 rounded">
              <span>Base:</span>
              <span className="font-mono font-bold text-slate-800">{baseRr} brpm</span>
            </div>
          </div>

          {/* 5. Blood Glucose */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Droplet className="w-4 h-4 text-amber-500" />
                <span>Blood Glucose</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">MANUAL</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold font-mono text-slate-900">
                  {currentGlucose}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-1">mg/dL</span>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                Norm: 70-110
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between bg-slate-50 p-1.5 rounded">
              <span>Base:</span>
              <span className="font-mono font-bold text-slate-800">{baseGlucose} mg/dL</span>
            </div>
          </div>

          {/* 6. Body Temperature */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Thermometer className="w-4 h-4 text-teal-600" />
                <span>Temperature</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">CORE PROBE</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold font-mono text-slate-900">
                  {currentTemp}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-1">°C</span>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                Norm: 36.1-37.5
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between bg-slate-50 p-1.5 rounded">
              <span>Base:</span>
              <span className="font-mono font-bold text-slate-800">{baseTemp} °C</span>
            </div>
          </div>

          {/* 7. Sleep Duration */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>Sleep Duration</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-std-3001" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold font-mono text-slate-900">
                  {currentSleep}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-1">hrs</span>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                Target: 7.0-8.5
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between bg-slate-50 p-1.5 rounded">
              <span>Base:</span>
              <span className="font-mono font-bold text-slate-800">{baseSleep} hrs</span>
            </div>
          </div>

          {/* 8. Cognitive & Mood Score */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Smile className="w-4 h-4 text-emerald-600" />
                <span>Mood Score</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-eimo-2025" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold font-mono text-slate-900">
                  {currentMood}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-1">/ 5.0</span>
              </div>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                Coherent
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between bg-slate-50 p-1.5 rounded">
              <span>Base:</span>
              <span className="font-mono font-bold text-slate-800">4.2 / 5.0</span>
            </div>
          </div>

        </div>
      </div>

      {/* Cumulative Radiation & Space Weather Card */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-700">
            <Radiation className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">Cumulative Mission Radiation Dosimetry</h4>
              <ProvenanceBadge provenance="REAL" sourceId="radlab-iss-2025" />
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Current total absorbed dose: <strong className="text-sky-700 font-bold">{astronaut.baseline.radiationDose.value} mGy</strong>. (NASA career constraint: 600 mGy).
            </p>
          </div>
        </div>
        <button
          onClick={onOpenStorm}
          className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-mono font-bold transition-colors cursor-pointer shadow-2xs"
        >
          View Solar Storm Replay
        </button>
      </div>

    </div>
  );
}
