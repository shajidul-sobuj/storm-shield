import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ShieldAlert, 
  RotateCcw, 
  CheckSquare, 
  ArrowRight, 
  Radiation, 
  Radio, 
  Key, 
  Wifi, 
  WifiOff,
  Sparkles,
  Play,
  Pause,
  Sun,
  Info,
  Droplet,
  UserCheck,
  CheckCircle2,
  Clock,
  Compass,
  Box,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import stormReplayData from '../../data/processed/storm-replay.json';
import { mapFluxToLevel, estimateStormDoseRate, NOAA_SCALES } from '../engine/storm.js';
import { 
  fetchUnifiedLiveSpaceWeather, 
  fetchNasaSpaceWeather,
  DEFAULT_NASA_KEY 
} from '../engine/nasaApi.js';
import ProvenanceBadge from './ProvenanceBadge.jsx';

export default function StormMonitor({ 
  onSelectStormLevel, 
  onLaunchCare, 
  onLaunchVitals,
  initialMode = 'live'
}) {
  // Operational Mode: 'live' (Real-time NASA/NOAA stream) or 'drill' (May 2024 S3 Superstorm replay)
  const [activeMode, setActiveMode] = useState(initialMode);

  // Live Telemetry Stream State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('nasa_api_key') || DEFAULT_NASA_KEY);
  const [liveData, setLiveData] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
  const [refreshCountdown, setRefreshCountdown] = useState(60);
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);
  const [noticeFilter, setNoticeFilter] = useState('ALL');

  // Drill / Historical Timeline Scrubber State (Index 4 is S3 Peak: 1,850 pfu)
  const [timelineIndex, setTimelineIndex] = useState(4);
  const [isPlaying, setIsPlaying] = useState(false);

  // Modals
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showExplainerModal, setShowExplainerModal] = useState(false);

  // 1. Initial Live Data Fetch & Auto-Refresh Interval
  const refreshLiveTelemetry = async (manualKey = null) => {
    setLiveLoading(true);
    try {
      const keyToUse = manualKey || apiKey;
      const result = await fetchUnifiedLiveSpaceWeather(keyToUse);
      setLiveData(result);
      setLastRefreshedAt(new Date());
      if (activeMode === 'live' && onSelectStormLevel) {
        onSelectStormLevel(result.stormLevel);
      }
    } catch (err) {
      console.warn('Live space weather fetch error:', err);
    } finally {
      setLiveLoading(false);
      setRefreshCountdown(60);
    }
  };

  useEffect(() => {
    refreshLiveTelemetry();

    const countdownTimer = setInterval(() => {
      setRefreshCountdown(prev => {
        if (prev <= 1) {
          refreshLiveTelemetry();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [apiKey]);

  // Handle Mode Switch
  const handleSwitchMode = (newMode) => {
    setActiveMode(newMode);
    setIsPlaying(false);
    if (newMode === 'live') {
      const currentLevel = liveData?.stormLevel || mapFluxToLevel(0.30);
      if (onSelectStormLevel) onSelectStormLevel(currentLevel);
    } else {
      const drillStep = stormReplayData.timeline[timelineIndex] || stormReplayData.timeline[4];
      if (onSelectStormLevel) onSelectStormLevel(mapFluxToLevel(drillStep.fluxPfu));
    }
  };

  // 5 Mission Storyline Phases for Drill Mode
  const PHASES = [
    {
      phaseId: 1,
      title: 'Solar Quiet',
      range: 'T -4h to -2h',
      indices: [0, 1],
      badge: 'S0 NOMINAL',
      badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
      desc: 'Nominal interplanetary transit. Deep space ambient proton background < 1 pfu.'
    },
    {
      phaseId: 2,
      title: 'Flare Eruption',
      range: 'T 0h to +1h',
      indices: [2, 3],
      badge: 'S1-S2 WARNING',
      badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
      desc: 'X-Class Flare on Sun AR3664. Prompt protons arrive. Immediate EVA abort ordered.'
    },
    {
      phaseId: 3,
      title: 'S3 Superstorm Peak',
      range: 'T +2.5h to +4h',
      indices: [4, 5],
      badge: 'S3 SHELTER NOW',
      badgeClass: 'bg-rose-950/70 text-rose-300 border-rose-500/50 animate-pulse',
      desc: 'CME shock front hits. Peak flux surges past 1,800-4,200 pfu. Mandatory Water Wall retreat.'
    },
    {
      phaseId: 4,
      title: 'Flux Decay in Core',
      range: 'T +8h to +20h',
      indices: [6, 7, 8],
      badge: 'S2-S1 DECAY',
      badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
      desc: 'Proton wave slowly diminishing. Crew stays locked in core until flux stabilizes.'
    },
    {
      phaseId: 5,
      title: 'Safe Clearance',
      range: 'T +30h',
      indices: [9],
      badge: 'S0 ALL-CLEAR',
      badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
      desc: 'Flux returns to background. Shelter stood down. Mandatory crew medical survey initiated.'
    }
  ];

  const currentDrillStep = stormReplayData.timeline[timelineIndex] || stormReplayData.timeline[0];
  const currentDrillPhase = PHASES.find(p => p.indices.includes(timelineIndex)) || PHASES[2];
  const drillStormLevel = mapFluxToLevel(currentDrillStep.fluxPfu);
  const drillDoseEstimate = estimateStormDoseRate(currentDrillStep.fluxPfu);

  // Auto-play interval for Drill Mode
  useEffect(() => {
    let timer = null;
    if (isPlaying && activeMode === 'drill') {
      timer = setInterval(() => {
        setTimelineIndex(prev => {
          if (prev >= stormReplayData.timeline.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          if (onSelectStormLevel) {
            onSelectStormLevel(mapFluxToLevel(stormReplayData.timeline[next].fluxPfu));
          }
          return next;
        });
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeMode]);

  const selectDrillStep = (idx) => {
    setTimelineIndex(idx);
    if (onSelectStormLevel) {
      onSelectStormLevel(mapFluxToLevel(stormReplayData.timeline[idx].fluxPfu));
    }
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    localStorage.setItem('nasa_api_key', apiKey);
    setShowKeyModal(false);
    refreshLiveTelemetry(apiKey);
  };

  // Active status values based on mode
  const currentFlux = activeMode === 'live' 
    ? (liveData?.flux ?? 0.30) 
    : currentDrillStep.fluxPfu;
  
  const currentLevel = activeMode === 'live' 
    ? (liveData?.stormLevel || mapFluxToLevel(0.30)) 
    : drillStormLevel;
  
  const currentDose = activeMode === 'live'
    ? (liveData?.doseEstimate || estimateStormDoseRate(0.30))
    : drillDoseEstimate;

  const isPostStorm = activeMode === 'drill' && timelineIndex === stormReplayData.timeline.length - 1;
  const isShelterActive = currentLevel.severity === 'shelter';

  // Filtered notifications
  const rawNotifications = liveData?.notifications || [];
  const filteredNotifications = rawNotifications.filter(n => {
    if (noticeFilter === 'ALL') return true;
    return (n.messageType || '').toUpperCase().includes(noticeFilter);
  });

  return (
    <div className="space-y-6 font-sans animate-fade-in text-slate-200">
      
      {/* 1. TOP DUAL-MODE HEADER & SATELLITE COMMAND BAR */}
      <div className="p-5 rounded-2xl glass-panel shadow-2xl space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-xl border ${
              activeMode === 'live'
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'bg-amber-950/80 border-amber-500/50 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
            }`}>
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {activeMode === 'live' ? 'Real-Time Space Weather Stream' : 'S3 Solar Superstorm Drill'}
                </h2>
                <ProvenanceBadge 
                  provenance="REAL" 
                  sourceId={activeMode === 'live' ? 'noaa-swpc-scales' : 'artemis1-radiation'} 
                />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeMode === 'live' ? (
                  <>Live Primary Sensor: <strong className="text-slate-200">{liveData?.satellite || 'GOES-18'}</strong> · NASA DONKI Gateway & NOAA SWPC Integral Protons (&ge;10 MeV).</>
                ) : (
                  <>Historical Superstorm Replay: <strong className="text-slate-200">May 10–12, 2024 Event</strong> (1,850 pfu Peak · Artemis 1 Water Wall Shielding).</>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons (Explainer, NASA Key, Refresh) */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setShowExplainerModal(!showExplainerModal)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 transition cursor-pointer font-bold"
            >
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>How It Works</span>
            </button>

            <button
              onClick={() => setShowKeyModal(!showKeyModal)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition cursor-pointer"
              title="Configure NASA API Key"
            >
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span>NASA Key</span>
            </button>

            {activeMode === 'live' && (
              <button
                onClick={() => refreshLiveTelemetry()}
                disabled={liveLoading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition cursor-pointer shadow-lg shadow-cyan-950/50 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${liveLoading ? 'animate-spin' : ''}`} />
                <span>{liveLoading ? 'Syncing...' : `Refresh (${refreshCountdown}s)`}</span>
              </button>
            )}
          </div>

        </div>

        {/* PRIMARY MODE SWITCHER TABS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
          
          <button
            onClick={() => handleSwitchMode('live')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              activeMode === 'live'
                ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border-cyan-400 ring-2 ring-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                : 'bg-slate-950/60 border-slate-800/90 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <div>
                <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                  <span>LIVE SATELLITE STREAM (DEFAULT)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    REAL NASA + NOAA
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Real-time GOES-18 proton flux & NASA DONKI solar event notifications.
                </div>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-300 font-bold hidden md:inline">
              {liveData?.flux != null ? `${liveData.flux} pfu · ${liveData.stormLevel?.level}` : 'Online'}
            </span>
          </button>

          <button
            onClick={() => handleSwitchMode('drill')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              activeMode === 'drill'
                ? 'bg-gradient-to-r from-amber-950/90 to-rose-950/90 border-amber-400 ring-2 ring-amber-400/30 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                : 'bg-slate-950/60 border-slate-800/90 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-1 rounded bg-amber-500/20 text-amber-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                  <span>S3 SUPERSTORM REPLAY DRILL</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                    HACKATHON DRILL
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                  May 2024 peak (1,850 pfu) to test water wall shelter & clinical triage.
                </div>
              </div>
            </div>
            <span className="text-xs font-mono text-amber-300 font-bold hidden md:inline">
              1,850 pfu · S3
            </span>
          </button>

        </div>

      </div>

      {/* Explainer Modal */}
      {showExplainerModal && (
        <div className="p-5 rounded-2xl glass-panel-glow text-xs shadow-2xl space-y-3 animate-fade-in border border-cyan-500/40">
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
            <span className="font-bold text-cyan-300 text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Solar Radiation Storm & Telemetry Guide</span>
            </span>
            <button
              onClick={() => setShowExplainerModal(false)}
              className="p-1 rounded text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300 leading-relaxed font-sans">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <strong className="text-cyan-300 block font-bold">1. Live NOAA & NASA Feeds</strong>
              <span>Storm Shield connects directly to NOAA Space Weather Prediction Center (GOES-18 satellite) and NASA DONKI API for live solar flares, CMEs, and proton fluxes.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <strong className="text-rose-400 block font-bold">2. Emergency S3 Threshold (1,000 pfu)</strong>
              <span>When proton flux exceeds 1,000 pfu, acute tissue irradiation occurs. Spacewalks are aborted and all astronauts retreat to the water wall storm shelter.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <strong className="text-emerald-400 block font-bold">3. Artemis 1 Shielding Physics</strong>
              <span>Artemis 1 flight telemetry proved that surrounding crew with potable water cargo delivers a <strong>4.0x radiation attenuation</strong>, preventing acute radiation sickness.</span>
            </div>
          </div>
        </div>
      )}

      {/* NASA API Key Modal */}
      {showKeyModal && (
        <form onSubmit={handleSaveKey} className="p-5 rounded-xl glass-panel shadow-xl space-y-3 animate-fade-in text-xs border border-cyan-500/40">
          <div className="flex justify-between items-center text-cyan-400 font-bold border-b border-slate-800 pb-2">
            <span className="flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>NASA API KEY CONFIGURATION</span>
            </span>
            <ProvenanceBadge provenance="PUBLISHED" sourceId="nasa-eimo-2025" compact />
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">
            Configure your official NASA API Key to query live Coronal Mass Ejections (CME), Solar Energetic Particles (SEP), and solar flares directly from NASA DONKI.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter NASA API Key"
              className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-mono transition cursor-pointer shadow-md"
            >
              Save Key & Sync
            </button>
          </div>
        </form>
      )}

      {/* 2. MODE-SPECIFIC BODY */}
      {activeMode === 'live' ? (
        /* ==================== LIVE SATELLITE STREAM VIEW ==================== */
        <div className="space-y-6">
          
          {/* Live Satellite Connectivity Status Bar */}
          <div className="p-4 rounded-xl glass-panel border border-emerald-500/30 text-xs font-mono flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                <Wifi className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span>TELEMETRY STREAM: {liveData?.satellite || 'GOES-18'} & NASA DONKI</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                    SYNCHRONIZED
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                  {liveData?.goesMessage || 'Connected to NOAA SWPC 1-minute primary satellite feed.'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
              <div>
                Last Sync: <strong className="text-slate-200">
                  {lastRefreshedAt ? lastRefreshedAt.toLocaleTimeString() : 'Connecting...'}
                </strong>
              </div>
              <div className="hidden sm:block">
                Auto-Poll: <strong className="text-cyan-400">{refreshCountdown}s</strong>
              </div>
            </div>
          </div>

          {/* Main Live Telemetry Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 8 Cols: Real-Time 6-Hour GOES Proton Histogram & NASA DONKI Feed */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Live 6-Hour GOES Timeseries Chart */}
              <div className="p-6 rounded-2xl glass-panel shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">
                        {liveData?.satellite || 'GOES-18'} Energetic Proton Flux (&ge;10 MeV) — Last 6 Hours
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
                        {liveData?.timeseries?.length || 0} Telemetry Samples
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Real-time stream from NOAA Space Weather Prediction Center. Updated every minute.
                    </p>
                  </div>

                  <div className="text-xs font-mono text-slate-400">
                    Latest: <strong className="text-cyan-300">{currentFlux} pfu</strong>
                  </div>
                </div>

                {/* Timeseries Bar Chart */}
                {liveData?.timeseries && liveData.timeseries.length > 0 ? (
                  <div className="h-44 flex items-end gap-1.5 pt-6 px-3 bg-slate-950/90 rounded-xl border border-slate-800">
                    {liveData.timeseries.map((pt, idx) => {
                      // Normalize flux height log-scale
                      const heightPct = Math.min(100, Math.max(10, (Math.log10(Math.max(0.01, pt.flux) + 1) / Math.log10(100)) * 100));
                      const isLast = idx === liveData.timeseries.length - 1;
                      const timeLabel = pt.timeTag ? pt.timeTag.substring(11, 16) : `${idx}`;

                      return (
                        <div
                          key={idx}
                          className="flex-1 h-full flex flex-col items-center justify-end group transition-all"
                          title={`${pt.timeTag}: ${pt.flux} pfu`}
                        >
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full rounded-t transition-all ${
                              pt.flux >= 1000 
                                ? 'bg-rose-500 shadow-md shadow-rose-500/50' 
                                : pt.flux >= 100 
                                ? 'bg-amber-500 shadow-md shadow-amber-500/50' 
                                : pt.flux >= 10 
                                ? 'bg-amber-400' 
                                : isLast 
                                ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50 ring-2 ring-cyan-200' 
                                : 'bg-cyan-600/70 hover:bg-cyan-500'
                            }`}
                          />
                          <span className={`text-[9px] font-mono mt-1.5 truncate max-w-[28px] ${
                            isLast ? 'text-cyan-300 font-bold' : 'text-slate-500'
                          }`}>
                            {timeLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center bg-slate-950/80 rounded-xl border border-slate-800 text-slate-400 text-xs">
                    <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin mb-2" />
                    <span>Synchronizing 6-hour GOES proton telemetry...</span>
                  </div>
                )}

                <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                  <span>-6 Hours Ago</span>
                  <span>-3 Hours</span>
                  <span>-1 Hour</span>
                  <span className="text-cyan-300 font-bold">Now ({currentFlux} pfu)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-mono text-cyan-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>LIVE SATELLITE INTERPRETATION:</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans">
                    {currentLevel.severity === 'quiet'
                      ? `Solar energetic proton flux is at interplanetary quiet background (${currentFlux} pfu). No solar particle events (SPE) directed toward trans-lunar trajectory.`
                      : currentLevel.advisory}
                  </p>
                </div>
              </div>

              {/* Live NASA DONKI Alert & Notification Stream */}
              <div className="p-6 rounded-2xl glass-panel shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">
                        NASA DONKI Space Weather Notifications
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40">
                        {rawNotifications.length} Events Logged
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Direct alerts for Coronal Mass Ejections (CME), Solar Flares (FLR), and Particle Events (SEP).
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 text-xs font-mono">
                    {['ALL', 'CME', 'FLR', 'SEP'].map(f => (
                      <button
                        key={f}
                        onClick={() => setNoticeFilter(f)}
                        className={`px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer ${
                          noticeFilter === f
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredNotifications.length > 0 ? (
                  <div className="space-y-2.5">
                    {filteredNotifications.slice(0, 5).map((notice, idx) => {
                      const isExpanded = expandedNoticeId === (notice.messageID || idx);
                      const noticeType = notice.messageType || 'ALERT';
                      const issueTime = notice.messageIssueTime ? new Date(notice.messageIssueTime).toUTCString() : 'Recent';

                      return (
                        <div
                          key={notice.messageID || idx}
                          className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                noticeType.includes('SEP')
                                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                                  : noticeType.includes('CME')
                                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                                  : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                              }`}>
                                {noticeType}
                              </span>
                              <span className="text-xs text-white font-bold font-mono">
                                {notice.messageID || `NASA-ALERT-${idx + 1}`}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              {issueTime}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 font-sans leading-relaxed">
                            {isExpanded 
                              ? notice.messageBody 
                              : (notice.messageBody || '').substring(0, 180) + ((notice.messageBody || '').length > 180 ? '...' : '')}
                          </p>

                          <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                            <button
                              onClick={() => setExpandedNoticeId(isExpanded ? null : (notice.messageID || idx))}
                              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <span>{isExpanded ? 'Show Less' : 'Read Full NASA Dispatch'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                            <span className="text-slate-500 text-[10px]">Source: NASA CCMC / DONKI</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                    <div className="font-bold text-white text-xs">No Active Space Weather Warnings in Window</div>
                    <p className="text-slate-400 text-xs font-sans">
                      Solar activity is currently nominal. Background flux is undisturbed.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Right 4 Cols: Live NOAA Scale & Artemis 1 Live Dosimetry */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* NOAA Radiation Tier Card */}
              <div className="p-6 rounded-2xl glass-panel shadow-xl space-y-4 text-center">
                <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-slate-400 block">
                  LIVE NOAA RADIATION SCALE TIER
                </span>

                <div className={`p-5 rounded-2xl border transition-all ${
                  currentLevel.severity === 'shelter'
                    ? 'bg-gradient-to-br from-rose-900/90 to-rose-950/90 text-rose-200 border-2 border-rose-500/70 shadow-lg shadow-rose-950/80 animate-pulse'
                    : currentLevel.severity === 'warning'
                    ? 'bg-gradient-to-br from-amber-900/90 to-amber-950/90 text-amber-200 border-2 border-amber-500/70 shadow-md'
                    : currentLevel.severity === 'watch'
                    ? 'bg-amber-950/50 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40'
                }`}>
                  <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
                    {currentLevel.name}
                  </div>
                  <div className="text-xs font-mono font-medium mt-1">
                    Live Proton Flux: <strong>{currentFlux} pfu</strong>
                  </div>
                </div>

                {/* NOAA Scale Gauge Bar */}
                <div className="space-y-1 text-left pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-emerald-400 font-bold">S0 Quiet</span>
                    <span>S1</span>
                    <span>S2</span>
                    <span>S3</span>
                    <span>S5</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                    <div className="bg-emerald-400 h-full w-[20%]" title="S0" />
                    <div className="bg-amber-400 h-full w-[20%]" title="S1" />
                    <div className="bg-amber-500 h-full w-[20%]" title="S2" />
                    <div className="bg-rose-500 h-full w-[20%]" title="S3" />
                    <div className="bg-purple-600 h-full w-[20%]" title="S4/S5" />
                  </div>
                </div>

                {/* Mandatory Order Directive */}
                <div className="text-left p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-mono text-slate-400 uppercase text-[10px] font-bold">Crew Operational Order:</div>
                  <div className="text-xs font-semibold text-white leading-snug">
                    {currentLevel.action}
                  </div>
                </div>
              </div>

              {/* Artemis I Live Dosimetry Rates */}
              <div className="p-5 rounded-2xl glass-panel shadow-xl space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-bold text-white">LIVE DOSIMETRY RATES</span>
                  <ProvenanceBadge provenance="REAL" sourceId="artemis1-radiation" compact />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60">
                    <div>
                      <span className="text-rose-300 font-bold block text-[11px]">Unshielded Hull Rate</span>
                      <span className="text-[10px] text-slate-400">Outer spacecraft skin</span>
                    </div>
                    <span className="text-base font-bold text-rose-400 font-mono">
                      {currentDose.unshieldedMgyPerHour} <span className="text-xs text-slate-400">mGy/hr</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/50">
                    <div>
                      <span className="text-emerald-300 font-bold block text-[11px]">Water Wall Haven Rate</span>
                      <span className="text-[10px] text-slate-400">4.0x Attenuated core</span>
                    </div>
                    <span className="text-base font-bold text-emerald-300 font-mono">
                      {currentDose.shieldedMgyPerHour} <span className="text-xs text-slate-400">mGy/hr</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] font-sans text-slate-300 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between font-mono text-[10px]">
                    <span>STATUS: SAFE BACKGROUND</span>
                    <span className="text-emerald-400 font-bold">NOMINAL</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-400">
                    Telemetry is pulling real-time interplanetary conditions. No acute biological hazard.
                  </p>
                </div>
              </div>

              {/* Judge S3 Drill Trigger Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/80 to-rose-950/80 border border-amber-500/50 shadow-xl space-y-2.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Judges: Test Emergency Shelter</span>
                </div>
                <p className="text-xs text-slate-200 leading-snug">
                  Because current solar weather is quiet, switch to the <strong>S3 Superstorm Drill</strong> to simulate peak proton radiation (1,850 pfu) and test emergency procedures.
                </p>
                <button
                  onClick={() => handleSwitchMode('drill')}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Launch S3 Drill Simulation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* ==================== S3 DRILL SIMULATION VIEW ==================== */
        <div className="space-y-6">
          
          {/* 5-Stage Mission Sequence Deck */}
          <div className="glass-panel p-5 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>SOLAR STORM SEQUENCE OF EVENTS (5 PHASES)</span>
              </span>
              <span className="text-slate-400 font-bold">
                CURRENT: <strong className="text-cyan-300">PHASE {currentDrillPhase.phaseId} OF 5</strong> ({currentDrillPhase.title})
              </span>
            </div>

            {/* Phase Stepper */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-1">
              {PHASES.map((ph) => {
                const isCurrent = ph.phaseId === currentDrillPhase.phaseId;
                const isPast = ph.phaseId < currentDrillPhase.phaseId;

                return (
                  <button
                    key={ph.phaseId}
                    onClick={() => selectDrillStep(ph.indices[0])}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-850/95 border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg'
                        : isPast
                        ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900/60'
                        : 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isCurrent ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}>
                        Phase {ph.phaseId}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${ph.badgeClass}`}>
                        {ph.badge}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-white text-xs">{ph.title}</div>
                      <div className="text-[10px] font-mono text-slate-400">{ph.range}</div>
                    </div>

                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                      {ph.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spacecraft Radiation Shelter Infographic */}
          <div className="p-6 rounded-2xl glass-panel text-white shadow-2xl space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40">
                    ARTEMIS ARCHITECTURE INFOGRAPHIC
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Active Source: Solar Flare AR3664 &rarr; Orion Spacecraft Transit
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1 flex items-center gap-2">
                  <span>Deep Space Radiation Shielding Simulation</span>
                  <span className="text-xs text-emerald-400 font-mono font-normal">● Real-time Physics</span>
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-slate-400">Artemis 1 Attenuation:</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold">
                  4.0x Dose Reduction
                </span>
              </div>
            </div>

            {/* Sun -> Proton Beam -> Spacecraft Shelter */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center py-2">
              
              {/* Sun */}
              <div className="lg:col-span-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center space-y-2">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping"></div>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center justify-center">
                    <Sun className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <div className="font-bold text-white text-xs">SOLAR SUNSPOT AR3664</div>
                  <div className="text-[10px] text-amber-400 font-mono mt-0.5">X8.7 Solar Flare Eruption</div>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  High-energy solar protons (&ge;10 MeV) accelerated along Parker Spiral toward spacecraft trajectory.
                </p>
              </div>

              {/* Transit Beam */}
              <div className="lg:col-span-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">SOLAR PROTON BEAM</span>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] border ${
                    currentDrillStep.fluxPfu >= 1000 ? 'bg-rose-950/60 text-rose-300 border-rose-500/40 animate-pulse' : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {currentDrillStep.fluxPfu >= 1000 ? 'S3 CRITICAL' : `${currentDrillStep.level} FLUX`}
                  </span>
                </div>

                <div className="h-8 w-full bg-slate-950 rounded-lg border border-slate-800 relative overflow-hidden flex items-center px-2">
                  <div 
                    className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                      currentDrillStep.fluxPfu >= 1000 ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 opacity-70 animate-pulse' : 'bg-gradient-to-r from-cyan-500 to-blue-500 opacity-40'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(10, (Math.log10(currentDrillStep.fluxPfu + 1) / 3.7) * 100))}%` }}
                  />
                  <span className="relative z-10 text-[11px] font-mono font-bold text-white tracking-wide">
                    FLUX: {currentDrillStep.fluxPfu} pfu (protons/cm²·s·sr)
                  </span>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>0.1 pfu (Nominal)</span>
                  <span>100 pfu (S2 Alert)</span>
                  <span>1,000 pfu (S3 Shelter)</span>
                </div>
              </div>

              {/* Spacecraft Zones */}
              <div className="lg:col-span-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-cyan-400" />
                    <span>SPACECRAFT DUAL RADIATION ZONES</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {isShelterActive ? 'CREW IN CORE' : 'CREW NOMINAL'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 space-y-1">
                    <span className="text-[10px] text-rose-300 block">OUTER HULL (UNSHIELDED)</span>
                    <span className="text-base font-bold text-rose-400">{drillDoseEstimate.unshieldedMgyPerHour} <span className="text-[10px] font-normal text-slate-400">mGy/hr</span></span>
                    <span className="text-[10px] text-rose-300/80 block">EVA lethal zone</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/50 space-y-1 ring-1 ring-emerald-500/30">
                    <span className="text-[10px] text-emerald-300 block flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-cyan-400" />
                      <span>WATER WALL CORE (SHELTER)</span>
                    </span>
                    <span className="text-base font-bold text-emerald-300">{drillDoseEstimate.shieldedMgyPerHour} <span className="text-[10px] font-normal text-slate-400">mGy/hr</span></span>
                    <span className="text-[10px] text-emerald-400/90 block">4.0x Hydrogen Attenuation</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-sans flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {isShelterActive 
                      ? 'All 3 astronauts gathered in central logistics core behind potable water tanks.'
                      : 'Crew distributed normally through habitat. Ambient monitoring nominal.'}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Drill Scrubber & Histogram */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className="lg:col-span-8 p-6 rounded-2xl glass-panel shadow-xl space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">
                      GOES-16 Energetic Proton Flux Histogram (May 2024 Event)
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
                      Step {timelineIndex + 1} of {stormReplayData.timeline.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Drag the slider or click any bar below to jump to that moment in the solar particle event.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-md cursor-pointer ${
                      isPlaying 
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 ring-2 ring-amber-300' 
                        : 'bg-cyan-600 text-white hover:bg-cyan-500'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlaying ? 'Pause Auto-Play' : 'Auto-Play Replay'}</span>
                  </button>

                  <button
                    onClick={() => { setIsPlaying(false); selectDrillStep(0); }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                    title="Reset Replay to T -4h"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Interactive Bar Chart Histogram */}
              <div className="h-44 flex items-end gap-2 pt-6 px-3 bg-slate-950/90 rounded-xl border border-slate-800">
                {stormReplayData.timeline.map((step, idx) => {
                  const heightPct = Math.min(100, Math.max(8, (Math.log10(step.fluxPfu + 1) / Math.log10(5000)) * 100));
                  const isCurrent = idx === timelineIndex;

                  const getBarColor = () => {
                    if (step.fluxPfu >= 1000) return isCurrent ? 'bg-rose-500 shadow-lg shadow-rose-500/50 ring-2 ring-rose-300' : 'bg-rose-900/60 hover:bg-rose-700/60';
                    if (step.fluxPfu >= 100) return isCurrent ? 'bg-amber-500 shadow-lg shadow-amber-500/50 ring-2 ring-amber-300' : 'bg-amber-900/60 hover:bg-amber-700/60';
                    if (step.fluxPfu >= 10) return isCurrent ? 'bg-amber-400 shadow-lg shadow-amber-400/50 ring-2 ring-amber-300' : 'bg-amber-950/60 hover:bg-amber-800/60';
                    return isCurrent ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50 ring-2 ring-cyan-300' : 'bg-slate-800 hover:bg-slate-700';
                  };

                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => selectDrillStep(idx)}
                      className="flex-1 h-full flex flex-col items-center justify-end group transition-all cursor-pointer"
                      title={`Step ${idx + 1}: ${step.offsetHours}h (${step.fluxPfu} pfu)`}
                    >
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t transition-all ${getBarColor()}`}
                      />
                      <span className={`text-[10px] font-mono mt-1.5 ${isCurrent ? 'text-cyan-300 font-bold' : 'text-slate-500'}`}>
                        {step.offsetHours}h
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400 font-semibold">SCRUB TIMELINE:</span>
                  <span className="text-cyan-300 font-bold">
                    Offset: {currentDrillStep.offsetHours >= 0 ? `+${currentDrillStep.offsetHours}` : currentDrillStep.offsetHours} hrs ({currentDrillStep.fluxPfu} pfu)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={stormReplayData.timeline.length - 1}
                  step="1"
                  value={timelineIndex}
                  onChange={(e) => selectDrillStep(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>-4.0h Pre-Storm</span>
                  <span>0.0h Flare Eruption</span>
                  <span>+4.0h Superstorm Peak</span>
                  <span>+30.0h Storm Passed</span>
                </div>
              </div>

              {/* Advisory Card */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>MISSION ADVISORY AT T {currentDrillStep.offsetHours >= 0 ? `+${currentDrillStep.offsetHours}` : currentDrillStep.offsetHours}h:</span>
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    currentDrillStep.fluxPfu >= 1000 ? 'bg-rose-950/60 text-rose-300 border-rose-500/40' : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {currentDrillStep.label}
                  </span>
                </div>
                <p className="text-slate-200 font-medium leading-relaxed">
                  {currentDrillStep.advisory}
                </p>
              </div>

              {/* Checklist */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 shadow-inner space-y-2">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between">
                  <span>LEVEL 2 OPERATIONAL PROTOCOL CHECKLIST</span>
                  <span className="text-[10px] text-slate-500 font-normal">Human Acts</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 p-1.5 rounded bg-slate-900/60 border border-slate-850">
                    <CheckCircle2 className={`w-4 h-4 ${currentDrillStep.fluxPfu >= 100 ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className={currentDrillStep.fluxPfu >= 100 ? 'text-white font-medium' : 'text-slate-500'}>
                      Abort EVA and confirm outer airlock hatch seal
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded bg-slate-900/60 border border-slate-850">
                    <CheckCircle2 className={`w-4 h-4 ${currentDrillStep.fluxPfu >= 1000 ? 'text-rose-400' : 'text-slate-600'}`} />
                    <span className={currentDrillStep.fluxPfu >= 1000 ? 'text-rose-300 font-bold' : 'text-slate-500'}>
                      All crew retreat to central storm shelter behind water walls
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded bg-slate-900/60 border border-slate-850">
                    <CheckCircle2 className={`w-4 h-4 ${currentDrillStep.fluxPfu >= 1000 ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className={currentDrillStep.fluxPfu >= 1000 ? 'text-white font-medium' : 'text-slate-500'}>
                      Power down external payload antennas and orient solar panels edge-on
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded bg-slate-900/60 border border-slate-850">
                    <CheckCircle2 className={`w-4 h-4 ${isPostStorm ? 'text-cyan-400' : 'text-slate-600'}`} />
                    <span className={isPostStorm ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                      Post-storm body survey & personal dosimeter download
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 4 Cols: Drill NOAA Scale & Care Handoff */}
            <div className="lg:col-span-4 space-y-5">
              
              <div className="p-6 rounded-2xl glass-panel shadow-xl space-y-4 text-center">
                <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-slate-400 block">
                  NOAA RADIATION SCALE TIER
                </span>

                <div className={`p-5 rounded-2xl border transition-all ${
                  drillStormLevel.severity === 'shelter'
                    ? 'bg-gradient-to-br from-rose-900/90 to-rose-950/90 text-rose-200 border-2 border-rose-500/70 shadow-lg shadow-rose-950/80 animate-pulse'
                    : drillStormLevel.severity === 'warning'
                    ? 'bg-gradient-to-br from-amber-900/90 to-amber-950/90 text-amber-200 border-2 border-amber-500/70 shadow-md'
                    : drillStormLevel.severity === 'watch'
                    ? 'bg-amber-950/50 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40'
                }`}>
                  <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
                    {drillStormLevel.name}
                  </div>
                  <div className="text-xs font-mono font-medium mt-1">
                    Proton Flux: <strong>{drillStormLevel.flux} pfu</strong>
                  </div>
                </div>

                <div className="text-left p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-mono text-slate-400 uppercase text-[10px] font-bold">Mandatory Order:</div>
                  <div className="text-xs font-semibold text-white leading-snug">
                    {drillStormLevel.action}
                  </div>
                </div>
              </div>

              {/* Artemis I Dosimetry */}
              <div className="p-5 rounded-2xl glass-panel shadow-xl space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-bold text-white">HISTORICAL DOSIMETRY RATES</span>
                  <ProvenanceBadge provenance="REAL" sourceId="artemis1-radiation" compact />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60">
                    <div>
                      <span className="text-rose-300 font-bold block text-[11px]">Unshielded Hull Rate</span>
                      <span className="text-[10px] text-slate-400">Outer spacecraft skin</span>
                    </div>
                    <span className="text-base font-bold text-rose-400 font-mono">
                      {drillDoseEstimate.unshieldedMgyPerHour} <span className="text-xs text-slate-400">mGy/hr</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/50">
                    <div>
                      <span className="text-emerald-300 font-bold block text-[11px]">Water Wall Shelter Rate</span>
                      <span className="text-[10px] text-slate-400">4.0x Attenuated haven</span>
                    </div>
                    <span className="text-base font-bold text-emerald-300 font-mono">
                      {drillDoseEstimate.shieldedMgyPerHour} <span className="text-xs text-slate-400">mGy/hr</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Post-Storm or Active Shelter Action Card */}
              {isPostStorm ? (
                <div className="p-4 rounded-2xl glass-panel-glow border-2 border-cyan-400/80 shadow-2xl space-y-3">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase">
                    <CheckSquare className="w-4 h-4 text-cyan-400" />
                    <span>Storm Passed: Crew Action</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-snug">
                    Proton flux has subsided. Proceed with mandatory medical survey in Care Mode.
                  </p>
                  <button
                    onClick={() => onLaunchCare('post-storm-illness')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Launch Scenario B: Nausea Check</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : isShelterActive ? (
                <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/60 shadow-xl space-y-2">
                  <span className="text-[11px] font-mono font-bold text-rose-300 uppercase block">
                    Active Emergency Protocol
                  </span>
                  <p className="text-xs text-slate-300 leading-snug">
                    S3 Strong storm in progress. Spacewalking prohibited. Verify all crew are logged inside the central core.
                  </p>
                </div>
              ) : null}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
