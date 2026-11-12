/**
 * commands.js
 * Spoken and button command matcher for astronaut hands-free operation [Plan v4 Section 5].
 */

export function parseCommand(rawText = '') {
  const text = rawText.toLowerCase().trim();

  // 1. Navigation & Step Controls
  if (/^(next|next step|forward|advance)$/.test(text)) {
    return { action: 'NEXT_STEP' };
  }
  if (/^(back|previous|prev step|go back)$/.test(text)) {
    return { action: 'PREV_STEP' };
  }
  if (/^(repeat|say again|read again|repeat step)$/.test(text)) {
    return { action: 'REPEAT' };
  }
  if (/^(done|mark done|step complete|completed)$/.test(text)) {
    return { action: 'MARK_DONE' };
  }

  // 2. Timers
  if (/^(start timer|timer|recheck timer|set timer)$/.test(text)) {
    return { action: 'START_TIMER' };
  }

  // 3. Emergency & Crew Alert
  if (/^(alert crew|emergency|call for help|mayday)$/.test(text)) {
    return { action: 'ALERT_CREW' };
  }

  // 4. Clinical Log dictation: "log [text]"
  const logMatch = text.match(/^log\s+(.+)$/);
  if (logMatch) {
    return { action: 'LOG_NOTE', note: logMatch[1] };
  }

  // 5. Spoken vitals dictation (e.g. "heart rate 110", "spo2 94", "blood pressure 140 over 90")
  const hrMatch = text.match(/^(?:heart rate|pulse)\s+(\d{2,3})$/);
  if (hrMatch) {
    return { action: 'UPDATE_VITAL', vital: 'hr', value: parseInt(hrMatch[1], 10) };
  }

  const spo2Match = text.match(/^(?:spo2|oxygen|saturation)\s+(\d{2,3})$/);
  if (spo2Match) {
    return { action: 'UPDATE_VITAL', vital: 'spo2', value: parseInt(spo2Match[1], 10) };
  }

  const bpMatch = text.match(/^(?:blood pressure|bp)\s+(\d{2,3})\s+(?:over|\/)\s+(\d{2,3})$/);
  if (bpMatch) {
    return { 
      action: 'UPDATE_VITAL', 
      vital: 'bp', 
      value: { systolic: parseInt(bpMatch[1], 10), diastolic: parseInt(bpMatch[2], 10) } 
    };
  }

  return { action: 'UNKNOWN', text: rawText };
}
