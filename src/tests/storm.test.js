import { describe, it, expect } from 'vitest';
import { mapFluxToLevel, estimateStormDoseRate } from '../engine/storm.js';

describe('storm.js - NOAA Space Weather Radiation Storm Scale Engine', () => {
  it('maps low background flux (< 10 pfu) to S0 Quiet', () => {
    const storm = mapFluxToLevel(0.8);
    expect(storm.level).toBe('S0');
    expect(storm.severity).toBe('quiet');
    expect(storm.shelterRequired).toBe(false);
  });

  it('maps 38 pfu to S1 Minor (Watch)', () => {
    const storm = mapFluxToLevel(38);
    expect(storm.level).toBe('S1');
    expect(storm.severity).toBe('watch');
  });

  it('maps 280 pfu to S2 Moderate (Warning and Shelter preparation)', () => {
    const storm = mapFluxToLevel(280);
    expect(storm.level).toBe('S2');
    expect(storm.severity).toBe('warning');
    expect(storm.shelterRequired).toBe(true);
    expect(storm.promptBodyCheck).toBe(true);
  });

  it('maps 1850 pfu to S3 Strong (Shelter Now)', () => {
    const storm = mapFluxToLevel(1850);
    expect(storm.level).toBe('S3');
    expect(storm.severity).toBe('shelter');
    expect(storm.shelterRequired).toBe(true);
  });

  it('computes Artemis I ~4x dose attenuation inside storm shelter', () => {
    const dose = estimateStormDoseRate(4000);
    expect(dose.unshieldedMgyPerHour).toBe(10.0);
    expect(dose.shieldedMgyPerHour).toBe(2.5);
    expect(dose.shieldingFactor).toBe(4.0);
  });
});
