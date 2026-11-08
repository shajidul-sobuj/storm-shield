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

  return (
    <div className="space-y-6">
      
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
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {assessment.primaryReason}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Immediate protocol escalation recommended. Autonomous clinical decision support active for this crew member.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => onLaunchCare('cardio-scare')}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>Launch Care Mode (Scenario A)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
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
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300">
                WATCH STATUS
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                {assessment.primaryReason}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Telemetry shows mild baseline divergence. Continue scheduled monitoring.
              </p>
            </div>
          </div>
          <button
            onClick={() => onLaunchCare('post-storm-illness')}
            className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <span>Evaluate Post-Storm (Scenario B)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-slate-700">
              <strong className="text-slate-900">{astronaut.name}</strong> telemetry is fully nominal across all 6 core physiological metrics.
            </span>
          </div>
          <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            ALL SYSTEMS NOMINAL
          </span>
        </div>
      )}

      {/* 6 Core Vital Telemetry Indicators Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-500 font-bold">
          <span>CREW HEALTH TELEMETRY (PERSONALIZED BASELINE VS CURRENT)</span>
          <span>SUBJECT: {astronaut.name.toUpperCase()}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. Blood Pressure */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>Blood Pressure</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-hrp-cardio" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold font-mono text-slate-900">
                  {currentBP.systolic}/{currentBP.diastolic}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-1">mmHg</span>
              </div>
              <div className={`text-xs font-mono font-bold flex items-center gap-0.5 px-2 py-0.5 rounded ${
                bpDeltaSys > 15 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {bpDeltaSys > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{bpDeltaSys > 0 ? `+${bpDeltaSys}` : bpDeltaSys}/{bpDeltaDia > 0 ? `+${bpDeltaDia}` : bpDeltaDia}</span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex justify-between bg-slate-50 p-2 rounded-lg">
              <span>Personal Baseline:</span>
              <span className="font-mono font-bold text-slate-800">{baseBP.systolic}/{baseBP.diastolic} mmHg</span>
            </div>
          </div>

          {/* 2. Heart Rate */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>Heart Rate</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-hrp-cardio" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold font-mono text-slate-900">
                  {currentHR}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-1">bpm</span>
              </div>
              <div className={`text-xs font-mono font-bold flex items-center gap-0.5 px-2 py-0.5 rounded ${
                hrDelta > 15 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {hrDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{hrDelta > 0 ? `+${hrDelta}` : hrDelta} bpm</span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex justify-between bg-slate-50 p-2 rounded-lg">
              <span>Personal Baseline:</span>
              <span className="font-mono font-bold text-slate-800">{baseHR} bpm (Resting)</span>
            </div>
          </div>

          {/* 3. Blood Glucose */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Droplet className="w-4 h-4 text-amber-500" />
                <span>Blood Glucose</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-std-3001" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold font-mono text-slate-900">
                  {currentGlucose}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-1">mg/dL</span>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                Norm: 70-110
              </span>
            </div>

            <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex justify-between bg-slate-50 p-2 rounded-lg">
              <span>Personal Baseline:</span>
              <span className="font-mono font-bold text-slate-800">{baseGlucose} mg/dL</span>
            </div>
          </div>

          {/* 4. Body Temperature */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Thermometer className="w-4 h-4 text-teal-600" />
                <span>Core Temperature</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-std-3001" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold font-mono text-slate-900">
                  {currentTemp}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-1">°C</span>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                Norm: 36.1-37.5
              </span>
            </div>

            <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex justify-between bg-slate-50 p-2 rounded-lg">
              <span>Personal Baseline:</span>
              <span className="font-mono font-bold text-slate-800">{baseTemp} °C</span>
            </div>
          </div>

          {/* 5. Sleep Duration */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>Sleep Duration</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-std-3001" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold font-mono text-slate-900">
                  {currentSleep}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-1">hrs</span>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                Target: 7.0-8.5
              </span>
            </div>

            <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex justify-between bg-slate-50 p-2 rounded-lg">
              <span>Personal Baseline:</span>
              <span className="font-mono font-bold text-slate-800">{baseSleep} hrs/night</span>
            </div>
          </div>

          {/* 6. Cognitive & Mood Score */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Smile className="w-4 h-4 text-emerald-600" />
                <span>Cognitive / Mood Score</span>
              </div>
              <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-eimo-2025" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold font-mono text-slate-900">
                  {currentMood}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-1">/ 5.0</span>
              </div>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                Alert & Coherent
              </span>
            </div>

            <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex justify-between bg-slate-50 p-2 rounded-lg">
              <span>Personal Baseline:</span>
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
