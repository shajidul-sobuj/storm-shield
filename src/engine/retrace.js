/**
 * retrace.js
 * Retrace mode for unexpected in-flight medical events.
 * Executes a deterministic, loss-minimising priority ladder:
 * 1. Stop ongoing harm
 * 2. Protect life functions (ABCDE)
 * 3. Prefer reversible, low-risk actions
 * 4. Preserve time (tighten recheck intervals)
 * 5. Preserve information (build forensic timeline)
 * 6. Preserve scarce supplies
 */

import { verifyAllergySafety } from './care.js';

export const LOSS_LADDER_TIERS = [
  { tier: 1, name: 'Stop Ongoing Harm', priority: 'Immediate' },
  { tier: 2, name: 'Protect Life Functions (Airway, Breathing, Circulation)', priority: 'Immediate' },
  { tier: 3, name: 'Execute Reversible, Conservative Actions', priority: 'Urgent' },
  { tier: 4, name: 'Preserve Time & Shorten Recheck Windows', priority: 'Continuous' },
  { tier: 5, name: 'Preserve Clinical Information for Flight Surgeon', priority: 'Continuous' },
  { tier: 6, name: 'Conserve Scarce Mission Consumables', priority: 'Standard' }
];

/**
 * Executes a generic primary-survey red-flag check (ABCDE framework).
 * @param {object} report - Report containing symptoms, vitals, and description
 * @returns {Array} List of detected red flags
 */
export function checkRedFlags(report = {}) {
  const flags = [];
  const symptoms = (report.symptoms || []).map(s => s.toLowerCase());
  const vitals = report.vitals || {};
  const desc = (report.description || '').toLowerCase();

  // A - Airway
  if (symptoms.includes('stridor') || desc.includes('choking') || desc.includes('airway obstructed')) {
    flags.push({ category: 'Airway', severity: 'critical', text: 'Potential airway obstruction or severe stridor detected.', source: 'who-primary-survey' });
  }

  // B - Breathing
  if (symptoms.includes('shortness-of-breath') || symptoms.includes('dyspnea') || (vitals.spo2 && vitals.spo2 < 90)) {
    flags.push({ category: 'Breathing', severity: 'critical', text: 'Acute respiratory compromise or severe hypoxemia.', source: 'who-primary-survey' });
  }

  // C - Circulation
  if (symptoms.includes('chest-discomfort') || (vitals.bp && vitals.bp.systolic < 85) || (vitals.hr && vitals.hr > 130)) {
    flags.push({ category: 'Circulation', severity: 'critical', text: 'Hemodynamic instability: severe hypotension, critical tachycardia, or chest discomfort.', source: 'nih-heart-firstaid' });
  }

  // D - Disability / Neurological
  if (symptoms.includes('syncope') || symptoms.includes('unconscious') || desc.includes('fainted') || desc.includes('seizure')) {
    flags.push({ category: 'Disability/Neuro', severity: 'critical', text: 'Loss of consciousness, syncope, or acute neurological deficit.', source: 'who-primary-survey' });
  }

  // E - Exposure / Trauma
  if (desc.includes('chemical splash') || desc.includes('radiation exposure') || desc.includes('burn')) {
    flags.push({ category: 'Exposure', severity: 'warning', text: 'Environmental, chemical, or acute radiation exposure hazard.', source: 'who-primary-survey' });
  }

  return flags;
}

/**
 * Reviews actions already taken by crew against profile allergies and kit contraindications.
 * @param {Array} actionsTaken - List of action strings or items used
 * @param {object} patientProfile - Patient profile
 * @param {Array} kitInventory - Onboard medical kit
 * @returns {Array} List of safety warnings / conflicts
 */
