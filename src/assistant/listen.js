/**
 * listen.js
 * Browser speech recognition wrapper (webkitSpeechRecognition / SpeechRecognition)
 * with robust error handling and button fallback [Plan v4 Section 5].
 */

export function isListeningSupported() {
  return typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function createSpeechRecognizer(onResult, onError, onEnd) {
  if (!isListeningSupported()) {
    return null;
  }

  try {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognizer = new SpeechRec();
    recognizer.continuous = false;
    recognizer.interimResults = false;
    recognizer.lang = 'en-US';

    recognizer.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript && onResult) {
        onResult(transcript);
      }
    };

    recognizer.onerror = (event) => {
      if (onError) onError(event.error);
    };

    recognizer.onend = () => {
      if (onEnd) onEnd();
    };

    return recognizer;
  } catch (err) {
    console.warn('SpeechRecognition initialization error:', err);
    return null;
  }
}
