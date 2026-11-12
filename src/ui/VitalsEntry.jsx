import React, { useState } from 'react';
import { HeartPulse, Check, AlertCircle, RefreshCw, Save, Wifi, Droplet, Wind } from 'lucide-react';
import ProvenanceBadge from './ProvenanceBadge.jsx';
import { mockBioMonitor } from '../device/mockBioMonitor.js';

export default function VitalsEntry({ astronaut, onUpdateVitals }) {
  const [systolic, setSystolic] = useState(astronaut.current?.bp?.systolic || 120);
  const [diastolic, setDiastolic] = useState(astronaut.current?.bp?.diastolic || 80);
  const [heartRate, setHeartRate] = useState(typeof astronaut.current?.hr === 'object' ? astronaut.current.hr.value : astronaut.current?.hr || 70);
  const [glucose, setGlucose] = useState(typeof astronaut.current?.glucose === 'object' ? astronaut.current.glucose.value : astronaut.current?.glucose || 90);
  const [temperature, setTemperature] = useState(typeof astronaut.current?.temp === 'object' ? astronaut.current.temp.value : astronaut.current?.temp || 36.6);
  const [sleep, setSleep] = useState(typeof astronaut.current?.sleep === 'object' ? astronaut.current.sleep.value : astronaut.current?.sleep || 7.0);
  const [mood, setMood] = useState(typeof astronaut.current?.mood === 'object' ? astronaut.current.mood.value : astronaut.current?.mood || 4.0);
  const [spo2, setSpo2] = useState(astronaut.current?.spo2?.value || 98);
  const [rr, setRr] = useState(astronaut.current?.rr?.value || 15);
  const [selectedSymptoms, setSelectedSymptoms] = useState(astronaut.current?.symptoms || []);
  const [savedNotice, setSavedNotice] = useState(false);
  const [fetchNotice, setFetchNotice] = useState(false);

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

  const handleFetchFromWearable = () => {
    const sample = mockBioMonitor.generateSample();
    setHeartRate(sample.hr);
    setSystolic(sample.sbpEstimate);
    setDiastolic(sample.dbpEstimate);
    setSpo2(sample.spo2);
    setRr(sample.rr);
    setFetchNotice(true);
    setTimeout(() => setFetchNotice(false), 3000);
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
      spo2: Number(spo2),
      rr: Number(rr),
      symptoms: selectedSymptoms
    });

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const baseBP = astronaut.baseline?.bp || { systolic: 120, diastolic: 80 };
  const baseHR = astronaut.baseline?.hr?.value || 70;
  const baseSpo2 = astronaut.baseline?.spo2?.value || 98;
  const baseRr = astronaut.baseline?.rr?.value || 14;

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans animate-fade-in">
      
      {/* Title & Hardware Fetch Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-white border border-slate-200 shadow-xs gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-700">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Vitals & Telemetry Log: {astronaut.name}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                [Approval A3]
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              8 Physiological metrics (Challenge statement + Bio-Monitor smart vest streams).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleFetchFromWearable}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-xs"
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fetch from Bio-Monitor</span>
          </button>
          <ProvenanceBadge provenance="ANCHORED" sourceId="nasa-std-3001" />
        </div>
      </div>

      {fetchNotice && (
        <div className="p-3.5 rounded-lg bg-sky-50 border border-sky-300 text-sky-900 text-xs flex items-center gap-2 font-mono font-medium shadow-xs">
          <Wifi className="w-4 h-4 text-sky-600 shrink-0" />
          <span>Synchronized live readings from CSA Bio-Monitor wearable stream.</span>
        </div>
      )}

      {savedNotice && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-mono font-medium shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Telemetry updated and re-evaluated by clinical triage engine.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Vitals Inputs Grid */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-mono font-bold text-sky-800 uppercase tracking-wider">
              1. Core Physiological Measurements (8 Indicators)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Accuracy: Wearable BP is an estimate; skin temp is not core temp
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Systolic BP */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Systolic BP (mmHg)</span>
                <span className="text-[10px] text-slate-400 font-mono">Base: {baseBP.systolic}</span>
              </label>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:bg-white focus:border-sky-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-amber-700 font-mono block">Estimated</span>
            </div>

            {/* Diastolic BP */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Diastolic BP (mmHg)</span>
                <span className="text-[10px] text-slate-400 font-mono">Base: {baseBP.diastolic}</span>
              </label>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:bg-white focus:border-sky-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-amber-700 font-mono block">Estimated</span>
            </div>

            {/* Heart Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Heart Rate (bpm)</span>
                <span className="text-[10px] text-slate-400 font-mono">Base: {baseHR}</span>
              </label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:bg-white focus:border-sky-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-400 font-mono block">Bio-Monitor / Pulse</span>
            </div>

            {/* Blood Oxygen (SpO2) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>SpO2 (%)</span>
                <span className="text-[10px] text-slate-400 font-mono">Base: {baseSpo2}%</span>
              </label>
              <input
                type="number"
                min="70"
                max="100"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:bg-white focus:border-sky-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-sky-700 font-mono block">Pulse Oximeter</span>
            </div>

            {/* Breathing Rate (RR) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Breathing Rate (brpm)</span>
                <span className="text-[10px] text-slate-400 font-mono">Base: {baseRr}</span>
              </label>
              <input
                type="number"
                min="4"
                max="45"
                value={rr}
                onChange={(e) => setRr(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:bg-white focus:border-sky-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-teal-700 font-mono block">Thoracic Band</span>
            </div>

            {/* Blood Glucose */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Blood Glucose (mg/dL)</span>
                <span className="text-[10px] text-slate-400 font-mono">Norm: 70-110</span>
              </label>
              <input
                type="number"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:bg-white focus:border-sky-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-amber-600 font-mono block">Manual strip assay</span>
            </div>

            {/* Temperature */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Core Temperature (°C)</span>
                <span className="text-[10px] text-slate-400 font-mono">Norm: 36.5</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:bg-white focus:border-sky-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-teal-700 font-mono block">Tympanic / Oral Probe</span>
            </div>

            {/* Sleep */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Sleep Duration (hrs)</span>
                <span className="text-[10px] text-slate-400 font-mono">Target: 7.0-8.5</span>
              </label>
              <input
                type="number"
                step="0.5"
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:bg-white focus:border-sky-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-indigo-700 font-mono block">Actigraphy / Log</span>
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
