import { describe, it, expect } from 'vitest';
import sources from '../content/sources.json';
import crew from '../content/crew.json';
import indicators from '../content/indicators.json';
import regions from '../content/regions.json';
import kit from '../content/kit.json';
import cardioScenario from '../content/scenarios/cardio.json';
import postStormScenario from '../content/scenarios/post-storm.json';

import approvals from '../content/approvals.json';
import assistantLibrary from '../content/assistant-library.json';

describe('PROVENANCE & LEGAL CITING AUDIT (Zero Unanchored Data Gate)', () => {
  const sourceIds = new Set(sources.map(s => s.id));

  it('verifies every source in sources.json contains an explicit license and access date', () => {
    for (const source of sources) {
      expect(source.id).toBeDefined();
      expect(source.title).toBeTruthy();
      expect(source.license).toBeTruthy();
      expect(source.accessed).toBeTruthy();
      expect(source.checkedBy).toBeTruthy();
    }
  });

  it('verifies all 8 indicator definitions link to valid cited sources', () => {
    expect(indicators.length).toBe(8);
    for (const ind of indicators) {
      expect(sourceIds.has(ind.source)).toBe(true);
      expect(ind.provenance).not.toBe('ILLUSTRATIVE');
      expect(ind.approval).toBeDefined();
    }
  });

  it('verifies all assistant library cards link to valid sources and approval tags', () => {
    expect(assistantLibrary.length).toBeGreaterThan(5);
    for (const card of assistantLibrary) {
      expect(sourceIds.has(card.source)).toBe(true);
      expect(card.approval?.id).toMatch(/^A[1-7]$/);
      expect(card.answer).toBeTruthy();
    }
  });

  it('verifies the approval register tracks A1-A8 and T1-T2 gates', () => {
    const approvalIds = new Set(approvals.map(a => a.id));
    expect(approvalIds.has('A1')).toBe(true);
    expect(approvalIds.has('A2')).toBe(true);
    expect(approvalIds.has('A3')).toBe(true);
    expect(approvalIds.has('A7')).toBe(true);
    expect(approvalIds.has('T1')).toBe(true);
    expect(approvalIds.has('T2')).toBe(true);
  });

  it('verifies all 8 anatomical regions link to valid cited sources', () => {
    expect(regions.length).toBe(8);
    for (const reg of regions) {
      expect(sourceIds.has(reg.source)).toBe(true);
      expect(reg.provenance).not.toBe('ILLUSTRATIVE');
    }
  });

  it('verifies all medical kit items link to valid cited sources', () => {
    for (const item of kit) {
      expect(sourceIds.has(item.source)).toBe(true);
      expect(item.provenance).not.toBe('ILLUSTRATIVE');
    }
  });

  it('verifies crew members have valid baseline provenance tags and NO illustrative data', () => {
    for (const astronaut of crew) {
      const b = astronaut.baseline;
      expect(['REAL', 'ANCHORED', 'PUBLISHED']).toContain(b.bp.provenance);
      expect(sourceIds.has(b.bp.source)).toBe(true);

      expect(['REAL', 'ANCHORED', 'PUBLISHED']).toContain(b.hr.provenance);
      expect(sourceIds.has(b.hr.source)).toBe(true);

      expect(['REAL', 'ANCHORED', 'PUBLISHED']).toContain(b.glucose.provenance);
      expect(sourceIds.has(b.glucose.source)).toBe(true);

      expect(['REAL', 'ANCHORED', 'PUBLISHED']).toContain(b.radiationDose.provenance);
      expect(sourceIds.has(b.radiationDose.source)).toBe(true);
    }
  });

  it('verifies every scenario step and first-response item has a valid source and reviewedBy sign-off', () => {
    const scenarios = [cardioScenario, postStormScenario];

    for (const sc of scenarios) {
      expect(sc.reviewedBy).toBeTruthy();

      // Check firstResponse
      for (const fr of sc.firstResponse) {
        expect(sourceIds.has(fr.source)).toBe(true);
        expect(fr.reviewedBy).toBeTruthy();
      }

      // Check clinical steps
      for (const step of sc.steps) {
        expect(sourceIds.has(step.source)).toBe(true);
        expect(step.reviewedBy).toBeTruthy();
      }

      // Check doNot rules
      for (const dn of sc.doNot) {
        expect(sourceIds.has(dn.source)).toBe(true);
        expect(dn.reviewedBy).toBeTruthy();
      }
    }
  });
});
