/**
 * mockBioMonitor.js
 * Simulates the Canadian Space Agency (CSA) Bio-Monitor wearable system.
 * Generates continuous physiological telemetry anchored to each astronaut's individual baseline,
 * with a triggerable scripted anomaly for judge demonstrations.
 */

import { formatSample } from './adapter.js';

export class MockBioMonitor {
  constructor(astronaut = null) {
    this.astronaut = astronaut;
    this.isAnomalyActive = false;
    this.anomalyStep = 0;
    this.timer = null;
    this.subscribers = new Set();
  }

  setAstronaut(astronaut) {
    this.astronaut = astronaut;
    this.anomalyStep = 0;
    this.isAnomalyActive = false;
  }

  triggerScriptedAnomaly(active = true) {
    this.isAnomalyActive = active;
    if (!active) {
      this.anomalyStep = 0;
    }
  }

  /**
   * Generates a single sample anchored to the current astronaut.
   */
  generateSample() {
    const base = this.astronaut?.baseline || {};
    const baseHr = (base.hr && base.hr.value) ? base.hr.value : 65;
    const baseSbp = (base.bp && base.bp.systolic) ? base.bp.systolic : 115;
    const baseDbp = (base.bp && base.bp.diastolic) ? base.bp.diastolic : 74;
    const baseSpo2 = (base.spo2 && base.spo2.value) ? base.spo2.value : 98;
    const baseRr = (base.rr && base.rr.value) ? base.rr.value : 14;
    const baseTemp = (base.temp && base.temp.value) ? base.temp.value : 36.6;

    // Natural physiological noise (sinus arrhythmia jitter)
    const hrJitter = (Math.random() - 0.5) * 2;
    const sbpJitter = (Math.random() - 0.5) * 3;
    const dbpJitter = (Math.random() - 0.5) * 2;
    const spo2Jitter = Math.random() > 0.8 ? -1 : 0;
    const rrJitter = (Math.random() - 0.5) * 1.5;

    let hr = baseHr + hrJitter;
    let sbp = baseSbp + sbpJitter;
    let dbp = baseDbp + dbpJitter;
    let spo2 = baseSpo2 + spo2Jitter;
    let rr = baseRr + rrJitter;
    let skinTemp = baseTemp - 0.8 + (Math.random() - 0.5) * 0.2; // skin temp typically ~35.8C in cabin
    let ecg = 'sinus_normal';

    // Apply scripted anomaly progression if active
    if (this.isAnomalyActive) {
      this.anomalyStep += 1;
      const progression = Math.min(1.0, this.anomalyStep / 4); // Reaches full anomaly severity across 4 ticks

      // Alex Vance cardiovascular & respiratory stress drift:
      // HR climbs toward 112 bpm
      hr = baseHr + (112 - baseHr) * progression + (Math.random() - 0.5) * 3;
      // SpO2 drops toward 91%
      spo2 = baseSpo2 - (baseSpo2 - 91) * progression + (Math.random() - 0.5) * 1;
      // SBP estimate increases toward 152 mmHg
      sbp = baseSbp + (152 - baseSbp) * progression + (Math.random() - 0.5) * 4;
      dbp = baseDbp + (98 - baseDbp) * progression;
      // RR increases toward 24 brpm
      rr = baseRr + (24 - baseRr) * progression;
      skinTemp += 0.4 * progression;
      ecg = this.anomalyStep >= 3 ? 'sinus_tachycardia' : 'sinus_normal';
    }

    return formatSample({
      t: new Date().toISOString(),
      hr,
      ecg,
      sbpEstimate: sbp,
      dbpEstimate: dbp,
      rr,
      spo2,
      skinTemp,
      activity: this.isAnomalyActive ? 'rest_acute' : 'rest',
      quality: 0.96 + Math.random() * 0.04
    });
  }

  /**
   * Start live streaming ticks.
   * @param {function} callback
   * @param {number} intervalMs
   */
  startStreaming(callback, intervalMs = 1500) {
    if (callback) this.subscribers.add(callback);
    if (!this.timer) {
      this.timer = setInterval(() => {
        const sample = this.generateSample();
        for (const sub of this.subscribers) {
          try {
            sub(sample);
          } catch (err) {
            console.error('BioMonitor subscriber error:', err);
          }
        }
      }, intervalMs);
    }
  }

  stopStreaming() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.subscribers.clear();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
}

// Global shared singleton for the application
export const mockBioMonitor = new MockBioMonitor();
