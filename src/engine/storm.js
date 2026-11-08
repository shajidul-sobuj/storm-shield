/**
 * storm.js
 * Solar Radiation Storm processor based on NOAA Space Weather Scales (S1-S5)
 * and Artemis I Orion transit dosimetry.
 */

export const NOAA_SCALES = {
  S0: {
    name: 'S0 Quiet',
    minFlux: 0,
    maxFlux: 10,
    severity: 'quiet',
    advisory: 'Interplanetary ambient background. Routine mission monitoring.',
    action: 'None. Nominal flight operations.',
    shelterRequired: false,
    promptBodyCheck: false
  },
  S1: {
    name: 'S1 Minor',
    minFlux: 10,
    maxFlux: 100,
    severity: 'watch',
    advisory: 'Minor biological risk; unshielded astronauts at elevated altitudes or EVA may experience minor exposure.',
    action: 'Place crew on radiation watch. Suspend scheduled Extravehicular Activity (EVA).',
    shelterRequired: false,
    promptBodyCheck: false
  },
  S2: {
    name: 'S2 Moderate',
    minFlux: 100,
    maxFlux: 1000,
    severity: 'warning',
    advisory: 'Moderate biological risk. Noticeable radiation hazard to astronauts during EVA.',
    action: 'IMMEDIATELY ABORT all ongoing EVAs. Ingress spacecraft airlock. Prepare storm shelter.',
    shelterRequired: true,
    promptBodyCheck: true
  },
  S3: {
    name: 'S3 Strong',
    minFlux: 1000,
    maxFlux: 10000,
    severity: 'shelter',
    advisory: 'Radiation hazard unavoidable without enhanced shielding. High dose rate to biological tissue.',
    action: 'CRITICAL SHELTER ORDER: All crew retreat to central storm shelter (water walls / logistics cargo).',
    shelterRequired: true,
    promptBodyCheck: true
  },
  S4: {
    name: 'S4 Severe',
    minFlux: 10000,
    maxFlux: 100000,
    severity: 'shelter',
    advisory: 'Severe radiation storm. Unavoidable biological damage to unshielded personnel.',
    action: 'EMERGENCY SHELTER PROTOCOL: Full containment. Don active personal dosimeters.',
    shelterRequired: true,
    promptBodyCheck: true
  },
  S5: {
    name: 'S5 Extreme',
    minFlux: 100000,
    maxFlux: Infinity,
    severity: 'shelter',
    advisory: 'Extreme Solar Particle Event. Lethal dose potential outside deep-core shielding.',
    action: 'MAXIMUM SURVIVABILITY PROTOCOL: Deepest core containment.',
    shelterRequired: true,
    promptBodyCheck: true
  }
};

/**
 * Maps proton flux >= 10 MeV (pfu) to NOAA storm tier and crew actions.
 * @param {number} fluxPfu - Proton flux in particles/(cm²·s·sr)
 * @returns {object} Storm level object with severity, advisory, and shelter mandates.
 */
export function mapFluxToLevel(fluxPfu) {
  const flux = Number(fluxPfu) || 0;

  if (flux >= 100000) return { level: 'S5', flux, ...NOAA_SCALES.S5 };
  if (flux >= 10000) return { level: 'S4', flux, ...NOAA_SCALES.S4 };
  if (flux >= 1000) return { level: 'S3', flux, ...NOAA_SCALES.S3 };
  if (flux >= 100) return { level: 'S2', flux, ...NOAA_SCALES.S2 };
  if (flux >= 10) return { level: 'S1', flux, ...NOAA_SCALES.S1 };
  return { level: 'S0', flux, ...NOAA_SCALES.S0 };
}

/**
 * Calculates estimated unshielded vs shielded absorbed dose rate based on Artemis I telemetry.
 * Artemis I Orion water/cargo wall provides ~4.0x attenuation against SPE protons.
 * @param {number} fluxPfu 
 * @returns {object} { unshieldedMgyPerHour, shieldedMgyPerHour, shieldingFactor: 4.0 }
 */
export function estimateStormDoseRate(fluxPfu) {
  const flux = Number(fluxPfu) || 0;
  // Approximate empirical conversion for >10 MeV SPE spectrum:
  // 1000 pfu is roughly ~2.5 mGy/hr unshielded in deep space transit
  const unshieldedMgyPerHour = Number(((flux / 1000) * 2.5).toFixed(2));
  const shieldedMgyPerHour = Number((unshieldedMgyPerHour / 4.0).toFixed(2));

  return {
    fluxPfu: flux,
    unshieldedMgyPerHour,
    shieldedMgyPerHour,
    shieldingFactor: 4.0,
    source: 'artemis1-radiation'
  };
}
