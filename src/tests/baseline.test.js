import { describe, it, expect } from 'vitest';
import { compareWithBaseline, evaluateBloodPressure } from '../engine/baseline.js';

describe('baseline.js - Personal Baseline Comparison Engine', () => {
  it('correctly calculates nominal baseline variation within tolerance', () => {
    const result = compareWithBaseline(68, 64, { watchPct: 15, actPct: 30 });
    expect(result.valid).toBe(true);
    expect(result.delta).toBe(4);
    expect(result.percentDelta).toBe(6.3);
    expect(result.status).toBe('nominal');
  });

  it('flags watch status when exceeding watch threshold', () => {
    const result = compareWithBaseline(78, 64, { watchPct: 15, actPct: 30 });
    expect(result.delta).toBe(14);
    expect(result.percentDelta).toBe(21.9);
    expect(result.status).toBe('watch');
  });

  it('flags act status when exceeding acute threshold', () => {
    const result = compareWithBaseline(104, 64, { watchPct: 15, actPct: 30 });
    expect(result.delta).toBe(40);
    expect(result.percentDelta).toBe(62.5);
    expect(result.status).toBe('act');
  });

  it('evaluates blood pressure against personal baseline and standard limits', () => {
    const nominal = evaluateBloodPressure({ systolic: 115, diastolic: 74 }, { systolic: 112, diastolic: 72 });
    expect(nominal.status).toBe('nominal');

    const hypertensionAlert = evaluateBloodPressure({ systolic: 148, diastolic: 96 }, { systolic: 118, diastolic: 76 });
    expect(hypertensionAlert.status).toBe('act');

    const hypotensionAlert = evaluateBloodPressure({ systolic: 84, diastolic: 54 }, { systolic: 118, diastolic: 76 });
    expect(hypotensionAlert.status).toBe('act');
  });
});
