/**
 * adapter.js
 * Device Feed Adapter Interface for wearable medical telemetry (CSA Bio-Monitor specification).
 * Standardizes physiological streams between simulation mock and future hardware APIs.
 */

/**
 * Standard Telemetry Sample Contract
 * @typedef {object} BioMonitorSample
 * @property {string} t - ISO timestamp of the sample
 * @property {number} hr - Heart rate in beats per minute (bpm)
 * @property {string} ecg - ECG lead rhythm classification ('sinus_normal'|'sinus_tachycardia'|'arrhythmia')
 * @property {number} sbpEstimate - Continuous systolic blood pressure estimate (mmHg)
 * @property {number} dbpEstimate - Continuous diastolic blood pressure estimate (mmHg)
 * @property {number} rr - Respiration / breathing rate (breaths per minute)
 * @property {number} spo2 - Peripheral capillary blood oxygen saturation percentage (%)
 * @property {number} skinTemp - Peripheral skin surface temperature (°C)
 * @property {string} activity - Physical activity state ('rest'|'light_exercise'|'eva'|'sleep')
 * @property {number} quality - Telemetry signal quality index (0.0 to 1.0)
 * @property {string} provenance - Telemetry data source classification ('ANCHORED'|'REAL')
 * @property {boolean} isEstimate - Explicit flag: SBP is a pulse transit estimate
 * @property {boolean} isSkinTemp - Explicit flag: skin temp is not core body temperature
 */

/**
 * Validates and normalizes a raw wearable sample.
 * @param {object} rawSample
 * @returns {BioMonitorSample}
 */
export function formatSample(rawSample = {}) {
  return {
    t: rawSample.t || new Date().toISOString(),
    hr: Math.round(rawSample.hr ?? 72),
    ecg: rawSample.ecg || 'sinus_normal',
    sbpEstimate: Math.round(rawSample.sbpEstimate ?? 120),
    dbpEstimate: Math.round(rawSample.dbpEstimate ?? 78),
    rr: Math.round(rawSample.rr ?? 15),
    spo2: Math.min(100, Math.max(70, Math.round(rawSample.spo2 ?? 98))),
    skinTemp: Number((rawSample.skinTemp ?? 35.8).toFixed(1)),
    activity: rawSample.activity || 'rest',
    quality: Number((rawSample.quality ?? 0.98).toFixed(2)),
    provenance: 'ANCHORED',
    isEstimate: true,
    isSkinTemp: true,
    sensorModel: 'CSA Bio-Monitor Telemetry Adapter v4'
  };
}