export function reviewPriorActions(actionsTaken = [], patientProfile = {}, kitInventory = []) {
  const warnings = [];
  const allergies = (patientProfile.allergies || []).map(a => a.toLowerCase());

  for (const act of actionsTaken) {
    const actStr = (typeof act === 'string' ? act : act.name || '').toLowerCase();

    // Check aspirin / NSAID conflict
    if ((actStr.includes('aspirin') || actStr.includes('ibuprofen') || actStr.includes('nsaid')) && allergies.includes('aspirin')) {
      warnings.push({
        severity: 'danger',
        action: actStr,
        issue: `ALLERGY VIOLATION: Patient has documented allergy to Aspirin/NSAIDs. Monitor closely for bronchospasm, urticaria, or anaphylaxis.`,
        source: 'nih-heart-firstaid'
      });
    }

    // Check penicillin conflict
    if (actStr.includes('penicillin') && allergies.includes('penicillin')) {
      warnings.push({
        severity: 'danger',
        action: actStr,
        issue: `ALLERGY VIOLATION: Patient has documented Penicillin allergy. Prepare Epinephrine auto-injector if anaphylaxis signs appear.`,
        source: 'who-primary-survey'
      });
    }
  }

  return warnings;
}

/**
 * Checks for closest scenario matches to allow clean handoff to pre-computed trees.
 * @param {object} report 
 * @returns {object|null}
 */
export function findClosestScenario(report = {}) {
  const symptoms = (report.symptoms || []).map(s => s.toLowerCase());
  const desc = (report.description || '').toLowerCase();

  if (symptoms.includes('chest-discomfort') || desc.includes('chest pain') || desc.includes('heart flutter')) {
    return {
      scenarioId: 'cardio-scare',
      title: 'Scenario A: Acute Chest Discomfort',
      confidence: 0.85,
      recommendation: 'Symptoms closely match Scenario A. Consider switching to guided Care Mode.'
    };
  }

  if (symptoms.includes('nausea') || symptoms.includes('vomiting') || desc.includes('radiation') || desc.includes('solar storm')) {
    return {
      scenarioId: 'post-storm-illness',
      title: 'Scenario B: Post-Storm Nausea & Radiation Dose',
      confidence: 0.80,
      recommendation: 'Symptoms and timing suggest post-storm evaluation. Switch to Scenario B for dose-verified care.'
    };
  }

  return null;
}

/**
 * Generates the loss-minimising priority ladder steps for an unexpected event.
 * @param {object} report 
 * @param {object} patientProfile 
 * @param {Array} kitInventory 
 * @returns {object} Full Retrace processing report
 */
export function processRetraceReport(report = {}, patientProfile = {}, kitInventory = []) {
  const redFlags = checkRedFlags(report);
  const actionWarnings = reviewPriorActions(report.actionsTaken || [], patientProfile, kitInventory);
  const scenarioMatch = findClosestScenario(report);

  const ladderSteps = [
    {
      tier: 1,
      title: 'Halt Hazardous Tasks & Ensure Physical Safety',
      text: 'Order immediate cessation of physical exertion, treadmill workout, or high-risk maintenance tasks. Ensure patient is seated or tethered in a zero-G couch.',
      source: 'nasa-cds-2022'
    },
    {
      tier: 2,
      title: 'Primary Vital Stabilization (Airway / Breathing / Pulse)',
      text: 'Verify clear oral airway. Measure pulse, SpO2, and automated blood pressure cuff reading. Keep medical oxygen delivery on standby.',
      source: 'who-primary-survey'
    },
    {
      tier: 3,
      title: 'Non-Invasive, Reversible Countermeasures',
      text: 'Administer oral sips of electrolyte rehydration if patient is conscious and alert. Avoid irreversible pharmaceuticals without flight surgeon or clear diagnosis.',
      source: 'nasa-cds-2022'
    },
    {
      tier: 4,
      title: 'Initiate 10-Minute Rapid Serial Recheck',
      text: 'Re-assess vitals and subjective pain/discomfort scale every 10 minutes. Record any acute trends.',
      source: 'who-primary-survey'
    },
    {
      tier: 5,
      title: 'Compile Ground Handoff Packet',
      text: 'Timestamp all recorded observations, vitals, and actions taken into the local telemetry cache for transmission upon link recovery.',
      source: 'nasa-eimo-2025'
    }
  ];

  return {
    isUnexpected: true,
    confidence: 'low',
    confidenceNote: 'Outside planned scenarios: low confidence. Guidance restricted to conservative, loss-minimising emergency stabilization.',
    redFlags,
    actionWarnings,
    scenarioMatch,
    ladderSteps,
    unknowns: [
      'Exact underlying etiology unknown',
      'Clinical laboratory confirmation unavailable in habitat',
      'Definitive imaging unavailable'
    ],
    timestamp: new Date().toISOString()
  };
}
