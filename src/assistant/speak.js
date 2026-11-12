/**
 * speak.js
 * Browser speech synthesis wrapper with queue management and headless safety.
 */

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakText(text, onEnd = null, onError = null) {
  if (!isSpeechSupported()) {
    if (onEnd) onEnd();
    return null;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (err) {
    console.warn('SpeechSynthesis error:', err);
    if (onError) onError(err);
    return null;
  }
}

export function stopSpeaking() {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}
