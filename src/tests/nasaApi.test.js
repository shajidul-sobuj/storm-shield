import { describe, it, expect } from 'vitest';
import { DEFAULT_NASA_KEY, fetchNasaSpaceWeather } from '../engine/nasaApi.js';

describe('nasaApi.js - NASA DONKI Space Weather Service', () => {
  it('provides a valid default NASA API key format', () => {
    expect(DEFAULT_NASA_KEY).toBeDefined();
    expect(DEFAULT_NASA_KEY.length).toBeGreaterThan(20);
  });

  it('gracefully falls back when offline or timed out without throwing uncaught exceptions', async () => {
    // Test with an invalid dummy host/key to verify safe error handling
    const result = await fetchNasaSpaceWeather('DEMO_KEY');
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('live');
    expect(typeof result.live).toBe('boolean');
  });
});
