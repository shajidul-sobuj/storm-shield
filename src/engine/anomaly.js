/**
 * anomaly.js
 * Statistical anomaly detector for astronaut telemetry.
 * Implements the V4 Persistence Rule [DOCTOR APPROVAL NEEDED: A3, A7]:
 * To eliminate false alarms from transient motion artifact, an ACT alert is
 * raised ONLY after N (default 3) consecutive samples outside nominal limits.
 */

export const DEFAULT_PERSISTENCE_WINDOW = 3;

/**
 * Check if a scalar value is outside safe operational boundaries.
 * @param {number} value - Measured telemetry value
 * @param {object} bounds - { watchMin, watchMax, actMin, actMax }
 * @returns {'nominal'|'watch'|'act'}
 */
export function classifySignal(value, bounds) {
  if (value === undefined || value === null || isNaN(value)) {
    return 'nominal';
  }
  if ((bounds.actMax !== undefined && value >= bounds.actMax) || 
      (bounds.actMin !== undefined && value <= bounds.actMin)) {
    return 'act';
  }
  if ((bounds.watchMax !== undefined && value >= bounds.watchMax) || 
      (bounds.watchMin !== undefined && value <= bounds.watchMin)) {
    return 'watch';
  }
  return 'nominal';
}

/**
 * Evaluates a single wearable sample against astronaut baseline and clinical bounds.
 * @param {object} sample - Wearable tick sample { hr, spo2, sbpEstimate, rr, skinTemp }
 * @param {object} baseline - Astronaut baseline { hr, bp, spo2, rr, temp }
 * @returns {object} { status: 'nominal'|'watch'|'act', violations: Array<{ metric, level, value, detail }> }
 */
export function evaluateSampleDivergence(sample = {}, baseline = {}) {
  const violations = [];

  // Heart Rate: baseline delta and absolute bounds
  if (sample.hr !== undefined) {
    const baseHr = (baseline.hr && baseline.hr.value) ? baseline.hr.value : (baseline.hr || 70);
    const hrDelta = sample.hr - baseHr;
    if (sample.hr >= 120 || sample.hr <= 45 || hrDelta >= 35) {
      violations.push({ metric: 'hr', level: 'act', value: sample.hr, detail: `Heart rate critically elevated: ${sample.hr} bpm (+${hrDelta} vs baseline)` });
    } else if (sample.hr >= 100 || sample.hr <= 50 || hrDelta >= 20) {
      violations.push({ metric: 'hr', level: 'watch', value: sample.hr, detail: `Heart rate elevated: ${sample.hr} bpm (+${hrDelta} vs baseline)` });
    }
  }

  // Blood Oxygen (SpO2): Wearable pulse oximetry
  if (sample.spo2 !== undefined) {
    if (sample.spo2 < 90) {
      violations.push({ metric: 'spo2', level: 'act', value: sample.spo2, detail: `Hypoxemia detected: SpO2 ${sample.spo2}% (critical < 90%)` });
    } else if (sample.spo2 <= 94) {
      violations.push({ metric: 'spo2', level: 'watch', value: sample.spo2, detail: `Marginal blood oxygen: SpO2 ${sample.spo2}% (watch <= 94%)` });
    }
  }

  // Blood Pressure Estimate (Systolic)
  if (sample.sbpEstimate !== undefined) {
    const baseSbp = (baseline.bp && baseline.bp.systolic) ? baseline.bp.systolic : 120;
    const sbpDelta = sample.sbpEstimate - baseSbp;
    if (sample.sbpEstimate >= 160 || sample.sbpEstimate <= 80 || sbpDelta >= 35) {
      violations.push({ metric: 'sbpEstimate', level: 'act', value: sample.sbpEstimate, detail: `Blood pressure estimate critical: ${sample.sbpEstimate} mmHg` });
    } else if (sample.sbpEstimate >= 140 || sample.sbpEstimate <= 90 || sbpDelta >= 20) {
      violations.push({ metric: 'sbpEstimate', level: 'watch', value: sample.sbpEstimate, detail: `Blood pressure estimate elevated: ${sample.sbpEstimate} mmHg` });
    }
  }

  // Respiration Rate (RR)
  if (sample.rr !== undefined) {
    if (sample.rr >= 28 || sample.rr <= 8) {
      violations.push({ metric: 'rr', level: 'act', value: sample.rr, detail: `Respiration rate extreme: ${sample.rr} brpm` });
    } else if (sample.rr >= 22 || sample.rr <= 10) {
      violations.push({ metric: 'rr', level: 'watch', value: sample.rr, detail: `Respiration rate elevated: ${sample.rr} brpm` });
    }
  }

  // Determine raw status
  const hasAct = violations.some(v => v.level === 'act');
  const hasWatch = violations.some(v => v.level === 'watch');
  const rawStatus = hasAct ? 'act' : (hasWatch ? 'watch' : 'nominal');

  return {
    rawStatus,
    violations
  };
}

