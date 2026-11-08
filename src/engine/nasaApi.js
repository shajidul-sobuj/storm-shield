/**
 * nasaApi.js
 * Integration service for official NASA DONKI (Space Weather Database Of Notifications,
 * Knowledge, Information) APIs with automatic offline fallback.
 */

export const DEFAULT_NASA_KEY = 'wBjQMWJPQWJLrbgNdp6BztqcR7BjHdWG6T97j7DL';

/**
 * Fetch latest space weather notifications from NASA DONKI.
 * @param {string} apiKey - Official NASA API key
 * @returns {Promise<object>} { success: boolean, live: boolean, notifications: Array, message: string }
 */
export async function fetchNasaSpaceWeather(apiKey = DEFAULT_NASA_KEY) {
  const key = apiKey || DEFAULT_NASA_KEY;

  // Query DONKI notifications without passing future dates (allows NASA server to default to latest available window)
  const url = `https://api.nasa.gov/DONKI/notifications?type=all&api_key=${key}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.status === 503) {
      return {
        success: false,
        live: false,
        statusCode: 503,
        message: 'NASA DONKI gateway is currently undergoing upstream maintenance (HTTP 503). Autonomous deep-space fallback engaged with bundled May 2024 GOES-16 telemetry.',
        source: 'offline-bundled-fallback'
      };
    }

    if (!response.ok) {
      return {
        success: false,
        live: false,
        statusCode: response.status,
        message: `NASA API gateway returned HTTP ${response.status}: ${response.statusText || 'Service Temporarily Unavailable'}. Autonomous deep-space fallback active.`,
        source: 'offline-bundled-fallback'
      };
    }

    const data = await response.json();
    return {
      success: true,
      live: true,
      statusCode: 200,
      notifications: Array.isArray(data) ? data : [],
      message: `Successfully connected to NASA DONKI gateway. ${Array.isArray(data) ? data.length : 0} live space weather alerts synchronized.`,
      source: 'api.nasa.gov/DONKI'
    };
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    return {
      success: false,
      live: false,
      message: isTimeout 
        ? 'Deep-space communication latency / network timeout. Autonomous deep-space fallback engaged.' 
        : `Network unreachable: ${err.message}. Operating in autonomous EIMO offline mode.`,
      source: 'offline-bundled-fallback'
    };
  }
}
