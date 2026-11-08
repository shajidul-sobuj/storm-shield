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
      <div className="flex items-center justify-between p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-700">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Vitals & Symptoms Telemetry Log: {astronaut.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Log daily readings or acute episode changes. Values automatically compared with personal baseline.
            </p>
          </div>
        </div>

        <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-std-3001" />
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in font-mono font-medium shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Telemetry updated and re-evaluated by clinical triage engine.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Vitals Inputs Grid */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-xs font-mono font-bold text-sky-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Core Physiological Measurements
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            
            {/* Systolic BP */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Systolic BP (mmHg)</span>
                <span className="text-[11px] text-slate-400 font-mono font-normal">Base: {baseBP.systolic}</span>
              </label>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:bg-white focus:border-sky-500 focus:outline-none"
                required
              />
            </div>

            {/* Diastolic BP */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Diastolic BP (mmHg)</span>
                <span className="text-[11px] text-slate-400 font-mono font-normal">Base: {baseBP.diastolic}</span>
              </label>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:bg-white focus:border-sky-500 focus:outline-none"
                required
              />
            </div>

            {/* Heart Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Heart Rate (bpm)</span>
                <span className="text-[11px] text-slate-400 font-mono font-normal">Base: {baseHR}</span>
              </label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:bg-white focus:border-sky-500 focus:outline-none"
                required
              />
            </div>

            {/* Blood Glucose */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Blood Glucose (mg/dL)</span>
                <span className="text-[11px] text-slate-400 font-mono font-normal">Norm: 70-110</span>
              </label>
              <input
                type="number"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:bg-white focus:border-sky-500 focus:outline-none"
                required
              />
            </div>

            {/* Temperature */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Core Temperature (°C)</span>
                <span className="text-[11px] text-slate-400 font-mono font-normal">Norm: 36.5</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:bg-white focus:border-sky-500 focus:outline-none"
                required
              />
            </div>

            {/* Sleep */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Sleep Duration (hrs)</span>
                <span className="text-[11px] text-slate-400 font-mono font-normal">Target: 7.0-8.5</span>
              </label>
              <input
                type="number"
                step="0.5"
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:bg-white focus:border-sky-500 focus:outline-none"
                required
              />
            </div>

          </div>

          {/* Mood Slider */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
              <span>Cognitive & Mood Score: <strong className="text-sky-700 font-mono text-sm">{mood} / 5.0</strong></span>
              <span className="text-[11px] text-slate-400 font-normal">1: Exhausted - 5: Calm & Focused</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.5"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </div>

        </div>

        {/* Symptoms Checklist */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-mono font-bold text-sky-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Report Observable Symptoms
          </h3>
          <p className="text-xs text-slate-500">
            Select any symptoms experienced in the past 4 hours. Critical symptoms automatically trigger Care Mode advisories.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
                        ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                        : 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>{symp.label}</span>
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    active ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {active && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Update Telemetry & Re-Assess</span>
          </button>
        </div>

      </form>

    </div>
  );
}
