import { describe, it, expect } from 'vitest';
import { assessAstronaut } from '../engine/assess.js';

describe('assess.js - Multi-factor Health Status Assessor', () => {
  const nominalBaseline = {
    bp: { systolic: 112, diastolic: 72 },
    hr: { value: 64 },
    glucose: { value: 88 },
    temp: { value: 36.6 },
    sleep: { value: 7.4 }
  };

  it('evaluates completely nominal astronaut telemetry as nominal', () => {
    const current = {
      bp: { systolic: 115, diastolic: 74 },
      hr: { value: 68 },
      glucose: { value: 92 },
      temp: { value: 36.7 },
      sleep: { value: 7.0 },
      symptoms: []
    };

    const assessment = assessAstronaut(current, nominalBaseline);
    expect(assessment.status).toBe('nominal');
    expect(assessment.confidence).toBe('high');
    expect(assessment.unknowns.length).toBe(0);
  });

  it('escalates to act when chest discomfort or tachycardia occurs', () => {
    const current = {
      bp: { systolic: 148, diastolic: 96 },
      hr: { value: 104 },
      glucose: { value: 94 },
      temp: { value: 36.8 },
      sleep: { value: 5.2 },
      symptoms: ['chest-discomfort', 'shortness-of-breath']
    };

    const assessment = assessAstronaut(current, nominalBaseline);
    expect(assessment.status).toBe('act');
    expect(assessment.reasons.length).toBeGreaterThan(0);
  });

  it('escalates to watch for mild nausea or sub-febrile temperature', () => {
    const current = {
      bp: { systolic: 114, diastolic: 74 },
      hr: { value: 76 },
      glucose: { value: 90 },
      temp: { value: 37.4 },
      sleep: { value: 6.0 },
      symptoms: ['nausea']
    };

    const assessment = assessAstronaut(current, nominalBaseline);
    expect(assessment.status).toBe('watch');
  });

  it('escalates to act for acute hypoxemia (SpO2 < 90%) and tachypnea', () => {
    const current = {
      bp: { systolic: 115, diastolic: 74 },
      hr: { value: 72 },
      spo2: { value: 88 },
      rr: { value: 29 },
      symptoms: []
    };

    const assessment = assessAstronaut(current, nominalBaseline);
    expect(assessment.status).toBe('act');
    expect(assessment.reasons.some(r => r.includes('Hypoxemia'))).toBe(true);
    expect(assessment.reasons.some(r => r.includes('respiratory rate'))).toBe(true);
  });
});
