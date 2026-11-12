import { describe, it, expect } from 'vitest';
import { AnomalyTracker, evaluateSampleDivergence } from '../engine/anomaly.js';
import { MockBioMonitor } from '../device/mockBioMonitor.js';

describe('PERSISTENCE RULE ANOMALY ENGINE (A3 & A7 Verification)', () => {
  const mockBaseline = {
    hr: { value: 60, unit: 'bpm' },
    bp: { systolic: 115, diastolic: 75, unit: 'mmHg' },
    spo2: { value: 98, unit: '%' },
    rr: { value: 14, unit: 'brpm' },
    temp: { value: 36.6, unit: '°C' }
  };

  it('evaluates individual samples and detects raw physiological divergence', () => {
    // Normal sample
    const normalSample = { hr: 62, spo2: 98, sbpEstimate: 116, rr: 14 };
    const normResult = evaluateSampleDivergence(normalSample, mockBaseline);
    expect(normResult.rawStatus).toBe('nominal');
    expect(normResult.violations.length).toBe(0);

    // Acute sample (HR 125, SpO2 88)
    const acuteSample = { hr: 125, spo2: 88, sbpEstimate: 155, rr: 26 };
    const acuteResult = evaluateSampleDivergence(acuteSample, mockBaseline);
    expect(acuteResult.rawStatus).toBe('act');
    expect(acuteResult.violations.some(v => v.metric === 'hr')).toBe(true);
    expect(acuteResult.violations.some(v => v.metric === 'spo2')).toBe(true);
  });

  it('guarantees that a transient spike (1 or 2 ticks) does NOT trigger an Act alert', () => {
    const tracker = new AnomalyTracker({ persistenceWindow: 3 });

    // Tick 1: Normal
    const r1 = tracker.processSample({ hr: 60, spo2: 98, sbpEstimate: 115, rr: 14 }, mockBaseline);
    expect(r1.persistedStatus).toBe('nominal');

    // Tick 2: Sudden isolated spike (HR 130)
    const r2 = tracker.processSample({ hr: 130, spo2: 98, sbpEstimate: 115, rr: 14 }, mockBaseline);
    expect(r2.rawStatus).toBe('act');
    expect(r2.persistedStatus).toBe('nominal'); // Suppressed by persistence rule!
    expect(r2.consecutiveActCount).toBe(1);

    // Tick 3: Second spike
    const r3 = tracker.processSample({ hr: 130, spo2: 98, sbpEstimate: 115, rr: 14 }, mockBaseline);
    expect(r3.persistedStatus).toBe('nominal'); // Still suppressed!
    expect(r3.consecutiveActCount).toBe(2);

    // Tick 4: Returns to normal (spike resolved, motion artifact ended)
    const r4 = tracker.processSample({ hr: 62, spo2: 98, sbpEstimate: 115, rr: 14 }, mockBaseline);
    expect(r4.rawStatus).toBe('nominal');
    expect(r4.persistedStatus).toBe('nominal');
    expect(r4.consecutiveActCount).toBe(0); // Counter reset
  });

  it('triggers an Act alert only after 3 consecutive samples outside safe range', () => {
    const tracker = new AnomalyTracker({ persistenceWindow: 3 });

    // Tick 1
    const r1 = tracker.processSample({ hr: 125, spo2: 88, sbpEstimate: 155, rr: 26 }, mockBaseline);
    expect(r1.persistedStatus).toBe('nominal');

    // Tick 2
    const r2 = tracker.processSample({ hr: 128, spo2: 87, sbpEstimate: 158, rr: 28 }, mockBaseline);
    expect(r2.persistedStatus).toBe('nominal');

    // Tick 3: Persistence threshold reached!
    const r3 = tracker.processSample({ hr: 130, spo2: 86, sbpEstimate: 160, rr: 30 }, mockBaseline);
    expect(r3.persistedStatus).toBe('act');
    expect(r3.persistenceSatisfied).toBe(true);
    expect(r3.reason).toBeTruthy();
  });

  it('verifies MockBioMonitor generates anchored samples and advances scripted anomaly', () => {
    const monitor = new MockBioMonitor({ baseline: mockBaseline });
    const s1 = monitor.generateSample();
    expect(s1.provenance).toBe('ANCHORED');
    expect(s1.isEstimate).toBe(true);
    expect(s1.isSkinTemp).toBe(true);
    expect(s1.hr).toBeGreaterThan(50);
    expect(s1.hr).toBeLessThan(75);

    // Trigger scripted anomaly
    monitor.triggerScriptedAnomaly(true);
    for (let i = 0; i < 5; i++) {
      monitor.generateSample();
    }
    const severeSample = monitor.generateSample();
    expect(severeSample.hr).toBeGreaterThan(95);
    expect(severeSample.spo2).toBeLessThanOrEqual(94);
  });
});
