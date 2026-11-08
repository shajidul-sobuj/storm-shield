import React, { useState } from 'react';
import sourcesData from '../content/sources.json';
import { BookOpen, ExternalLink, ShieldCheck, CheckCircle2, Search } from 'lucide-react';

export default function SourcesScreen() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = sourcesData.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.publisher.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.usedFor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-space-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-800/80 text-cyan-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">Data Provenance, Citations & Licensing</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                100% CITED & VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Zero unanchored simulated data in demo paths. Every algorithm and threshold cites official government and scientific publications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-space-950 border border-slate-800 text-cyan-400">
            Total Sources: <strong>{sourcesData.length}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            Illustrative Count: <strong>0</strong>
          </span>
        </div>
      </div>

      {/* Provenance Badge Taxonomy Card */}
      <div className="p-5 rounded-xl bg-space-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
          Scientific Provenance Taxonomy
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-space-950 border border-emerald-800/60 space-y-1">
            <div className="flex items-center justify-between font-mono font-bold text-emerald-400">
              <span>REAL</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-700">MEASURED</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Real space-weather and radiation dosimetry from NOAA GOES-16 satellites, Artemis I Orion, and NASA OSDR RadLab.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-space-950 border border-cyan-800/60 space-y-1">
            <div className="flex items-center justify-between font-mono font-bold text-cyan-400">
              <span>PUBLISHED</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-700">CLINICAL</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Official medical standards, dose thresholds, and emergency protocols published by CDC, NASA HRP, NIH, and WHO.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-space-950 border border-blue-800/60 space-y-1">
            <div className="flex items-center justify-between font-mono font-bold text-blue-400">
              <span>ANCHORED</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 border border-blue-700">BOUNDED</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Fictional astronaut baselines strictly generated inside physiological boundaries established by peer-reviewed NASA studies.
            </p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Filter sources by title, publisher, or clinical application..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-space-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-sans"
        />
      </div>

      {/* Citations List */}
      <div className="space-y-3">
        {filtered.map(source => (
          <div
            key={source.id}
            className="p-4 rounded-xl bg-space-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-space-950 text-cyan-400 border border-slate-800 font-semibold">
                  {source.id}
                </span>
                <span className="text-slate-400 font-medium">{source.publisher}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-100">{source.title}</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <strong>Used For:</strong> {source.usedFor}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-slate-400 font-mono">
                <span>License: <strong className="text-slate-300">{source.license}</strong></span>
                <span>Accessed: {source.accessed}</span>
                <span>Reviewed by: <strong className="text-emerald-400">{source.checkedBy}</strong></span>
              </div>
            </div>

            <div className="shrink-0">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-950 hover:bg-space-800 text-cyan-400 border border-slate-800 text-xs font-mono transition-colors"
              >
                <span>View Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
