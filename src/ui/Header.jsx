import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  LifeBuoy
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
  onTriggerDrill,
  onToggleAssistant,
  onRaiseCrewAlert,
  hasActiveAlert = false
}) {
  const selectedCrew = crewList.find(c => c.id === selectedCrewId) || crewList[0];

  // Dynamic live mission elapsed time tick
  const [metSeconds, setMetSeconds] = useState(38);
  useEffect(() => {
    const timer = setInterval(() => {
      setMetSeconds(prev => (prev + 1) % 60);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStormBadge = () => {
    switch (stormStatus.severity) {
      case 'shelter':
        return {
          bg: 'bg-rose-600/90 hover:bg-rose-600 text-white animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.4)] border border-rose-400',
          label: `${stormStatus.level} SHELTER NOW`,
          flux: `${stormStatus.flux} pfu`
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/90 hover:bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-amber-300',
          label: `${stormStatus.level} WARNING`,
          flux: `${stormStatus.flux} pfu`
        };
      case 'watch':
        return {
          bg: 'bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/40',
          label: `${stormStatus.level} WATCH`,
          flux: `${stormStatus.flux} pfu`
        };
      case 'quiet':
      default:
        return {
          bg: 'bg-slate-900/80 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30',
          label: `${stormStatus.level || 'S0'} LIVE`,
          flux: `${stormStatus.flux} pfu`
        };
    }
  };

  const stormBadge = getStormBadge();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'health-twin', label: 'Health Twin', icon: User },
    { id: 'vitals-entry', label: 'Vitals Log', icon: HeartPulse },
    { id: 'self-support', label: 'Self-Support', icon: LifeBuoy },
    { id: 'storm-monitor', label: 'Storm Monitor', icon: Zap },
    { id: 'care-mode', label: 'Care Mode', icon: ShieldAlert },
    { id: 'retrace', label: 'Retrace', icon: Compass },
    { id: 'medical-kit', label: 'Medical Kit', icon: Box },
    { id: 'handoff', label: 'Doctor Handoff', icon: FileText },
    { id: 'sources', label: 'Data & Sources', icon: BookOpen }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#070c18]/95 backdrop-blur-xl border-b border-slate-800/90 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      
      {/* Rapid Presentation Tour Bar for Judges */}
      <div className="bg-[#0b1120]/80 border-b border-slate-800/80 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-[11px] tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>V4 JUDGE TOUR:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          <button
            onClick={() => onTriggerDrill('anomaly')}
            className="px-2.5 py-0.5 rounded-full bg-slate-900/80 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-400/60 transition shadow-sm cursor-pointer font-medium"
          >
            1. Wearable Drift & Anomaly
          </button>
          <button
            onClick={() => onTriggerDrill('selfsupport')}
            className="px-2.5 py-0.5 rounded-full bg-slate-900/80 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-400/60 transition shadow-sm cursor-pointer font-medium"
          >
            2. Self-Support & Check-in
          </button>
          <button
            onClick={() => onTriggerDrill('cardio')}
            className="px-2.5 py-0.5 rounded-full bg-slate-900/80 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-400/60 transition shadow-sm cursor-pointer font-medium"
          >
            3. Care Mode (Scenario A)
          </button>
          <button
            onClick={() => onTriggerDrill('storm')}
            className="px-2.5 py-0.5 rounded-full bg-slate-900/80 hover:bg-amber-950/60 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-400/60 transition shadow-sm cursor-pointer font-medium"
          >
            4. Solar Storm & Shelter
          </button>
          <button
            onClick={() => onTriggerDrill('retrace')}
            className="px-2.5 py-0.5 rounded-full bg-slate-900/80 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-300 border border-slate-700 hover:border-indigo-400/60 transition shadow-sm cursor-pointer font-medium"
          >
            5. Retrace Event
          </button>
          <button
            onClick={() => onTriggerDrill('handoff')}
            className="px-2.5 py-0.5 rounded-full bg-slate-900/80 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-400/60 transition shadow-sm cursor-pointer font-medium"
          >
            6. Doctor Handoff
          </button>
        </div>
      </div>

      {/* Main Top Telemetry Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Brand & Mission Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="font-bold tracking-wider text-white flex items-center gap-2 text-sm">
                <span>STORM SHIELD</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono font-semibold">
                  EIMO v4
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 font-mono font-medium">
                  Level 2: Human Acts
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Earth-Independent Medical Operations · NASA Deep Space</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-slate-300 font-mono text-[11px] shadow-inner">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>MET 142:08:44:{metSeconds < 10 ? `0${metSeconds}` : metSeconds}</span>
          </div>
        </div>

        {/* Action Controls: Alert Crew, Assistant, Weather, Ground Link */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Persistent ALERT CREW Button [A6] */}
          <button
            onClick={onRaiseCrewAlert}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
              hasActiveAlert
                ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                : 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 hover:border-rose-400'
            }`}
            title="Broadcast emergency medical alert to all habitat crew members"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{hasActiveAlert ? 'ACTIVE CREW ALERT' : 'ALERT CREW'}</span>
          </button>

          {/* Guided Assistant Button */}
          {onToggleAssistant && (
            <button
              onClick={onToggleAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 text-xs font-bold transition shadow-sm cursor-pointer"
              title="Open Grounded Medical Assistant & Voice Controls"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Assistant</span>
            </button>
          )}

          {/* Live NASA/NOAA Satellite Feed Indicator */}
          <div 
            onClick={onOpenStormModal}
            className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 font-mono text-[11px] text-emerald-400 cursor-pointer hover:bg-emerald-950/60 transition shadow-inner"
            title="Real-time NOAA GOES-18 and NASA DONKI satellite stream active"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>NASA DONKI · LIVE</span>
          </div>

          {/* Storm Alert Button */}
          <button
            onClick={onOpenStormModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all hover:scale-105 cursor-pointer shadow-md ${stormBadge.bg}`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{stormBadge.label}</span>
            <span className="text-[10px] opacity-90">({stormBadge.flux})</span>
          </button>

          {/* Ground Link Switch */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900/90 border border-slate-700/80 font-mono shadow-inner">
            <Radio className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
            {['Available', 'Delayed', 'Unavailable'].map((mode) => (
              <button
                key={mode}
                onClick={() => setGroundLink(mode)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                  groundLink === mode
                    ? mode === 'Available'
                      ? 'bg-emerald-600 text-white font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : mode === 'Delayed'
                      ? 'bg-amber-600 text-white font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'bg-rose-600 text-white font-bold shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="text-[11px] text-cyan-400 font-mono font-bold mr-1">CREW:</span>
          {crewList.map((astronaut) => {
            const isSelected = astronaut.id === selectedCrewId;
            const status = astronaut.current?.status || 'nominal';
            
            return (
              <button
                key={astronaut.id}
                onClick={() => setSelectedCrewId(astronaut.id)}
                className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/90 text-cyan-100 border border-cyan-400/50 shadow-[0_0_18px_rgba(6,182,212,0.2)] font-bold'
                    : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 hover:text-white border border-slate-800 font-medium'
                }`}
              >
                <span className={`w-2 h-2 rounded-full relative flex`}>
                  {status === 'act' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    status === 'act' 
                      ? 'bg-rose-500' 
                      : status === 'watch' 
                      ? 'bg-amber-400' 
                      : 'bg-emerald-400'
                  }`} />
                </span>
                <span>{astronaut.name}</span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">({astronaut.callsign})</span>
              </button>
            );
          })}
        </div>

        {/* Selected Astronaut Quick Status Pill */}
        <div className="hidden xl:flex items-center gap-4 text-xs font-mono">
          <div className="text-slate-400">
            Role: <span className="text-slate-200 font-medium">{selectedCrew.role}</span>
          </div>
          <div className="text-slate-400">
            Allergies: <span className={selectedCrew.allergies.length > 0 ? 'text-amber-400 font-bold' : 'text-slate-200 font-medium'}>
              {selectedCrew.allergies.length > 0 ? selectedCrew.allergies.join(', ').toUpperCase() : 'NONE (NKDA)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 overflow-x-auto">
        <nav className="flex space-x-1.5 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
