import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AlertSystem } from '../engine/alerts.js';

describe('CREW ALERT & CHECK-IN DEAD-MAN TIMER (A6 & A7 Verification)', () => {
  let alerts;

  beforeEach(() => {
    vi.useFakeTimers();
    alerts = new AlertSystem();
  });

  afterEach(() => {
    alerts.dismissAlert(false);
    vi.useRealTimers();
  });

  it('creates an active crew alert with mandatory fields', () => {
    const alert = alerts.raiseAlert({
      from: 'Alex Vance',
      kind: 'medical',
      reason: 'SpO2 88%, HR 118 bpm',
      location: 'Crew Quarters Beta',
      checkInSeconds: 10
    });

    expect(alert.id).toBeTruthy();
    expect(alert.from).toBe('Alex Vance');
    expect(alert.escalated).toBe(false);
    expect(alert.acks.length).toBe(0);
    expect(alerts.activeAlert.id).toBe(alert.id);
  });

  it('records acknowledgements ("On my way") from responders', () => {
    alerts.raiseAlert({ from: 'Alex Vance', reason: 'Hypoxemia' });

    alerts.acknowledgeAlert('Dr. Maya Lin');
    expect(alerts.activeAlert.acks.length).toBe(1);
    expect(alerts.activeAlert.acks[0].responder).toBe('Dr. Maya Lin');

    // Duplicate ACK prevention
    alerts.acknowledgeAlert('Dr. Maya Lin');
    expect(alerts.activeAlert.acks.length).toBe(1);

    // Second responder
    alerts.acknowledgeAlert('Sofia Rossi');
    expect(alerts.activeAlert.acks.length).toBe(2);
  });

  it('resets check-in timer when patient taps "I am OK"', () => {
    alerts.raiseAlert({ from: 'Alex Vance', checkInSeconds: 10 });
    expect(alerts.checkInSecondsRemaining).toBe(10);

    vi.advanceTimersByTime(4000);
    expect(alerts.checkInSecondsRemaining).toBe(6);

    // Patient checks in
    alerts.recordCheckIn();
    expect(alerts.checkInSecondsRemaining).toBe(10);
  });

  it('escalates alert when dead-man check-in timer expires without confirmation', () => {
    alerts.raiseAlert({ from: 'Alex Vance', checkInSeconds: 10 });
    expect(alerts.activeAlert.escalated).toBe(false);

    // Advance 10 seconds without check-in
    vi.advanceTimersByTime(10000);

    expect(alerts.activeAlert.escalated).toBe(true);
    expect(alerts.activeAlert.reason).toContain('PATIENT UNRESPONSIVE');

    // When patient taps "I'm OK", it de-escalates!
    alerts.recordCheckIn();
    expect(alerts.activeAlert.escalated).toBe(false);
    expect(alerts.checkInSecondsRemaining).toBe(10);
  });

  it('dismisses active alert properly and terminates check-in timer', () => {
    alerts.raiseAlert({ from: 'Alex Vance', checkInSeconds: 10 });
    expect(alerts.activeAlert).not.toBeNull();

    alerts.dismissAlert(false);
    expect(alerts.activeAlert).toBeNull();
    expect(alerts.checkInSecondsRemaining).toBe(0);

    // Advancing timers should not cause any crashes or re-escalation
    vi.advanceTimersByTime(15000);
    expect(alerts.activeAlert).toBeNull();
  });
});
