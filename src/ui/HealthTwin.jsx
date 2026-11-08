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
  Moon
} from 'lucide-react';

export default function HealthTwin({ astronaut, onLaunchCare, onLaunchRetrace }) {
  const [selectedRegionId, setSelectedRegionId] = useState('cardio');
  const [viewAngle, setViewAngle] = useState('front'); // 'front', 'profile', 'dorsal', 'orbit'
  const [activeLayer, setActiveLayer] = useState('all'); // 'all', 'cardio-lungs', 'neuro', 'digestive', 'skeletal', 'radiation'
  const [hoveredRegionId, setHoveredRegionId] = useState(null);
  const [orbitAngle, setOrbitAngle] = useState(0);

  const selectedRegion = regionsData.find(r => r.id === selectedRegionId) || regionsData[0];
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

  // Zone status evaluation
  const getZoneStatus = (regionId) => {
    if (regionId === 'cardio' && symptoms.includes('chest-discomfort')) {
      return {
        status: 'act',
        color: '#ef4444',
        label: 'ACT REQUIRED',
        border: 'border-rose-400 bg-rose-50 text-rose-800'
      };
    }
    if (regionId === 'digestive' && (symptoms.includes('nausea') || symptoms.includes('vomiting'))) {
      return {
        status: 'watch',
        color: '#f59e0b',
        label: 'WATCH',
        border: 'border-amber-400 bg-amber-50 text-amber-800'
      };
    }
    return {
      status: 'nominal',
      color: '#0284c7',
      label: 'NOMINAL',
      border: 'border-sky-300 bg-sky-50 text-sky-800'
    };
  };

  const cardioStatus = getZoneStatus('cardio');
  const digestiveStatus = getZoneStatus('digestive');

  return (
    <div className="space-y-6">
      
      {/* Top Bio-Scan HUD Control Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 shadow-2xs">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                3D Digital Bio-Scan Blueprint // {astronaut.name}
              </h2>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                CALLSIGN: {astronaut.callsign}
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                MISSION DAY {astronaut.flightDay}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              High-resolution anatomical digital twin mapped to NASA Human Research Program deep-space health standards.
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
              title="Anterior (Frontal) 3D View"
            >
              Front 0°
            </button>
            <button
              onClick={() => setViewAngle('profile')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewAngle === 'profile' ? 'bg-white text-sky-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Lateral (Profile) 3D View"
            >
              Side 90°
            </button>
            <button
              onClick={() => setViewAngle('dorsal')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewAngle === 'dorsal' ? 'bg-white text-sky-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Posterior (Spinal) 3D View"
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
            <span className="text-slate-500">Absorbed Dose:</span>
            <strong className="text-slate-900 font-bold">{astronaut.baseline.radiationDose.value} mGy</strong>
          </div>
          <ProvenanceBadge provenance="REAL" sourceId="radlab-iss-2025" compact />
        </div>
      </div>

      {/* Layer Filter Selector Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-slate-500 font-bold text-[11px] uppercase mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-sky-600" />
          <span>Anatomical Layers:</span>
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

      {/* Main 3-Column Studio Layout (Directly matching Image 1, 4 & 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Flank: Vitals Telemetry & Health Metrics (Inspired by Image 1 & 4) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Real-Time Animated Lead II ECG Telemetry Card */}
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

            {/* Simulated Animated ECG Waveform */}
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

            {/* Heart Rate & BP Delta Grid */}
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

          {/* Core System Telemetry Stream (Matching Image 1 & 4) */}
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
                    <span className="text-[10px] text-slate-500 font-mono">Circadian Rhythm</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-900 text-sm">36.7 °C</span>
              </div>
            </div>
          </div>

          {/* NASA Spaceflight Health Metrics (Inspired by Image 1) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="text-xs font-mono font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wide flex items-center justify-between">
              <span>Spaceflight Health Metrics</span>
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
                  <span className="text-slate-600">Sleep Quality Index:</span>
                  <span className="font-bold text-emerald-700">85% Restful</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
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

        {/* Center Column: The 3D Anatomical Bio-Scan Hologram Stage (Matching Image 1, 3, 4 & 5) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 relative flex flex-col items-center justify-between clinical-grid shadow-xs min-h-[640px] overflow-hidden">
          
          {/* Top HUD Overlay Coordinates */}
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-slate-100 pb-2.5 z-10">
            <div className="flex items-center gap-1.5 text-sky-700 font-bold">
              <Crosshair className="w-4 h-4 text-sky-600 animate-spin" style={{ animationDuration: '20s' }} />
              <span>BIO-SCAN // 3D ANATOMICAL BLUEPRINT</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                PERSPECTIVE: {viewAngle.toUpperCase()}
              </span>
              <span className="text-emerald-700 font-bold">ACTIVE SCAN</span>
            </div>
          </div>

          {/* The 3D Anatomical Centerpiece Container */}
          <div className="relative w-full max-w-[420px] h-[520px] flex items-center justify-center my-1 select-none">
            
            {/* Holographic Vertical Scanning Laser Line */}
            <div className="absolute inset-x-4 top-4 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-scan-beam pointer-events-none opacity-50 z-20"></div>

            {/* High-Resolution 3D Rendered Translucent Anatomical Body Model */}
            <div
              className="relative w-full h-full flex items-center justify-center transition-transform duration-500 ease-out"
              style={{
                transform: viewAngle === 'profile' 
                  ? 'rotateY(42deg) scaleX(0.88)' 
                  : viewAngle === 'dorsal' 
                  ? 'scaleX(-1)' 
                  : viewAngle === 'orbit' 
                  ? `rotateY(${Math.sin(orbitAngle * Math.PI / 180) * 35}deg)` 
                  : 'none'
              }}
            >
              <img
                src={modelImg}
                alt="3D Anatomical Human Model"
                className="w-full h-full object-contain filter drop-shadow-lg pointer-events-none"
              />

              {/* Dynamic Holographic Overlay SVG: Interactive Callout Lines & Glowing Organ Hotspots (Matching Image 3 & 4) */}
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full z-10"
                preserveAspectRatio="none"
              >
                {/* 1. Cranial / Brain Hotspot & Callout (Top Right) */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedRegionId('head-brain')}
                  onMouseEnter={() => setHoveredRegionId('head-brain')}
                  onMouseLeave={() => setHoveredRegionId(null)}
                >
                  {/* Glowing hotspot dot */}
                  <circle cx="50" cy="10" r="3.5" fill="#38bdf8" opacity="0.3" className="animate-ping" style={{ transformOrigin: '50% 10%' }} />
                  <circle cx="50" cy="10" r="2" fill="#0284c7" stroke="#ffffff" strokeWidth="0.8" />
                  
                  {/* Sleek Curved Leader Line to Right */}
                  <path
                    d="M 50 10 Q 64 10 74 7 L 88 7"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="0.8"
                    strokeDasharray={selectedRegionId === 'head-brain' ? 'none' : '1.5 1'}
                  />
                  <circle cx="88" cy="7" r="1.2" fill="#0284c7" />
                  
                  {/* Floating Glass Tag Badge */}
                  <g transform="translate(68, 1)">
                    <rect width="30" height="9" rx="2" fill="#ffffff" stroke="#0284c7" strokeWidth="0.7" opacity="0.95" />
                    <text x="15" y="4.5" textAnchor="middle" fill="#0f172a" fontSize="2.8" fontFamily="monospace" fontWeight="bold">
                      CRANIAL VAULT
                    </text>
                    <text x="15" y="7.5" textAnchor="middle" fill="#0284c7" fontSize="2.2" fontFamily="monospace" fontWeight="bold">
                      ICP: 14 mmHg
                    </text>
                  </g>
                </g>

                {/* 2. Heart / Cardiovascular Hotspot & Callout (Left Side - Cardio Scare Alert!) */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedRegionId('cardio')}
                  onMouseEnter={() => setHoveredRegionId('cardio')}
                  onMouseLeave={() => setHoveredRegionId(null)}
                >
                  {/* Expanding Pulsing Beacon */}
                  <circle
                    cx="50.5"
                    cy="25.5"
                    r={cardioStatus.status === 'act' ? '6' : '3.5'}
                    fill={cardioStatus.color}
                    opacity="0.35"
                    className="animate-ping"
                    style={{ transformOrigin: '50.5% 25.5%' }}
                  />
                  <circle
                    cx="50.5"
                    cy="25.5"
                    r="2.5"
                    fill={cardioStatus.color}
                    stroke="#ffffff"
                    strokeWidth="0.9"
                  />
                  
                  {/* Sleek Curved Leader Line to Left */}
                  <path
                    d="M 50.5 25.5 Q 36 25.5 26 23 L 12 23"
                    fill="none"
                    stroke={cardioStatus.color}
                    strokeWidth={selectedRegionId === 'cardio' ? '1' : '0.8'}
                  />
                  <circle cx="12" cy="23" r="1.2" fill={cardioStatus.color} />

                  {/* Floating Action Badge */}
                  <g transform="translate(1, 17)">
                    <rect
                      width="31"
                      height="10.5"
                      rx="2"
                      fill="#ffffff"
                      stroke={cardioStatus.color}
                      strokeWidth="0.8"
                      opacity="0.95"
                    />
                    <text x="15.5" y="4.5" textAnchor="middle" fill="#0f172a" fontSize="2.8" fontFamily="monospace" fontWeight="bold">
                      HEART & VESSELS
                    </text>
                    <text x="15.5" y="8" textAnchor="middle" fill={cardioStatus.color} fontSize="2.4" fontFamily="monospace" fontWeight="bold">
                      {cardioStatus.label}
                    </text>
                  </g>
                </g>

                {/* 3. Lungs / Pulmonary Fields Hotspot & Callout (Right Side) */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedRegionId('respiratory')}
                  onMouseEnter={() => setHoveredRegionId('respiratory')}
                  onMouseLeave={() => setHoveredRegionId(null)}
                >
                  <circle cx="56" cy="25" r="2" fill="#0284c7" stroke="#ffffff" strokeWidth="0.7" />
                  
                  {/* Leader Line to Right */}
                  <path
                    d="M 56 25 Q 68 25 76 27 L 88 27"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="0.8"
                  />
                  <circle cx="88" cy="27" r="1.2" fill="#0284c7" />

                  <g transform="translate(68, 22)">
                    <rect width="30" height="9" rx="2" fill="#ffffff" stroke="#0284c7" strokeWidth="0.7" opacity="0.95" />
                    <text x="15" y="4.5" textAnchor="middle" fill="#0f172a" fontSize="2.8" fontFamily="monospace" fontWeight="bold">
                      PULMONARY TRACT
                    </text>
                    <text x="15" y="7.5" textAnchor="middle" fill="#0284c7" fontSize="2.2" fontFamily="monospace" fontWeight="bold">
                      SpO2 98.5%
                    </text>
                  </g>
                </g>

                {/* 4. Digestive & Intestines Hotspot & Callout (Left Side - Radiation Prodrome Risk) */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedRegionId('digestive')}
                  onMouseEnter={() => setHoveredRegionId('digestive')}
                  onMouseLeave={() => setHoveredRegionId(null)}
                >
                  {digestiveStatus.status === 'watch' && (
                    <circle cx="50" cy="38" r="5" fill="#f59e0b" opacity="0.3" className="animate-ping" style={{ transformOrigin: '50% 38%' }} />
                  )}
                  <circle cx="50" cy="38" r="2.4" fill={digestiveStatus.color} stroke="#ffffff" strokeWidth="0.8" />

                  {/* Leader Line to Left */}
                  <path
                    d="M 50 38 Q 36 38 26 39 L 12 39"
                    fill="none"
                    stroke={digestiveStatus.color}
                    strokeWidth="0.8"
                  />
                  <circle cx="12" cy="39" r="1.2" fill={digestiveStatus.color} />

                  <g transform="translate(1, 33)">
                    <rect width="31" height="10" rx="2" fill="#ffffff" stroke={digestiveStatus.color} strokeWidth="0.8" opacity="0.95" />
                    <text x="15.5" y="4.5" textAnchor="middle" fill="#0f172a" fontSize="2.8" fontFamily="monospace" fontWeight="bold">
                      GI / PRODROME
                    </text>
                    <text x="15.5" y="8" textAnchor="middle" fill={digestiveStatus.color} fontSize="2.3" fontFamily="monospace" fontWeight="bold">
                      {digestiveStatus.label}
                    </text>
                  </g>
                </g>

                {/* 5. Spine & Musculoskeletal Hotspot & Callout (Right Side) */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedRegionId('musculoskeletal')}
                  onMouseEnter={() => setHoveredRegionId('musculoskeletal')}
                  onMouseLeave={() => setHoveredRegionId(null)}
                >
                  <circle cx="50" cy="48" r="2" fill="#64748b" stroke="#ffffff" strokeWidth="0.8" />
                  
                  {/* Leader Line to Right */}
                  <path
                    d="M 50 48 Q 66 48 76 49 L 88 49"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="0.8"
                  />
                  <circle cx="88" cy="49" r="1.2" fill="#64748b" />

                  <g transform="translate(68, 44)">
                    <rect width="30" height="9" rx="2" fill="#ffffff" stroke="#64748b" strokeWidth="0.7" opacity="0.95" />
                    <text x="15" y="4.5" textAnchor="middle" fill="#0f172a" fontSize="2.8" fontFamily="monospace" fontWeight="bold">
                      SPINAL AXIS
                    </text>
                    <text x="15" y="7.5" textAnchor="middle" fill="#64748b" fontSize="2.2" fontFamily="monospace" fontWeight="bold">
                      +4.2 cm DECOMP
                    </text>
                  </g>
                </g>

                {/* 6. Radiation Heatmap Overlay (When Active) */}
                {activeLayer === 'radiation' && (
                  <g className="pointer-events-none">
                    <circle cx="50" cy="30" r="18" fill="#f59e0b" opacity="0.2" filter="blur(4px)" />
                    <circle cx="50" cy="30" r="10" fill="#ef4444" opacity="0.25" filter="blur(3px)" />
                  </g>
                )}

              </svg>
            </div>

          </div>

          {/* Bottom BMI & Physiological Telemetry Slider (Directly matching Image 4 "HealthCo") */}
          <div className="w-full mt-2 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 z-10 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="p-1.5 px-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] mr-1.5">MASS:</span>
                <strong className="text-slate-900 font-bold">76 kg</strong>
              </div>
              <div className="p-1.5 px-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] mr-1.5">HEIGHT:</span>
                <strong className="text-slate-900 font-bold">182 cm (+4.2cm in 0-g)</strong>
              </div>
              <div className="p-1.5 px-3 rounded-lg bg-slate-50 border border-slate-200 hidden sm:block">
                <span className="text-slate-500 text-[10px] mr-1.5">BMI:</span>
                <strong className="text-emerald-700 font-bold">22.9 (Optimal)</strong>
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
                    className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 text-sky-900 border border-sky-300 font-bold shadow-2xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
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

        {/* Right Flank: System Overview Matrix + Region Drawer (Matching Image 1 & 4) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Organ Systems Readiness Overview Matrix (Inspired by Image 1) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="text-xs font-mono font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wide flex items-center justify-between">
              <span>System Health Matrix</span>
              <span className="text-[10px] text-emerald-700 font-bold">WELLNESS: 87%</span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              {[
                { name: 'Cardiovascular', status: cardioStatus.status === 'act' ? 'ACT REQUIRED' : 'HEALTHY', color: cardioStatus.color, badge: cardioStatus.border },
                { name: 'Respiratory', status: 'HEALTHY', color: '#0284c7', badge: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
                { name: 'Gastrointestinal', status: digestiveStatus.status === 'watch' ? 'WATCH / PRODROME' : 'HEALTHY', color: digestiveStatus.color, badge: digestiveStatus.border },
                { name: 'Nervous System', status: 'HEALTHY', color: '#0284c7', badge: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
                { name: 'Musculoskeletal', status: 'ARED STABLE', color: '#64748b', badge: 'bg-slate-50 text-slate-700 border-slate-200' },
                { name: 'Immune & Radiation', status: 'MONITORING', color: '#0284c7', badge: 'bg-sky-50 text-sky-700 border-sky-200' }
              ].map((sys, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sys.color }}></span>
                    <span className="text-slate-700 font-medium text-[11px]">{sys.name}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${sys.badge}`}>
                    {sys.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Performance Circular Ring (Image 1) */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] font-mono">
                <span className="text-slate-500 block">CREW EFFICIENCY</span>
                <span className="text-xs font-bold text-slate-800">Operational Readiness</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="3.5"
                      strokeDasharray="87, 100"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-mono font-bold text-sky-700">87%</span>
                </div>
              </div>
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
