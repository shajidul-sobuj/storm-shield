import React, { useState } from 'react';
import { ShieldCheck, BookOpen, Database, HelpCircle } from 'lucide-react';
import sources from '../content/sources.json';

export default function ProvenanceBadge({ provenance = 'ANCHORED', sourceId, compact = false }) {
  const [open, setOpen] = useState(false);
  const source = sources.find(s => s.id === sourceId);

  const configs = {
    REAL: {
      bg: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-semibold',
      icon: Database,
      label: 'REAL',
      desc: 'Measured scientific spaceflight telemetry (NASA/NOAA)'
    },
    PUBLISHED: {
      bg: 'bg-sky-950/70 text-sky-300 border-sky-500/40 shadow-[0_0_10px_rgba(56,189,248,0.15)] font-semibold',
      icon: BookOpen,
      label: 'PUBLISHED',
      desc: 'Peer-reviewed clinical & emergency standard (CDC/NASA-STD)'
    },
    ANCHORED: {
      bg: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.15)] font-semibold',
      icon: ShieldCheck,
      label: 'ANCHORED',
      desc: 'Synthetic astronaut metric strictly bounded inside cited human flight ranges'
    },
    ILLUSTRATIVE: {
      bg: 'bg-amber-950/70 text-amber-300 border-amber-500/40',
      icon: HelpCircle,
      label: 'ILLUSTRATIVE',
      desc: 'Placeholder data'
    }
  };

  const current = configs[provenance] || configs.ANCHORED;
  const Icon = current.icon;

  return (
    <div className="relative inline-block text-xs font-mono">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[11px] ${current.bg} hover:scale-105 transition-all cursor-pointer`}
        title={`Provenance: ${provenance} - Click to inspect source`}
      >
        <Icon className="w-3 h-3 shrink-0" />
        <span>{compact ? provenance[0] : current.label}</span>
      </button>

      {open && (
        <div className="absolute z-50 bottom-full left-0 mb-1.5 w-68 p-3.5 rounded-xl bg-[#0b1120]/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl text-slate-200 text-xs font-sans">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/80">
            <span className={`font-bold text-xs ${current.bg.split(' ')[1]}`}>{current.label} DATA</span>
            <span className="text-[10px] text-slate-400 uppercase font-mono">{source?.license || 'Open'}</span>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-300 leading-relaxed">{current.desc}</p>
          {source && (
            <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono space-y-0.5">
              <div>Source: <span className="text-slate-200 font-semibold">{source.title}</span></div>
              <div className="text-slate-400">Pub: {source.publisher} ({source.year})</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
