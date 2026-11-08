/**
 * baseline.js
 * Compares an astronaut's current vital signs with their personal baseline first,
 * then evaluates against NASA/standard clinical reference boundaries.
 */

/**
 * Compare an individual reading with an astronaut's personal baseline.
 * @param {number} current - Current measured value.
 * @param {number} baseline - Astronaut's established pre-flight / nominal baseline.
 * @param {object} thresholdConfig - Standard tolerance margins.
 * @returns {object} Comparison result with absolute delta, percentage deviation, and status.
 */
export function compareWithBaseline(current, baseline, thresholdConfig = {}) {
  if (current === undefined || current === null || baseline === undefined || baseline === null) {
    return { valid: false, status: 'unknown', reason: 'Missing vital telemetry' };
  }

  const delta = Number((current - baseline).toFixed(2));
  const percentDelta = baseline !== 0 ? Number(((delta / baseline) * 100).toFixed(1)) : 0;

  // Defaults: 15% change is watch, 30% change is act
  const watchPct = thresholdConfig.watchPct || 15;
  const actPct = thresholdConfig.actPct || 30;

  let status = 'nominal';
  if (Math.abs(percentDelta) >= actPct) {
    status = 'act';
  } else if (Math.abs(percentDelta) >= watchPct) {
    status = 'watch';
  }

  return {
    valid: true,
    current,
    baseline,
    delta,
    percentDelta,
    status,
    isElevated: delta > 0,
    isDepressed: delta < 0
  };
}

/**
 * Evaluate compound blood pressure (systolic / diastolic) against baseline and standard ranges.
 * @param {object} current - { systolic, diastolic }
 * @param {object} baseline - { systolic, diastolic }
 * @returns {object}
 */
export function evaluateBloodPressure(current, baseline) {
  if (!current || !baseline) {
    return { status: 'unknown', reason: 'Blood pressure data incomplete' };
  }

  const sysComp = compareWithBaseline(current.systolic, baseline.systolic, { watchPct: 15, actPct: 25 });
  const diaComp = compareWithBaseline(current.diastolic, baseline.diastolic, { watchPct: 15, actPct: 25 });

  let status = 'nominal';
  const reasons = [];

  // Critical standard limits (NASA-STD-3001)
  if (current.systolic >= 160 || current.systolic < 90 || current.diastolic >= 100 || current.diastolic < 50) {
    status = 'act';
    reasons.push(`Critical absolute blood pressure threshold reached (${current.systolic}/${current.diastolic} mmHg)`);
  } else if (sysComp.status === 'act' || diaComp.status === 'act') {
    status = 'act';
    reasons.push(`Significant deviation from personal baseline (${sysComp.percentDelta}% systolic, ${diaComp.percentDelta}% diastolic)`);
  } else if (sysComp.status === 'watch' || diaComp.status === 'watch' || current.systolic >= 135 || current.diastolic >= 85) {
    status = 'watch';
    reasons.push(`Mild deviation from baseline (${sysComp.delta > 0 ? '+' : ''}${sysComp.delta}/${diaComp.delta > 0 ? '+' : ''}${diaComp.delta} mmHg)`);
  }

  return {
    status,
    systolic: sysComp,
    diastolic: diaComp,
    reasons
  };
}
