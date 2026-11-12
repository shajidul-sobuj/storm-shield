/**
 * answer.js
 * Guided Assistant Answer Engine [Plan v4 Section 5].
 * Enforces safety boundaries, emergency phrase bypass, grounded library retrieval,
 * and mandatory medical review citation badging.
 */

import { queryLibrary } from './library.js';
import { alertSystem } from '../engine/alerts.js';

// Emergency Red-Flag Phrases that immediately bypass chat and trigger Crew Alert [A6]
export const EMERGENCY_PHRASES = [
  'not breathing',
  'stopped breathing',
  'unresponsive',
  'unconscious',
  'bleeding heavily',
  'heavy bleeding',
  'no pulse',
  'cardiac arrest',
  'collapsed',
  'seizure'
];

export const REFUSAL_MESSAGE = 
  "I don't have a reviewed answer for that. Use Retrace or contact flight medicine.";

/**
 * Evaluates whether a query contains clinical red-flag emergency keywords.
 * @param {string} text
 * @returns {string|null} The matched emergency phrase or null
 */
export function checkEmergencyPhrase(text = '') {
  const norm = text.toLowerCase();
  for (const phrase of EMERGENCY_PHRASES) {
    if (norm.includes(phrase)) {
      return phrase;
    }
  }
  return null;
}

/**
 * Processes an astronaut or helper inquiry.
 * @param {string} query - The spoken or typed question
 * @param {object} astronaut - The currently selected astronaut context
 * @returns {object} { type: 'emergency'|'answered'|'refusal', text, source, approval, isEmergency }
 */
export function askAssistant(query = '', astronaut = null) {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      type: 'refusal',
      text: 'Please ask a medical or mission procedure question.',
      source: null,
      approval: null,
      isEmergency: false
    };
  }

  // 1. Safety Rule 3: Emergency Phrase Interception
  const emergencyMatch = checkEmergencyPhrase(trimmed);
  if (emergencyMatch) {
    const astronautName = astronaut?.name || 'Astronaut';
    // Raise emergency crew alert immediately
    alertSystem.raiseAlert({
      from: astronautName,
      kind: 'emergency',
      reason: `CRITICAL RED-FLAG: "${emergencyMatch.toUpperCase()}" reported in assistant dialog`,
      location: 'Habitat Module',
      checkInSeconds: 10
    });

    return {
      type: 'emergency',
      isEmergency: true,
      text: `EMERGENCY ALERT TRIGGERED! Reported "${emergencyMatch}". Crew has been alerted immediately. Check Airway, Breathing, and Circulation. Prepare emergency oxygen and resuscitation.`,
      matchedPhrase: emergencyMatch,
      source: 'who-primary-survey',
      approval: { id: 'A6', status: 'pending' },
      guidance: 'Primary ABCDE Survey initiated. Crew response en route.'
    };
  }

  // 2. Grounded Library Retrieval
  const match = queryLibrary(trimmed);
  if (match) {
    return {
      type: 'answered',
      isEmergency: false,
      question: match.question,
      text: match.answer,
      source: match.source,
      approval: match.approval,
      confidenceScore: match.confidenceScore,
      citationBadge: match.approval?.status === 'approved' 
        ? `[Approved: ${match.approval.id}]` 
        : `[${match.approval?.id || 'A5'}: Pending Medical Review]`
    };
  }

  // 3. Safety Rule 1: Strict Refusal for out-of-domain queries
  return {
    type: 'refusal',
    isEmergency: false,
    text: REFUSAL_MESSAGE,
    source: null,
    approval: { id: 'A5', status: 'pending' },
    suggestion: 'Navigate to Retrace to document unexpected events, or log observations for ground transmission.'
  };
}