/**
 * Stateful Anomaly Tracker that applies the Persistence Rule.
 * Only promotes an anomaly to 'act' when N consecutive ticks show an active violation.
 */
export class AnomalyTracker {
  constructor(options = {}) {
    this.persistenceWindow = options.persistenceWindow || DEFAULT_PERSISTENCE_WINDOW;
    this.consecutiveActCount = 0;
    this.consecutiveWatchCount = 0;
    this.history = [];
    this.currentStatus = 'nominal';
    this.lastTriggeredReason = null;
  }

  /**
   * Process a single incoming sample tick.
   * @param {object} sample - Wearable telemetry sample
   * @param {object} baseline - Astronaut baseline
   * @returns {object} Analysis result including persisted alert status
   */
  processSample(sample, baseline) {
    const analysis = evaluateSampleDivergence(sample, baseline);
    this.history.push({ ...sample, ...analysis });
    if (this.history.length > 50) this.history.shift();

    if (analysis.rawStatus === 'act') {
      this.consecutiveActCount += 1;
      this.consecutiveWatchCount += 1;
    } else if (analysis.rawStatus === 'watch') {
      this.consecutiveActCount = 0; // reset act counter if not act
      this.consecutiveWatchCount += 1;
    } else {
      this.consecutiveActCount = 0;
      this.consecutiveWatchCount = 0;
    }

    // Apply Persistence Rule
    let persistedStatus = 'nominal';
    let persistenceSatisfied = false;

    if (this.consecutiveActCount >= this.persistenceWindow) {
      persistedStatus = 'act';
      persistenceSatisfied = true;
      this.lastTriggeredReason = analysis.violations[0]?.detail || 'Sustained severe physiological deviation';
    } else if (this.consecutiveWatchCount >= this.persistenceWindow || analysis.rawStatus === 'watch') {
      persistedStatus = 'watch';
      this.lastTriggeredReason = analysis.violations[0]?.detail || 'Physiological metrics diverging from baseline';
    } else {
      persistedStatus = 'nominal';
      this.lastTriggeredReason = null;
    }

    this.currentStatus = persistedStatus;

    return {
      sample,
      rawStatus: analysis.rawStatus,
      persistedStatus,
      consecutiveActCount: this.consecutiveActCount,
      consecutiveWatchCount: this.consecutiveWatchCount,
      persistenceWindow: this.persistenceWindow,
      persistenceSatisfied,
      violations: analysis.violations,
      reason: this.lastTriggeredReason,
      accuracyNotice: 'Blood pressure is an estimate; skin temperature is not core temperature.'
    };
  }

  reset() {
    this.consecutiveActCount = 0;
    this.consecutiveWatchCount = 0;
    this.currentStatus = 'nominal';
    this.lastTriggeredReason = null;
    this.history = [];
  }
}
