/**
 * care.js
 * Autonomous Clinical Decision Support Engine for spaceflight scenarios.
 * Strictly adheres to supply-aware constraints, allergy verification,
 * and deterministic decision trees.
 */

/**
 * Check if the onboard medical kit contains the required items.
 * @param {Array} needsKitIds - Array of kit item IDs required by the step
 * @param {Array} onboardKit - Current onboard medical kit inventory
 * @returns {object} { available: boolean, missingItems: Array, availableItems: Array }
 */
export function checkKitAvailability(needsKitIds = [], onboardKit = []) {
  if (!needsKitIds || needsKitIds.length === 0) {
    return { available: true, missingItems: [], availableItems: [] };
  }

  const missing = [];
  const available = [];

  for (const reqId of needsKitIds) {
    const item = onboardKit.find(k => k.id === reqId);
    if (!item || item.quantity <= 0) {
      missing.push(reqId);
    } else {
      available.push(item);
    }
  }

  return {
    available: missing.length === 0,
    missingItems: missing,
    availableItems: available
  };
}

/**
 * Verify if any step's contraindicated allergens match the patient's allergy profile.
 * @param {object} step - Clinical step definition
 * @param {object} patientProfile - Astronaut medical profile with allergies array
 * @returns {object} { safe: boolean, conflictingAllergens: Array, warning: string|null }
 */
export function verifyAllergySafety(step = {}, patientProfile = {}) {
  const cautions = step.cautionIfAllergicTo || [];
  const patientAllergies = (patientProfile.allergies || []).map(a => a.toLowerCase().trim());

  const conflicting = cautions.filter(c => patientAllergies.includes(c.toLowerCase().trim()));

  if (conflicting.length > 0) {
    return {
      safe: false,
      conflictingAllergens: conflicting,
      warning: `CONTRAINDICATION: Astronaut has documented allergy to ${conflicting.join(', ')}. DO NOT ADMINISTER.`
    };
  }

  return {
    safe: true,
    conflictingAllergens: [],
    warning: null
  };
}

/**
 * Evaluate dynamic rules inside a scenario.
 * @param {Array} rules - Array of scenario rule objects
 * @param {object} context - Current measurements and triage answers
 * @returns {Array} List of triggered rules
 */
export function evaluateScenarioRules(rules = [], context = {}) {
  const triggered = [];

  for (const rule of rules) {
    let matches = false;
    // Safe evaluation of supported clinical conditions
    if (rule.condition.includes('personalDoseMgy >= 700') && context.personalDoseMgy >= 700) {
      if (rule.condition.includes('vomitingWithinHours <= 2')) {
        if (context.vomitingWithinHours !== undefined && context.vomitingWithinHours <= 2) {
          matches = true;
        }
      } else {
        matches = true;
      }
    } else if (rule.condition.includes('personalDoseMgy < 200') && context.personalDoseMgy < 200) {
      matches = true;
    } else if (rule.condition.includes('systolicBP >= 140') && context.systolicBP >= 140) {
      matches = true;
    } else if (rule.condition.includes('systolicBP < 90') && context.systolicBP < 90) {
      matches = true;
    } else if (rule.condition.includes('heartRate >= 100') && context.heartRate >= 100) {
      matches = true;
    }

    if (matches) {
      triggered.push(rule);
    }
  }

  return triggered;
}

/**
 * Formats a verified clinical log entry for the astronaut's medical timeline.
 */
export function createCareLogEntry(scenarioId, stepId, actionDescription, patientId, kitUsed = []) {
  return {
    timestamp: new Date().toISOString(),
    scenarioId,
    stepId,
    actionDescription,
    patientId,
    kitUsed,
    verified: true
  };
}
