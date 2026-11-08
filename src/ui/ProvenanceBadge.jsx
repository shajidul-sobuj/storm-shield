import React, { useState } from 'react';
import { ShieldCheck, BookOpen, Database, HelpCircle } from 'lucide-react';
import sources from '../content/sources.json';

export default function ProvenanceBadge({ provenance = 'ANCHORED', sourceId, compact = false }) {
  const [open, setOpen] = useState(false);
  const source = sources.find(s => s.id === sourceId);

  const configs = {
    REAL: {
      bg: 'bg-emerald-950/80 text-emerald-400 border-emerald-700/50',
      icon: Database,
      label: 'REAL',
      desc: 'Measured scientific/spaceflight telemetry (NASA/NOAA)'
    },
    PUBLISHED: {
      bg: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/50',
      icon: BookOpen,
      label: 'PUBLISHED',
      desc: 'Peer-reviewed clinical/standard reference (CDC/NASA-STD)'
    },
    ANCHORED: {
      bg: 'bg-blue-950/80 text-blue-400 border-blue-700/50',
      icon: ShieldCheck,
      label: 'ANCHORED',
      desc: 'Synthetic astronaut metric strictly bounded inside cited human flight ranges'
    },
    ILLUSTRATIVE: {
      bg: 'bg-amber-950/80 text-amber-400 border-amber-700/50',
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
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${current.bg} hover:brightness-125 transition-all cursor-pointer`}
        title={`Provenance: ${provenance} - Click to inspect source`}
      >
        <Icon className="w-3 h-3" />
        <span>{compact ? provenance[0] : current.label}</span>
      </button>

      {open && (
        <div className="absolute z-50 bottom-full left-0 mb-1.5 w-64 p-2.5 rounded-lg bg-space-900 border border-slate-700 shadow-2xl text-slate-200 text-xs backdrop-blur-md">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className={`font-semibold ${current.bg.split(' ')[1]}`}>{current.label} DATA</span>
            <span className="text-[10px] text-slate-400 uppercase font-mono">{source?.license || 'Open'}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">{current.desc}</p>
          {source && (
            <div className="mt-2 pt-1.5 border-t border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-sans font-medium">Source:</div>
              <div className="font-semibold text-slate-200 truncate">{source.title}</div>
              <div className="text-[10px] text-cyan-400">{source.publisher}</div>
              <div className="mt-1 text-[10px] text-slate-400 font-mono">Verified by: {source.checkedBy}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
