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
  Sparkles
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
          bg: 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-sm',
          label: `${stormStatus.level} SHELTER NOW`,
          flux: `${stormStatus.flux} pfu`
        };
      case 'warning':
        return {
          bg: 'bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-sm',
          label: `${stormStatus.level} WARNING`,
          flux: `${stormStatus.flux} pfu`
        };
      case 'watch':
        return {
          bg: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300',
          label: `${stormStatus.level} WATCH`,
          flux: `${stormStatus.flux} pfu`
        };
      case 'quiet':
      default:
        return {
          bg: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300',
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      
      {/* Rapid Presentation Tour Bar for Judges */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sky-800 font-mono font-bold text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>JUDGE PRESENTATION TOUR:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          <button
            onClick={() => onTriggerDrill('cardio')}
            className="px-2.5 py-0.5 rounded-full bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 transition-colors shadow-2xs cursor-pointer font-medium"
          >
            1. Cardio Alert (Alex Vance)
          </button>
          <button
            onClick={() => onTriggerDrill('storm')}
            className="px-2.5 py-0.5 rounded-full bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-300 hover:border-amber-300 transition-colors shadow-2xs cursor-pointer font-medium"
          >
            2. Solar Storm & Shelter
          </button>
          <button
            onClick={() => onTriggerDrill('retrace')}
            className="px-2.5 py-0.5 rounded-full bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-300 hover:border-indigo-300 transition-colors shadow-2xs cursor-pointer font-medium"
          >
            3. Retrace Unexpected Event
          </button>
          <button
            onClick={() => onTriggerDrill('handoff')}
            className="px-2.5 py-0.5 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300 hover:border-emerald-300 transition-colors shadow-2xs cursor-pointer font-medium"
          >
            4. 30s Doctor Handoff
          </button>
        </div>
      </div>

      {/* Main Top Telemetry Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Brand & Mission Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold tracking-wide text-slate-900 flex items-center gap-2 text-sm">
                <span>STORM SHIELD</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 border border-sky-300 font-mono font-semibold">
                  EIMO v3
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Earth-Independent Medical Operations</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>MET 142:08:44:12</span>
          </div>
        </div>

        {/* Space Weather & Ground Link Controls */}
        <div className="flex items-center gap-3">
          {/* Storm Alert Button */}
          <button
            onClick={onOpenStormModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all hover:scale-105 cursor-pointer shadow-xs ${stormBadge.bg}`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{stormBadge.label}</span>
            <span className="text-[10px] opacity-80">({stormBadge.flux})</span>
          </button>

          {/* Ground Link Switch */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200 font-mono">
            <Radio className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
            {['Available', 'Delayed', 'Unavailable'].map((mode) => (
              <button
                key={mode}
                onClick={() => setGroundLink(mode)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                  groundLink === mode
                    ? mode === 'Available'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : mode === 'Delayed'
                      ? 'bg-amber-500 text-white font-bold shadow-xs'
                      : 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
                title={`Switch Ground Link Mode to ${mode}`}
              >
                {mode === 'Available' ? 'Direct' : mode === 'Delayed' ? '20m Delay' : 'Blackout'}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Crew Switcher Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="text-[11px] text-slate-400 font-mono font-bold mr-1">CREW:</span>
          {crewList.map((astronaut) => {
            const isSelected = astronaut.id === selectedCrewId;
            const status = astronaut.current?.status || 'nominal';
            
            return (
              <button
                key={astronaut.id}
                onClick={() => setSelectedCrewId(astronaut.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50 text-sky-900 border border-sky-300 shadow-xs font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 font-medium'
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
        <div className="hidden xl:flex items-center gap-4 text-xs font-mono">
          <div className="text-slate-500">
            Role: <span className="text-slate-800 font-medium">{selectedCrew.role}</span>
          </div>
          <div className="text-slate-500">
            Allergies: <span className={selectedCrew.allergies.length > 0 ? 'text-amber-600 font-bold' : 'text-slate-800 font-medium'}>
              {selectedCrew.allergies.length > 0 ? selectedCrew.allergies.join(', ').toUpperCase() : 'NONE (NKDA)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 overflow-x-auto">
        <nav className="flex space-x-1 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-sky-50 text-sky-700 border border-sky-300 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
