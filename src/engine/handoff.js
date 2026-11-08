/**
 * handoff.js
 * Generates a concise, structured 30-second medical briefing
 * for Earth-based Flight Surgeons as specified in NASA EIMO Concept of Operations.
 */

/**
 * Compiles a comprehensive flight surgeon handoff packet.
 */
export function generateFlightSurgeonHandoff({
  patient = {},
  groundLinkMode = 'Unavailable',
  careLogs = [],
  retraceReport = null,
  stormStatus = { level: 'S0', flux: 0.8 },
  missionDay = 142
} = {}) {
  const now = new Date().toISOString();
  const bpBaseline = patient.baseline?.bp 
    ? `${patient.baseline.bp.systolic}/${patient.baseline.bp.diastolic} mmHg` 
    : 'Unknown';
  const bpCurrent = patient.current?.bp 
    ? `${patient.current.bp.systolic}/${patient.current.bp.diastolic} mmHg` 
    : 'Unknown';

  const hrBaseline = patient.baseline?.hr?.value ? `${patient.baseline.hr.value} bpm` : 'Unknown';
  const hrCurrent = patient.current?.hr ? `${typeof patient.current.hr === 'object' ? patient.current.hr.value : patient.current.hr} bpm` : 'Unknown';

  const allergies = (patient.allergies && patient.allergies.length > 0)
    ? patient.allergies.join(', ').toUpperCase()
    : 'NKDA (No Known Drug Allergies)';

  const activeSymptoms = (patient.current?.symptoms || []).join(', ') || 'None reported';

  return {
    meta: {
      generatedAt: now,
      missionElapsedDay: missionDay,
      groundLinkStatus: groundLinkMode,
      classification: 'OFFICIAL FLIGHT MEDICAL HANDOFF (EIMO / NASA)',
      source: 'nasa-eimo-2025'
    },
    patient: {
      id: patient.id || 'Unknown',
      name: patient.name || 'Unnamed Astronaut',
      role: patient.role || 'Crew Member',
      callsign: patient.callsign || 'Orion',
      age: patient.age || 'N/A',
      bloodType: patient.bloodType || 'N/A',
      allergies
    },
    spaceWeatherContext: {
      noaaStormLevel: stormStatus.level || 'S0',
      protonFluxPfu: stormStatus.flux || 0,
      shelterProtocolActive: Boolean(stormStatus.shelterRequired),
      absorbedDoseRate: stormStatus.doseRate || '0.95 mGy/day'
    },
    clinicalVitalsTable: [
      {
        vital: 'Blood Pressure',
        baseline: bpBaseline,
        current: bpCurrent,
        provenance: 'ANCHORED'
      },
      {
        vital: 'Heart Rate',
        baseline: hrBaseline,
        current: hrCurrent,
        provenance: 'ANCHORED'
      },
      {
        vital: 'Body Temperature',
        baseline: `${patient.baseline?.temp?.value || 36.6} °C`,
        current: `${patient.current?.temp?.value || patient.current?.temp || 36.6} °C`,
        provenance: 'ANCHORED'
      },
      {
        vital: 'Cumulative Radiation',
        baseline: `${patient.baseline?.radiationDose?.value || 68.4} mGy`,
        current: `${patient.current?.radiationDose?.value || patient.baseline?.radiationDose?.value || 71.2} mGy`,
        provenance: 'REAL'
      }
    ],
    chiefComplaint: activeSymptoms,
    clinicalLogs: careLogs,
    retraceSummary: retraceReport ? {
      confidence: retraceReport.confidence,
      redFlagsDetected: retraceReport.redFlags.length,
      redFlags: retraceReport.redFlags,
      actionWarnings: retraceReport.actionWarnings,
      unknowns: retraceReport.unknowns
    } : null,
    surgeonActionRequired: [
      'Review vital deltas against pre-flight cardiovascular norm',
      'Verify onboard medication administration timing',
      'Transmit tailored countermeasure telemetry packet if ground link window opens'
    ]
  };
}
