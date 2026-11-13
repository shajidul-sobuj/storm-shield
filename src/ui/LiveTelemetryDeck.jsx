import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Activity, 
  Droplet, 
  Wind, 
  Thermometer, 
  Sliders, 
  Sparkles, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Zap, 
  Radio, 
  Play, 
  Pause,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { mockBioMonitor } from '../device/mockBioMonitor.js';

export default function LiveTelemetryDeck({ 
  astronaut, 
  onUpdateVitals, 
  onLaunchCare 
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [allowJitter, setAllowJitter] = useState(true);
  
  // Current values
  const currentHr = typeof astronaut.current?.hr === 'object' ? astronaut.current.hr.value : (astronaut.current?.hr || 70);
  const currentSbp = astronaut.current?.bp?.systolic || 120;
  const currentDbp = astronaut.current?.bp?.diastolic || 80;
  const currentSpo2 = typeof astronaut.current?.spo2 === 'object' ? astronaut.current.spo2.value : (astronaut.current?.spo2 || 98);
  const currentRr = typeof astronaut.current?.rr === 'object' ? astronaut.current.rr.value : (astronaut.current?.rr || 14);
  const currentTemp = typeof astronaut.current?.temp === 'object' ? astronaut.current.temp.value : (astronaut.current?.temp || 36.6);
  const currentGlucose = typeof astronaut.current?.glucose === 'object' ? astronaut.current.glucose.value : (astronaut.current?.glucose || 90);

  // Local interactive slider state
  const [hr, setHr] = useState(currentHr);
  const [sbp, setSbp] = useState(currentSbp);
  const [dbp, setDbp] = useState(currentDbp);
  const [spo2, setSpo2] = useState(currentSpo2);
  const [rr, setRr] = useState(currentRr);
  const [temp, setTemp] = useState(currentTemp);
  const [glucose, setGlucose] = useState(currentGlucose);
  const [activePreset, setActivePreset] = useState(null);

  // Sync from props if external astronaut changes
  useEffect(() => {
    setHr(currentHr);
    setSbp(currentSbp);
    setDbp(currentDbp);
    setSpo2(currentSpo2);
    setRr(currentRr);
    setTemp(currentTemp);
    setGlucose(currentGlucose);
  }, [astronaut.id]);

  // Push updates immediately to parent and mockBioMonitor
  const emitUpdate = (overrides = {}) => {
    const updated = {
      hr: overrides.hr !== undefined ? overrides.hr : hr,
      bp: {
        systolic: overrides.sbp !== undefined ? overrides.sbp : sbp,
        diastolic: overrides.dbp !== undefined ? overrides.dbp : dbp
      },
      spo2: overrides.spo2 !== undefined ? overrides.spo2 : spo2,
      rr: overrides.rr !== undefined ? overrides.rr : rr,
      temp: overrides.temp !== undefined ? overrides.temp : temp,
      glucose: overrides.glucose !== undefined ? overrides.glucose : glucose,
      symptoms: overrides.symptoms !== undefined ? overrides.symptoms : (astronaut.current?.symptoms || [])
    };

    onUpdateVitals(astronaut.id, updated);
  };

  // Preset scenarios
  const PRESETS = [
    {
      id: 'nominal',
      name: 'Nominal Rest',
      badge: 'NOMINAL',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      data: { hr: 68, sbp: 118, dbp: 76, spo2: 99, rr: 14, temp: 36.6, glucose: 92, symptoms: [] },
      desc: 'Normal spaceflight resting baseline.'
    },
    {
      id: 'exertion',
      name: 'EVA Workload',
      badge: 'WATCH',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      data: { hr: 122, sbp: 142, dbp: 88, spo2: 96, rr: 24, temp: 37.2, glucose: 110, symptoms: ['fatigue'] },
      desc: 'Post-spacewalk strenuous exertion.'
    },
    {
      id: 'cardio',
      name: 'Cardio Distress',
      badge: 'ACT ALERT',
      badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse',
      data: { hr: 138, sbp: 168, dbp: 104, spo2: 91, rr: 26, temp: 36.8, glucose: 104, symptoms: ['chest-discomfort', 'shortness-of-breath'] },
      desc: 'Acute angina & cephalad fluid overload.'
    },
    {
      id: 'hypoxia',
      name: 'Cabin Hypoxia',
      badge: 'CRITICAL',
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30 animate-pulse',
      data: { hr: 126, sbp: 102, dbp: 62, spo2: 82, rr: 32, temp: 35.6, glucose: 88, symptoms: ['dizziness', 'shortness-of-breath'] },
      desc: 'Depressurization / breathing gas leak.'
    },
    {
      id: 'solar',
      name: 'Radiation Prodrome',
      badge: 'ACT ALERT',
      badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      data: { hr: 112, sbp: 146, dbp: 92, spo2: 94, rr: 22, temp: 38.1, glucose: 118, symptoms: ['repeated-vomiting', 'nausea'] },
      desc: 'Post-solar storm acute radiation prodrome.'
    }
  ];

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setHr(preset.data.hr);
    setSbp(preset.data.sbp);
    setDbp(preset.data.dbp);
    setSpo2(preset.data.spo2);
    setRr(preset.data.rr);
    setTemp(preset.data.temp);
    setGlucose(preset.data.glucose);
    emitUpdate(preset.data);
  };

  const resetToBaseline = () => {
    setActivePreset('baseline');
    const b = astronaut.baseline || {};
    const baseHr = b.hr?.value || 65;
    const baseSbp = b.bp?.systolic || 115;
    const baseDbp = b.bp?.diastolic || 74;
    const baseSpo2 = b.spo2?.value || 98;
    const baseRr = b.rr?.value || 14;
    const baseTemp = b.temp?.value || 36.6;
    const baseGlucose = b.glucose?.value || 90;

    setHr(baseHr);
    setSbp(baseSbp);
    setDbp(baseDbp);
    setSpo2(baseSpo2);
    setRr(baseRr);
    setTemp(baseTemp);
    setGlucose(baseGlucose);

    emitUpdate({
      hr: baseHr,
      sbp: baseSbp,
      dbp: baseDbp,
      spo2: baseSpo2,
      rr: baseRr,
      temp: baseTemp,
      glucose: baseGlucose,
      symptoms: []
    });
  };

  // Canvas Oscilloscope ECG wave
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let x = 0;
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    // Clear background grid
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw faint oscilloscope grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < width; gx += 20) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = 0; gy < height; gy += 20) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    let lastTime = performance.now();
    let phase = 0;

    const render = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Frequency based on current HR (e.g. 60 bpm = 1 Hz, 120 bpm = 2 Hz)
      const freq = hr / 60;
      phase += dt * freq * Math.PI * 2;

      // Calculate ECG P-Q-R-S-T synthetic signal
      const cycle = (phase % (Math.PI * 2)) / (Math.PI * 2); // 0 to 1
      let yOffset = 0;

      if (cycle > 0.15 && cycle < 0.22) {
        // P Wave
        yOffset = Math.sin((cycle - 0.15) / 0.07 * Math.PI) * -10;
      } else if (cycle >= 0.22 && cycle < 0.25) {
        // Q Dip
        yOffset = 4;
      } else if (cycle >= 0.25 && cycle < 0.30) {
        // R Spike (Giant ventricular spike)
        const rPos = (cycle - 0.25) / 0.05;
        yOffset = rPos < 0.5 ? -38 * (rPos * 2) : -38 * (2 - rPos * 2);
      } else if (cycle >= 0.30 && cycle < 0.34) {
        // S Dip
        yOffset = 10;
      } else if (cycle >= 0.38 && cycle < 0.55) {
        // T Wave (Ventricular repolarization)
        yOffset = Math.sin((cycle - 0.38) / 0.17 * Math.PI) * (hr > 100 ? -16 : -11);
      }

      // Add slight biological noise
      if (allowJitter) {
        yOffset += (Math.random() - 0.5) * 2;
      }

      const targetY = midY + yOffset;

      // Sweep line
      ctx.fillStyle = '#0f172a';
      ctx.fillRect((x + 1) % width, 0, 8, height); // erase ahead

      // Redraw grid line that was erased
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const nextX = (x + 1) % width;
      if (nextX % 20 === 0) {
        ctx.beginPath();
        ctx.moveTo(nextX, 0);
        ctx.lineTo(nextX, height);
        ctx.stroke();
      }

      // Draw ECG glowing point
      ctx.strokeStyle = hr >= 100 ? '#f43f5e' : (spo2 < 93 ? '#fbbf24' : '#10b981');
      ctx.lineWidth = 2.5;
      ctx.shadowColor = hr >= 100 ? '#f43f5e' : '#10b981';
      ctx.shadowBlur = 6;

      ctx.beginPath();
      ctx.moveTo(x, targetY);
      x = (x + 2.5) % width;
      ctx.lineTo(x, targetY);
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [hr, spo2, allowJitter]);

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-700/80 text-white shadow-xl overflow-hidden font-sans transition-all">
      
      {/* Top Header & Collapsible Toggle */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <span>Interactive Telemetry & Patient Simulator</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                LIVE REACTIVE ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Drag any slider or tap a scenario. Telemetry, deltas, and triage cascade dynamically across the entire webapp in real time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              const next = !allowJitter;
              setAllowJitter(next);
              mockBioMonitor.setAllowJitter(next);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border flex items-center gap-1.5 ${
              allowJitter 
                ? 'bg-slate-800 text-slate-200 border-slate-600' 
                : 'bg-indigo-600 text-white border-indigo-500'
            }`}
            title="Toggle natural micro-jitter vs locked manual values"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{allowJitter ? 'Jitter: ON' : 'Lock: EXACT'}</span>
          </button>

          <button
            onClick={resetToBaseline}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 text-xs font-mono font-bold transition flex items-center gap-1.5"
            title="Reset to astronaut's nominal baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Baseline</span>
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 transition"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-5 sm:p-6 space-y-6">

          {/* 1. Quick Mission Scenarios (Presets) */}
          <div>
            <div className="flex items-center justify-between mb-2.5 text-xs font-mono text-slate-400 font-bold">
              <span>ONE-CLICK MISSION CLINICAL PRESETS:</span>
              <span className="text-[11px] text-sky-400">Instantly drives live patient state</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {PRESETS.map((p) => {
                const isSelected = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-slate-800 border-sky-400 ring-2 ring-sky-400/30'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white truncate">{p.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${p.badgeClass}`}>
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                        {p.desc}
                      </p>
                    </div>

                    <div className="text-[10px] font-mono text-slate-300 pt-1 border-t border-slate-700/60 flex items-center justify-between">
                      <span>HR {p.data.hr}</span>
                      <span>SpO2 {p.data.spo2}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Live Dynamic Oscilloscope ECG Waveform Monitor */}
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-2/3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Activity className="w-4 h-4 animate-pulse" />
                  LEAD II ELECTROCARDIOGRAM (DYNAMIC SWEEP)
                </span>
                <span className="text-[11px]">SWEEP RATE: {(hr / 60).toFixed(1)} Hz</span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                <canvas 
                  ref={canvasRef} 
                  width={560} 
                  height={90} 
                  className="w-full h-[90px] block"
                />
              </div>
            </div>

            <div className="w-full sm:w-1/3 flex sm:flex-col justify-between items-center sm:items-end gap-2 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <Heart className={`w-5 h-5 text-rose-500 ${hr > 100 ? 'animate-ping' : ''}`} />
                <span className="text-3xl font-black font-mono text-white tracking-tight">{hr}</span>
                <span className="text-xs text-slate-400 font-mono">BPM</span>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  hr >= 100 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : (hr < 55 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300')
                }`}>
                  {hr >= 100 ? 'SINUS TACHYCARDIA' : (hr < 55 ? 'BRADYCARDIA' : 'NORMAL SINUS RHYTHM')}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Real-Time Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            
            {/* Heart Rate Slider */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Heart Rate (HR)
                </span>
                <span className="font-mono font-bold text-lg text-rose-400">{hr} <span className="text-xs text-slate-400">bpm</span></span>
              </div>
              <input
                type="range"
                min="40"
                max="180"
                step="1"
                value={hr}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setHr(val);
                  setActivePreset(null);
                  emitUpdate({ hr: val });
                }}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>40 Brady</span>
                <span>Base: {astronaut.baseline.hr?.value || 70}</span>
                <span>180 Severe</span>
              </div>
            </div>

            {/* Systolic Blood Pressure */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-sky-400" />
                  Systolic BP
                </span>
                <span className="font-mono font-bold text-lg text-sky-400">{sbp} <span className="text-xs text-slate-400">mmHg</span></span>
              </div>
              <input
                type="range"
                min="80"
                max="200"
                step="1"
                value={sbp}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSbp(val);
                  setActivePreset(null);
                  emitUpdate({ sbp: val });
                }}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>80 Hypo</span>
                <span>Base: {astronaut.baseline.bp?.systolic || 120}</span>
                <span>200 Stage 3</span>
              </div>
            </div>

            {/* Diastolic Blood Pressure */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-400" />
                  Diastolic BP
                </span>
                <span className="font-mono font-bold text-lg text-teal-400">{dbp} <span className="text-xs text-slate-400">mmHg</span></span>
              </div>
              <input
                type="range"
                min="50"
                max="120"
                step="1"
                value={dbp}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDbp(val);
                  setActivePreset(null);
                  emitUpdate({ dbp: val });
                }}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>50 Low</span>
                <span>Base: {astronaut.baseline.bp?.diastolic || 80}</span>
                <span>120 High</span>
              </div>
            </div>

            {/* Blood Oxygen SpO2 */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-sky-400" />
                  Oxygen Saturation (SpO2)
                </span>
                <span className={`font-mono font-bold text-lg ${spo2 < 93 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {spo2}%
                </span>
              </div>
              <input
                type="range"
                min="75"
                max="100"
                step="1"
                value={spo2}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSpo2(val);
                  setActivePreset(null);
                  emitUpdate({ spo2: val });
                }}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>75% Cyanosis</span>
                <span>Hypoxia &lt;93%</span>
                <span>100% Sat</span>
              </div>
            </div>

            {/* Respiration Rate */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-teal-400" />
                  Respiratory Rate (RR)
                </span>
                <span className="font-mono font-bold text-lg text-teal-400">{rr} <span className="text-xs text-slate-400">brpm</span></span>
              </div>
              <input
                type="range"
                min="8"
                max="38"
                step="1"
                value={rr}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRr(val);
                  setActivePreset(null);
                  emitUpdate({ rr: val });
                }}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>8 Slow</span>
                <span>Norm: 12-20</span>
                <span>38 Tachypnea</span>
              </div>
            </div>

            {/* Temperature */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  Body Temperature
                </span>
                <span className="font-mono font-bold text-lg text-orange-400">{temp} <span className="text-xs text-slate-400">°C</span></span>
              </div>
              <input
                type="range"
                min="35.0"
                max="40.5"
                step="0.1"
                value={temp}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTemp(val);
                  setActivePreset(null);
                  emitUpdate({ temp: val });
                }}
                className="w-full accent-orange-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>35.0 Hypothermia</span>
                <span>Norm: 36.5-37.5</span>
                <span>40.5 Fever</span>
              </div>
            </div>

          </div>

          {/* Quick Actions & Care Trigger Bar */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">
              Active Subject: <strong className="text-white">{astronaut.name} ({astronaut.callsign})</strong> · Real-time bi-directional telemetry bus
            </span>

            <div className="flex items-center gap-2.5">
              {onLaunchCare && (
                <button
                  onClick={() => onLaunchCare('cardio-scare')}
                  className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Launch Care Mode with These Vitals</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
