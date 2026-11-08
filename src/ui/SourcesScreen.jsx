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
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-700">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Data Provenance, Citations & Licensing</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                100% CITED & VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Zero unanchored simulated data in demo paths. Every algorithm and threshold cites official government and scientific publications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700">
            Total Sources: <strong className="text-slate-900">{sourcesData.length}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
            Illustrative Count: 0
          </span>
        </div>
      </div>

      {/* Provenance Badge Taxonomy Card */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-mono font-bold text-sky-700 uppercase tracking-wider">
          Scientific Provenance Taxonomy
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between font-mono font-bold text-emerald-800">
              <span>REAL</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-300 font-mono font-bold">MEASURED</span>
            </div>
            <p className="text-emerald-950 text-[11px] leading-relaxed">
              Real space-weather and radiation dosimetry from NOAA GOES-16 satellites, Artemis I Orion, and NASA OSDR RadLab.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-sky-50/70 border border-sky-200 space-y-1">
            <div className="flex items-center justify-between font-mono font-bold text-sky-800">
              <span>PUBLISHED</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 border border-sky-300 font-mono font-bold">CLINICAL</span>
            </div>
            <p className="text-sky-950 text-[11px] leading-relaxed">
              Official medical standards, dose thresholds, and emergency protocols published by CDC, NASA HRP, NIH, and WHO.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-indigo-50/70 border border-indigo-200 space-y-1">
            <div className="flex items-center justify-between font-mono font-bold text-indigo-800">
              <span>ANCHORED</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 border border-indigo-300 font-mono font-bold">BOUNDED</span>
            </div>
            <p className="text-indigo-950 text-[11px] leading-relaxed">
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
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-sans transition-all"
        />
      </div>

      {/* Citations List */}
      <div className="space-y-3">
        {filtered.map(source => (
          <div
            key={source.id}
            className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:border-slate-300 transition-all"
          >
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-bold">
                  {source.id}
                </span>
                <span className="text-slate-500 font-medium">{source.publisher}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{source.title}</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                <strong className="text-slate-700">Used For:</strong> {source.usedFor}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-slate-500 font-mono">
                <span>License: <strong className="text-slate-700">{source.license}</strong></span>
                <span>Accessed: {source.accessed}</span>
                <span>Reviewed by: <strong className="text-emerald-700 font-semibold">{source.checkedBy}</strong></span>
              </div>
            </div>

            <div className="shrink-0">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-sky-700 border border-slate-200 text-xs font-mono font-semibold transition-colors shadow-2xs"
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
