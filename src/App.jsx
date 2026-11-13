import React, { useState, useEffect } from 'react';
import initialCrew from './content/crew.json';
import { assessAstronaut } from './engine/assess.js';
import { mapFluxToLevel } from './engine/storm.js';
import { alertSystem } from './engine/alerts.js';
import { mockBioMonitor } from './device/mockBioMonitor.js';
import { fetchUnifiedLiveSpaceWeather } from './engine/nasaApi.js';

import Header from './ui/Header.jsx';
import Overview from './ui/Overview.jsx';
import HealthTwin from './ui/HealthTwin.jsx';
import VitalsEntry from './ui/VitalsEntry.jsx';
import StormMonitor from './ui/StormMonitor.jsx';
import CareMode from './ui/CareMode.jsx';
import RetraceMode from './ui/RetraceMode.jsx';
import MedicalKit from './ui/MedicalKit.jsx';
import HandoffScreen from './ui/HandoffScreen.jsx';
import SourcesScreen from './ui/SourcesScreen.jsx';
import SelfSupport from './ui/SelfSupport.jsx';
import CrewAlertModal from './ui/CrewAlertModal.jsx';
import AssistantPanel from './ui/AssistantPanel.jsx';

export default function App() {
  const getInitialTab = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || 'overview';
    } catch {
      return 'overview';
    }
  };

  const [currentTab, setCurrentTab] = useState(getInitialTab);
  const [crewList, setCrewList] = useState(initialCrew);
  // Default to Alex Vance (crew-2) who illustrates the active cardiovascular scare & allergy check
  const [selectedCrewId, setSelectedCrewId] = useState('crew-2');
  const [groundLink, setGroundLink] = useState('Unavailable');
  // Initialize to live nominal background (S0 Quiet: 0.30 pfu)
  const [stormStatus, setStormStatus] = useState(() => mapFluxToLevel(0.30));
  const [stormDrillRequested, setStormDrillRequested] = useState(false);
  const [activeCareScenario, setActiveCareScenario] = useState('cardio-scare');
  const [isAssistantOpen, setIsAssistantOpen] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('assistant') === 'true';
    } catch {
      return false;
    }
  });
  const [activeAlert, setActiveAlert] = useState(null);

  const [careLogs, setCareLogs] = useState([
    {
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      scenarioId: 'cardio-scare',
      stepId: 'step-rest',
      actionDescription: 'Mandatory physical rest initiated; semi-recumbent positioning.',
      patientId: 'crew-2',
      kitUsed: [],
      verified: true
    }
  ]);

  // Subscribe to Alert System state
  useEffect(() => {
    return alertSystem.subscribe((state) => {
      setActiveAlert(state.activeAlert);
    });
  }, []);

  // Synchronize with real-time NOAA SWPC GOES satellite & NASA DONKI on mount
  useEffect(() => {
    fetchUnifiedLiveSpaceWeather().then(result => {
      if (result && result.stormLevel) {
        setStormStatus(result.stormLevel);
      }
    }).catch(err => {
      console.warn('Initial space weather sync error:', err);
    });
  }, []);

  const selectedCrew = crewList.find(c => c.id === selectedCrewId) || crewList[0];

  const setTab = (newTab) => {
    setCurrentTab(newTab);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  // Handler to update vitals
  const handleUpdateVitals = (crewId, newVitals) => {
    setCrewList(prevList => {
      return prevList.map(astronaut => {
        if (astronaut.id === crewId) {
          const assessment = assessAstronaut(newVitals, astronaut.baseline);
          return {
            ...astronaut,
            current: {
              ...astronaut.current,
              ...newVitals,
              status: assessment.status
            }
          };
        }
        return astronaut;
      });
    });
  };

  // Launch Care Mode with specific scenario
  const handleLaunchCare = (scenarioId = 'cardio-scare') => {
    setActiveCareScenario(scenarioId);
    setTab('care-mode');
  };

  // Launch Retrace
  const handleLaunchRetrace = () => {
    setTab('retrace');
  };

  // Add Care Log
  const handleLogCareAction = (logEntry) => {
    setCareLogs(prev => [logEntry, ...prev]);
  };

  // Manual Trigger Alert Crew
  const handleRaiseCrewAlert = () => {
    if (activeAlert) {
      // Toggle or keep modal open
      return;
    }
    alertSystem.raiseAlert({
      from: `${selectedCrew.name} (${selectedCrew.callsign})`,
      kind: 'emergency',
      reason: 'Manual emergency crew assistance requested from Habitat console',
      location: 'Habitat Module Alpha',
      checkInSeconds: 10
    });
  };

  // Handle assistant procedure commands
  const handleAssistantCommand = (cmd) => {
    if (cmd.action === 'NEXT_STEP') {
      handleLogCareAction({
        timestamp: new Date().toISOString(),
        scenarioId: activeCareScenario,
        stepId: 'voice-next',
        actionDescription: 'Voice command: Advanced to next clinical step',
        patientId: selectedCrew.id,
        kitUsed: [],
        verified: true
      });
    } else if (cmd.action === 'ALERT_CREW') {
      handleRaiseCrewAlert();
    } else if (cmd.action === 'START_TIMER') {
      // Timer started
    } else if (cmd.action === 'UPDATE_VITAL') {
      if (cmd.vital === 'hr') {
        handleUpdateVitals(selectedCrew.id, { hr: cmd.value });
      } else if (cmd.vital === 'spo2') {
        handleUpdateVitals(selectedCrew.id, { spo2: cmd.value });
      } else if (cmd.vital === 'bp') {
        handleUpdateVitals(selectedCrew.id, { bp: cmd.value });
      }
    }
  };

  // Judge Demo Tour Quick Launcher
  const handleTriggerDrill = (drillType) => {
    if (drillType === 'anomaly') {
      setSelectedCrewId('crew-2');
      setTab('overview');
      mockBioMonitor.triggerScriptedAnomaly(true);
    } else if (drillType === 'selfsupport') {
      setSelectedCrewId('crew-2');
      setTab('self-support');
    } else if (drillType === 'cardio') {
      setSelectedCrewId('crew-2');
      setActiveCareScenario('cardio-scare');
      setTab('care-mode');
    } else if (drillType === 'storm') {
      setStormStatus(mapFluxToLevel(1850));
      setStormDrillRequested(true);
      setTab('storm-monitor');
    } else if (drillType === 'retrace') {
      setSelectedCrewId('crew-2');
      setTab('retrace');
    } else if (drillType === 'handoff') {
      setTab('handoff');
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative space-grid">
      
      {/* Ambient Aerospace Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-0"></div>
      <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none -z-0"></div>
      
      {/* Global Crew Alert Broadcast Modal (Synchronized across tabs) */}
      <CrewAlertModal
        currentCrewId={selectedCrewId}
        onSwitchToCare={() => handleLaunchCare('cardio-scare')}
        onSwitchToSelfSupport={() => setTab('self-support')}
      />

      {/* Global Guided Assistant Docked Drawer */}
      <AssistantPanel
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        astronaut={selectedCrew}
        onExecuteCommand={handleAssistantCommand}
      />

      {/* Primary Mission HUD Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setTab}
        crewList={crewList}
        selectedCrewId={selectedCrewId}
        setSelectedCrewId={setSelectedCrewId}
        groundLink={groundLink}
        setGroundLink={setGroundLink}
        stormStatus={stormStatus}
        onOpenStormModal={() => setTab('storm-monitor')}
        onTriggerDrill={handleTriggerDrill}
        onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)}
        onRaiseCrewAlert={handleRaiseCrewAlert}
        hasActiveAlert={!!activeAlert}
      />

      {/* Main Mission Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {currentTab === 'overview' && (
          <Overview
            astronaut={selectedCrew}
            groundLink={groundLink}
            stormStatus={stormStatus}
            onLaunchCare={handleLaunchCare}
            onLaunchRetrace={handleLaunchRetrace}
            onLaunchSelfSupport={() => setTab('self-support')}
            onOpenStorm={() => setTab('storm-monitor')}
            onUpdateVitals={handleUpdateVitals}
          />
        )}

        {currentTab === 'health-twin' && (
          <HealthTwin
            astronaut={selectedCrew}
            onLaunchCare={handleLaunchCare}
            onLaunchRetrace={handleLaunchRetrace}
          />
        )}

        {currentTab === 'vitals-entry' && (
          <VitalsEntry
            astronaut={selectedCrew}
            onUpdateVitals={handleUpdateVitals}
          />
        )}

        {currentTab === 'self-support' && (
          <SelfSupport
            astronaut={selectedCrew}
            onSwitchToHelperView={() => handleLaunchCare('cardio-scare')}
          />
        )}

        {currentTab === 'storm-monitor' && (
          <StormMonitor
            onSelectStormLevel={(newLevel) => setStormStatus(newLevel)}
            onLaunchCare={handleLaunchCare}
            onLaunchVitals={() => setTab('vitals-entry')}
            initialMode={stormDrillRequested ? 'drill' : 'live'}
          />
        )}

        {currentTab === 'care-mode' && (
          <CareMode
            astronaut={selectedCrew}
            activeScenarioId={activeCareScenario}
            onLogCareAction={handleLogCareAction}
          />
        )}

        {currentTab === 'retrace' && (
          <RetraceMode
            astronaut={selectedCrew}
            onSwitchToScenario={handleLaunchCare}
          />
        )}

        {currentTab === 'medical-kit' && (
          <MedicalKit />
        )}

        {currentTab === 'handoff' && (
          <HandoffScreen
            astronaut={selectedCrew}
            groundLink={groundLink}
            careLogs={careLogs}
            stormStatus={stormStatus}
          />
        )}

        {currentTab === 'sources' && (
          <SourcesScreen />
        )}
      </main>

      {/* Spaceflight Mission Command Footer */}
      <footer className="bg-[#070c18]/90 backdrop-blur-md border-t border-slate-800/80 py-4 text-xs font-mono text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">STORM SHIELD · TEAM EXTOKENED</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">NASA SPACE APPS CHALLENGE 2026 · THE NEXT FRONTIER</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-3">
            <span>Autonomy Level 2: Human Acts</span>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-400/90 font-medium">NASA HRP · NOAA SWPC · CDC · CSA Bio-Monitor</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
