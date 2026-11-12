/**
 * library.js
 * Grounded Q&A search over reviewed assistant cards [Plan v4 Section 5].
 * Answers ONLY from reviewed library cards; no uncontrolled language model generation.
 */

import libraryData from '../content/assistant-library.json';

/**
 * Searches the reviewed library for relevant answer cards.
 * @param {string} query - Spoken or typed user question
 * @param {number} minScore - Minimum match threshold
 * @returns {object|null} Matched card with score or null if no confident match
 */
export function queryLibrary(query = '', minScore = 5.0) {
  if (!query || typeof query !== 'string') return null;

  const normalized = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = normalized.split(/\s+/).filter(t => t.length > 2);

  if (tokens.length === 0) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const card of libraryData) {
    let score = 0;
    let matchedKeywords = 0;

    // 1. Direct Keyword Phrase Match (Primary Clinical Anchor)
    for (const kw of card.keywords) {
      const kwNorm = kw.toLowerCase().trim();
      const escaped = kwNorm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const kwRegex = new RegExp(`\\b${escaped}\\b`, 'i');

      if (kwRegex.test(normalized)) {
        score += 4.0;
        matchedKeywords += 1;
      }
    }

    // Must have matched at least one direct keyword to be considered a clinical match
    if (matchedKeywords === 0) {
      continue;
    }

    // 2. Question Title Overlap
    const qNorm = card.question.toLowerCase();
    for (const t of tokens) {
      if (qNorm.includes(t)) {
        score += 1.0;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = card;
    }
  }

  if (bestScore >= minScore && bestMatch) {
    return {
      ...bestMatch,
      confidenceScore: bestScore
    };
  }

  return null;
}

export function getAllCards() {
  return libraryData;
}
