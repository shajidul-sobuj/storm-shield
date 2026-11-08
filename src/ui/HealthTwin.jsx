import React, { useState } from 'react';
import regionsData from '../content/regions.json';
import RegionDrawer from './RegionDrawer.jsx';
import { User, Activity, AlertCircle, Shield, CheckCircle2, Crosshair, Sparkles } from 'lucide-react';
import ProvenanceBadge from './ProvenanceBadge.jsx';

export default function HealthTwin({ astronaut, onLaunchCare, onLaunchRetrace }) {
  const [selectedRegionId, setSelectedRegionId] = useState('cardio');
  const selectedRegion = regionsData.find(r => r.id === selectedRegionId) || regionsData[0];

  const symptoms = astronaut.current?.symptoms || [];

  // Zone status evaluation
  const getZoneStatus = (regionId) => {
    if (regionId === 'cardio' && symptoms.includes('chest-discomfort')) {
      return {
        status: 'act',
        color: '#ef4444',
        glow: 'rgba(239, 68, 68, 0.6)',
        badge: 'ACT'
      };
    }
    if (regionId === 'digestive' && (symptoms.includes('nausea') || symptoms.includes('vomiting'))) {
      return {
        status: 'watch',
        color: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.5)',
        badge: 'WATCH'
      };
    }
    return {
      status: 'nominal',
      color: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.3)',
      badge: 'NOMINAL'
    };
  };

  const currentZoneStatus = getZoneStatus(selectedRegionId);

  return (
    <div className="space-y-6">
      
      {/* Top Telemetry Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-space-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-800/80 text-cyan-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                Digital Health Twin: {astronaut.name}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-950 text-cyan-300 border border-slate-700">
                CALLSIGN: {astronaut.callsign}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-950 text-slate-400 border border-slate-800">
                MISSION DAY {astronaut.flightDay}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive anatomical telemetry map correlating astronaut symptoms with NASA Human Research Program hazards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="p-2 rounded bg-space-950 border border-slate-800">
            <span className="text-slate-400">Absorbed Dose: </span>
            <strong className="text-cyan-400">{astronaut.baseline.radiationDose.value} mGy</strong>
          </div>
          <ProvenanceBadge provenance="REAL" sourceId="radlab-iss-2025" />
        </div>
      </div>

      {/* Main Grid: Anatomical Hologram + Diagnostics Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Futuristic Anatomical SVG Silhouette */}
        <div className="lg:col-span-6 bg-space-900/90 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative cockpit-grid overflow-hidden">
          
          {/* Subtle scanner header */}
          <div className="w-full flex items-center justify-between mb-4 text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Crosshair className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
              <span>BIO-SCAN // 0142-EIMO</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Select any zone to inspect</span>
          </div>

          {/* SVG Vector Hologram */}
          <div className="relative w-80 h-[500px] flex items-center justify-center">
            
            {/* Background circular radar reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-64 h-64 rounded-full border border-cyan-500/40 border-dashed animate-spin" style={{ animationDuration: '40s' }}></div>
              <div className="w-48 h-48 rounded-full border border-cyan-400/20 absolute"></div>
            </div>

            <svg
              viewBox="0 0 240 440"
              className="w-full h-full filter drop-shadow-[0_0_20px_rgba(6,182,212,0.15)] focus:outline-none"
              role="region"
              aria-label="Interactive Anatomical Health Twin"
            >
              <defs>
                <filter id="hudGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0b1329" />
                  <stop offset="100%" stopColor="#050a17" />
                </linearGradient>
              </defs>

              {/* Base Human Contour Silhouette (Microgravity Suit outline) */}
              <path
                d="M120,25 C132,25 142,36 142,50 C142,62 134,71 126,75 L126,82 L158,95 L178,160 L166,165 L144,115 L144,195 L140,320 L150,390 L132,392 L124,310 L120,240 L116,310 L108,392 L90,390 L100,320 L96,195 L96,115 L74,165 L62,160 L82,95 L114,82 L114,75 C106,71 98,62 98,50 C98,36 108,25 120,25 Z"
                fill="url(#bodyGradient)"
                stroke="#1e293b"
                strokeWidth="1.5"
                className="opacity-70"
              />

              {/* 1. Zone Head & Brain */}
              <g
                id="zone-head"
                tabIndex={0}
                role="button"
                aria-label="Inspect Head and Brain"
                onClick={() => setSelectedRegionId('head-brain')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedRegionId('head-brain'); }}
                className="cursor-pointer transition-transform hover:scale-105 focus:outline-none"
              >
                <circle
                  cx="120"
                  cy="50"
                  r="24"
                  fill={selectedRegionId === 'head-brain' ? '#083344' : '#09152a'}
                  stroke={selectedRegionId === 'head-brain' ? '#06b6d4' : '#334155'}
                  strokeWidth={selectedRegionId === 'head-brain' ? '2.5' : '1.5'}
                  filter={selectedRegionId === 'head-brain' ? 'url(#hudGlow)' : undefined}
                />
                {/* Neural brain wave vectors */}
                <path d="M110,48 Q120,40 130,48 Q120,56 110,48" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                <circle cx="120" cy="50" r="3" fill="#38bdf8" />
                <text x="120" y="64" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">
                  BRAIN
                </text>
              </g>

              {/* 2. Zone Eyes / Vision (SANS) */}
              <g
                id="zone-eyes"
                tabIndex={0}
                role="button"
                aria-label="Inspect Eyes and Vision"
                onClick={() => setSelectedRegionId('eyes')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedRegionId('eyes'); }}
                className="cursor-pointer transition-transform hover:scale-105 focus:outline-none"
              >
                <rect
                  x="104"
                  y="42"
                  width="32"
                  height="11"
                  rx="4"
                  fill={selectedRegionId === 'eyes' ? '#0c4a6e' : '#0f172a'}
                  stroke={selectedRegionId === 'eyes' ? '#38bdf8' : '#334155'}
                  strokeWidth="1.5"
                />
                <circle cx="112" cy="47.5" r="2.5" fill="#38bdf8" />
                <circle cx="128" cy="47.5" r="2.5" fill="#38bdf8" />
              </g>

              {/* 3. Zone Heart & Circulation (Cardio) */}
              <g
                id="zone-cardio"
                tabIndex={0}
                role="button"
                aria-label="Inspect Cardiovascular System"
                onClick={() => setSelectedRegionId('cardio')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedRegionId('cardio'); }}
                className="cursor-pointer transition-transform hover:scale-105 focus:outline-none"
              >
                <path
                  d="M96,96 L144,96 L138,142 L102,142 Z"
                  fill={getZoneStatus('cardio').status === 'act' ? '#450a0a' : selectedRegionId === 'cardio' ? '#083344' : '#09152a'}
                  stroke={getZoneStatus('cardio').status === 'act' ? '#ef4444' : selectedRegionId === 'cardio' ? '#06b6d4' : '#334155'}
                  strokeWidth={selectedRegionId === 'cardio' || getZoneStatus('cardio').status === 'act' ? '2.5' : '1.5'}
                  filter={getZoneStatus('cardio').status === 'act' ? 'url(#hudGlow)' : undefined}
                  className={getZoneStatus('cardio').status === 'act' ? 'animate-pulse' : ''}
                />
                {/* Heart Icon / Ventricle Graphic */}
                <g className={getZoneStatus('cardio').status === 'act' ? 'animate-heartbeat' : ''} style={{ transformOrigin: '120px 116px' }}>
                  <path
                    d="M120,110 C120,105 113,103 110,107 C106,112 120,123 120,123 C120,123 134,112 130,107 C127,103 120,105 120,110 Z"
                    fill={getZoneStatus('cardio').status === 'act' ? '#ef4444' : '#f43f5e'}
                  />
                </g>
                <text x="120" y="136" textAnchor="middle" fill="#f8fafc" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  CARDIO
                </text>
              </g>

              {/* 4. Zone Lungs / Respiratory */}
              <g
                id="zone-respiratory"
                tabIndex={0}
                role="button"
                aria-label="Inspect Respiratory System"
                onClick={() => setSelectedRegionId('respiratory')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedRegionId('respiratory'); }}
                className="cursor-pointer transition-transform hover:scale-105 focus:outline-none"
              >
                <path d="M84,102 Q74,122 86,138 Z" fill={selectedRegionId === 'respiratory' ? '#083344' : '#09152a'} stroke={selectedRegionId === 'respiratory' ? '#38bdf8' : '#334155'} strokeWidth="1.5" />
                <path d="M156,102 Q166,122 154,138 Z" fill={selectedRegionId === 'respiratory' ? '#083344' : '#09152a'} stroke={selectedRegionId === 'respiratory' ? '#38bdf8' : '#334155'} strokeWidth="1.5" />
              </g>

              {/* 5. Zone Abdomen / GI Tract */}
              <g
                id="zone-digestive"
                tabIndex={0}
                role="button"
                aria-label="Inspect Digestive System"
                onClick={() => setSelectedRegionId('digestive')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedRegionId('digestive'); }}
                className="cursor-pointer transition-transform hover:scale-105 focus:outline-none"
              >
                <path
                  d="M100,146 L140,146 L135,190 L105,190 Z"
                  fill={getZoneStatus('digestive').status === 'watch' ? '#451a03' : selectedRegionId === 'digestive' ? '#083344' : '#09152a'}
                  stroke={getZoneStatus('digestive').status === 'watch' ? '#f59e0b' : selectedRegionId === 'digestive' ? '#06b6d4' : '#334155'}
                  strokeWidth={selectedRegionId === 'digestive' || getZoneStatus('digestive').status === 'watch' ? '2.5' : '1.5'}
                  className={getZoneStatus('digestive').status === 'watch' ? 'animate-pulse' : ''}
                />
                <circle cx="120" cy="168" r="6" fill="#f59e0b" opacity="0.8" />
                <text x="120" y="184" textAnchor="middle" fill="#f8fafc" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  GI / RECEPT
                </text>
              </g>

              {/* 6. Zone Musculoskeletal / Spine & Bones */}
              <g
                id="zone-musculoskeletal"
                tabIndex={0}
                role="button"
                aria-label="Inspect Musculoskeletal System"
                onClick={() => setSelectedRegionId('musculoskeletal')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedRegionId('musculoskeletal'); }}
                className="cursor-pointer transition-transform hover:scale-105 focus:outline-none"
              >
                {/* Vertebral column */}
                <line x1="120" y1="84" x2="120" y2="195" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
                {/* Femoral & tibial bone paths */}
                <line x1="112" y1="205" x2="108" y2="350" stroke={selectedRegionId === 'musculoskeletal' ? '#06b6d4' : '#334155'} strokeWidth="2.5" />
                <line x1="128" y1="205" x2="132" y2="350" stroke={selectedRegionId === 'musculoskeletal' ? '#06b6d4' : '#334155'} strokeWidth="2.5" />
                <text x="120" y="270" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
                  BONE / SPINE
                </text>
              </g>

              {/* 7. Zone Immune & Skin / Cumulative Radiation Field */}
              <g
                id="zone-skin"
                tabIndex={0}
                role="button"
                aria-label="Inspect Skin and Radiation Dose"
                onClick={() => setSelectedRegionId('immune-skin')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedRegionId('immune-skin'); }}
                className="cursor-pointer transition-transform hover:scale-105 focus:outline-none"
              >
                <rect
                  x="48"
                  y="15"
                  width="144"
                  height="400"
                  rx="24"
                  fill="none"
                  stroke={selectedRegionId === 'immune-skin' ? '#06b6d4' : '#1e293b'}
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                />
                <text x="120" y="425" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="monospace">
                  IONIZING FIELD // {astronaut.baseline.radiationDose.value} mGy
                </text>
              </g>
            </svg>
          </div>

          {/* Bottom Region Quick Picker Strip */}
          <div className="w-full mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
            {regionsData.map((reg) => {
              const status = getZoneStatus(reg.id);
              const isSelected = selectedRegionId === reg.id;
              return (
                <button
                  key={reg.id}
                  onClick={() => setSelectedRegionId(reg.id)}
                  className={`p-2 rounded-lg text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950 text-cyan-200 border border-cyan-600 font-bold shadow-sm'
                      : 'bg-space-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span className="truncate">{reg.name.split(' ')[0]}</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    status.status === 'act'
                      ? 'bg-rose-500 animate-ping'
                      : status.status === 'watch'
                      ? 'bg-amber-400'
                      : 'bg-cyan-500'
                  }`} />
                </button>
              );
            })}
          </div>

        </div>

        {/* Right: Detailed Spaceflight Hazard & Telemetry Drawer */}
        <div className="lg:col-span-6">
          <RegionDrawer
            region={selectedRegion}
            astronaut={astronaut}
            onClose={() => setSelectedRegionId(null)}
            onLaunchCare={onLaunchCare}
            onLaunchRetrace={onLaunchRetrace}
          />
        </div>

      </div>

    </div>
  );
}
