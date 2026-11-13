import { describe, it, expect } from 'vitest';
import { 
  DEFAULT_NASA_KEY, 
  parseLiveGoesData,
  fetchNasaSpaceWeather, 
  fetchLiveGoesProtonFlux,
  fetchUnifiedLiveSpaceWeather 
} from '../engine/nasaApi.js';

describe('nasaApi.js - Real-time NASA & NOAA Space Weather Service', () => {
  it('provides a valid default NASA API key format', () => {
    expect(DEFAULT_NASA_KEY).toBeDefined();
    expect(DEFAULT_NASA_KEY.length).toBeGreaterThan(20);
  });

  describe('parseLiveGoesData', () => {
    it('gracefully handles empty or non-array inputs with nominal defaults', () => {
      const res = parseLiveGoesData(null);
      expect(res.currentFlux).toBe(0.30);
      expect(res.satellite).toContain('GOES');
      expect(res.timeseries).toEqual([]);
    });

    it('correctly filters for >=10 MeV protons and extracts latest flux and timeseries', () => {
      const mockPoints = [
        { time_tag: '2026-11-13T09:00:00Z', satellite: 18, energy: '>=1 MeV', flux: 45.2 },
        { time_tag: '2026-11-13T09:00:00Z', satellite: 18, energy: '>=10 MeV', flux: 0.28 },
        { time_tag: '2026-11-13T09:10:00Z', satellite: 18, energy: '>=10 MeV', flux: 0.35 },
        { time_tag: '2026-11-13T09:20:00Z', satellite: 18, energy: '>=10 MeV', flux: 1.42 },
        { time_tag: '2026-11-13T09:20:00Z', satellite: 18, energy: '>=100 MeV', flux: 0.01 }
      ];

      const res = parseLiveGoesData(mockPoints);
      expect(res.currentFlux).toBe(1.42);
      expect(res.satellite).toBe('GOES-18');
      expect(res.timestamp).toBe('2026-11-13T09:20:00Z');
      expect(res.timeseries.length).toBeGreaterThanOrEqual(1);
      expect(res.timeseries[res.timeseries.length - 1].flux).toBe(1.42);
    });
  });

  it('fetchUnifiedLiveSpaceWeather produces a complete clinical telemetry model', async () => {
    const unified = await fetchUnifiedLiveSpaceWeather('DEMO_KEY');
    expect(unified).toHaveProperty('success', true);
    expect(unified).toHaveProperty('flux');
    expect(typeof unified.flux).toBe('number');
    expect(unified).toHaveProperty('stormLevel');
    expect(unified.stormLevel).toHaveProperty('level');
    expect(unified.stormLevel).toHaveProperty('severity');
    expect(unified).toHaveProperty('doseEstimate');
    expect(unified.doseEstimate).toHaveProperty('unshieldedMgyPerHour');
    expect(unified.doseEstimate).toHaveProperty('shieldedMgyPerHour');
    expect(unified).toHaveProperty('timeseries');
    expect(Array.isArray(unified.timeseries)).toBe(true);
    expect(unified).toHaveProperty('notifications');
    expect(Array.isArray(unified.notifications)).toBe(true);
  }, 15000);

  it('gracefully falls back when offline or timed out without throwing uncaught exceptions', async () => {
    const result = await fetchNasaSpaceWeather('DEMO_KEY');
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('live');
    expect(typeof result.live).toBe('boolean');
  }, 12000);
});
