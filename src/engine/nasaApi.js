/**
 * nasaApi.js
 * Integration service for official NASA DONKI (Space Weather Database Of Notifications,
 * Knowledge, Information) APIs with automatic offline fallback.
 */

export const DEFAULT_NASA_KEY = 'wBjQMWJPQWJLrbgNdp6BztqcR7BjHdWG6T97j7DL';

/**
 * Fetch latest space weather notifications from NASA DONKI.
 * @param {string} apiKey - Official NASA API key
 * @returns {Promise<object>} { success: boolean, live: boolean, notifications: Array, error?: string }
 */
export async function fetchNasaSpaceWeather(apiKey = DEFAULT_NASA_KEY) {
  const key = apiKey || DEFAULT_NASA_KEY;
  const today = new Date();
  const pastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const startDate = pastWeek.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const url = `https://api.nasa.gov/DONKI/notifications?startDate=${startDate}&endDate=${endDate}&type=all&api_key=${key}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`NASA API returned status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      live: true,
      notifications: Array.isArray(data) ? data : [],
      source: 'api.nasa.gov/DONKI'
    };
  } catch (err) {
    return {
      success: false,
      live: false,
      error: err.name === 'AbortError' ? 'NASA API connection timed out (Offline / Deep Space Latency)' : err.message,
      source: 'offline-bundled-fallback'
    };
  }
}
