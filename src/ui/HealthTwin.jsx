import React, { useState } from 'react';
import regionsData from '../content/regions.json';
import RegionDrawer from './RegionDrawer.jsx';
import { User, Activity, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';
import ProvenanceBadge from './ProvenanceBadge.jsx';

export default function HealthTwin({ astronaut, onLaunchCare, onLaunchRetrace }) {
  const [selectedRegionId, setSelectedRegionId] = useState('cardio');
  const selectedRegion = regionsData.find(r => r.id === selectedRegionId) || regionsData[0];

  const symptoms = astronaut.current?.symptoms || [];

  // Helper to determine status color for each zone
  const getZoneColor = (regionId) => {
    const isSelected = selectedRegionId === regionId;

    if (regionId === 'cardio' && symptoms.includes('chest-discomfort')) {
      return {
        fill: isSelected ? '#ef4444' : '#b91c1c',
        stroke: '#fca5a5',
        pulse: true,
        status: 'act'
      };
    }

    if (regionId === 'digestive' && (symptoms.includes('nausea') || symptoms.includes('vomiting'))) {
      return {
        fill: isSelected ? '#f59e0b' : '#b45309',
        stroke: '#fde68a',
        pulse: true,
        status: 'watch'
      };
    }

    if (isSelected) {
      return { fill: '#06b6d4', stroke: '#a5f3fc', pulse: false, status: 'nominal' };
    }

    return { fill: '#1e293b', stroke: '#334155', pulse: false, status: 'nominal' };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-space-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Health Twin: {astronaut.name}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-slate-700">
                Day {astronaut.flightDay}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive physiological digital twin with spaceflight hazard correlation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Cumulative Mission Dose:</span>
          <span className="font-bold text-cyan-400">{astronaut.baseline.radiationDose.value} mGy</span>
          <ProvenanceBadge provenance="REAL" sourceId="radlab-iss-2025" compact />
        </div>
      </div>

      {/* Grid: SVG Body on Left, Region Drawer / Hazard Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Interactive SVG Body */}
        <div className="lg:col-span-6 bg-space-900/90 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative cockpit-grid">
          
          <div className="w-full flex items-center justify-between mb-4 text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
            <span>ANATOMICAL TELEMETRY MODEL</span>
            <span className="text-cyan-400">Click a zone to inspect</span>
          </div>

          {/* SVG Vector Body */}
          <div className="relative w-72 h-[480px]">
            <svg
              viewBox="0 0 200 400"
              className="w-full h-full filter drop-shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            >
              {/* Head / Brain Zone */}
              <g
                id="zone-head"
                onClick={() => setSelectedRegionId('head-brain')}
                className="cursor-pointer transition-all hover:opacity-80"
              >
                <circle
                  cx="100"
                  cy="45"
                  r="24"
                  fill={getZoneColor('head-brain').fill}
                  stroke={getZoneColor('head-brain').stroke}
                  strokeWidth="2"
                  className={getZoneColor('head-brain').pulse ? 'animate-pulse' : ''}
                />
                <text x="100" y="48" textAnchor="middle" fill="#f8fafc" fontSize="8" fontFamily="sans-serif" fontWeight="bold">
                  HEAD
                </text>
              </g>

              {/* Eyes Zone */}
              <g
                id="zone-eyes"
                onClick={() => setSelectedRegionId('eyes')}
                className="cursor-pointer transition-all hover:opacity-80"
              >
                <rect
                  x="86"
                  y="38"
                  width="28"
                  height="10"
                  rx="4"
                  fill={getZoneColor('eyes').fill}
                  stroke={getZoneColor('eyes').stroke}
                  strokeWidth="1.5"
                />
                <text x="100" y="46" textAnchor="middle" fill="#e2e8f0" fontSize="6" fontFamily="sans-serif">
                  EYES
                </text>
              </g>

              {/* Neck Connector */}
              <rect x="94" y="69" width="12" height="12" fill="#1e293b" />

              {/* Chest / Cardio Zone */}
              <g
                id="zone-cardio"
                onClick={() => setSelectedRegionId('cardio')}
                className="cursor-pointer transition-all hover:opacity-80"
              >
                <path
                  d="M65,82 L135,82 L125,140 L75,140 Z"
                  fill={getZoneColor('cardio').fill}
                  stroke={getZoneColor('cardio').stroke}
                  strokeWidth="2"
                  className={getZoneColor('cardio').pulse ? 'animate-pulse' : ''}
                />
                <circle cx="92" cy="104" r="8" fill="#ef4444" opacity="0.8" />
                <text x="100" y="112" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="bold">
                  HEART
                </text>
              </g>

              {/* Lungs (flanking chest) */}
              <g
                id="zone-respiratory"
                onClick={() => setSelectedRegionId('respiratory')}
                className="cursor-pointer transition-all hover:opacity-80"
              >
                <path d="M70,88 Q60,110 72,130 Z" fill={getZoneColor('respiratory').fill} stroke={getZoneColor('respiratory').stroke} />
                <path d="M130,88 Q140,110 128,130 Z" fill={getZoneColor('respiratory').fill} stroke={getZoneColor('respiratory').stroke} />
              </g>

              {/* Abdomen / GI Zone */}
              <g
                id="zone-digestive"
                onClick={() => setSelectedRegionId('digestive')}
                className="cursor-pointer transition-all hover:opacity-80"
              >
                <path
                  d="M75,142 L125,142 L120,195 L80,195 Z"
                  fill={getZoneColor('digestive').fill}
                  stroke={getZoneColor('digestive').stroke}
                  strokeWidth="2"
                  className={getZoneColor('digestive').pulse ? 'animate-pulse' : ''}
                />
                <text x="100" y="172" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="bold">
                  GI / RECEPT
                </text>
              </g>

              {/* Arms */}
              <g
                id="zone-arms"
                onClick={() => setSelectedRegionId('musculoskeletal')}
                className="cursor-pointer transition-all hover:opacity-80"
              >
                <path d="M63,85 L35,170 L45,172 L70,105 Z" fill={getZoneColor('musculoskeletal').fill} stroke={getZoneColor('musculoskeletal').stroke} />
                <path d="M137,85 L165,170 L155,172 L130,105 Z" fill={getZoneColor('musculoskeletal').fill} stroke={getZoneColor('musculoskeletal').stroke} />
              </g>

              {/* Legs / Musculoskeletal */}
              <g
                id="zone-legs"
                onClick={() => setSelectedRegionId('musculoskeletal')}
                className="cursor-pointer transition-all hover:opacity-80"
              >
                <path d="M80,197 L75,340 L92,340 L97,197 Z" fill={getZoneColor('musculoskeletal').fill} stroke={getZoneColor('musculoskeletal').stroke} strokeWidth="1.5" />
                <path d="M120,197 L125,340 L108,340 L103,197 Z" fill={getZoneColor('musculoskeletal').fill} stroke={getZoneColor('musculoskeletal').stroke} strokeWidth="1.5" />
                <text x="100" y="270" textAnchor="middle" fill="#94a3b8" fontSize="8">
                  MUSCLE/BONE
                </text>
              </g>

              {/* Skin & Radiation Aura */}
              <g
                id="zone-skin"
                onClick={() => setSelectedRegionId('immune-skin')}
                className="cursor-pointer transition-all hover:opacity-80"
              >
                <rect x="25" y="20" width="150" height="350" rx="20" fill="none" stroke={selectedRegionId === 'immune-skin' ? '#06b6d4' : '#334155'} strokeDasharray="4 4" strokeWidth="1.5" />
                <text x="100" y="385" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="monospace">
                  RADIATION FIELD & DERMA
                </text>
              </g>
            </svg>
          </div>

          {/* Quick Zone Navigation Chips below */}
          <div className="w-full mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
            {regionsData.map((reg) => (
              <button
                key={reg.id}
                onClick={() => setSelectedRegionId(reg.id)}
                className={`p-1.5 rounded text-left truncate transition-colors cursor-pointer ${
                  selectedRegionId === reg.id
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-semibold'
                    : 'bg-space-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {reg.name.split(' ')[0]}
              </button>
            ))}
          </div>

        </div>

        {/* Right: Region Drawer */}
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
