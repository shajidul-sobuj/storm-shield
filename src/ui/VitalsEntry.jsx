import React, { useState } from 'react';
import { HeartPulse, Check, AlertCircle, RefreshCw, Save } from 'lucide-react';
import ProvenanceBadge from './ProvenanceBadge.jsx';

export default function VitalsEntry({ astronaut, onUpdateVitals }) {
  const [systolic, setSystolic] = useState(astronaut.current?.bp?.systolic || 120);
  const [diastolic, setDiastolic] = useState(astronaut.current?.bp?.diastolic || 80);
  const [heartRate, setHeartRate] = useState(typeof astronaut.current?.hr === 'object' ? astronaut.current.hr.value : astronaut.current?.hr || 70);
  const [glucose, setGlucose] = useState(typeof astronaut.current?.glucose === 'object' ? astronaut.current.glucose.value : astronaut.current?.glucose || 90);
  const [temperature, setTemperature] = useState(typeof astronaut.current?.temp === 'object' ? astronaut.current.temp.value : astronaut.current?.temp || 36.6);
  const [sleep, setSleep] = useState(typeof astronaut.current?.sleep === 'object' ? astronaut.current.sleep.value : astronaut.current?.sleep || 7.0);
  const [mood, setMood] = useState(typeof astronaut.current?.mood === 'object' ? astronaut.current.mood.value : astronaut.current?.mood || 4.0);
  const [selectedSymptoms, setSelectedSymptoms] = useState(astronaut.current?.symptoms || []);
  const [savedNotice, setSavedNotice] = useState(false);

  const availableSymptoms = [
    { id: 'chest-discomfort', label: 'Chest Discomfort / Tightness', severity: 'critical' },
    { id: 'shortness-of-breath', label: 'Shortness of Breath / Dyspnea', severity: 'critical' },
    { id: 'repeated-vomiting', label: 'Repeated Vomiting (<2 hrs)', severity: 'critical' },
    { id: 'nausea', label: 'Persistent Nausea', severity: 'moderate' },
    { id: 'headache', label: 'Frontal / Space Headache', severity: 'mild' },
    { id: 'dizziness', label: 'Dizziness / Orthostatic Lightheadedness', severity: 'moderate' },
    { id: 'fatigue', label: 'Acute Fatigue', severity: 'mild' }
  ];

  const toggleSymptom = (id) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateVitals(astronaut.id, {
      bp: { systolic: Number(systolic), diastolic: Number(diastolic) },
      hr: Number(heartRate),
      glucose: Number(glucose),
      temp: Number(temperature),
      sleep: Number(sleep),
      mood: Number(mood),
      symptoms: selectedSymptoms
    });

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const baseBP = astronaut.baseline?.bp || { systolic: 120, diastolic: 80 };
  const baseHR = astronaut.baseline?.hr?.value || 70;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-space-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Vitals & Symptoms Telemetry Log: {astronaut.name}
            </h2>
            <p className="text-xs text-slate-400">
              Log daily readings or acute episode changes. Values automatically compared with personal baseline.
            </p>
          </div>
        </div>

        <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-std-3001" />
      </div>

      {savedNotice && (
        <div className="p-3 rounded-lg bg-emerald-950/90 border border-emerald-600 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in font-mono">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Telemetry updated and re-evaluated by clinical triage engine.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Vitals Inputs Grid */}
        <div className="p-6 rounded-xl bg-space-900/90 border border-slate-800 space-y-4">
          <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            1. Core Physiological Measurements
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* Systolic BP */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex justify-between">
                <span>Systolic BP (mmHg)</span>
                <span className="text-[11px] text-slate-400 font-mono">Base: {baseBP.systolic}</span>
              </label>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-space-950 border border-slate-700 text-slate-100 font-mono text-sm focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>

            {/* Diastolic BP */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex justify-between">
                <span>Diastolic BP (mmHg)</span>
                <span className="text-[11px] text-slate-400 font-mono">Base: {baseBP.diastolic}</span>
              </label>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-space-950 border border-slate-700 text-slate-100 font-mono text-sm focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>

            {/* Heart Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex justify-between">
                <span>Heart Rate (bpm)</span>
                <span className="text-[11px] text-slate-400 font-mono">Base: {baseHR}</span>
              </label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-space-950 border border-slate-700 text-slate-100 font-mono text-sm focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>

            {/* Blood Glucose */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex justify-between">
                <span>Blood Glucose (mg/dL)</span>
                <span className="text-[11px] text-slate-400 font-mono">Norm: 70-110</span>
              </label>
              <input
                type="number"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-space-950 border border-slate-700 text-slate-100 font-mono text-sm focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>

            {/* Temperature */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex justify-between">
                <span>Core Temperature (°C)</span>
                <span className="text-[11px] text-slate-400 font-mono">Norm: 36.5</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-space-950 border border-slate-700 text-slate-100 font-mono text-sm focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>

            {/* Sleep */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex justify-between">
                <span>Sleep Duration (hrs)</span>
                <span className="text-[11px] text-slate-400 font-mono">Target: 7.0-8.5</span>
              </label>
              <input
                type="number"
                step="0.5"
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-space-950 border border-slate-700 text-slate-100 font-mono text-sm focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>

          </div>

          {/* Mood Slider */}
          <div className="pt-2">
            <div className="flex justify-between items-center text-xs font-medium text-slate-300 mb-1">
              <span>Cognitive & Mood Score: <strong className="text-cyan-400 font-mono">{mood} / 5.0</strong></span>
              <span className="text-[11px] text-slate-400">1: Exhausted/Anxious - 5: Focused/Calm</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.5"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

        </div>

        {/* Symptoms Checklist */}
        <div className="p-6 rounded-xl bg-space-900/90 border border-slate-800 space-y-3">
          <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            2. Report Observable Symptoms
          </h3>
          <p className="text-xs text-slate-400">
            Select any symptoms experienced in the past 4 hours. Critical symptoms automatically trigger Care Mode advisories.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {availableSymptoms.map((symp) => {
              const active = selectedSymptoms.includes(symp.id);
              return (
                <button
                  type="button"
                  key={symp.id}
                  onClick={() => toggleSymptom(symp.id)}
                  className={`p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    active
                      ? symp.severity === 'critical'
                        ? 'bg-rose-950 border-rose-600 text-rose-200'
                        : 'bg-amber-950 border-amber-600 text-amber-200'
                      : 'bg-space-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="font-medium">{symp.label}</span>
                  <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                    active ? 'bg-cyan-500 border-cyan-400 text-black' : 'border-slate-600'
                  }`}>
                    {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Update Telemetry & Re-Assess</span>
          </button>
        </div>

      </form>

    </div>
  );
}
