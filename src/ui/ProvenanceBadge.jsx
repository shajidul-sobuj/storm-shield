import React, { useState } from 'react';
import { ShieldCheck, BookOpen, Database, HelpCircle } from 'lucide-react';
import sources from '../content/sources.json';

export default function ProvenanceBadge({ provenance = 'ANCHORED', sourceId, compact = false }) {
  const [open, setOpen] = useState(false);
  const source = sources.find(s => s.id === sourceId);

  const configs = {
    REAL: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
      icon: Database,
      label: 'REAL',
      desc: 'Measured scientific spaceflight telemetry (NASA/NOAA)'
    },
    PUBLISHED: {
      bg: 'bg-sky-50 text-sky-800 border-sky-300 font-semibold',
      icon: BookOpen,
      label: 'PUBLISHED',
      desc: 'Peer-reviewed clinical & emergency standard (CDC/NASA-STD)'
    },
    ANCHORED: {
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-300 font-semibold',
      icon: ShieldCheck,
      label: 'ANCHORED',
      desc: 'Synthetic astronaut metric strictly bounded inside cited human flight ranges'
    },
    ILLUSTRATIVE: {
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
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
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[11px] ${current.bg} hover:shadow-sm transition-all cursor-pointer`}
        title={`Provenance: ${provenance} - Click to inspect source`}
      >
        <Icon className="w-3 h-3 shrink-0" />
        <span>{compact ? provenance[0] : current.label}</span>
      </button>

      {open && (
        <div className="absolute z-50 bottom-full left-0 mb-1.5 w-64 p-3 rounded-lg bg-white border border-slate-200 shadow-xl text-slate-800 text-xs font-sans">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <span className={`font-bold text-xs ${current.bg.split(' ')[1]}`}>{current.label} DATA</span>
            <span className="text-[10px] text-slate-500 uppercase font-mono">{source?.license || 'Open'}</span>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-600 leading-relaxed">{current.desc}</p>
          {source && (
            <div className="mt-2 pt-1.5 border-t border-slate-100">
              <div className="text-[10px] text-slate-400 font-medium">Source Document:</div>
              <div className="font-semibold text-slate-900 truncate">{source.title}</div>
              <div className="text-[10px] text-sky-700">{source.publisher}</div>
              <div className="mt-1 text-[10px] text-slate-500 font-mono">Verified by: {source.checkedBy}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
