import { describe, it, expect } from 'vitest';
import { checkRedFlags, reviewPriorActions, findClosestScenario, processRetraceReport } from '../engine/retrace.js';

describe('retrace.js - Unexpected Event & Loss-Minimising Retrace Engine', () => {
  it('detects emergency red flags using ABCDE primary survey', () => {
    const criticalReport = {
      symptoms: ['shortness-of-breath', 'chest-discomfort'],
      vitals: { bp: { systolic: 78, diastolic: 48 }, hr: 135 }
    };

    const flags = checkRedFlags(criticalReport);
    expect(flags.length).toBeGreaterThan(0);
    expect(flags.some(f => f.category === 'Breathing')).toBe(true);
    expect(flags.some(f => f.category === 'Circulation')).toBe(true);
  });

  it('reviews prior off-script actions and flags allergy conflicts', () => {
    const patientWithAllergy = { allergies: ['aspirin', 'nsaids'] };
    const actionsTaken = ['administered chewable aspirin 325mg', 'seated patient in airlock'];

    const warnings = reviewPriorActions(actionsTaken, patientWithAllergy);
    expect(warnings.length).toBe(1);
    expect(warnings[0].issue).toContain('ALLERGY VIOLATION');
  });

  it('identifies closest planned scenario from symptoms', () => {
    const cardioEvent = { symptoms: ['chest-discomfort'] };
    const match = findClosestScenario(cardioEvent);
    expect(match.scenarioId).toBe('cardio-scare');

    const stormEvent = { symptoms: ['nausea', 'vomiting'], description: 'after solar storm' };
    const stormMatch = findClosestScenario(stormEvent);
    expect(stormMatch.scenarioId).toBe('post-storm-illness');
  });

  it('executes full retrace pipeline with explicit low confidence disclosure', () => {
    const report = {
      description: 'Astronaut felt sudden dizziness and nausea following maintenance in habitat node 2',
      symptoms: ['nausea'],
      actionsTaken: ['rested for 5 minutes']
    };

    const result = processRetraceReport(report, { allergies: [] }, []);
    expect(result.confidence).toBe('low');
    expect(result.confidenceNote).toContain('Outside planned scenarios: low confidence');
    expect(result.ladderSteps.length).toBe(5);
    expect(result.ladderSteps[0].tier).toBe(1); // Stop harm first
  });
});
