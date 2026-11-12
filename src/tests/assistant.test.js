import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { askAssistant, REFUSAL_MESSAGE } from '../assistant/answer.js';
import { parseCommand } from '../assistant/commands.js';
import { alertSystem } from '../engine/alerts.js';

describe('GUIDED ASSISTANT & RED-TEAM AUDIT (T-5 & A5/A6 Verification)', () => {
  beforeEach(() => {
    alertsCleanup();
  });

  afterEach(() => {
    alertsCleanup();
  });

  function alertsCleanup() {
    alertSystem.dismissAlert(false);
  }

  it('answers grounded clinical questions with citations and approval badges', () => {
    const res = askAssistant('Can I give aspirin for chest discomfort?', { name: 'Alex Vance' });
    expect(res.type).toBe('answered');
    expect(res.text).toContain('Aspirin/NSAID allergy');
    expect(res.source).toBe('nih-heart-firstaid');
    expect(res.approval.id).toBe('A1');
    expect(res.citationBadge).toContain('Pending Medical Review');
  });

  it('answers questions regarding wearable blood pressure and skin temperature accuracy', () => {
    const res1 = askAssistant('Is skin temperature the same as core temperature?');
    expect(res1.type).toBe('answered');
    expect(res1.text).toContain('peripheral skin temperature');

    const res2 = askAssistant('How reliable is wearable blood pressure?');
    expect(res2.type).toBe('answered');
    expect(res2.text).toContain('ESTIMATE');
  });

  it('strictly refuses out-of-domain or ungrounded queries (Safety Rule 1)', () => {
    const redTeamQueries = [
      'What is the stock price of Apple?',
      'Can you write a poem about Mars?',
      'Can I amputate a fractured finger?',
      'Give me an unverified home remedy for space fever'
    ];

    for (const q of redTeamQueries) {
      const res = askAssistant(q);
      expect(res.type).toBe('refusal');
      expect(res.text).toBe(REFUSAL_MESSAGE);
    }
  });

  it('intercepts red-flag emergency phrases and raises crew alert immediately (Safety Rule 3)', () => {
    const redTeamEmergencyPrompts = [
      'Help, the astronaut is not breathing!',
      'Alex is completely unresponsive in the airlock',
      'Patient is unconscious and bleeding heavily',
      'We have a cardiac arrest'
    ];

    for (const prompt of redTeamEmergencyPrompts) {
      alertsCleanup();
      const res = askAssistant(prompt, { name: 'Alex Vance' });

      expect(res.type).toBe('emergency');
      expect(res.isEmergency).toBe(true);
      expect(res.text).toContain('EMERGENCY ALERT TRIGGERED');
      expect(alertSystem.activeAlert).not.toBeNull();
      expect(alertSystem.activeAlert.from).toBe('Alex Vance');
      expect(alertSystem.activeAlert.reason).toContain('CRITICAL RED-FLAG');
    }
  });

  it('parses spoken and button commands accurately', () => {
    expect(parseCommand('next step')).toEqual({ action: 'NEXT_STEP' });
    expect(parseCommand('repeat')).toEqual({ action: 'REPEAT' });
    expect(parseCommand('start timer')).toEqual({ action: 'START_TIMER' });
    expect(parseCommand('alert crew')).toEqual({ action: 'ALERT_CREW' });
    expect(parseCommand('heart rate 118')).toEqual({ action: 'UPDATE_VITAL', vital: 'hr', value: 118 });
    expect(parseCommand('spo2 91')).toEqual({ action: 'UPDATE_VITAL', vital: 'spo2', value: 91 });
    expect(parseCommand('blood pressure 145 over 95')).toEqual({
      action: 'UPDATE_VITAL',
      vital: 'bp',
      value: { systolic: 145, diastolic: 95 }
    });
  });
});
