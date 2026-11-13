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
  LifeBuoy,
  Sliders,
  Zap,
  CheckCircle2
} from 'lucide-react';
import ProvenanceBadge from './ProvenanceBadge.jsx';
import { assessAstronaut } from '../engine/assess.js';
import { mockBioMonitor } from '../device/mockBioMonitor.js';
import { AnomalyTracker } from '../engine/anomaly.js';
import { alertSystem } from '../engine/alerts.js';
import LiveTelemetryDeck from './LiveTelemetryDeck.jsx';

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
  const [showSimulator, setShowSimulator] = useState(true);
  const trackerRef = useRef(new AnomalyTracker({ persistenceWindow: 3 }));
  const hasAlertedRef = useRef(false);
  const alertDismissedRef = useRef(false);

  useEffect(() => {
    mockBioMonitor.setAstronaut(astronaut);
    trackerRef.current.reset();
    setIsAnomalyActive(false);
    setAnomalyProgress({ count: 0, status: 'nominal', reason: null });
    hasAlertedRef.current = false;
    alertDismissedRef.current = false;

    // Track when user dismisses an alert so we never re-trigger within the same episode
    const unsubAlert = alertSystem.subscribe((state) => {
      if (!state.activeAlert && hasAlertedRef.current) {
        alertDismissedRef.current = true;
      }
    });

    const unsubscribe = mockBioMonitor.subscribe((sample) => {
      setLiveSample(sample);
      const res = trackerRef.current.processSample(sample, astronaut.baseline);
      setAnomalyProgress({
        count: res.consecutiveActCount,
        status: res.persistedStatus,
        reason: res.reason
      });

      // If condition normalizes back to nominal (0 violations), reset the dismissal latch for future episodes
      if (res.consecutiveActCount === 0) {
        hasAlertedRef.current = false;
        alertDismissedRef.current = false;
      }

      // If Persistence Rule triggers Act, automatically raise crew alert:
      // BUT ONLY when:
      // 1. Scripted anomaly is active (user clicked "Simulate Scripted Anomaly")
      // 2. We have not already alerted for this episode (hasAlertedRef.current)
      // 3. The user has not dismissed this episode (alertDismissedRef.current)
      // 4. There is no currently active alert modal already open
      if (res.persistenceSatisfied && isAnomalyActive && !hasAlertedRef.current && !alertDismissedRef.current && !alertSystem.activeAlert) {
        hasAlertedRef.current = true;
        alertSystem.raiseAlert({
          from: `${astronaut.name} (${astronaut.callsign})`,
          kind: 'medical',
          reason: `Bio-Monitor Sustained Anomaly: ${res.reason}`,
          location: 'Crew Quarters / Hab A',
          checkInSeconds: 20
        });
      }
    });

    mockBioMonitor.startStreaming(null, 1500);

    return () => {
      unsubscribe();
      unsubAlert();
    };
  }, [astronaut.id, isAnomalyActive]);

  // Synchronize mockBioMonitor immediately whenever astronaut vitals update
  useEffect(() => {
    mockBioMonitor.setAstronaut(astronaut);
    setLiveSample(mockBioMonitor.generateSample());
  }, [astronaut]);

  const handleToggleAnomaly = () => {
    const nextState = !isAnomalyActive;
    setIsAnomalyActive(nextState);
    mockBioMonitor.triggerScriptedAnomaly(nextState);
    trackerRef.current.reset();
    setAnomalyProgress({ count: 0, status: 'nominal', reason: null });
    hasAlertedRef.current = false;
    alertDismissedRef.current = false;
  };

  const currentBP = astronaut.current?.bp || { systolic: 120, diastolic: 80 };
  const baseBP = astronaut.baseline?.bp || { systolic: 120, diastolic: 80 };
  const bpDeltaSys = currentBP.systolic - baseBP.systolic;
  const bpDeltaDia = currentBP.diastolic - baseBP.diastolic;

  const currentHR = typeof astronaut.current?.hr === 'object' ? astronaut.current.hr.value : (astronaut.current?.hr !== undefined ? astronaut.current.hr : 70);
  const baseHR = astronaut.baseline?.hr?.value || 70;
  const hrDelta = currentHR - baseHR;

  const currentGlucose = typeof astronaut.current?.glucose === 'object' ? astronaut.current.glucose.value : (astronaut.current?.glucose !== undefined ? astronaut.current.glucose : 90);
  const baseGlucose = astronaut.baseline?.glucose?.value || 90;

  const currentTemp = typeof astronaut.current?.temp === 'object' ? astronaut.current.temp.value : (astronaut.current?.temp !== undefined ? astronaut.current.temp : 36.6);
  const baseTemp = astronaut.baseline?.temp?.value || 36.6;

  const currentSleep = typeof astronaut.current?.sleep === 'object' ? astronaut.current.sleep.value : (astronaut.current?.sleep !== undefined ? astronaut.current.sleep : 7.0);
  const baseSleep = astronaut.baseline?.sleep?.value || 7.0;

  const currentMood = typeof astronaut.current?.mood === 'object' ? astronaut.current.mood.value : (astronaut.current?.mood !== undefined ? astronaut.current.mood : 4.0);

  const currentSpo2 = typeof astronaut.current?.spo2 === 'object' ? astronaut.current.spo2.value : (astronaut.current?.spo2 !== undefined ? astronaut.current.spo2 : 98);
  const baseSpo2 = astronaut.baseline?.spo2?.value || 98;

  const currentRr = typeof astronaut.current?.rr === 'object' ? astronaut.current.rr.value : (astronaut.current?.rr !== undefined ? astronaut.current.rr : 15);
  const baseRr = astronaut.baseline?.rr?.value || 14;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Active Medical & Environmental Alert Banner */}
      {assessment.status === 'act' ? (
        <div className="glass-panel-danger p-6 rounded-2xl border border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.18)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-rose-600/90 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] shrink-0 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-400/50">
                  ACTION REQUIRED · HIGH PRIORITY
                </span>
                <span className="text-xs text-rose-300 font-mono">
                  Ground link: <strong>{groundLink}</strong>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-500/40 font-bold">
                  [A1 / A7]
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1.5 tracking-tight">
                {assessment.primaryReason}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Autonomy Ladder Level 2 Decision Support: Follow clinical step guidance below. The human acts.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 flex-wrap">
            <button
              onClick={() => onLaunchCare('cardio-scare')}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] cursor-pointer active:scale-95"
            >
              <span>Launch Care Mode (Scenario A)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {onLaunchSelfSupport && (
              <button
                onClick={onLaunchSelfSupport}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>Patient Self-Support</span>
              </button>
            )}
            <button
              onClick={() => onLaunchRetrace()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs border border-slate-700 font-medium cursor-pointer shadow-sm"
            >
              Retrace
            </button>
          </div>
        </div>
      ) : assessment.status === 'watch' ? (
        <div className="glass-panel-warning p-6 rounded-2xl border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.18)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500/90 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-400/50">
                  WATCH STATUS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                  [A2 / A3]
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1.5 tracking-tight">
                {assessment.primaryReason}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Telemetry shows baseline divergence. Continue scheduled monitoring and hydration protocol.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onLaunchCare('post-storm-illness')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
            >
              <span>Evaluate Post-Storm (Scenario B)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {onLaunchSelfSupport && (
              <button
                onClick={onLaunchSelfSupport}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer"
              >
                Self-Support
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-panel-glow p-6 rounded-2xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.12)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  NOMINAL BASELINE ENVELOPE
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Ground link: {groundLink}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1.5 tracking-tight">
                All 8 telemetry markers tracking within personal baseline boundaries
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Flight Day 142. Scheduled EVA preparation cleared. Continuous CSA Bio-Monitor wearable feed nominal.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {onLaunchSelfSupport && (
              <button
                onClick={onLaunchSelfSupport}
                className="px-4 py-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>Daily Wellness Log</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Interactive Simulator Deck Toggle Bar */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowSimulator(!showSimulator)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-mono font-medium transition cursor-pointer shadow-sm"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>{showSimulator ? 'Hide Live Telemetry Simulator Deck' : 'Open Live Telemetry Simulator Deck (Judge Sliders & ECG)'}</span>
        </button>
      </div>

      {/* FEATURED: Interactive Live Telemetry Deck with ECG Canvas Sweep */}
      {showSimulator && onUpdateVitals && (
        <LiveTelemetryDeck
          astronaut={astronaut}
          onUpdateVitals={onUpdateVitals}
          onLaunchCare={onLaunchCare}
        />
      )}

      {/* FEATURED: CSA Bio-Monitor Wearable Live Stream & Scripted Anomaly Trigger */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c1322] via-[#090e1a] to-[#060913] text-white shadow-2xl border border-cyan-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <Wifi className="w-3 h-3 animate-pulse text-emerald-400" />
                <span>LIVE WEARABLE TELEMETRY (CSA BIO-MONITOR ADAPTER)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                ANCHORED · 1.5s TICK
              </span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 pt-1">
              <span>Smart Vest Stream · {astronaut.name}</span>
              <span className="text-xs font-mono text-cyan-400/80 font-medium">({astronaut.callsign})</span>
            </h3>
            <p className="text-xs text-slate-300">
              Continuous vitals stream anchored to personalized baseline. Enforces statistical persistence ($N=3$) before alerting.
            </p>
          </div>

          {/* Interactive Trigger Button for Judges */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleToggleAnomaly}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                isAnomalyActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{isAnomalyActive ? 'Reset Wearable Drift' : 'Simulate Scripted Anomaly (Drift)'}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5 pt-5">
          
          {/* Live Heart Rate */}
          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-700/80 shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Heart className={`w-3.5 h-3.5 ${liveSample.hr >= 100 ? 'text-rose-500 animate-heartbeat' : 'text-rose-400'}`} />
                Live HR
              </span>
              <span className="font-mono text-[10px] text-slate-400 uppercase">{liveSample.ecg.replace('_', ' ')}</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`text-2xl font-black font-mono tracking-tight ${
                liveSample.hr >= 100 ? 'text-rose-400 animate-pulse' : 'text-white'
              }`}>
                {liveSample.hr}
              </span>
              <span className="text-xs text-slate-400 font-mono">bpm</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Base: {astronaut.baseline.hr.value} bpm ({liveSample.hr - astronaut.baseline.hr.value >= 0 ? `+${liveSample.hr - astronaut.baseline.hr.value}` : liveSample.hr - astronaut.baseline.hr.value})
            </div>
          </div>

          {/* Live SpO2 */}
          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-700/80 shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                Pulse Oximetry
              </span>
              <span className="font-mono text-[10px] text-slate-400">IR Sensor</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-black font-mono tracking-tight ${
                liveSample.spo2 < 93 ? 'text-rose-400 animate-pulse' : 'text-white'
              }`}>
                {liveSample.spo2}%
              </span>
              <span className="text-xs text-slate-400 font-mono">SpO2</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              {liveSample.spo2 < 90 ? 'Critical Hypoxemia' : liveSample.spo2 <= 94 ? 'Marginal' : 'Optimal'}
            </div>
          </div>

          {/* Live Blood Pressure Estimate */}
          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-700/80 shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Est. Arterial BP
              </span>
              <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-indigo-500/20 text-indigo-300">
                PTT CALC
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-black font-mono tracking-tight ${
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
          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-700/80 shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                Breathing (RR)
              </span>
              <span className="font-mono text-[10px] text-slate-400">Thoracic</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-black font-mono tracking-tight ${
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
          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-700/80 shadow-inner col-span-2 sm:col-span-4 lg:col-span-1">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                Skin Temp
              </span>
              <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-sky-500/20 text-sky-300">
                SKIN ≠ CORE
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-white tracking-tight">
                {liveSample.skinTemp}°C
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Probe quality: {Math.round(liveSample.quality * 100)}%
            </div>
          </div>

        </div>

        {/* Persistence Rule Status Indicator */}
        <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-mono font-medium">Persistence Gate (Approval A7):</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((step) => {
                const filled = anomalyProgress.count >= step;
                return (
                  <span
                    key={step}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold transition-all ${
                      filled
                        ? anomalyProgress.count >= 3
                          ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                          : 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {step}
                  </span>
                );
              })}
            </div>
            <span className="text-slate-300 text-[11px]">
              {anomalyProgress.count === 0 && 'Nominal baseline envelope'}
              {anomalyProgress.count === 1 && 'Spike detected (sample 1/3) · Suppressing false alarm'}
              {anomalyProgress.count === 2 && 'Sustained divergence (sample 2/3) · Suppressing false alarm'}
              {anomalyProgress.count >= 3 && 'Persistence verified (sample 3/3) · Crew alert activated!'}
            </span>
          </div>

          <div className="text-[11px] text-cyan-400 font-mono">
            {isAnomalyActive ? 'Scripted Anomaly: RUNNING' : 'Scripted Anomaly: STANDBY'}
          </div>
        </div>
      </div>

      {/* 8 Core Vital Telemetry Indicators Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400 font-bold tracking-wider">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>ALL 8 CLINICAL INDICATORS (CHALLENGE STATEMENT + WEARABLES)</span>
          </span>
          <span>SUBJECT: {astronaut.name.toUpperCase()} · [A3]</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Blood Pressure */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Blood Pressure</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">ESTIMATE</span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  {currentBP.systolic}/{currentBP.diastolic}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">mmHg</span>
              </div>
              <div className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                bpDeltaSys > 15 ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
              }`}>
                {bpDeltaSys > 0 ? `+${bpDeltaSys}` : bpDeltaSys}/{bpDeltaDia > 0 ? `+${bpDeltaDia}` : bpDeltaDia}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between bg-slate-950/60 p-2 rounded-lg font-mono">
              <span>Personal Base:</span>
              <span className="font-bold text-slate-200">{baseBP.systolic}/{baseBP.diastolic} mmHg</span>
            </div>
          </div>

          {/* 2. Heart Rate */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Heart Rate</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-hrp-cardio" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  {currentHR}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">bpm</span>
              </div>
              <div className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                hrDelta > 15 ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
              }`}>
                {hrDelta > 0 ? `+${hrDelta}` : hrDelta} bpm
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between bg-slate-950/60 p-2 rounded-lg font-mono">
              <span>Personal Base:</span>
              <span className="font-bold text-slate-200">{baseHR} bpm</span>
            </div>
          </div>

          {/* 3. Blood Oxygen (SpO2) */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Droplet className="w-4 h-4 text-cyan-400" />
                <span>Blood Oxygen</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="csa-biomonitor" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  {currentSpo2}%
                </span>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                currentSpo2 < 93 ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
              }`}>
                {currentSpo2 < 93 ? 'CRITICAL LOW' : 'OPTIMAL'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between bg-slate-950/60 p-2 rounded-lg font-mono">
              <span>Personal Base:</span>
              <span className="font-bold text-slate-200">{baseSpo2}%</span>
            </div>
          </div>

          {/* 4. Respiration Rate (RR) */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Wind className="w-4 h-4 text-teal-400" />
                <span>Breathing Rate</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="csa-biomonitor" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  {currentRr}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">brpm</span>
              </div>
              <span className="text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                Norm: 12-20
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between bg-slate-950/60 p-2 rounded-lg font-mono">
              <span>Personal Base:</span>
              <span className="font-bold text-slate-200">{baseRr} brpm</span>
            </div>
          </div>

          {/* 5. Blood Glucose */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Droplet className="w-4 h-4 text-amber-400" />
                <span>Blood Glucose</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">MANUAL</span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  {currentGlucose}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">mg/dL</span>
              </div>
              <span className="text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                Norm: 70-110
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between bg-slate-950/60 p-2 rounded-lg font-mono">
              <span>Personal Base:</span>
              <span className="font-bold text-slate-200">{baseGlucose} mg/dL</span>
            </div>
          </div>

          {/* 6. Body Temperature */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Thermometer className="w-4 h-4 text-teal-400" />
                <span>Temperature</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">CORE PROBE</span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  {currentTemp}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">°C</span>
              </div>
              <span className="text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                Norm: 36.1-37.5
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between bg-slate-950/60 p-2 rounded-lg font-mono">
              <span>Personal Base:</span>
              <span className="font-bold text-slate-200">{baseTemp} °C</span>
            </div>
          </div>

          {/* 7. Sleep Duration */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Sleep Duration</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-std-3001" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  {currentSleep}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">hrs</span>
              </div>
              <span className="text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                Target: 7.0-8.5
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between bg-slate-950/60 p-2 rounded-lg font-mono">
              <span>Personal Base:</span>
              <span className="font-bold text-slate-200">{baseSleep} hrs</span>
            </div>
          </div>

          {/* 8. Cognitive & Mood Score */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Smile className="w-4 h-4 text-emerald-400" />
                <span>Mood Score</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-eimo-2025" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  {currentMood}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">/ 5.0</span>
              </div>
              <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                Coherent
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between bg-slate-950/60 p-2 rounded-lg font-mono">
              <span>Personal Base:</span>
              <span className="font-bold text-slate-200">4.2 / 5.0</span>
            </div>
          </div>

        </div>
      </div>

      {/* Cumulative Radiation & Space Weather Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-700/70 hover:border-indigo-500/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Radiation className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-wide">Cumulative Mission Radiation Dosimetry</h4>
              <ProvenanceBadge provenance="REAL" sourceId="radlab-iss-2025" />
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Current total absorbed dose: <strong className="text-cyan-400 font-bold">{astronaut.baseline.radiationDose.value} mGy</strong>. (NASA-STD-3001 career constraint: 600 mGy).
            </p>
          </div>
        </div>
        <button
          onClick={onOpenStorm}
          className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-mono font-bold transition-all cursor-pointer shadow-md flex items-center gap-2 hover:border-cyan-500/40"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>View Solar Storm Replay</span>
        </button>
      </div>

    </div>
  );
}
