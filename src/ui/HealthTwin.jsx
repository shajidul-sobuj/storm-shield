import React, { useState, useEffect } from 'react';
import regionsData from '../content/regions.json';
import RegionDrawer from './RegionDrawer.jsx';
import ProvenanceBadge from './ProvenanceBadge.jsx';
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
  ArrowUpRight
} from 'lucide-react';

export default function HealthTwin({ astronaut, onLaunchCare, onLaunchRetrace }) {
  const [selectedRegionId, setSelectedRegionId] = useState('cardio');
  const [viewAngle, setViewAngle] = useState('front'); // 'front', 'profile', 'dorsal', 'orbit'
  const [activeLayer, setActiveLayer] = useState('all'); // 'all', 'cardio-lungs', 'neuro', 'digestive', 'skeletal', 'radiation'
  const [hoveredRegionId, setHoveredRegionId] = useState(null);
  const [orbitAngle, setOrbitAngle] = useState(0);

  const selectedRegion = regionsData.find(r => r.id === selectedRegionId) || regionsData[0];
  const symptoms = astronaut.current?.symptoms || [];

  // Orbit rotation animation loop
  useEffect(() => {
    let animId;
    if (viewAngle === 'orbit') {
      const step = () => {
        setOrbitAngle(prev => (prev + 0.4) % 360);
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [viewAngle]);

  // Zone status evaluation
  const getZoneStatus = (regionId) => {
    if (regionId === 'cardio' && symptoms.includes('chest-discomfort')) {
      return {
        status: 'act',
        color: '#ef4444',
        glow: 'rgba(239, 68, 68, 0.4)',
        label: 'ACT REQUIRED',
        border: 'border-rose-400 bg-rose-50 text-rose-800'
      };
    }
    if (regionId === 'digestive' && (symptoms.includes('nausea') || symptoms.includes('vomiting'))) {
      return {
        status: 'watch',
        color: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.35)',
        label: 'WATCH',
        border: 'border-amber-400 bg-amber-50 text-amber-800'
      };
    }
    return {
      status: 'nominal',
      color: '#0284c7',
      glow: 'rgba(2, 132, 199, 0.25)',
      label: 'NOMINAL',
      border: 'border-sky-300 bg-sky-50 text-sky-800'
    };
  };

  const isLayerVisible = (layerName) => {
    if (activeLayer === 'all') return true;
    return activeLayer === layerName;
  };

  const cardioStatus = getZoneStatus('cardio');
  const digestiveStatus = getZoneStatus('digestive');

  return (
    <div className="space-y-6">
      
      {/* Top Bio-Scan HUD Control Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 shadow-2xs">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Digital Bio-Scan Hologram // {astronaut.name}
              </h2>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                CALLSIGN: {astronaut.callsign}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                FLIGHT DAY: {astronaut.flightDay}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-frequency 3D physiological avatar mapped to NASA Human Research Program exploration hazards.
            </p>
          </div>
        </div>

        {/* Top Controls: 3D Perspective & Layer Switches */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* View Perspective Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono">
            <button
              onClick={() => setViewAngle('front')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewAngle === 'front' ? 'bg-white text-sky-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Anterior (Frontal) View"
            >
              Front 0°
            </button>
            <button
              onClick={() => setViewAngle('profile')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewAngle === 'profile' ? 'bg-white text-sky-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Lateral (Profile) View"
            >
              Side 90°
            </button>
            <button
              onClick={() => setViewAngle('dorsal')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewAngle === 'dorsal' ? 'bg-white text-sky-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Posterior (Spinal) View"
            >
              Dorsal 180°
            </button>
            <button
              onClick={() => setViewAngle(viewAngle === 'orbit' ? 'front' : 'orbit')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                viewAngle === 'orbit' ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Continuous 360° Perspective Orbit"
            >
              <Rotate3d className={`w-3.5 h-3.5 ${viewAngle === 'orbit' ? 'animate-spin' : ''}`} />
              <span>Orbit</span>
            </button>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono hidden sm:flex items-center gap-2">
            <span className="text-slate-500">Absorbed:</span>
            <strong className="text-slate-900 font-bold">{astronaut.baseline.radiationDose.value} mGy</strong>
          </div>
          <ProvenanceBadge provenance="REAL" sourceId="radlab-iss-2025" compact />
        </div>
      </div>

      {/* Layer Filter Selector Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-slate-500 font-bold text-[11px] uppercase mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-sky-600" />
          <span>Filters:</span>
        </span>
        {[
          { id: 'all', label: 'All Systems' },
          { id: 'cardio-lungs', label: 'Cardio & Lungs' },
          { id: 'neuro', label: 'Cranial & SANS' },
          { id: 'digestive', label: 'GI & Prodrome' },
          { id: 'skeletal', label: 'Spine & Fluid Shift' },
          { id: 'radiation', label: 'Radiation Heatmap' }
        ].map(layer => (
          <button
            key={layer.id}
            onClick={() => setActiveLayer(layer.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeLayer === layer.id
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {layer.label}
          </button>
        ))}
      </div>

      {/* Main 3-Column Studio Layout: Telemetry Flank | 3D Bio-Scan Stage | Diagnostics Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Flank: Live Physiological Telemetry & Spaceflight Biomarkers (Inspired by Image 1 & 4) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Real-Time Animated ECG Waveform Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-mono border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Heart className={`w-3.5 h-3.5 ${cardioStatus.status === 'act' ? 'text-rose-500 animate-heartbeat' : 'text-sky-600'}`} />
                <span>LEAD II ECG TELEMETRY</span>
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cardioStatus.status === 'act' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {cardioStatus.status === 'act' ? 'TACHYCARDIA' : 'NORMAL SINUS'}
              </span>
            </div>

            {/* Simulated Animated ECG Line */}
            <div className="h-16 w-full bg-slate-900 rounded-xl relative overflow-hidden flex items-center justify-center p-1">
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#0284c7_1px,transparent_1px),linear-gradient(to_bottom,#0284c7_1px,transparent_1px)] bg-[size:10px_10px]"></div>
              
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
                {astronaut.current?.hr?.value || astronaut.current?.hr || 74} BPM
              </div>
            </div>

            {/* Heart Rate & BP Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">PULSE RATE</span>
                <span className="text-base font-bold text-slate-900">
                  {astronaut.current?.hr?.value || astronaut.current?.hr} <span className="text-[10px] font-normal text-slate-500">bpm</span>
                </span>
                <span className="text-[10px] text-slate-500 block">Base: {astronaut.baseline?.hr?.value}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">BLOOD PRESSURE</span>
                <span className="text-base font-bold text-slate-900">
                  {astronaut.current?.bp?.systolic}/{astronaut.current?.bp?.diastolic}
                </span>
                <span className="text-[10px] text-slate-500 block">Base: {astronaut.baseline?.bp?.systolic}/{astronaut.baseline?.bp?.diastolic}</span>
              </div>
            </div>
          </div>

          {/* Core System Telemetry Tiles */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="text-xs font-mono font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wide">
              Vital Physiological Stream
            </div>

            <div className="space-y-2 text-xs">
              {/* SpO2 */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-sky-600" />
                  <div>
                    <span className="text-slate-800 font-semibold block">Blood Oxygen (SpO2)</span>
                    <span className="text-[10px] text-slate-500 font-mono">Alveolar Diffusion</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-900 text-sm">98.5%</span>
              </div>

              {/* Respiratory Rate */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-slate-800 font-semibold block">Respiration Rate</span>
                    <span className="text-[10px] text-slate-500 font-mono">Minute Ventilation</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-900 text-sm">16 <span className="text-[10px] font-normal text-slate-500">rpm</span></span>
              </div>

              {/* Core Temperature */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-slate-800 font-semibold block">Core Temperature</span>
                    <span className="text-[10px] text-slate-500 font-mono">Circadian Thermoregulation</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-900 text-sm">36.7 °C</span>
              </div>
            </div>
          </div>

          {/* NASA Spaceflight Stress Markers */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="text-xs font-mono font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wide flex items-center justify-between">
              <span>Spaceflight Stress Indices</span>
              <span className="text-[10px] text-sky-600 font-bold">NASA HRP</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600">Cephalad Fluid Shift:</span>
                  <span className="font-bold text-sky-700">+28% Venous Pool</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600">SANS Optical Risk:</span>
                  <span className="font-bold text-emerald-700">Stage 0 (Clear)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '22%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600">Bone Mineral Density:</span>
                  <span className="font-bold text-amber-700">-1.1% / mo</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Center: The 3D Bio-Scan Holographic Stage (Directly inspired by Images 1, 2, 3 & 4) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 relative flex flex-col items-center justify-center clinical-grid shadow-xs min-h-[580px] overflow-hidden">
          
          {/* Top HUD Overlay Coordinates */}
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-slate-100 pb-2.5 z-10">
            <div className="flex items-center gap-1.5 text-sky-700 font-bold">
              <Crosshair className="w-4 h-4 text-sky-600 animate-spin" style={{ animationDuration: '20s' }} />
              <span>BIO-SCAN // 3D HOLOGRAPHIC BLUEPRINT</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                VIEW: {viewAngle.toUpperCase()}
              </span>
              <span className="text-slate-400">FPS: 60</span>
            </div>
          </div>

          {/* Interactive 3D SVG Stage */}
          <div className="relative w-full max-w-[380px] h-[520px] flex items-center justify-center my-2">
            
            {/* Holographic Vertical Scanning Laser Line */}
            <div className="absolute inset-x-8 top-10 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-scan-beam pointer-events-none opacity-60 z-20"></div>

            {/* 3D Holographic Base Pedestal (Concentric Scanner Rings - Image 1 & 2) */}
            <svg
              className="absolute bottom-2 w-72 h-28 pointer-events-none z-0"
              viewBox="0 0 280 100"
            >
              {/* Soft radial glow under feet */}
              <ellipse cx="140" cy="50" rx="120" ry="32" fill="#e0f2fe" opacity="0.6" />
              
              {/* Outer ring with tick marks */}
              <ellipse cx="140" cy="50" rx="110" ry="26" fill="none" stroke="#bae6fd" strokeWidth="1.5" strokeDasharray="3 4" />
              
              {/* Middle highlighted ring */}
              <ellipse cx="140" cy="50" rx="85" ry="20" fill="none" stroke="#0284c7" strokeWidth="1.5" opacity="0.8" />
              
              {/* Rotating Radar Sweep Beam */}
              <g className="animate-radar">
                <line x1="140" y1="50" x2="225" y2="50" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
                <path d="M 140 50 L 225 45 A 85 20 0 0 1 225 55 Z" fill="#38bdf8" opacity="0.3" />
              </g>

              {/* Inner core ring */}
              <ellipse cx="140" cy="50" rx="55" ry="14" fill="#f0f9ff" stroke="#38bdf8" strokeWidth="2" />
              <ellipse cx="140" cy="50" rx="30" ry="8" fill="#0284c7" opacity="0.2" />

              {/* Center Holographic Projector Emitter */}
              <circle cx="140" cy="50" r="4" fill="#0284c7" />
            </svg>

            {/* High-Fidelity 3D Anatomical Human SVG Figure */}
            <svg
              viewBox="0 0 340 480"
              className="w-full h-full relative z-10 filter drop-shadow-md transition-transform duration-500 ease-out"
              style={{
                transform: viewAngle === 'profile' 
                  ? 'rotateY(45deg) scaleX(0.85)' 
                  : viewAngle === 'dorsal' 
                  ? 'scaleX(-1)' 
                  : viewAngle === 'orbit' 
                  ? `rotateY(${orbitAngle}deg)` 
                  : 'none'
              }}
              role="region"
              aria-label="3D Anatomical Human Bio-Scan Model"
            >
              <defs>
                {/* Holographic Shading Gradients */}
                <linearGradient id="bodyHoloGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#f1f5f9" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.95" />
                </linearGradient>

                <linearGradient id="heartPulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#be123c" />
                </linearGradient>

                <linearGradient id="lungFieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.75" />
                </linearGradient>

                <linearGradient id="digestiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.95" />
                </linearGradient>

                <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#bae6fd" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>

                {/* Drop shadow filters for realistic 3D organ lighting */}
                <filter id="organGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. Base 3D Anatomical Contour Silhouette (High Human Accuracy) */}
              <g id="human-body-silhouette" className="opacity-95">
                {/* Full Human Body Contour with muscular curves (Head, Neck, Torso, Arms, Legs) */}
                <path
                  d="M170,30 
                     C186,30 198,42 198,58 
                     C198,73 189,84 178,89 
                     L180,98 L218,114 
                     C228,120 236,134 238,150 
                     L248,210 C250,222 242,230 232,230 
                     C226,230 220,224 218,216 
                     L210,166 L202,154 
                     L202,230 C202,246 198,260 196,274 
                     L204,360 C206,378 206,410 208,440 
                     C208,448 200,452 188,452 
                     C178,452 176,444 176,432 
                     L172,360 L170,290 
                     L168,360 L164,432 
                     C164,444 162,452 152,452 
                     C140,452 132,448 132,440 
                     C134,410 134,378 136,360 
                     L144,274 C142,260 138,246 138,230 
                     L138,154 L130,166 
                     L122,216 C120,224 114,230 108,230 
                     C98,230 90,222 92,210 
                     L102,150 C104,134 112,120 122,114 
                     L160,98 L162,89 
                     C151,84 142,73 142,58 
                     C142,42 154,30 170,30 Z"
                  fill="url(#bodyHoloGrad)"
                  stroke="#94a3b8"
                  strokeWidth="1.75"
                />

                {/* Clavicles & Ribcage Sub-surface Contours */}
                <path d="M148,102 Q170,112 192,102" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                <path d="M142,130 Q170,140 198,130" fill="none" stroke="#e2e8f0" strokeWidth="1.2" strokeDasharray="2 3" />
                <path d="M144,146 Q170,156 196,146" fill="none" stroke="#e2e8f0" strokeWidth="1.2" strokeDasharray="2 3" />
                <path d="M146,162 Q170,172 194,162" fill="none" stroke="#e2e8f0" strokeWidth="1.2" strokeDasharray="2 3" />
                <path d="M148,178 Q170,188 192,178" fill="none" stroke="#e2e8f0" strokeWidth="1.2" strokeDasharray="2 3" />
              </g>

              {/* 2. Cranial Vault & Central Nervous System (Zone: head-brain) */}
              {isLayerVisible('neuro') && (
                <g
                  id="zone-head"
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedRegionId('head-brain')}
                  onMouseEnter={() => setHoveredRegionId('head-brain')}
                  onMouseLeave={() => setHoveredRegionId(null)}
                >
                  {/* Brain Silhouette with Gyri Patterns (Matching Image 1 & 3) */}
                  <ellipse cx="170" cy="56" rx="20" ry="17" fill="url(#brainGrad)" filter="url(#organGlow)" opacity="0.85" />
                  
                  {/* Cerebral Gyri Grooves */}
                  <path d="M158,54 Q170,46 182,54" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />
                  <path d="M160,60 Q170,52 180,60" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />
                  <path d="M164,66 Q170,62 176,66" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />
                  <circle cx="170" cy="56" r="3" fill="#ffffff" />
                  
                  {/* Brainstem extending into spinal cord */}
                  <path d="M170,72 L170,95" stroke="#0284c7" strokeWidth="2.5" strokeDasharray="2 2" />
                </g>
              )}

              {/* 3. Eyes & Optical Tracts (SANS Syndrome - Zone: eyes) */}
              {isLayerVisible('neuro') && (
                <g
                  id="zone-eyes"
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedRegionId('eyes')}
                  onMouseEnter={() => setHoveredRegionId('eyes')}
                  onMouseLeave={() => setHoveredRegionId(null)}
                >
                  <circle cx="163" cy="52" r="3" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="177" cy="52" r="3" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
                  {/* Optic Nerves to Chiasm */}
                  <line x1="163" y1="52" x2="170" y2="58" stroke="#38bdf8" strokeWidth="1" />
                  <line x1="177" y1="52" x2="170" y2="58" stroke="#38bdf8" strokeWidth="1" />
                </g>
              )}

              {/* 4. Pulmonary Fields (Bilateral Lungs - Zone: respiratory) */}
              {isLayerVisible('cardio-lungs') && (
                <g
                  id="zone-respiratory"
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedRegionId('respiratory')}
                  onMouseEnter={() => setHoveredRegionId('respiratory')}
                  onMouseLeave={() => setHoveredRegionId(null)}
                >
                  {/* Right Lung Field */}
                  <path
                    d="M144,116 C144,112 154,116 156,128 C158,140 156,155 146,160 C138,158 136,138 144,116 Z"
                    fill="url(#lungFieldGrad)"
                    stroke="#0284c7"
                    strokeWidth="1.2"
                    filter="url(#organGlow)"
                  />
                  {/* Left Lung Field */}
                  <path
                    d="M196,116 C196,112 186,116 184,128 C182,140 184,155 194,160 C202,158 204,138 196,116 Z"
                    fill="url(#lungFieldGrad)"
                    stroke="#0284c7"
                    strokeWidth="1.2"
                    filter="url(#organGlow)"
                  />
                  {/* Bronchial Tree Branching */}
                  <path d="M170,105 L170,122 L152,135 M170,122 L188,135" stroke="#bae6fd" strokeWidth="1.5" fill="none" />
                </g>
              )}

              {/* 5. Cardiovascular Engine (Heart & Great Vessels - Zone: cardio) */}
              {isLayerVisible('cardio-lungs') && (
                <g
                  id="zone-cardio"
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedRegionId('cardio')}
                  onMouseEnter={() => setHoveredRegionId('cardio')}
                  onMouseLeave={() => setHoveredRegionId(null)}
                >
                  {/* Pulsing Vascular Beacon Ring */}
                  {cardioStatus.status === 'act' && (
                    <circle cx="170" cy="138" r="22" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.75" className="animate-ping" style={{ transformOrigin: '170px 138px' }} />
                  )}

                  {/* Aortic Arch & Vena Cava */}
                  <path d="M167,126 Q170,118 175,126" stroke="#ef4444" strokeWidth="3" fill="none" />
                  <path d="M164,124 L164,134" stroke="#0284c7" strokeWidth="2.5" fill="none" />

                  {/* Anatomical Heart Model with Rhythmic Pulse (Image 1, 2, 3) */}
                  <g className={cardioStatus.status === 'act' ? 'animate-heartbeat' : ''} style={{ transformOrigin: '170px 138px' }}>
                    <path
                      d="M170,130 
                         C170,124 160,122 156,128 
                         C150,136 170,152 170,152 
                         C170,152 190,136 184,128 
                         C180,122 170,124 170,130 Z"
                      fill="url(#heartPulseGrad)"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      filter="url(#organGlow)"
                    />
                    {/* Glowing Coronary Artery Branch */}
                    <path d="M168,134 Q172,140 171,146" stroke="#fecdd3" strokeWidth="1.2" fill="none" />
                  </g>
                </g>
              )}

              {/* 6. Gastrointestinal & Abdominal Organs (Stomach, Liver, Intestines - Zone: digestive) */}
              {isLayerVisible('digestive') && (
                <g
                  id="zone-digestive"
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedRegionId('digestive')}
                  onMouseEnter={() => setHoveredRegionId('digestive')}
                  onMouseLeave={() => setHoveredRegionId(null)}
                >
                  {/* Hepatic Silhouette (Liver) */}
                  <path d="M152,168 C152,162 165,160 172,168 L170,178 L152,176 Z" fill="#b45309" opacity="0.8" />
                  
                  {/* Stomach J-Curve */}
                  <path d="M172,166 C180,166 188,172 184,182 C180,188 172,186 168,180 Z" fill="#d97706" opacity="0.9" />

                  {/* Looped Convoluted Intestines (Crucial for CDC Radiation Prodrome Assessment - Image 1 & 3) */}
                  <g>
                    {digestiveStatus.status === 'watch' && (
                      <circle cx="170" cy="198" r="18" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="animate-ping" style={{ transformOrigin: '170px 198px' }} />
                    )}
                    <path
                      d="M156,188 Q170,184 184,188 Q186,196 170,196 Q154,196 156,204 Q170,204 184,204 Q184,212 170,212 Q156,212 158,220 Q170,222 182,220"
                      fill="none"
                      stroke="url(#digestiveGrad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      filter="url(#organGlow)"
                    />
                  </g>
                </g>
              )}

              {/* 7. Skeletal Axis & Vertebral Column (Zone: musculoskeletal) */}
              {isLayerVisible('skeletal') && (
                <g
                  id="zone-musculoskeletal"
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedRegionId('musculoskeletal')}
                  onMouseEnter={() => setHoveredRegionId('musculoskeletal')}
                  onMouseLeave={() => setHoveredRegionId(null)}
                >
                  {/* Segmented Spinal Column (Vertebrae) */}
                  <line x1="170" y1="92" x2="170" y2="236" stroke="#64748b" strokeWidth="3" strokeDasharray="3 2" />
                  {/* Pelvic Cradle */}
                  <path d="M152,234 Q170,244 188,234 L184,250 Q170,256 156,250 Z" fill="#94a3b8" opacity="0.8" />
                  {/* Femoral Bone Axes */}
                  <line x1="160" y1="250" x2="152" y2="350" stroke="#94a3b8" strokeWidth="2.5" />
                  <line x1="180" y1="250" x2="188" y2="350" stroke="#94a3b8" strokeWidth="2.5" />
                  {/* Tibial Axes */}
                  <line x1="152" y1="360" x2="148" y2="430" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="188" y1="360" x2="192" y2="430" stroke="#94a3b8" strokeWidth="2" />
                </g>
              )}

              {/* 8. Spaceflight Microgravity Cephalad Fluid Shift Vector Arrows */}
              {isLayerVisible('skeletal') && (
                <g id="fluid-shift-vectors" className="pointer-events-none opacity-80">
                  <path d="M130,220 L130,120" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" />
                  <polygon points="130,114 126,122 134,122" fill="#0284c7" />
                  <path d="M210,220 L210,120" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" />
                  <polygon points="210,114 206,122 214,122" fill="#0284c7" />
                  <text x="110" y="170" fill="#0284c7" fontSize="7" fontFamily="monospace" fontWeight="bold">
                    ▲ CEPHALAD SHIFT
                  </text>
                </g>
              )}

              {/* 9. Ionizing Radiation Heatmap Field Overlay (Zone: immune-skin) */}
              {isLayerVisible('radiation') && (
                <g id="radiation-heatmap-overlay" className="pointer-events-none">
                  <ellipse cx="170" cy="180" rx="48" ry="85" fill="#f59e0b" opacity="0.25" filter="url(#organGlow)" />
                  <ellipse cx="170" cy="180" rx="32" ry="55" fill="#ef4444" opacity="0.2" filter="url(#organGlow)" />
                  <text x="170" y="470" textAnchor="middle" fill="#d97706" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    DOSE ABSORPTION: {astronaut.baseline.radiationDose.value} mGy
                  </text>
                </g>
              )}

              {/* 10. Precision Holographic Callout Leader Lines & Interactive Diagnostic Tags (Matching Image 3, 4 & 5) */}
              <g id="callout-leader-lines">
                
                {/* Callout A: Heart / Cardiovascular -> Top Left Floating Tag */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedRegionId('cardio')}
                >
                  <circle cx="170" cy="138" r="4" fill={cardioStatus.color} stroke="#ffffff" strokeWidth="1.5" />
                  <polyline
                    points="170,138 120,138 75,115"
                    fill="none"
                    stroke={cardioStatus.color}
                    strokeWidth={selectedRegionId === 'cardio' ? '2' : '1.2'}
                    strokeDasharray={selectedRegionId === 'cardio' ? 'none' : '3 2'}
                  />
                  <circle cx="75" cy="115" r="3" fill={cardioStatus.color} />
                  {/* Floating Tag Box */}
                  <rect x="5" y="98" width="68" height="24" rx="5" fill="#ffffff" stroke={cardioStatus.color} strokeWidth="1.2" filter="url(#organGlow)" />
                  <text x="39" y="110" textAnchor="middle" fill="#0f172a" fontSize="7" fontFamily="monospace" fontWeight="bold">
                    HEART RATE
                  </text>
                  <text x="39" y="118" textAnchor="middle" fill={cardioStatus.color} fontSize="6.5" fontFamily="monospace" fontWeight="bold">
                    {cardioStatus.label}
                  </text>
                </g>

                {/* Callout B: Brain & Cranial -> Top Right Floating Tag */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedRegionId('head-brain')}
                >
                  <circle cx="170" cy="56" r="3.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                  <polyline
                    points="170,56 215,56 260,42"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth={selectedRegionId === 'head-brain' ? '2' : '1.2'}
                    strokeDasharray={selectedRegionId === 'head-brain' ? 'none' : '3 2'}
                  />
                  <circle cx="260" cy="42" r="3" fill="#0284c7" />
                  <rect x="263" y="28" width="72" height="24" rx="5" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" filter="url(#organGlow)" />
                  <text x="299" y="40" textAnchor="middle" fill="#0f172a" fontSize="7" fontFamily="monospace" fontWeight="bold">
                    CRANIAL VAULT
                  </text>
                  <text x="299" y="48" textAnchor="middle" fill="#0284c7" fontSize="6.5" fontFamily="monospace" fontWeight="bold">
                    ICP NOMINAL
                  </text>
                </g>

                {/* Callout C: Lungs -> Left Floating Tag */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedRegionId('respiratory')}
                >
                  <circle cx="190" cy="132" r="3" fill="#0284c7" stroke="#ffffff" strokeWidth="1.2" />
                  <polyline
                    points="190,132 225,132 265,120"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth={selectedRegionId === 'respiratory' ? '2' : '1.2'}
                  />
                  <circle cx="265" cy="120" r="3" fill="#0284c7" />
                  <rect x="268" y="106" width="68" height="24" rx="5" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" />
                  <text x="302" y="118" textAnchor="middle" fill="#0f172a" fontSize="7" fontFamily="monospace" fontWeight="bold">
                    PULMONARY
                  </text>
                  <text x="302" y="126" textAnchor="middle" fill="#0284c7" fontSize="6.5" fontFamily="monospace" fontWeight="bold">
                    SpO2 98.5%
                  </text>
                </g>

                {/* Callout D: GI / Abdomen -> Lower Left Floating Tag */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedRegionId('digestive')}
                >
                  <circle cx="170" cy="198" r="4" fill={digestiveStatus.color} stroke="#ffffff" strokeWidth="1.5" />
                  <polyline
                    points="170,198 120,198 75,215"
                    fill="none"
                    stroke={digestiveStatus.color}
                    strokeWidth={selectedRegionId === 'digestive' ? '2' : '1.2'}
                  />
                  <circle cx="75" cy="215" r="3" fill={digestiveStatus.color} />
                  <rect x="5" y="202" width="68" height="24" rx="5" fill="#ffffff" stroke={digestiveStatus.color} strokeWidth="1.2" />
                  <text x="39" y="214" textAnchor="middle" fill="#0f172a" fontSize="7" fontFamily="monospace" fontWeight="bold">
                    GI TRACT
                  </text>
                  <text x="39" y="222" textAnchor="middle" fill={digestiveStatus.color} fontSize="6.5" fontFamily="monospace" fontWeight="bold">
                    {digestiveStatus.label}
                  </text>
                </g>

                {/* Callout E: Spine & Musculoskeletal -> Lower Right Floating Tag */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedRegionId('musculoskeletal')}
                >
                  <circle cx="170" cy="240" r="3.5" fill="#64748b" stroke="#ffffff" strokeWidth="1.5" />
                  <polyline
                    points="170,240 220,240 262,255"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth={selectedRegionId === 'musculoskeletal' ? '2' : '1.2'}
                  />
                  <circle cx="262" cy="255" r="3" fill="#64748b" />
                  <rect x="265" y="242" width="72" height="24" rx="5" fill="#ffffff" stroke="#64748b" strokeWidth="1.2" />
                  <text x="301" y="254" textAnchor="middle" fill="#0f172a" fontSize="7" fontFamily="monospace" fontWeight="bold">
                    SPINAL AXIS
                  </text>
                  <text x="301" y="262" textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="monospace" fontWeight="bold">
                    +4.2 cm DECOMP
                  </text>
                </g>

              </g>

            </svg>
          </div>

          {/* Bottom Interactive Quick-Region Selector Strip */}
          <div className="w-full mt-2 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 z-10 text-xs">
            <span className="text-[11px] font-mono text-slate-500 font-bold">INSPECT REGION:</span>
            <div className="flex flex-wrap gap-1.5">
              {regionsData.map(reg => {
                const status = getZoneStatus(reg.id);
                const isSelected = selectedRegionId === reg.id;
                return (
                  <button
                    key={reg.id}
                    onClick={() => setSelectedRegionId(reg.id)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 text-sky-900 border border-sky-300 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{reg.name.split(' ')[0]}</span>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: status.color }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Flank: Detailed Diagnostics & Clinical Countermeasures Drawer */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Organ Systems Health Readiness Matrix (Inspired by Image 1) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="text-xs font-mono font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wide flex items-center justify-between">
              <span>System Health Matrix</span>
              <span className="text-[10px] text-emerald-700 font-bold">OVERALL: 89%</span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              {[
                { name: 'Cardiovascular', status: cardioStatus.status === 'act' ? 'ACT REQUIRED' : 'HEALTHY', color: cardioStatus.color, badge: cardioStatus.border },
                { name: 'Respiratory', status: 'HEALTHY', color: '#0284c7', badge: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
                { name: 'Gastrointestinal', status: digestiveStatus.status === 'watch' ? 'WATCH / PRODROME' : 'HEALTHY', color: digestiveStatus.color, badge: digestiveStatus.border },
                { name: 'Central Nervous', status: 'HEALTHY', color: '#0284c7', badge: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
                { name: 'Musculoskeletal', status: 'ARED STABLE', color: '#64748b', badge: 'bg-slate-50 text-slate-700 border-slate-200' },
                { name: 'Immune & Radiation', status: 'MONITORING', color: '#0284c7', badge: 'bg-sky-50 text-sky-700 border-sky-200' }
              ].map((sys, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sys.color }}></span>
                    <span className="text-slate-700 font-medium">{sys.name}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${sys.badge}`}>
                    {sys.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Region Drawer: Full Clinical Telemetry & Autonomous Action Prompts */}
          <RegionDrawer
            region={selectedRegion}
            astronaut={astronaut}
            onClose={() => setSelectedRegionId('cardio')}
            onLaunchCare={onLaunchCare}
            onLaunchRetrace={onLaunchRetrace}
          />

        </div>

      </div>

    </div>
  );
}
