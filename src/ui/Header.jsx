import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Radio, 
  Clock, 
  User, 
  AlertTriangle, 
  Zap, 
  HeartPulse, 
  Compass, 
  Box, 
  FileText, 
  BookOpen,
  Sparkles,
  Layers
} from 'lucide-react';

export default function Header({ 
  currentTab, 
  setCurrentTab, 
  crewList, 
  selectedCrewId, 
  setSelectedCrewId, 
  groundLink, 
  setGroundLink,
  stormStatus,
  onOpenStormModal,
  onTriggerDrill
}) {
  const selectedCrew = crewList.find(c => c.id === selectedCrewId) || crewList[0];

  const getStormBadge = () => {
    switch (stormStatus.severity) {
      case 'shelter':
        return {
          bg: 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse',
          label: `${stormStatus.level} SHELTER NOW`,
          flux: `${stormStatus.flux} pfu`
        };
      case 'warning':
        return {
          bg: 'bg-amber-600 hover:bg-amber-500 text-black font-bold',
          label: `${stormStatus.level} WARNING`,
          flux: `${stormStatus.flux} pfu`
        };
      case 'watch':
        return {
          bg: 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-600',
          label: `${stormStatus.level} WATCH`,
          flux: `${stormStatus.flux} pfu`
        };
      case 'quiet':
      default:
        return {
          bg: 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700',
          label: 'S0 QUIET',
          flux: `${stormStatus.flux} pfu`
        };
    }
  };

  const stormBadge = getStormBadge();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'health-twin', label: 'Health Twin', icon: User },
    { id: 'vitals-entry', label: 'Vitals Log', icon: HeartPulse },
    { id: 'storm-monitor', label: 'Storm Monitor', icon: Zap },
    { id: 'care-mode', label: 'Care Mode', icon: ShieldAlert },
    { id: 'retrace', label: 'Retrace', icon: Compass },
    { id: 'medical-kit', label: 'Medical Kit', icon: Box },
    { id: 'handoff', label: 'Doctor Handoff', icon: FileText },
    { id: 'sources', label: 'Data & Sources', icon: BookOpen }
  ];

  return (
    <header className="sticky top-0 z-40 bg-space-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
      
      {/* Judge Rapid Demo Tour Bar */}
      <div className="bg-gradient-to-r from-cyan-950 via-space-900 to-indigo-950 px-4 py-1.5 border-b border-cyan-800/40 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-semibold text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>JUDGE DEMO DRILLS:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          <button
            onClick={() => onTriggerDrill('cardio')}
            className="px-2 py-0.5 rounded bg-space-900/90 hover:bg-rose-950 hover:text-rose-200 text-slate-300 border border-slate-700 hover:border-rose-500 transition-colors cursor-pointer"
          >
            1. Cardio Alert (Alex Vance)
          </button>
          <button
            onClick={() => onTriggerDrill('storm')}
            className="px-2 py-0.5 rounded bg-space-900/90 hover:bg-amber-950 hover:text-amber-200 text-slate-300 border border-slate-700 hover:border-amber-500 transition-colors cursor-pointer"
          >
            2. Solar Superstorm & Shelter
          </button>
          <button
            onClick={() => onTriggerDrill('retrace')}
            className="px-2 py-0.5 rounded bg-space-900/90 hover:bg-indigo-950 hover:text-indigo-200 text-slate-300 border border-slate-700 hover:border-indigo-500 transition-colors cursor-pointer"
          >
            3. Unexpected Event Retrace
          </button>
          <button
            onClick={() => onTriggerDrill('handoff')}
            className="px-2 py-0.5 rounded bg-space-900/90 hover:bg-emerald-950 hover:text-emerald-200 text-slate-300 border border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer"
          >
            4. Flight Surgeon Handoff
          </button>
        </div>
      </div>

      {/* Top telemetry bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Brand & Mission Clock */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="font-bold tracking-wider text-slate-100 flex items-center gap-2">
                <span>STORM SHIELD</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">EIMO v3</span>
              </div>
              <div className="text-[10px] text-slate-400">Earth-Independent Medical Operations</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-space-900 border border-slate-800 text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-500" />
            <span>MET 142:08:44:12</span>
          </div>
        </div>

        {/* Space Weather & Ground Link Controls */}
        <div className="flex items-center gap-3">
          {/* Storm Alert Button */}
          <button
            onClick={onOpenStormModal}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all hover:scale-105 cursor-pointer shadow-md ${stormBadge.bg}`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{stormBadge.label}</span>
            <span className="text-[10px] opacity-80">({stormBadge.flux})</span>
          </button>

          {/* Ground Link Switch */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-space-900 border border-slate-800 font-mono">
            <Radio className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
            {['Available', 'Delayed', 'Unavailable'].map((mode) => (
              <button
                key={mode}
                onClick={() => setGroundLink(mode)}
                className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                  groundLink === mode
                    ? mode === 'Available'
                      ? 'bg-emerald-600 text-white font-semibold shadow'
                      : mode === 'Delayed'
                      ? 'bg-amber-600 text-black font-semibold shadow'
                      : 'bg-rose-700 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Switch Ground Link Mode to ${mode}`}
              >
                {mode === 'Available' ? 'Direct' : mode === 'Delayed' ? '20m Delay' : 'Blackout'}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Crew Selector & Primary Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/50">
        
        {/* Crew Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[11px] text-slate-400 font-mono mr-1">CREW:</span>
          {crewList.map((astronaut) => {
            const isSelected = astronaut.id === selectedCrewId;
            const status = astronaut.current?.status || 'nominal';
            
            return (
              <button
                key={astronaut.id}
                onClick={() => setSelectedCrewId(astronaut.id)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-sans transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-space-800 text-cyan-300 border border-cyan-500/50 shadow-sm font-semibold'
                    : 'bg-space-900/60 text-slate-400 hover:bg-space-800 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  status === 'act' 
                    ? 'bg-rose-500 animate-ping' 
                    : status === 'watch' 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500'
                }`} />
                <span>{astronaut.name}</span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">({astronaut.callsign})</span>
              </button>
            );
          })}
        </div>

        {/* Selected Astronaut Quick Status Pill */}
        <div className="hidden xl:flex items-center gap-3 text-xs font-mono">
          <div className="text-slate-400">
            Role: <span className="text-slate-200 font-medium">{selectedCrew.role}</span>
          </div>
          <div className="text-slate-400">
            Allergies: <span className={selectedCrew.allergies.length > 0 ? 'text-amber-400 font-bold' : 'text-slate-200'}>
              {selectedCrew.allergies.length > 0 ? selectedCrew.allergies.join(', ').toUpperCase() : 'NONE (NKDA)'}
            </span>
          </div>
        </div>

      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 overflow-x-auto">
        <nav className="flex space-x-1 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  active
                    ? 'bg-cyan-950/70 text-cyan-400 border border-cyan-800/60 font-semibold shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
