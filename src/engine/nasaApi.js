/**
 * nasaApi.js
 * Integration service for real-time NASA DONKI (Space Weather Database Of Notifications,
 * Knowledge, Information) and NOAA Space Weather Prediction Center (SWPC) GOES satellite telemetry.
 */

import { mapFluxToLevel, estimateStormDoseRate } from './storm.js';

export const DEFAULT_NASA_KEY = 'wBjQMWJPQWJLrbgNdp6BztqcR7BjHdWG6T97j7DL';
export const NOAA_GOES_PROTON_URL = 'https://services.swpc.noaa.gov/json/goes/primary/integral-protons-plot-6-hour.json';

/**
 * Parses raw NOAA SWPC GOES integral proton points and extracts current >=10 MeV flux and timeseries.
 * Pure function for testing and reliability.
 * @param {Array} rawPoints - Array of { time_tag, satellite, energy, flux }
 * @returns {object} { currentFlux, timestamp, satellite, timeseries }
 */
export function parseLiveGoesData(rawPoints) {
  if (!Array.isArray(rawPoints) || rawPoints.length === 0) {
    return {
      currentFlux: 0.30,
      timestamp: new Date().toISOString(),
      satellite: 'GOES-18 (Default)',
      timeseries: []
    };
  }

  // Filter for integral energetic protons >= 10 MeV
  const proton10Mev = rawPoints.filter(p => p.energy === '>=10 MeV' && typeof p.flux === 'number');

  if (proton10Mev.length === 0) {
    return {
      currentFlux: 0.30,
      timestamp: new Date().toISOString(),
      satellite: 'GOES-18',
      timeseries: []
    };
  }

  const latest = proton10Mev[proton10Mev.length - 1];
  const currentFlux = Number(latest.flux.toFixed(3));
  const satellite = latest.satellite ? `GOES-${latest.satellite}` : 'GOES-18';

  // Sample roughly 12-16 points across the 6-hour window for timeline visualization
  const sampleStep = Math.max(1, Math.floor(proton10Mev.length / 14));
  const timeseries = [];
  for (let i = 0; i < proton10Mev.length; i += sampleStep) {
    const pt = proton10Mev[i];
    timeseries.push({
      timeTag: pt.time_tag,
      flux: Number(pt.flux.toFixed(3)),
      satellite: pt.satellite
    });
  }
  // Ensure the latest point is included at the end
  if (timeseries[timeseries.length - 1]?.timeTag !== latest.time_tag) {
    timeseries.push({
      timeTag: latest.time_tag,
      flux: currentFlux,
      satellite: latest.satellite
    });
  }

  return {
    currentFlux,
    timestamp: latest.time_tag,
    satellite,
    timeseries
  };
}

/**
 * Fetch live integral energetic proton flux from NOAA SWPC GOES primary satellite.
 * Updated every minute by NOAA. CORS enabled.
 * @returns {Promise<object>}
 */
export async function fetchLiveGoesProtonFlux() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(NOAA_GOES_PROTON_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        live: false,
        statusCode: response.status,
        message: `NOAA SWPC gateway HTTP ${response.status}`,
        currentFlux: 0.30,
        satellite: 'GOES-18',
        timeseries: []
      };
    }

    const data = await response.json();
    const parsed = parseLiveGoesData(data);

    return {
      success: true,
      live: true,
      statusCode: 200,
      ...parsed,
      message: `Synchronized with ${parsed.satellite} primary integral proton sensor (${parsed.currentFlux} pfu).`,
      source: 'services.swpc.noaa.gov'
    };
  } catch (err) {
    return {
      success: false,
      live: false,
      message: `NOAA GOES unreachable (${err.message}). Using autonomous baseline.`,
      currentFlux: 0.30,
      satellite: 'GOES-18 (Autonomous)',
      timeseries: []
    };
  }
}

/**
 * Fetch latest space weather notifications from NASA DONKI.
 * @param {string} apiKey - Official NASA API key
 * @returns {Promise<object>} { success: boolean, live: boolean, notifications: Array, message: string }
 */
export async function fetchNasaSpaceWeather(apiKey = DEFAULT_NASA_KEY) {
  const key = apiKey || DEFAULT_NASA_KEY;
  const url = `https://api.nasa.gov/DONKI/notifications?type=all&api_key=${key}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.status === 503) {
      return {
        success: false,
        live: false,
        statusCode: 503,
        notifications: [],
        message: 'NASA DONKI gateway undergoing upstream maintenance (HTTP 503).',
        source: 'offline-bundled-fallback'
      };
    }

    if (!response.ok) {
      return {
        success: false,
        live: false,
        statusCode: response.status,
        notifications: [],
        message: `NASA API gateway returned HTTP ${response.status}.`,
        source: 'offline-bundled-fallback'
      };
    }

    const data = await response.json();
    const notifications = Array.isArray(data) ? data : [];

    return {
      success: true,
      live: true,
      statusCode: 200,
      notifications,
      message: `Connected to NASA DONKI gateway (${notifications.length} space weather events).`,
      source: 'api.nasa.gov/DONKI'
    };
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    return {
      success: false,
      live: false,
      notifications: [],
      message: isTimeout 
        ? 'Deep-space communication latency / timeout from NASA DONKI.' 
        : `Network unreachable: ${err.message}`,
      source: 'offline-bundled-fallback'
    };
  }
}

/**
 * Aggregates live NOAA SWPC GOES proton flux + NASA DONKI alerts into a unified real-time telemetry model.
 * @param {string} apiKey - NASA API key
 * @returns {Promise<object>} Unified space weather status
 */
export async function fetchUnifiedLiveSpaceWeather(apiKey = DEFAULT_NASA_KEY) {
  const [goesResult, nasaResult] = await Promise.allSettled([
    fetchLiveGoesProtonFlux(),
    fetchNasaSpaceWeather(apiKey)
  ]);

  const goesData = goesResult.status === 'fulfilled' && goesResult.value?.success
    ? goesResult.value
    : {
        success: false,
        live: false,
        currentFlux: 0.30,
        satellite: 'GOES-18',
        timeseries: [],
        message: 'Autonomous nominal baseline'
      };

  const nasaData = nasaResult.status === 'fulfilled' && nasaResult.value?.success
    ? nasaResult.value
    : {
        success: false,
        live: false,
        notifications: [],
        message: 'NASA DONKI offline or standby'
      };

  const currentFlux = typeof goesData.currentFlux === 'number' ? goesData.currentFlux : 0.30;
  const stormLevel = mapFluxToLevel(currentFlux);
  const doseEstimate = estimateStormDoseRate(currentFlux);
  const isLive = goesData.live || nasaData.live;

  return {
    success: true,
    isLive,
    flux: currentFlux,
    stormLevel,
    doseEstimate,
    satellite: goesData.satellite,
    timeseries: goesData.timeseries || [],
    notifications: nasaData.notifications || [],
    goesMessage: goesData.message,
    nasaMessage: nasaData.message,
    lastUpdated: new Date().toISOString(),
    source: isLive ? `${goesData.satellite} + NASA DONKI` : 'Autonomous Deep-Space Standby'
  };
}
