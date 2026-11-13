/**
 * alerts.js
 * Crew Alert System, BroadcastChannel multi-tab sync, synthetic audio chime,
 * and Patient Dead-Man Check-in Timer [A6, A7].
 */

export class AlertSystem {
  constructor() {
    this.activeAlert = null;
    this.alertHistory = [];
    this.subscribers = new Set();
    this.channel = null;
    this.checkInTimer = null;
    this.checkInSecondsRemaining = 0;
    this.checkInInterval = 10; // Default 10s for judge demonstration
    this.isDemoSpeed = true;
    this.audioContext = null;

    // Initialize BroadcastChannel if in browser
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('storm_shield_crew_alerts');
        this.channel.onmessage = (event) => {
          this._handleRemoteMessage(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported or restricted:', e);
      }
    }
  }

  /**
   * Subscribe to alert state changes.
   * @param {function} callback
   * @returns {function} unsubscribe
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    callback({
      activeAlert: this.activeAlert,
      secondsRemaining: this.checkInSecondsRemaining,
      history: this.alertHistory
    });
    return () => this.subscribers.delete(callback);
  }

  _notify() {
    const state = {
      activeAlert: this.activeAlert,
      secondsRemaining: this.checkInSecondsRemaining,
      history: this.alertHistory
    };
    for (const sub of this.subscribers) {
      try {
        sub(state);
      } catch (err) {
        console.error('Alert subscriber error:', err);
      }
    }
  }

  _broadcast(type, payload) {
    if (this.channel) {
      try {
        this.channel.postMessage({ type, payload });
      } catch (err) {
        console.warn('Failed to broadcast alert message:', err);
      }
    }
  }

  _handleRemoteMessage(data) {
    if (!data || !data.type) return;
    if (data.type === 'NEW_ALERT') {
      this.activeAlert = data.payload;
      this._startCheckInTimer(this.activeAlert.checkInSeconds || this.checkInInterval);
      this.playAlertSound();
      this._notify();
    } else if (data.type === 'ACK_ALERT') {
      if (this.activeAlert && this.activeAlert.id === data.payload.alertId) {
        if (!this.activeAlert.acks.some(a => a.responder === data.payload.ack.responder)) {
          this.activeAlert.acks.push(data.payload.ack);
        }
        this._notify();
      }
    } else if (data.type === 'CHECKIN_OK') {
      this.recordCheckIn();
    } else if (data.type === 'DISMISS_ALERT') {
      this.dismissAlert(false);
    }
  }

  /**
   * Synthesize audio alert chime using Web Audio API (offline, zero external files).
   */
  playAlertSound(isEscalation = false) {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = isEscalation ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isEscalation ? 880 : 660, this.audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(isEscalation ? 440 : 880, this.audioContext.currentTime + 0.3);

      gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start();
      osc.stop(this.audioContext.currentTime + 0.35);
    } catch {
      // Audio playback fails silently in headless/restricted environments
    }
  }

  /**
   * Create and broadcast a new crew alert.
   */
  raiseAlert({ from = 'Astronaut', kind = 'medical', reason = 'Vitals deviation', location = 'Habitat Module Alpha', checkInSeconds = null }) {
    const timerLength = checkInSeconds || (this.isDemoSpeed ? 20 : 60);
    const alert = {
      id: `alert-${Date.now()}`,
      from,
      kind,
      reason,
      originalReason: reason,
      location,
      time: new Date().toISOString(),
      acks: [],
      escalated: false,
      checkInSeconds: timerLength
    };

    this.activeAlert = alert;
    this.alertHistory.unshift(alert);
    this._startCheckInTimer(timerLength);
    this.playAlertSound(false);
    this._broadcast('NEW_ALERT', alert);
    this._notify();
    return alert;
  }

  /**
   * Acknowledge an active alert ("On my way").
   */
  acknowledgeAlert(responder = 'Dr. Maya Lin') {
    if (!this.activeAlert) return;
    const ack = {
      responder,
      time: new Date().toISOString()
    };
    if (!this.activeAlert.acks.some(a => a.responder === responder)) {
      this.activeAlert.acks.push(ack);
    }
    this._broadcast('ACK_ALERT', { alertId: this.activeAlert.id, ack });
    this._notify();
  }

  /**
   * Patient resets the dead-man check-in timer by tapping "I'm OK".
   * Also de-escalates patient unresponsive status if it had escalated.
   */
  recordCheckIn() {
    if (!this.activeAlert) return;
    this.activeAlert.escalated = false;
    if (this.activeAlert.originalReason) {
      this.activeAlert.reason = this.activeAlert.originalReason;
    }
    this.checkInSecondsRemaining = this.activeAlert.checkInSeconds || this.checkInInterval;
    this._notify();
    this._broadcast('CHECKIN_OK', { alertId: this.activeAlert.id });
  }

  _startCheckInTimer(seconds) {
    if (this.checkInTimer) {
      clearInterval(this.checkInTimer);
      this.checkInTimer = null;
    }
    this.checkInSecondsRemaining = seconds;

    this.checkInTimer = setInterval(() => {
      if (!this.activeAlert) {
        clearInterval(this.checkInTimer);
        this.checkInTimer = null;
        return;
      }

      this.checkInSecondsRemaining -= 1;
      if (this.checkInSecondsRemaining <= 0) {
        // ESCALATION: Patient has not checked in!
        this.activeAlert.escalated = true;
        this.activeAlert.originalReason = this.activeAlert.originalReason || this.activeAlert.reason;
        this.activeAlert.reason = `PATIENT UNRESPONSIVE: Check-in silence timeout exceeded (${seconds}s). Urgent crew dispatch required!`;
        this.playAlertSound(true);
        this.checkInSecondsRemaining = seconds; // reset cycle
      }
      this._notify();
    }, 1000);
  }

  dismissAlert(broadcast = true) {
    if (this.checkInTimer) {
      clearInterval(this.checkInTimer);
      this.checkInTimer = null;
    }
    const dismissedId = this.activeAlert ? this.activeAlert.id : null;
    this.activeAlert = null;
    this.checkInSecondsRemaining = 0;
    this.lastDismissedAt = Date.now();
    this.lastDismissedId = dismissedId;
    if (broadcast) {
      this._broadcast('DISMISS_ALERT', { alertId: dismissedId });
    }
    this._notify();
  }

  setDemoSpeed(isDemo) {
    this.isDemoSpeed = isDemo;
    this.checkInInterval = isDemo ? 10 : 60;
  }
}

// Global shared singleton
export const alertSystem = new AlertSystem();
