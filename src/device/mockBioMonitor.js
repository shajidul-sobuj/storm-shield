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
    this.allowJitter = true;
    this.intervalMs = 1500;
  }

  setAstronaut(astronaut) {
    this.astronaut = astronaut;
    this.anomalyStep = 0;
    this.isAnomalyActive = false;
  }

  setAllowJitter(allow = true) {
    this.allowJitter = allow;
  }

  triggerScriptedAnomaly(active = true) {
    this.isAnomalyActive = active;
    if (!active) {
      this.anomalyStep = 0;
    }
  }

  /**
   * Generates a single sample anchored to the current astronaut.
   * If astronaut has active current vitals, it anchors to those;
   * otherwise it falls back to the personal baseline.
   */
  generateSample() {
    const base = this.astronaut?.baseline || {};
    const curr = this.astronaut?.current || {};

    const baseHr = (curr.hr && typeof curr.hr === 'object') ? curr.hr.value : (curr.hr != null ? curr.hr : ((base.hr && base.hr.value) ? base.hr.value : 65));
    const baseSbp = (curr.bp && curr.bp.systolic) ? curr.bp.systolic : ((base.bp && base.bp.systolic) ? base.bp.systolic : 115);
    const baseDbp = (curr.bp && curr.bp.diastolic) ? curr.bp.diastolic : ((base.bp && base.bp.diastolic) ? base.bp.diastolic : 74);
    const baseSpo2 = (curr.spo2 && typeof curr.spo2 === 'object') ? curr.spo2.value : (curr.spo2 != null ? curr.spo2 : ((base.spo2 && base.spo2.value) ? base.spo2.value : 98));
    const baseRr = (curr.rr && typeof curr.rr === 'object') ? curr.rr.value : (curr.rr != null ? curr.rr : ((base.rr && base.rr.value) ? base.rr.value : 14));
    const baseTemp = (curr.temp && typeof curr.temp === 'object') ? curr.temp.value : (curr.temp != null ? curr.temp : ((base.temp && base.temp.value) ? base.temp.value : 36.6));

    // Natural physiological noise (sinus arrhythmia jitter)
    const hrJitter = this.allowJitter ? (Math.random() - 0.5) * 2 : 0;
    const sbpJitter = this.allowJitter ? (Math.random() - 0.5) * 3 : 0;
    const dbpJitter = this.allowJitter ? (Math.random() - 0.5) * 2 : 0;
    const spo2Jitter = this.allowJitter ? (Math.random() > 0.8 ? -1 : 0) : 0;
    const rrJitter = this.allowJitter ? (Math.random() - 0.5) * 1.5 : 0;

    let hr = Math.round(baseHr + hrJitter);
    let sbp = Math.round(baseSbp + sbpJitter);
    let dbp = Math.round(baseDbp + dbpJitter);
    let spo2 = Math.min(100, Math.max(70, Math.round(baseSpo2 + spo2Jitter)));
    let rr = Math.round(baseRr + rrJitter);
    let skinTemp = Number((baseTemp - 0.8 + (this.allowJitter ? (Math.random() - 0.5) * 0.2 : 0)).toFixed(1));
    let ecg = hr >= 100 ? 'sinus_tachycardia' : (hr < 55 ? 'sinus_bradycardia' : 'sinus_normal');

    // Apply scripted anomaly progression if active
    if (this.isAnomalyActive) {
      this.anomalyStep += 1;
      const progression = Math.min(1.0, this.anomalyStep / 4); // Reaches full anomaly severity across 4 ticks

      // Alex Vance cardiovascular & respiratory stress drift:
      // HR climbs toward 112 bpm
      hr = Math.round(baseHr + (112 - baseHr) * progression + (Math.random() - 0.5) * 3);
      // SpO2 drops toward 91%
      spo2 = Math.round(baseSpo2 - (baseSpo2 - 91) * progression + (Math.random() - 0.5) * 1);
      // SBP estimate increases toward 152 mmHg
      sbp = Math.round(baseSbp + (152 - baseSbp) * progression + (Math.random() - 0.5) * 4);
      dbp = Math.round(baseDbp + (98 - baseDbp) * progression);
      // RR increases toward 24 brpm
      rr = Math.round(baseRr + (24 - baseRr) * progression);
      skinTemp = Number((baseTemp - 0.8 + 0.4 * progression).toFixed(1));
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
      activity: this.isAnomalyActive ? 'rest_acute' : (hr > 110 ? 'exertion' : 'rest'),
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
