import React, { useState } from 'react';
import kitData from '../content/kit.json';
import ProvenanceBadge from './ProvenanceBadge.jsx';
import { Box, Search, AlertTriangle, ShieldCheck, Pill } from 'lucide-react';

export default function MedicalKit() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(kitData.map(k => k.category.split('/')[0].trim()))];

  const filteredItems = kitData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.cautions.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category.startsWith(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-5 rounded-2xl glass-panel shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Onboard Medical Kit Inventory</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 font-bold">
                SUPPLY-AWARE CONSTRAINTS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Validated exploration pack based on NASA Human-System Standard 3001 & CDC clinical emergency reserves.
            </p>
          </div>
        </div>

        <ProvenanceBadge provenance="PUBLISHED" sourceId="nasa-std-3001" />
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl glass-panel shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search supplies, medications, cautions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-sans transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Supplies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-2xl glass-panel shadow-xl flex flex-col justify-between space-y-3 hover:border-cyan-500/50 transition-all"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{item.name}</h4>
                </div>
                <ProvenanceBadge provenance={item.provenance} sourceId={item.source} compact />
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Current Stock:</span>
                <span className="text-white font-bold px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800">
                  {item.quantity} {item.unit}
                </span>
              </div>

              {item.cautions && (
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300 flex items-start gap-1.5 leading-relaxed">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{item.cautions}</span>
                </div>
              )}
            </div>

            <div className="pt-2.5 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>Item ID: {item.id}</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Inspected & Verified
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
