import React, { useState } from 'react';
import { 
  Zap, 
  ShieldAlert, 
  HelpCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertOctagon, 
  CheckSquare, 
  ArrowRight,
  TrendingUp,
  Radiation
} from 'lucide-react';
import stormReplayData from '../../data/processed/storm-replay.json';
import { mapFluxToLevel, estimateStormDoseRate } from '../engine/storm.js';
import ProvenanceBadge from './ProvenanceBadge.jsx';

export default function StormMonitor({ onSelectStormLevel, onLaunchCare, onLaunchVitals }) {
  const [timelineIndex, setTimelineIndex] = useState(4); // Default at peak (S3 4200 pfu)
  const [isPlaying, setIsPlaying] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);

  const currentStep = stormReplayData.timeline[timelineIndex] || stormReplayData.timeline[0];
  const stormLevel = mapFluxToLevel(currentStep.fluxPfu);
  const doseEstimate = estimateStormDoseRate(currentStep.fluxPfu);

  const handleNext = () => {
    if (timelineIndex < stormReplayData.timeline.length - 1) {
      const newIdx = timelineIndex + 1;
      setTimelineIndex(newIdx);
      onSelectStormLevel(mapFluxToLevel(stormReplayData.timeline[newIdx].fluxPfu));
    }
  };

  const handlePrev = () => {
    if (timelineIndex > 0) {
      const newIdx = timelineIndex - 1;
      setTimelineIndex(newIdx);
      onSelectStormLevel(mapFluxToLevel(stormReplayData.timeline[newIdx].fluxPfu));
    }
  };

  const handleReset = () => {
    setTimelineIndex(0);
    onSelectStormLevel(mapFluxToLevel(stormReplayData.timeline[0].fluxPfu));
  };

  const isPostStorm = timelineIndex === stormReplayData.timeline.length - 1;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-space-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-950 border border-amber-600/50 text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Solar Radiation Storm Monitor & Replay</span>
              <ProvenanceBadge provenance="REAL" sourceId="noaa-swpc-scales" />
            </h2>
            <p className="text-xs text-slate-400">
              {stormReplayData.title} · GOES-16 satellite energetic proton telemetry.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowWhyModal(!showWhyModal)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-cyan-400 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Why this alert?</span>
        </button>
      </div>

      {/* "Why this alert?" Explanation Panel */}
      {showWhyModal && (
        <div className="p-4 rounded-xl bg-space-950 border border-cyan-800/80 text-xs text-slate-300 space-y-2 animate-fade-in font-sans">
          <div className="flex justify-between items-center text-cyan-300 font-bold border-b border-slate-800 pb-1.5">
            <span>SCIENTIFIC RATIONALE: NOAA SPACE WEATHER S-SCALE</span>
            <ProvenanceBadge provenance="PUBLISHED" sourceId="noaa-swpc-scales" compact />
          </div>
          <p className="leading-relaxed">
            Solar particle events (SPEs) accelerate high-energy protons (&gt;10 MeV) across the interplanetary medium. At flux levels exceeding 100 pfu (S2), unshielded crew on EVA risk acute biological exposure. Above 1,000 pfu (S3), spacecraft habitat shielding must be augmented by the central storm shelter (water walls / logistics cargo).
          </p>
          <div className="text-[11px] text-slate-400 font-mono">
            Shielding Physics: Artemis I Orion measurements established that the central storm shelter provides ~4.0x dose reduction compared with unshielded transit areas.
          </div>
        </div>
      )}

      {/* Post-Storm Body Check Mandatory Callout */}
      {isPostStorm && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-950 to-space-900 border-2 border-cyan-500 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-600 text-black">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-900 text-cyan-200 border border-cyan-700">
                POST-STORM PROTOCOL INITIATED
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                Storm Passed: Mandatory Crew Body Check
              </h3>
              <p className="text-xs text-slate-300">
                Flux returned to nominal background (6.8 pfu). Screen all 3 crew members for acute nausea, headache, or dosimeter spikes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onLaunchCare('post-storm-illness')}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Scenario B: Nausea / Dose Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLaunchVitals}
              className="px-3 py-2 rounded-lg bg-space-800 text-slate-200 text-xs border border-slate-700 hover:bg-space-700 cursor-pointer"
            >
              Log Crew Vitals
            </button>
          </div>
        </div>
      )}

      {/* Main Storm Status Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Replay Scrubber & Flux Chart */}
        <div className="lg:col-span-8 p-6 rounded-xl bg-space-900 border border-slate-800 space-y-6">
          
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
            <span>GOES-16 PROTON FLUX (&gt;= 10 MeV) TIMELINE REPLAY</span>
            <span className="text-cyan-400">Step {timelineIndex + 1} of {stormReplayData.timeline.length}</span>
          </div>

          {/* Timeline Bar Chart */}
          <div className="h-44 flex items-end gap-2 pt-6 px-2 bg-space-950 rounded-lg border border-slate-800/80">
            {stormReplayData.timeline.map((step, idx) => {
              const heightPct = Math.min(100, Math.max(8, (Math.log10(step.fluxPfu + 1) / Math.log10(5000)) * 100));
              const isCurrent = idx === timelineIndex;

              const getBarColor = () => {
                if (step.fluxPfu >= 1000) return isCurrent ? 'bg-rose-500' : 'bg-rose-950/80 hover:bg-rose-800';
                if (step.fluxPfu >= 100) return isCurrent ? 'bg-amber-500' : 'bg-amber-950/80 hover:bg-amber-800';
                if (step.fluxPfu >= 10) return isCurrent ? 'bg-amber-400' : 'bg-amber-950/50 hover:bg-amber-700';
                return isCurrent ? 'bg-cyan-500' : 'bg-slate-800 hover:bg-slate-700';
              };

              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setTimelineIndex(idx);
                    onSelectStormLevel(mapFluxToLevel(step.fluxPfu));
                  }}
                  className="flex-1 h-full flex flex-col items-center justify-end group transition-all cursor-pointer"
                >
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t transition-all ${getBarColor()} ${
                      isCurrent ? 'ring-2 ring-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]' : ''
                    }`}
                  />
                  <span className={`text-[10px] font-mono mt-1.5 ${isCurrent ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                    {step.offsetHours}h
                  </span>
                </button>
              );
            })}
          </div>

          {/* Replay Controls */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={timelineIndex === 0}
                className="px-3 py-1.5 rounded-lg bg-space-800 hover:bg-space-700 disabled:opacity-40 text-xs font-mono text-slate-200 border border-slate-700 cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={timelineIndex === stormReplayData.timeline.length - 1}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-xs font-mono text-black font-semibold cursor-pointer"
              >
                Advance Step
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-400 hover:text-slate-200 border border-slate-700 cursor-pointer"
                title="Reset Replay"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Time Offset: <strong className="text-slate-100">{currentStep.offsetHours >= 0 ? `+${currentStep.offsetHours}` : currentStep.offsetHours} hrs</strong>
            </div>
          </div>

          {/* Current Step Advisory Note */}
          <div className="p-3.5 rounded-lg bg-space-950 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-mono text-cyan-400 font-semibold uppercase text-[11px]">Mission Advisory:</div>
            <div>{currentStep.advisory}</div>
          </div>

        </div>

        {/* Right: Live S-Scale & Shelter Dose Metrics */}
        <div className="lg:col-span-4 p-6 rounded-xl bg-space-900 border border-slate-800 space-y-5">
          
          <div className="text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
            REAL-TIME CLASSIFICATION
          </div>

          {/* Storm Scale Badge */}
          <div className={`p-4 rounded-xl border text-center space-y-2 ${
            stormLevel.severity === 'shelter'
              ? 'bg-rose-950/80 border-rose-600 text-rose-200'
              : stormLevel.severity === 'warning'
              ? 'bg-amber-950/80 border-amber-600 text-amber-200'
              : stormLevel.severity === 'watch'
              ? 'bg-amber-950/50 border-amber-700/60 text-amber-300'
              : 'bg-space-950 border-slate-800 text-emerald-400'
          }`}>
            <span className="text-xs font-mono tracking-widest uppercase">
              NOAA RADIATION SCALE
            </span>
            <div className="text-3xl font-extrabold font-mono">
              {stormLevel.name}
            </div>
            <div className="text-xs font-mono">
              Proton Flux: <strong className="text-slate-100">{stormLevel.flux} pfu</strong>
            </div>
          </div>

          {/* Artemis I Shelter Attenuation Card */}
          <div className="p-3.5 rounded-lg bg-space-950 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>DOSE RATE ESTIMATE</span>
              <ProvenanceBadge provenance="REAL" sourceId="artemis1-radiation" compact />
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Unshielded Rate:</span>
              <span className="text-rose-400 font-bold">{doseEstimate.unshieldedMgyPerHour} mGy/hr</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Shelter (~4x Attenuated):</span>
              <span className="text-emerald-400 font-bold">{doseEstimate.shieldedMgyPerHour} mGy/hr</span>
            </div>
          </div>

          {/* Mandatory Crew Order */}
          <div className="space-y-1.5 text-xs">
            <div className="font-mono text-slate-400 uppercase text-[11px]">Operational Action:</div>
            <div className="p-3 rounded-lg bg-space-950 border border-slate-800 text-slate-200 leading-relaxed">
              {stormLevel.action}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
