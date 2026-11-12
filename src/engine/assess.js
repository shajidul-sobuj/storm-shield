/**
 * assess.js
 * Multi-factor health status assessor for spaceflight crew.
 * Evaluates individual baselines first, followed by clinical reference limits,
 * symptoms, and spaceflight environmental factors.
 */

import { compareWithBaseline, evaluateBloodPressure } from './baseline.js';

/**
 * Assess comprehensive astronaut status.
 * @param {object} current - Astronaut current vitals { bp, hr, glucose, temp, sleep, mood, symptoms }
 * @param {object} baseline - Astronaut established baseline
 * @param {Array} indicatorDefs - Indicator definitions
 * @returns {object} { status: 'nominal'|'watch'|'act', primaryReason, reasons, confidence, unknowns }
 */
export function assessAstronaut(current = {}, baseline = {}, indicatorDefs = []) {
  const reasons = [];
  const unknowns = [];
  let highestStatus = 'nominal';

  // Helper to escalate status
  const escalate = (newStatus, reason) => {
    reasons.push(reason);
    if (newStatus === 'act') {
      highestStatus = 'act';
    } else if (newStatus === 'watch' && highestStatus !== 'act') {
      highestStatus = 'watch';
    }
  };

  // 1. Blood Pressure Check
  if (current.bp && baseline.bp) {
    const bpResult = evaluateBloodPressure(current.bp, baseline.bp);
    if (bpResult.status !== 'nominal') {
      escalate(bpResult.status, bpResult.reasons.join('; '));
    }
  } else {
    unknowns.push('Blood pressure telemetry missing');
  }

  // 2. Heart Rate Check
  if (current.hr !== undefined && baseline.hr !== undefined) {
    const hrVal = typeof current.hr === 'object' ? current.hr.value : current.hr;
    const baseVal = typeof baseline.hr === 'object' ? baseline.hr.value : baseline.hr;
    const hrComp = compareWithBaseline(hrVal, baseVal, { watchPct: 20, actPct: 40 });

    if (hrVal >= 120 || hrVal < 45 || hrComp.status === 'act') {
      escalate('act', `Tachycardia/arrhythmia alert: ${hrVal} bpm (${hrComp.percentDelta}% vs baseline ${baseVal} bpm)`);
    } else if (hrVal >= 100 || hrComp.status === 'watch') {
      escalate('watch', `Elevated heart rate: ${hrVal} bpm (baseline: ${baseVal} bpm)`);
    }
  } else {
    unknowns.push('Heart rate telemetry missing');
  }

  // 3. Blood Glucose Check
  if (current.glucose !== undefined && baseline.glucose !== undefined) {
    const gVal = typeof current.glucose === 'object' ? current.glucose.value : current.glucose;
    const gBase = typeof baseline.glucose === 'object' ? baseline.glucose.value : baseline.glucose;
    const gComp = compareWithBaseline(gVal, gBase, { watchPct: 25, actPct: 45 });

    if (gVal >= 180 || gVal < 60) {
      escalate('act', `Severe glycemic divergence: ${gVal} mg/dL`);
    } else if (gComp.status !== 'nominal' || gVal > 125) {
      escalate('watch', `Altered metabolic glucose: ${gVal} mg/dL`);
    }
  }

  // 4. Body Temperature Check
  if (current.temp !== undefined && baseline.temp !== undefined) {
    const tVal = typeof current.temp === 'object' ? current.temp.value : current.temp;
    const tBase = typeof baseline.temp === 'object' ? baseline.temp.value : baseline.temp;
    if (tVal >= 38.3) {
      escalate('act', `Fever detected: ${tVal} °C`);
    } else if (tVal >= 37.6 || tVal < 35.8) {
      escalate('watch', `Sub-febrile / temperature shift: ${tVal} °C`);
    }
  }

  // 5. Blood Oxygen (SpO2) Check
  if (current.spo2 !== undefined) {
    const spo2Val = typeof current.spo2 === 'object' ? current.spo2.value : current.spo2;
    if (spo2Val < 90) {
      escalate('act', `Hypoxemia alert: SpO2 ${spo2Val}% (critical < 90%)`);
    } else if (spo2Val <= 94) {
      escalate('watch', `Borderline oxygen saturation: SpO2 ${spo2Val}%`);
    }
  }

  // 6. Respiration Rate (RR) Check
  if (current.rr !== undefined) {
    const rrVal = typeof current.rr === 'object' ? current.rr.value : current.rr;
    if (rrVal >= 28 || rrVal <= 8) {
      escalate('act', `Severe respiratory rate abnormality: ${rrVal} brpm`);
    } else if (rrVal >= 22 || rrVal <= 10) {
      escalate('watch', `Altered respiratory rate: ${rrVal} brpm`);
    }
  }

  // 7. Sleep & Cognitive Fatigue Check
  if (current.sleep !== undefined) {
    const sVal = typeof current.sleep === 'object' ? current.sleep.value : current.sleep;
    if (sVal < 4.5) {
      escalate('watch', `Acute sleep deprivation: ${sVal} hrs`);
    }
  }

  // 6. Symptoms Check (High clinical weight)
  const symptoms = current.symptoms || [];
  if (symptoms.includes('chest-discomfort') || symptoms.includes('shortness-of-breath')) {
    escalate('act', 'Cardiovascular symptom reported: chest discomfort or acute shortness of breath');
  }
  if (symptoms.includes('repeated-vomiting')) {
    escalate('act', 'Severe gastrointestinal distress: repeated vomiting within exposure window');
  }
  if (symptoms.includes('nausea') && highestStatus === 'nominal') {
    escalate('watch', 'Mild gastrointestinal prodrome: persistent nausea');
  }

  // Confidence estimation
  let confidence = 'high';
  if (unknowns.length > 2) {
    confidence = 'low';
  } else if (unknowns.length > 0 || symptoms.length > 2) {
    confidence = 'moderate';
  }

  const primaryReason = reasons.length > 0 
    ? reasons[0] 
    : 'All telemetry metrics within personalized baseline and mission bounds.';

  return {
    status: highestStatus,
    primaryReason,
    reasons,
    confidence,
    unknowns,
    evaluatedAt: new Date().toISOString()
  };
}
