import { describe, it, expect } from 'vitest';
import { checkKitAvailability, verifyAllergySafety, evaluateScenarioRules } from '../engine/care.js';

describe('care.js - Supply-Aware Clinical Decision Support Engine', () => {
  const mockKit = [
    { id: 'aspirin', quantity: 30 },
    { id: 'ondansetron', quantity: 18 },
    { id: 'oxygen-kit', quantity: 0 } // Exhausted item
  ];

  it('detects available and missing supplies from kit', () => {
    const availableResult = checkKitAvailability(['aspirin', 'ondansetron'], mockKit);
    expect(availableResult.available).toBe(true);
    expect(availableResult.missingItems.length).toBe(0);

    const exhaustedResult = checkKitAvailability(['oxygen-kit'], mockKit);
    expect(exhaustedResult.available).toBe(false);
    expect(exhaustedResult.missingItems).toContain('oxygen-kit');
  });

  it('enforces strict allergy safety check against crew medical profile', () => {
    const alexVance = { name: 'Alex Vance', allergies: ['aspirin', 'nsaids'] };
    const mayaLin = { name: 'Dr. Maya Lin', allergies: [] };

    const aspirinStep = {
      title: 'Aspirin Administration',
      cautionIfAllergicTo: ['aspirin', 'nsaids']
    };

    const alexCheck = verifyAllergySafety(aspirinStep, alexVance);
    expect(alexCheck.safe).toBe(false);
    expect(alexCheck.conflictingAllergens).toContain('aspirin');
    expect(alexCheck.warning).toContain('CONTRAINDICATION');

    const mayaCheck = verifyAllergySafety(aspirinStep, mayaLin);
    expect(mayaCheck.safe).toBe(true);
    expect(mayaCheck.warning).toBeNull();
  });

  it('triggers CDC dose and early vomiting rule in Scenario B', () => {
    const rules = [
      {
        condition: 'personalDoseMgy >= 700 && vomitingWithinHours <= 2',
        status: 'act',
        why: 'Early vomiting marker'
      },
      {
        condition: 'personalDoseMgy < 200',
        status: 'watch',
        why: 'Low dose'
      }
    ];

    const highDoseTrigger = evaluateScenarioRules(rules, { personalDoseMgy: 850, vomitingWithinHours: 1.5 });
    expect(highDoseTrigger.length).toBe(1);
    expect(highDoseTrigger[0].status).toBe('act');

    const lowDoseTrigger = evaluateScenarioRules(rules, { personalDoseMgy: 65 });
    expect(lowDoseTrigger.length).toBe(1);
    expect(lowDoseTrigger[0].status).toBe('watch');
  });
});
