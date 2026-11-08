import React, { useState } from 'react';
import initialCrew from './content/crew.json';
import { assessAstronaut } from './engine/assess.js';
import { mapFluxToLevel } from './engine/storm.js';
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

export default function App() {
  const [currentTab, setCurrentTab] = useState('overview');
  const [crewList, setCrewList] = useState(initialCrew);
  // Default to Alex Vance (crew-2) who illustrates the active cardiovascular scare & allergy check
  const [selectedCrewId, setSelectedCrewId] = useState('crew-2');
  const [groundLink, setGroundLink] = useState('Unavailable');
  const [stormStatus, setStormStatus] = useState(mapFluxToLevel(4200)); // Default S3 storm peak
  const [activeCareScenario, setActiveCareScenario] = useState('cardio-scare');
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

  const selectedCrew = crewList.find(c => c.id === selectedCrewId) || crewList[0];

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
    setCurrentTab('care-mode');
  };

  // Launch Retrace
  const handleLaunchRetrace = () => {
    setCurrentTab('retrace');
  };

  // Add Care Log
  const handleLogCareAction = (logEntry) => {
    setCareLogs(prev => [logEntry, ...prev]);
  };

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Primary Mission HUD Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        crewList={crewList}
        selectedCrewId={selectedCrewId}
        setSelectedCrewId={setSelectedCrewId}
        groundLink={groundLink}
        setGroundLink={setGroundLink}
        stormStatus={stormStatus}
        onOpenStormModal={() => setCurrentTab('storm-monitor')}
      />

      {/* Main Mission Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'overview' && (
          <Overview
            astronaut={selectedCrew}
            groundLink={groundLink}
            stormStatus={stormStatus}
            onLaunchCare={handleLaunchCare}
            onLaunchRetrace={handleLaunchRetrace}
            onOpenStorm={() => setCurrentTab('storm-monitor')}
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

        {currentTab === 'storm-monitor' && (
          <StormMonitor
            onSelectStormLevel={(newLevel) => setStormStatus(newLevel)}
            onLaunchCare={handleLaunchCare}
            onLaunchVitals={() => setCurrentTab('vitals-entry')}
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

      {/* Spaceflight Footer */}
      <footer className="bg-space-950 border-t border-slate-800/80 py-4 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>STORM SHIELD · TEAM EXTOKENED (NASA SPACE APPS CHALLENGE 2026)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Student Decision Support Prototype · Not clinically validated · Powered by CDC, NASA HRP & NOAA SWPC
          </div>
        </div>
      </footer>

    </div>
  );
}
