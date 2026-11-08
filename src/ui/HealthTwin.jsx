import React, { useState } from 'react';
import regionsData from '../content/regions.json';
import RegionDrawer from './RegionDrawer.jsx';
import { User, Activity, AlertCircle, Shield, CheckCircle2, Crosshair } from 'lucide-react';
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
        fill: '#fee2e2',
        stroke: '#dc2626',
        badge: 'ACT'
      };
    }
    if (regionId === 'digestive' && (symptoms.includes('nausea') || symptoms.includes('vomiting'))) {
      return {
        status: 'watch',
        fill: '#fef3c7',
        stroke: '#d97706',
        badge: 'WATCH'
      };
    }
    return {
      status: 'nominal',
      fill: selectedRegionId === regionId ? '#e0f2fe' : '#f8fafc',
      stroke: selectedRegionId === regionId ? '#0284c7' : '#94a3b8',
      badge: 'NOMINAL'
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Top Telemetry Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-700">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Digital Health Twin: {astronaut.name}
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                CALLSIGN: {astronaut.callsign}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                DAY {astronaut.flightDay}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive anatomical telemetry map correlating astronaut symptoms with NASA Human Research Program hazards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500">Absorbed Dose: </span>
            <strong className="text-slate-900 font-bold">{astronaut.baseline.radiationDose.value} mGy</strong>
          </div>
          <ProvenanceBadge provenance="REAL" sourceId="radlab-iss-2025" />
        </div>
      </div>

      {/* Main Grid: Anatomical Hologram + Diagnostics Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Clean Vector Anatomical Silhouette */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center relative clinical-grid shadow-xs">
          
          <div className="w-full flex items-center justify-between mb-4 text-xs font-mono text-slate-500 border-b border-slate-100 pb-2.5 font-bold">
            <div className="flex items-center gap-1.5 text-sky-700">
              <Crosshair className="w-3.5 h-3.5 text-sky-600" />
              <span>BIO-SCAN BLUEPRINT // 0142-EIMO</span>
            </div>
            <span className="text-slate-400 font-normal">Click any zone to inspect</span>
          </div>

          {/* SVG Vector Anatomical Model */}
          <div className="relative w-80 h-[500px] flex items-center justify-center">
            
            {/* Background circular medical reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
              <div className="w-64 h-64 rounded-full border border-sky-300 border-dashed"></div>
              <div className="w-48 h-48 rounded-full border border-slate-200 absolute"></div>
            </div>

            <svg
              viewBox="0 0 240 440"
              className="w-full h-full filter drop-shadow-sm focus:outline-none"
              role="region"
              aria-label="Interactive Anatomical Health Twin"
            >
              <defs>
                <linearGradient id="bodyLightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#f1f5f9" />
                </linearGradient>
              </defs>

              {/* Base Human Contour Silhouette */}
              <path
                d="M120,25 C132,25 142,36 142,50 C142,62 134,71 126,75 L126,82 L158,95 L178,160 L166,165 L144,115 L144,195 L140,320 L150,390 L132,392 L124,310 L120,240 L116,310 L108,392 L90,390 L100,320 L96,195 L96,115 L74,165 L62,160 L82,95 L114,82 L114,75 C106,71 98,62 98,50 C98,36 108,25 120,25 Z"
                fill="url(#bodyLightGradient)"
                stroke="#cbd5e1"
                strokeWidth="1.5"
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
                  fill={selectedRegionId === 'head-brain' ? '#e0f2fe' : '#ffffff'}
                  stroke={selectedRegionId === 'head-brain' ? '#0284c7' : '#94a3b8'}
                  strokeWidth={selectedRegionId === 'head-brain' ? '2.5' : '1.5'}
                />
                <path d="M110,48 Q120,40 130,48 Q120,56 110,48" fill="none" stroke="#0284c7" strokeWidth="1.5" />
                <circle cx="120" cy="50" r="3" fill="#0284c7" />
                <text x="120" y="64" textAnchor="middle" fill="#334155" fontSize="7" fontFamily="monospace" fontWeight="bold">
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
                  fill={selectedRegionId === 'eyes' ? '#bae6fd' : '#f8fafc'}
                  stroke={selectedRegionId === 'eyes' ? '#0284c7' : '#94a3b8'}
                  strokeWidth="1.5"
                />
                <circle cx="112" cy="47.5" r="2.5" fill="#0284c7" />
                <circle cx="128" cy="47.5" r="2.5" fill="#0284c7" />
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
                  fill={getZoneStatus('cardio').fill}
                  stroke={getZoneStatus('cardio').stroke}
                  strokeWidth={selectedRegionId === 'cardio' || getZoneStatus('cardio').status === 'act' ? '2.5' : '1.5'}
                  className={getZoneStatus('cardio').status === 'act' ? 'animate-pulse' : ''}
                />
                <g className={getZoneStatus('cardio').status === 'act' ? 'animate-heartbeat' : ''} style={{ transformOrigin: '120px 116px' }}>
                  <path
                    d="M120,110 C120,105 113,103 110,107 C106,112 120,123 120,123 C120,123 134,112 130,107 C127,103 120,105 120,110 Z"
                    fill={getZoneStatus('cardio').status === 'act' ? '#dc2626' : '#f43f5e'}
                  />
                </g>
                <text x="120" y="136" textAnchor="middle" fill="#0f172a" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  HEART
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
                <path d="M84,102 Q74,122 86,138 Z" fill={selectedRegionId === 'respiratory' ? '#e0f2fe' : '#ffffff'} stroke={selectedRegionId === 'respiratory' ? '#0284c7' : '#94a3b8'} strokeWidth="1.5" />
                <path d="M156,102 Q166,122 154,138 Z" fill={selectedRegionId === 'respiratory' ? '#e0f2fe' : '#ffffff'} stroke={selectedRegionId === 'respiratory' ? '#0284c7' : '#94a3b8'} strokeWidth="1.5" />
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
                  fill={getZoneStatus('digestive').fill}
                  stroke={getZoneStatus('digestive').stroke}
                  strokeWidth={selectedRegionId === 'digestive' || getZoneStatus('digestive').status === 'watch' ? '2.5' : '1.5'}
                  className={getZoneStatus('digestive').status === 'watch' ? 'animate-pulse' : ''}
                />
                <circle cx="120" cy="168" r="6" fill="#f59e0b" opacity="0.9" />
                <text x="120" y="184" textAnchor="middle" fill="#0f172a" fontSize="8" fontFamily="monospace" fontWeight="bold">
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
                <line x1="120" y1="84" x2="120" y2="195" stroke="#0284c7" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="112" y1="205" x2="108" y2="350" stroke={selectedRegionId === 'musculoskeletal' ? '#0284c7' : '#94a3b8'} strokeWidth="2.5" />
                <line x1="128" y1="205" x2="132" y2="350" stroke={selectedRegionId === 'musculoskeletal' ? '#0284c7' : '#94a3b8'} strokeWidth="2.5" />
                <text x="120" y="270" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="monospace">
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
                  stroke={selectedRegionId === 'immune-skin' ? '#0284c7' : '#e2e8f0'}
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                />
                <text x="120" y="425" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold">
                  IONIZING FIELD // {astronaut.baseline.radiationDose.value} mGy
                </text>
              </g>
            </svg>
          </div>

          {/* Bottom Region Quick Picker Strip */}
          <div className="w-full mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {regionsData.map((reg) => {
              const status = getZoneStatus(reg.id);
              const isSelected = selectedRegionId === reg.id;
              return (
                <button
                  key={reg.id}
                  onClick={() => setSelectedRegionId(reg.id)}
                  className={`p-2.5 rounded-lg text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 text-sky-900 border border-sky-300 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span className="truncate">{reg.name.split(' ')[0]}</span>
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    status.status === 'act'
                      ? 'bg-rose-500 animate-ping'
                      : status.status === 'watch'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
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
