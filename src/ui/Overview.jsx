import React from 'react';
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
  TrendingDown
} from 'lucide-react';
import ProvenanceBadge from './ProvenanceBadge.jsx';
import { assessAstronaut } from '../engine/assess.js';

export default function Overview({ astronaut, groundLink, stormStatus, onLaunchCare, onLaunchRetrace, onOpenStorm }) {
  const assessment = assessAstronaut(astronaut.current, astronaut.baseline);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'act':
        return {
          bg: 'bg-rose-950/80 text-rose-300 border-rose-700',
          icon: AlertTriangle,
          text: 'ACT REQUIRED'
        };
      case 'watch':
        return {
          bg: 'bg-amber-950/80 text-amber-300 border-amber-700',
          icon: ShieldAlert,
          text: 'WATCH'
        };
      case 'nominal':
      default:
        return {
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
          icon: CheckCircle,
          text: 'NOMINAL'
        };
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

  const overallBadge = getStatusBadge(assessment.status);
  const OverallIcon = overallBadge.icon;

  return (
    <div className="space-y-6">
      
      {/* Active Medical & Environmental Alert Banner */}
      {assessment.status === 'act' ? (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/90 to-space-900 border-2 border-rose-600 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-rose-600 text-white animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-900 text-rose-200 border border-rose-700">
                  ACTION REQUIRED · HIGH PRIORITY
                </span>
                <span className="text-xs text-rose-300 font-mono">
                  Ground link: {groundLink}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {assessment.primaryReason}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Immediate protocol escalation recommended. Autonomous clinical decision support active.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => onLaunchCare('cardio-scare')}
              className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <span>Launch Care Mode (Scenario A)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onLaunchRetrace()}
              className="px-3 py-2 rounded-lg bg-space-800 hover:bg-space-700 text-slate-200 text-xs border border-slate-700 cursor-pointer"
            >
              Retrace
            </button>
          </div>
        </div>
      ) : assessment.status === 'watch' ? (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/80 to-space-900 border border-amber-600/60 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-600 text-black">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-900 text-amber-200 border border-amber-700">
                WATCH STATUS
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-1">
                {assessment.primaryReason}
              </h3>
              <p className="text-xs text-slate-300">
                Telemetry shows mild baseline divergence. Continue scheduled monitoring.
              </p>
            </div>
          </div>
          <button
            onClick={() => onLaunchCare('post-storm-illness')}
            className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Evaluate Post-Storm (Scenario B)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-space-900/80 border border-slate-800 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">
              <strong className="text-slate-100">{astronaut.name}</strong> telemetry is fully nominal across all 6 core physiological metrics.
            </span>
          </div>
          <span className="text-emerald-400 font-mono text-[11px] font-semibold">ALL SYSTEMS NOMINAL</span>
        </div>
      )}

      {/* 6 Core Vital Telemetry Indicators Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
          <span>CREW HEALTH INDICATORS (PERSONALIZED BASELINES)</span>
          <span>SUBJECT: {astronaut.name.toUpperCase()}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. Blood Pressure */}
          <div className="p-4 rounded-xl bg-space-900 border border-slate-800 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Blood Pressure</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-hrp-cardio" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-mono text-slate-100">
                  {currentBP.systolic}/{currentBP.diastolic}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">mmHg</span>
              </div>
              <div className={`text-xs font-mono font-semibold flex items-center gap-0.5 ${bpDeltaSys > 15 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {bpDeltaSys > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{bpDeltaSys > 0 ? `+${bpDeltaSys}` : bpDeltaSys}/{bpDeltaDia > 0 ? `+${bpDeltaDia}` : bpDeltaDia}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
              <span>Personal Baseline:</span>
              <span className="font-mono text-slate-300">{baseBP.systolic}/{baseBP.diastolic} mmHg</span>
            </div>
          </div>

          {/* 2. Heart Rate */}
          <div className="p-4 rounded-xl bg-space-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Heart Rate</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-hrp-cardio" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-mono text-slate-100">
                  {currentHR}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">bpm</span>
              </div>
              <div className={`text-xs font-mono font-semibold flex items-center gap-0.5 ${hrDelta > 15 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {hrDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{hrDelta > 0 ? `+${hrDelta}` : hrDelta} bpm</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
              <span>Personal Baseline:</span>
              <span className="font-mono text-slate-300">{baseHR} bpm (Resting)</span>
            </div>
          </div>

          {/* 3. Blood Glucose */}
          <div className="p-4 rounded-xl bg-space-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Droplet className="w-4 h-4 text-amber-400" />
                <span>Blood Glucose</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-std-3001" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-mono text-slate-100">
                  {currentGlucose}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">mg/dL</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Norm: 70-110
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
              <span>Personal Baseline:</span>
              <span className="font-mono text-slate-300">{baseGlucose} mg/dL</span>
            </div>
          </div>

          {/* 4. Body Temperature */}
          <div className="p-4 rounded-xl bg-space-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Thermometer className="w-4 h-4 text-sky-400" />
                <span>Core Temperature</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-std-3001" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-mono text-slate-100">
                  {currentTemp}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">°C</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Norm: 36.1-37.5
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
              <span>Personal Baseline:</span>
              <span className="font-mono text-slate-300">{baseTemp} °C</span>
            </div>
          </div>

          {/* 5. Sleep Duration */}
          <div className="p-4 rounded-xl bg-space-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Sleep Duration</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-std-3001" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-mono text-slate-100">
                  {currentSleep}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">hrs</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Target: 7.0-8.5
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
              <span>Personal Baseline:</span>
              <span className="font-mono text-slate-300">{baseSleep} hrs/night</span>
            </div>
          </div>

          {/* 6. Cognitive & Mood Score */}
          <div className="p-4 rounded-xl bg-space-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Smile className="w-4 h-4 text-emerald-400" />
                <span>Cognitive / Mood Score</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-eimo-2025" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-mono text-slate-100">
                  {currentMood}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">/ 5.0</span>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                Alert & Coherent
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
              <span>Personal Baseline:</span>
              <span className="font-mono text-slate-300">4.2 / 5.0</span>
            </div>
          </div>

        </div>
      </div>

      {/* Cumulative Radiation & Space Weather Card */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-space-900 to-space-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-cyan-950 border border-cyan-800/80 text-cyan-400">
            <Radiation className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-100">Cumulative Mission Radiation Dosimetry</h4>
              <ProvenanceBadge provenance="REAL" sourceId="radlab-iss-2025" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Current total absorbed dose: <strong className="text-cyan-400">{astronaut.baseline.radiationDose.value} mGy</strong>. (NASA career constraint: 600 mGy).
            </p>
          </div>
        </div>
        <button
          onClick={onOpenStorm}
          className="px-3.5 py-2 rounded-lg bg-space-800 hover:bg-space-700 text-cyan-400 border border-cyan-800/60 text-xs font-mono font-medium transition-colors cursor-pointer"
        >
          View Solar Storm Replay
        </button>
      </div>

    </div>
  );
}
