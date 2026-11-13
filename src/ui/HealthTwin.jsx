import React, { useState, useEffect } from 'react';
import regionsData from '../content/regions.json';
import RegionDrawer from './RegionDrawer.jsx';
import ProvenanceBadge from './ProvenanceBadge.jsx';
import modelImg from '../assets/bioscan-3d-model.png';
import { 
  User, 
  Activity, 
  AlertCircle, 
  Shield, 
  CheckCircle2, 
  Crosshair, 
  Rotate3d, 
  Layers, 
  Heart, 
  Eye, 
  Brain, 
  Wind, 
  Radio, 
  Maximize2, 
  Sparkles,
  Zap,
  Flame,
  ArrowRight,
  TrendingUp,
  Droplets,
  Moon,
  Info
} from 'lucide-react';

export default function HealthTwin({ astronaut, onLaunchCare, onLaunchRetrace }) {
  const [selectedRegionId, setSelectedRegionId] = useState('cardio');
  const [viewAngle, setViewAngle] = useState('front'); // 'front', 'profile', 'dorsal', 'orbit'
  const [activeLayer, setActiveLayer] = useState('all'); // 'all', 'cardio-lungs', 'neuro', 'digestive', 'skeletal', 'radiation'
  const [hoveredRegionId, setHoveredRegionId] = useState(null);
  const [orbitAngle, setOrbitAngle] = useState(0);

  const selectedRegion = regionsData.find(r => r.id === selectedRegionId) || regionsData[0];
  
  const getVital = (val, fallback) => {
    if (val === undefined || val === null) return fallback;
    if (typeof val === 'object' && val.value !== undefined) return val.value;
    return val;
  };

  const currHr = getVital(astronaut.current?.hr, 74);
  const currSbp = astronaut.current?.bp?.systolic || 120;
  const currDbp = astronaut.current?.bp?.diastolic || 80;
  const currSpo2 = getVital(astronaut.current?.spo2, 98);
  const currRr = getVital(astronaut.current?.rr, 16);
  const currTemp = getVital(astronaut.current?.temp, 36.7);
  const symptoms = astronaut.current?.symptoms || [];

  // Orbit rotation animation
  useEffect(() => {
    let animId;
    if (viewAngle === 'orbit') {
      const step = () => {
        setOrbitAngle(prev => (prev + 0.35) % 360);
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [viewAngle]);

  // Zone status evaluation based on true clinical bounds + symptoms
  const getZoneStatus = (regionId) => {
    if (regionId === 'cardio') {
      if (symptoms.includes('chest-discomfort') || currHr >= 120 || currSbp >= 160 || currDbp >= 100) {
        return {
          status: 'act',
          color: '#f43f5e',
          label: 'ACT REQUIRED',
          border: 'border-rose-500/50 bg-rose-950/60 text-rose-300'
        };
      }
      if (currHr >= 100 || currSbp >= 140 || currDbp >= 90) {
        return {
          status: 'watch',
          color: '#f59e0b',
          label: 'WATCH',
          border: 'border-amber-500/50 bg-amber-950/60 text-amber-300'
        };
      }
      return {
        status: 'nominal',
        color: '#06b6d4',
        label: 'NOMINAL',
        border: 'border-cyan-500/40 bg-cyan-950/50 text-cyan-300'
      };
    }
    if (regionId === 'respiratory') {
      if (symptoms.includes('shortness-of-breath') || currSpo2 < 90 || currRr >= 28) {
        return {
          status: 'act',
          color: '#f43f5e',
          label: 'ACT REQUIRED',
          border: 'border-rose-500/50 bg-rose-950/60 text-rose-300'
        };
      }
      if (currSpo2 <= 94 || currRr >= 22) {
        return {
          status: 'watch',
          color: '#f59e0b',
          label: 'WATCH',
          border: 'border-amber-500/50 bg-amber-950/60 text-amber-300'
        };
      }
      return {
        status: 'nominal',
        color: '#10b981',
        label: 'HEALTHY',
        border: 'border-emerald-500/40 bg-emerald-950/50 text-emerald-300'
      };
    }
    if (regionId === 'digestive') {
      if (symptoms.includes('repeated-vomiting')) {
        return {
          status: 'act',
          color: '#f43f5e',
          label: 'ACT REQUIRED',
          border: 'border-rose-500/50 bg-rose-950/60 text-rose-300'
        };
      }
      if (symptoms.includes('nausea') || symptoms.includes('vomiting')) {
        return {
          status: 'watch',
          color: '#f59e0b',
          label: 'WATCH / PRODROME',
          border: 'border-amber-500/50 bg-amber-950/60 text-amber-300'
        };
      }
      return {
        status: 'nominal',
        color: '#06b6d4',
        label: 'NOMINAL',
        border: 'border-cyan-500/40 bg-cyan-950/50 text-cyan-300'
      };
    }
    if (regionId === 'radiation') {
      if (currTemp >= 38.3) {
        return {
          status: 'act',
          color: '#f43f5e',
          label: 'ACT REQUIRED',
          border: 'border-rose-500/50 bg-rose-950/60 text-rose-300'
        };
      }
      if (currTemp >= 37.6) {
        return {
          status: 'watch',
          color: '#f59e0b',
          label: 'WATCH',
          border: 'border-amber-500/50 bg-amber-950/60 text-amber-300'
        };
      }
      return {
        status: 'nominal',
        color: '#06b6d4',
        label: 'MONITORING',
        border: 'border-cyan-500/40 bg-cyan-950/50 text-cyan-300'
      };
    }
    return {
      status: 'nominal',
      color: '#06b6d4',
      label: 'NOMINAL',
      border: 'border-cyan-500/40 bg-cyan-950/50 text-cyan-300'
    };
  };

  const cardioStatus = getZoneStatus('cardio');
  const digestiveStatus = getZoneStatus('digestive');
  const respStatus = getZoneStatus('respiratory');
  const radiationStatus = getZoneStatus('radiation');

  // Organ target coordinates mapped to the 896 x 1200 image space
  const organCoords = {
    'head-brain': { x: 448, y: 120, side: 'right', name: 'Cranial Vault & Brain', metric: 'ICP: 14 mmHg (Nominal)', desc: 'Intracranial pressure & cerebral perfusion' },
    'eyes': { x: 448, y: 150, side: 'right', name: 'Optic Disc & SANS', metric: 'Grade 0 (Clear)', desc: 'Posterior globe flattening check' },
    'cardio': { x: 454, y: 310, side: 'left', name: 'Heart & Great Vessels', metric: `${currHr} bpm · ${currSbp}/${currDbp} mmHg`, desc: currHr >= 100 ? 'Sinus tachycardia alert' : 'Cardiac rhythm nominal' },
    'respiratory': { x: 400, y: 310, side: 'left', name: 'Pulmonary Lungs', metric: `SpO2 ${currSpo2}% · ${currRr} rpm`, desc: currSpo2 < 93 ? 'Hypoxemia warning' : 'Bilateral alveolar ventilation clear' },
    'digestive': { x: 448, y: 480, side: 'left', name: 'GI Tract & Prodrome', metric: symptoms.includes('nausea') ? 'Nausea Watch (Post-Storm)' : 'Motility nominal', desc: 'Acute radiation prodrome monitoring' },
    'musculoskeletal': { x: 448, y: 400, side: 'right', name: 'Spinal Axis & Bones', metric: '+4.2 cm Decompression', desc: 'Microgravity vertebral elongation' }
  };

  const activeOrgan = organCoords[selectedRegionId] || organCoords['cardio'];
  const activeStatus = getZoneStatus(selectedRegionId);

  return (
    <div className="space-y-4">
      
      {/* Sleek Unified Aerospace Telemetry HUD Toolbar */}
      <div className="p-3 px-4 rounded-2xl glass-panel shadow-xl flex flex-wrap lg:flex-nowrap items-center justify-between gap-3">
        {/* Left: Crew & Mission context */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="p-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shadow-sm">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>3D Bio-Scan</span>
                <span className="text-slate-500">//</span>
                <span className="text-cyan-300">{astronaut.name}</span>
              </h2>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/40">
                {astronaut.callsign}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60 font-semibold hidden md:inline-block">
                SOL {astronaut.flightDay}
              </span>
              <ProvenanceBadge provenance="REAL" sourceId="radlab-iss-2025" compact />
            </div>
          </div>
        </div>

        {/* Center: Anatomical Layer Selector Chips */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-mono">
          {[
            { id: 'all', label: 'All Systems' },
            { id: 'cardio-lungs', label: 'Cardio & Lungs' },
            { id: 'neuro', label: 'Neuro & SANS' },
            { id: 'digestive', label: 'GI' },
            { id: 'skeletal', label: 'Spine' },
            { id: 'radiation', label: 'Radiation Heatmap' }
          ].map(layer => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                activeLayer === layer.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-850/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>

        {/* Right: 3D Views & Absorbed Dose */}
        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <div className="flex items-center p-0.5 rounded-lg bg-slate-950/80 border border-slate-800">
            {[
              { id: 'front', label: '0°' },
              { id: 'profile', label: '90°' },
              { id: 'dorsal', label: '180°' }
            ].map(view => (
              <button
                key={view.id}
                onClick={() => setViewAngle(view.id)}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  viewAngle === view.id ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title={`${view.id} view`}
              >
                {view.label}
              </button>
            ))}
            <button
              onClick={() => setViewAngle(viewAngle === 'orbit' ? 'front' : 'orbit')}
              className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer ${
                viewAngle === 'orbit' ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Continuous 360° Perspective Orbit"
            >
              <Rotate3d className={`w-3 h-3 ${viewAngle === 'orbit' ? 'animate-spin' : ''}`} />
              <span>Orbit</span>
            </button>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-xs hidden lg:flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px]">DOSE:</span>
            <strong className="text-cyan-300 font-mono font-bold text-[11px]">{astronaut.baseline.radiationDose.value} mGy</strong>
          </div>
        </div>
      </div>

      {/* Main 3-Column Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Flank: Vitals Telemetry & Health Metrics */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Real-Time Animated Lead II ECG Telemetry Card */}
          <div className="p-4 rounded-2xl glass-panel shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Heart className={`w-3.5 h-3.5 ${cardioStatus.status === 'act' ? 'text-rose-400 animate-heartbeat' : 'text-cyan-400'}`} />
                <span>LEAD II ECG TELEMETRY</span>
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cardioStatus.border}`}>
                {cardioStatus.status === 'act' ? 'TACHYCARDIA' : 'NORMAL SINUS'}
              </span>
            </div>

            {/* Simulated Animated ECG Waveform */}
            <div className="h-16 w-full bg-slate-950/90 rounded-xl relative overflow-hidden border border-slate-800 flex items-center justify-center p-1">
              <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:10px_10px]"></div>
              
              <svg viewBox="0 0 300 60" className="w-full h-full">
                <path
                  d="M 0,30 L 30,30 L 40,30 L 45,20 L 50,42 L 55,5 L 62,55 L 68,26 L 75,32 L 85,30 L 120,30 L 130,30 L 135,20 L 140,42 L 145,5 L 152,55 L 158,26 L 165,32 L 175,30 L 210,30 L 220,30 L 225,20 L 230,42 L 235,5 L 242,55 L 248,26 L 255,32 L 265,30 L 300,30"
                  fill="none"
                  stroke={cardioStatus.status === 'act' ? '#f43f5e' : '#38bdf8'}
                  strokeWidth="2"
                  className="animate-ecg-line"
                />
              </svg>
              <div className="absolute top-1.5 right-2 text-[10px] font-mono text-cyan-300 font-bold">
                {currHr} BPM
              </div>
            </div>

            {/* Heart Rate & BP Delta Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 text-[10px] block">PULSE RATE</span>
                <span className="text-base font-bold text-white">
                  {currHr} <span className="text-[10px] font-normal text-slate-400">bpm</span>
                </span>
                <span className="text-[10px] text-slate-500 block">Base: {astronaut.baseline?.hr?.value}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 text-[10px] block">BLOOD PRESSURE</span>
                <span className="text-base font-bold text-white">
                  {currSbp}/{currDbp}
                </span>
                <span className="text-[10px] text-slate-500 block">Base: {astronaut.baseline?.bp?.systolic}/{astronaut.baseline?.bp?.diastolic}</span>
              </div>
            </div>
          </div>

          {/* Core System Telemetry Stream */}
          <div className="p-4 rounded-2xl glass-panel shadow-xl space-y-3">
            <div className="text-xs font-mono font-bold text-slate-300 border-b border-slate-800 pb-2 uppercase tracking-wide">
              Vital Physiological Stream
            </div>

            <div className="space-y-2 text-xs">
              {/* SpO2 */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-slate-200 font-semibold block">Blood Oxygen (SpO2)</span>
                    <span className="text-[10px] text-slate-400 font-mono">Alveolar Diffusion</span>
                  </div>
                </div>
                <span className={`font-mono font-bold text-sm ${currSpo2 < 93 ? 'text-rose-400' : 'text-emerald-400'}`}>{currSpo2}%</span>
              </div>

              {/* Respiratory Rate */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-slate-200 font-semibold block">Respiration Rate</span>
                    <span className="text-[10px] text-slate-400 font-mono">Minute Ventilation</span>
                  </div>
                </div>
                <span className={`font-mono font-bold text-sm ${currRr >= 22 ? 'text-amber-400' : 'text-white'}`}>{currRr} <span className="text-[10px] font-normal text-slate-400">rpm</span></span>
              </div>

              {/* Core Temperature */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-slate-200 font-semibold block">Core Temperature</span>
                    <span className="text-[10px] text-slate-400 font-mono">Circadian Rhythm</span>
                  </div>
                </div>
                <span className={`font-mono font-bold text-sm ${currTemp >= 38.0 ? 'text-rose-400' : 'text-white'}`}>{currTemp} °C</span>
              </div>
            </div>
          </div>

          {/* NASA Spaceflight Health Metrics */}
          <div className="p-4 rounded-2xl glass-panel shadow-xl space-y-2.5">
            <div className="text-xs font-mono font-bold text-slate-300 border-b border-slate-800 pb-2 uppercase tracking-wide flex items-center justify-between">
              <span>Spaceflight Health Metrics</span>
              <span className="text-[10px] text-cyan-400 font-bold">NASA HRP</span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Cephalad Fluid Shift:</span>
                  <span className="font-bold text-cyan-300">+28% Venous Pool</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Sleep Quality Index:</span>
                  <span className="font-bold text-emerald-400">85% Restful</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Bone Mineral Density:</span>
                  <span className="font-bold text-amber-400">-1.1% / mo</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Center Column: The 3D Anatomical Bio-Scan Hologram Stage */}
        <div className="lg:col-span-6 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 relative flex flex-col justify-between shadow-2xl h-[580px] overflow-hidden">
          
          {/* Ambient Holographic Glow Orb */}
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_50%_45%,rgba(6,182,212,0.18)_0%,transparent_65%)]" />

          {/* Top HUD Overlay Coordinates */}
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800/80 pb-2 z-20">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Crosshair className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '20s' }} />
              <span>BIO-SCAN // 3D ANATOMICAL BLUEPRINT</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                VIEW: {viewAngle.toUpperCase()}
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE SCAN
              </span>
            </div>
          </div>

          {/* Center Stage with exact 896/1200 Aspect Ratio */}
          <div className="relative w-full flex-1 flex items-center justify-center my-1 select-none">
            
            {/* Holographic Vertical Scanning Laser Line */}
            <div className="absolute inset-x-8 top-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-beam pointer-events-none opacity-50 z-20"></div>

            {/* Exactly Sized Container maintaining 896/1200 aspect ratio */}
            <div 
              className="relative w-auto h-[410px] aspect-[896/1200] max-w-full transition-transform duration-500 ease-out"
              style={{
                transform: viewAngle === 'profile' 
                  ? 'rotateY(35deg) scaleX(0.9)' 
                  : viewAngle === 'dorsal' 
                  ? 'scaleX(-1)' 
                  : viewAngle === 'orbit' 
                  ? `rotateY(${Math.sin(orbitAngle * Math.PI / 180) * 28}deg)` 
                  : 'none'
              }}
            >
              {/* High-Resolution 3D Transparent Anatomical Body Model */}
              <img
                src={modelImg}
                alt="3D Anatomical Human Model"
                className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(6,182,212,0.25)] pointer-events-none select-none"
              />

              {/* Exact-Pixel Coordinate SVG Overlay on 896 x 1200 Canvas */}
              <svg
                viewBox="0 0 896 1200"
                className="absolute inset-0 w-full h-full z-10 pointer-events-auto"
              >
                {/* Radiation Heatmap Layer (when active) */}
                {activeLayer === 'radiation' && (
                  <g className="animate-pulse">
                    <radialGradient id="radShieldGlow" cx="50%" cy="35%" r="35%">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.5" />
                      <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                    </radialGradient>
                    <ellipse cx="448" cy="380" rx="140" ry="220" fill="url(#radShieldGlow)" />
                  </g>
                )}

                {/* 1. Hotspot Pins directly at verified organ coordinates */}
                {Object.entries(organCoords).map(([id, organ]) => {
                  const status = getZoneStatus(id);
                  const isSelected = selectedRegionId === id;
                  const isHovered = hoveredRegionId === id;

                  // Layer filter visibility
                  if (activeLayer === 'cardio-lungs' && id !== 'cardio' && id !== 'respiratory') return null;
                  if (activeLayer === 'neuro' && id !== 'head-brain' && id !== 'eyes') return null;
                  if (activeLayer === 'digestive' && id !== 'digestive') return null;
                  if (activeLayer === 'skeletal' && id !== 'musculoskeletal') return null;

                  return (
                    <g
                      key={id}
                      className="cursor-pointer group"
                      onClick={() => setSelectedRegionId(id)}
                      onMouseEnter={() => setHoveredRegionId(id)}
                      onMouseLeave={() => setHoveredRegionId(null)}
                    >
                      <title>{organ.name}: {organ.metric}</title>
                      {/* Pulsing Beacon Ring for Selected or Alert Organs */}
                      {(isSelected || status.status === 'act') && (
                        <circle
                          cx={organ.x}
                          cy={organ.y}
                          r={status.status === 'act' ? '28' : '20'}
                          fill={status.color}
                          opacity="0.4"
                          className="animate-ping"
                          style={{ transformOrigin: `${organ.x}px ${organ.y}px` }}
                        />
                      )}
                      
                      {/* Main Hotspot Dot */}
                      <circle
                        cx={organ.x}
                        cy={organ.y}
                        r={isSelected ? '9.5' : isHovered ? '8.5' : '7'}
                        fill={status.color}
                        stroke="#0f172a"
                        strokeWidth="2.5"
                        filter="drop-shadow(0 0 8px rgba(6,182,212,0.8))"
                        className="transition-all"
                      />
                    </g>
                  );
                })}

                {/* 2. Active Focused Leader Line */}
                {activeOrgan && (
                  <g className="transition-all duration-300">
                    <path
                      d={`M ${activeOrgan.x},${activeOrgan.y} C ${activeOrgan.x + 140},${activeOrgan.y} 720,${Math.min(Math.max(activeOrgan.y, 180), 420)} 896,${Math.min(Math.max(activeOrgan.y, 180), 420)}`}
                      fill="none"
                      stroke={activeStatus.color}
                      strokeWidth="2.5"
                      strokeDasharray="6,4"
                      strokeLinecap="round"
                      className="filter drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] animate-pulse"
                    />

                    {/* Edge Target Node pointing to the Right Diagnostic Panel */}
                    <circle
                      cx="892"
                      cy={Math.min(Math.max(activeOrgan.y, 180), 420)}
                      r="6"
                      fill={activeStatus.color}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>
            </div>

          </div>

          {/* Bottom BMI & Physiological Telemetry Bar */}
          <div className="w-full mt-1 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 z-10 text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="p-1 px-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] mr-1">MASS:</span>
                <strong className="text-white font-bold">76 kg</strong>
              </div>
              <div className="p-1 px-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] mr-1">HEIGHT:</span>
                <strong className="text-white font-bold">182 cm (+4.2cm)</strong>
              </div>
              <div className="p-1 px-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hidden sm:block">
                <span className="text-slate-400 text-[10px] mr-1">BMI:</span>
                <strong className="text-emerald-400 font-bold">22.9</strong>
              </div>
            </div>

            {/* Quick Organ Zone Chips */}
            <div className="flex flex-wrap gap-1">
              {regionsData.map(reg => {
                const status = getZoneStatus(reg.id);
                const isSelected = selectedRegionId === reg.id;
                return (
                  <button
                    key={reg.id}
                    onClick={() => setSelectedRegionId(reg.id)}
                    className={`px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 font-bold shadow-xs'
                        : 'bg-slate-900/70 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
                    }`}
                  >
                    <span>{reg.name.split(' ')[0]}</span>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Flank: Focused Diagnostic Drawer + System Health Matrix */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* 1. Region Drawer: Direct target of the 3D model leader line */}
          <div className="relative">
            {/* Visual connector pulse dot aligned with SVG leader line from center stage */}
            <div 
              className="hidden lg:block absolute -left-3 w-3 h-3 rounded-full border-2 border-slate-900 shadow-sm z-30 transition-all duration-300"
              style={{
                top: '72px',
                backgroundColor: activeStatus.color,
                boxShadow: `0 0 10px ${activeStatus.color}`
              }}
            />

            <RegionDrawer
              region={selectedRegion}
              astronaut={astronaut}
              onClose={() => setSelectedRegionId('cardio')}
              onLaunchCare={onLaunchCare}
              onLaunchRetrace={onLaunchRetrace}
            />
          </div>

          {/* 2. Organ Systems Readiness Overview Matrix */}
          <div className="p-3.5 rounded-2xl glass-panel shadow-xl space-y-2.5">
            <div className="text-xs font-mono font-bold text-slate-300 border-b border-slate-800 pb-2 uppercase tracking-wide flex items-center justify-between">
              <span>System Health Matrix</span>
              <span className="text-[10px] text-emerald-400 font-bold">WELLNESS: 87%</span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              {[
                { id: 'cardio', name: 'Cardiovascular', status: cardioStatus.label, color: cardioStatus.color, badge: cardioStatus.border },
                { id: 'respiratory', name: 'Respiratory', status: respStatus.label, color: respStatus.color, badge: respStatus.border },
                { id: 'digestive', name: 'Gastrointestinal', status: digestiveStatus.label, color: digestiveStatus.color, badge: digestiveStatus.border },
                { id: 'head-brain', name: 'Nervous System', status: 'NOMINAL', color: '#06b6d4', badge: 'bg-cyan-950/50 text-cyan-300 border-cyan-500/40' },
                { id: 'musculoskeletal', name: 'Musculoskeletal', status: 'ARED STABLE', color: '#64748b', badge: 'bg-slate-800/80 text-slate-300 border-slate-700/60' },
                { id: 'radiation', name: 'Immune & Radiation', status: radiationStatus.label, color: radiationStatus.color, badge: radiationStatus.border }
              ].map((sys) => {
                const isSelected = selectedRegionId === sys.id;
                return (
                  <button
                    key={sys.id}
                    onClick={() => {
                      if (sys.id === 'radiation') {
                        setActiveLayer('radiation');
                      } else {
                        setSelectedRegionId(sys.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-1.5 px-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-cyan-950/70 border-cyan-500/50 shadow-xs font-semibold' 
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sys.color }}></span>
                      <span className="text-slate-200 text-[11px] truncate">{sys.name}</span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold shrink-0 ${sys.badge}`}>
                      {sys.status}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Performance Circular Ring */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[11px] font-mono">
                <span className="text-slate-400 block">CREW EFFICIENCY</span>
                <span className="text-xs font-bold text-white">Operational Readiness</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3.5"
                      strokeDasharray="87, 100"
                    />
                  </svg>
                  <span className="absolute text-[9px] font-mono font-bold text-cyan-400">87%</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
