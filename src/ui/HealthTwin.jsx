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

  // Organ target coordinates mapped to the 896 x 1200 image space
  const organCoords = {
    'head-brain': { x: 448, y: 120, side: 'right', name: 'Cranial Vault & Brain', metric: 'ICP: 14 mmHg (Nominal)', desc: 'Intracranial pressure & cerebral perfusion' },
    'eyes': { x: 448, y: 150, side: 'right', name: 'Optic Disc & SANS', metric: 'Grade 0 (Clear)', desc: 'Posterior globe flattening check' },
    'cardio': { x: 454, y: 310, side: 'left', name: 'Heart & Great Vessels', metric: `${astronaut.current?.hr?.value || 104} bpm · ${astronaut.current?.bp?.systolic || 148}/${astronaut.current?.bp?.diastolic || 96} mmHg`, desc: 'Tachycardia & elevated pressure alert' },
    'respiratory': { x: 400, y: 310, side: 'left', name: 'Pulmonary Lungs', metric: 'SpO2 98.5% · 16 rpm', desc: 'Bilateral alveolar ventilation clear' },
    'digestive': { x: 448, y: 480, side: 'left', name: 'GI Tract & Prodrome', metric: 'Nausea Watch (Post-Storm)', desc: 'Acute radiation prodrome monitoring' },
    'musculoskeletal': { x: 448, y: 400, side: 'right', name: 'Spinal Axis & Bones', metric: '+4.2 cm Decompression', desc: 'Microgravity vertebral elongation' }
  };

  const activeOrgan = organCoords[selectedRegionId] || organCoords['cardio'];
  const activeStatus = getZoneStatus(selectedRegionId);

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

      {/* Main 3-Column Studio Layout (Matching Image 1, 4 & 5) */}
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
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 relative flex flex-col justify-between clinical-grid shadow-xs min-h-[660px] overflow-hidden">
          
          {/* Top HUD Overlay Coordinates */}
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-slate-100 pb-2 z-20">
            <div className="flex items-center gap-1.5 text-sky-700 font-bold">
              <Crosshair className="w-4 h-4 text-sky-600 animate-spin" style={{ animationDuration: '20s' }} />
              <span>BIO-SCAN // 3D ANATOMICAL BLUEPRINT</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                VIEW: {viewAngle.toUpperCase()}
              </span>
              <span className="text-emerald-700 font-bold">● ACTIVE SCAN</span>
            </div>
          </div>

          {/* Center Stage with exact 896/1200 Aspect Ratio matching image */}
          <div className="relative w-full flex-1 flex items-center justify-center my-2 select-none">
            
            {/* Holographic Vertical Scanning Laser Line */}
            <div className="absolute inset-x-8 top-2 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-scan-beam pointer-events-none opacity-40 z-20"></div>

            {/* Exactly Sized Container maintaining 896/1200 aspect ratio */}
            <div 
              className="relative w-auto h-[540px] aspect-[896/1200] max-w-full transition-transform duration-500 ease-out"
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
                className="w-full h-full object-contain filter drop-shadow-md pointer-events-none select-none"
              />

              {/* Exact-Pixel Coordinate SVG Overlay on 896 x 1200 Canvas */}
              <svg
                viewBox="0 0 896 1200"
                className="absolute inset-0 w-full h-full z-10 pointer-events-auto"
              >
                {/* 1. Hotspot Pins directly at verified organ coordinates */}
                {Object.entries(organCoords).map(([id, organ]) => {
                  const status = getZoneStatus(id);
                  const isSelected = selectedRegionId === id;
                  const isHovered = hoveredRegionId === id;

                  return (
                    <g
                      key={id}
                      className="cursor-pointer group"
                      onClick={() => setSelectedRegionId(id)}
                      onMouseEnter={() => setHoveredRegionId(id)}
                      onMouseLeave={() => setHoveredRegionId(null)}
                    >
                      {/* Pulsing Beacon Ring for Selected or Alert Organs */}
                      {(isSelected || status.status === 'act') && (
                        <circle
                          cx={organ.x}
                          cy={organ.y}
                          r={status.status === 'act' ? '28' : '20'}
                          fill={status.color}
                          opacity="0.35"
                          className="animate-ping"
                          style={{ transformOrigin: `${organ.x}px ${organ.y}px` }}
                        />
                      )}
                      
                      {/* Main Hotspot Dot */}
                      <circle
                        cx={organ.x}
                        cy={organ.y}
                        r={isSelected ? '9' : isHovered ? '8' : '6.5'}
                        fill={status.color}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                        className="transition-all"
                      />
                    </g>
                  );
                })}

                {/* 2. Active Focused Callout Line (Matching Image 4 "HealthCo") */}
                {activeOrgan && (
                  <g className="transition-all duration-300">
                    {activeOrgan.side === 'left' ? (
                      // Left-side Leader Line
                      <path
                        d={`M ${activeOrgan.x},${activeOrgan.y} C ${activeOrgan.x - 120},${activeOrgan.y} 220,${Math.min(activeOrgan.y, 420)} 80,${Math.min(activeOrgan.y, 420)}`}
                        fill="none"
                        stroke={activeStatus.color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="filter drop-shadow-xs"
                      />
                    ) : (
                      // Right-side Leader Line
                      <path
                        d={`M ${activeOrgan.x},${activeOrgan.y} C ${activeOrgan.x + 120},${activeOrgan.y} 680,${Math.min(activeOrgan.y, 350)} 816,${Math.min(activeOrgan.y, 350)}`}
                        fill="none"
                        stroke={activeStatus.color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="filter drop-shadow-xs"
                      />
                    )}

                    {/* Anchor Dot at end of line */}
                    <circle
                      cx={activeOrgan.side === 'left' ? 80 : 816}
                      cy={Math.min(activeOrgan.y, activeOrgan.side === 'left' ? 420 : 350)}
                      r="4.5"
                      fill={activeStatus.color}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </g>
                )}
              </svg>

              {/* 3. Floating Clinical Callout Card (HTML Overlay with Crisp Typography - Image 4) */}
              {activeOrgan && (
                <div 
                  className={`absolute z-20 pointer-events-auto transition-all duration-300 ${
                    activeOrgan.side === 'left' ? 'left-2' : 'right-2'
                  }`}
                  style={{
                    top: `${Math.min((activeOrgan.y / 1200) * 100 - 4, 45)}%`
                  }}
                >
                  <div className={`p-3 rounded-xl bg-white/95 backdrop-blur-md border shadow-lg max-w-[210px] space-y-1.5 ${
                    activeStatus.status === 'act' 
                      ? 'border-rose-400 ring-2 ring-rose-400/20' 
                      : activeStatus.status === 'watch'
                      ? 'border-amber-400 ring-2 ring-amber-400/20'
                      : 'border-sky-300'
                  }`}>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                        {activeOrgan.name}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${activeStatus.border}`}>
                        {activeStatus.label}
                      </span>
                    </div>

                    <div className="font-mono text-xs font-bold text-slate-900">
                      {activeOrgan.metric}
                    </div>

                    <div className="text-[10px] text-slate-600 leading-tight">
                      {activeOrgan.desc}
                    </div>

                    <button
                      onClick={() => onLaunchCare(selectedRegionId === 'cardio' ? 'cardio-scare' : 'post-storm-illness')}
                      className={`w-full mt-1 py-1 rounded text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        activeStatus.status === 'act'
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-sky-600 hover:bg-sky-700 text-white'
                      }`}
                    >
                      <span>Care Protocol</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Bottom BMI & Physiological Telemetry Slider (Directly matching Image 4 "HealthCo") */}
          <div className="w-full mt-2 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 z-10 text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="p-1 px-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] mr-1">MASS:</span>
                <strong className="text-slate-900 font-bold">76 kg</strong>
              </div>
              <div className="p-1 px-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] mr-1">HEIGHT:</span>
                <strong className="text-slate-900 font-bold">182 cm (+4.2cm)</strong>
              </div>
              <div className="p-1 px-2.5 rounded-lg bg-slate-50 border border-slate-200 hidden sm:block">
                <span className="text-slate-500 text-[10px] mr-1">BMI:</span>
                <strong className="text-emerald-700 font-bold">22.9</strong>
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
