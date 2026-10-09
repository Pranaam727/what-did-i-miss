import { ChatMessage, DeadlineItem, UrgencyLevel } from '@/types/chat';

interface DeadlinePattern {
  regex: RegExp;
  cleaner: (match: RegExpExecArray, fullText: string) => { taskOrEvent: string; deadlineText: string };
}

const DEADLINE_PATTERNS: DeadlinePattern[] = [
  // 1. Explicit Deadline statement: deadline is Friday 5 PM / due by 11:59 PM
  {
    regex: /\b(?:deadline is|due by|due on|due at|target is|deadline:)\s+([^.,!?\n]+)/i,
    cleaner: (m, full) => ({
      deadlineText: m[1].trim(),
      taskOrEvent: full.slice(0, 60),
    }),
  },
  // 2. Action with "by <time/date>": Submit PR by 4 PM / Deploy fix before 6:00 PM
  {
    regex: /\b(?:submit|deploy|finish|complete|push|send|release|deliver)\b[^.,!?\n]*?\s+(?:by|before|until)\s+((?:\d{1,2}(?::\d{2})?\s*(?:am|pm)?|today|tonight|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|eod|midnight|end of day)[^.,!?\n]*)/i,
    cleaner: (m) => ({
      deadlineText: m[1].trim(),
      taskOrEvent: m[0].trim(),
    }),
  },
  // 3. General "by <time>": need this by 3 PM / update by tomorrow morning
  {
    regex: /\b(?:by|before)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)|eod|tonight|tomorrow\s*(?:morning|afternoon|evening|eod)?|midnight|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i,
    cleaner: (m, full) => ({
      deadlineText: m[1].trim(),
      taskOrEvent: full.slice(0, 70),
    }),
  },
  // 4. "in X hours / in X minutes":
  {
    regex: /\b(?:in|within)\s+(\d+\s*(?:hours?|hrs?|minutes?|mins?))\b/i,
    cleaner: (m, full) => ({
      deadlineText: `Within ${m[1].trim()}`,
      taskOrEvent: full.slice(0, 70),
    }),
  },
];

/**
 * Extracts deadlines and time-bound constraints from conversation messages.
 */
export function extractDeadlines(messages: ChatMessage[]): DeadlineItem[] {
  const deadlines: DeadlineItem[] = [];
  const seenDeadlines = new Set<string>();

  for (const msg of messages) {
    const text = msg.content;

    for (const pattern of DEADLINE_PATTERNS) {
      const match = pattern.regex.exec(text);
      if (match) {
        const { deadlineText, taskOrEvent } = pattern.cleaner(match, text);

        if (deadlineText.length < 2 || deadlineText.length > 50) continue;

        const dedupeKey = `${deadlineText.toLowerCase()}-${taskOrEvent.slice(0, 20).toLowerCase()}`;
        if (seenDeadlines.has(dedupeKey)) continue;
        seenDeadlines.add(dedupeKey);

        msg.hasDeadline = true;

        // Elevated urgency if it has "eod", "today", "within", or critical message
        let urgency: UrgencyLevel = msg.urgency;
        if (/(today|tonight|within|immediately|asap|eod)/i.test(deadlineText)) {
          urgency = urgency === 'LOW' ? 'HIGH' : urgency;
        }

        deadlines.push({
          id: `dl-${deadlines.length + 1}`,
          taskOrEvent: taskOrEvent.replace(/^[\s,:-]+/, '').replace(/[\s,.:]+$/, ''),
          deadlineText: deadlineText.charAt(0).toUpperCase() + deadlineText.slice(1),
          timestamp: msg.timestamp,
          urgency,
          sender: msg.sender,
          sourceMessageId: msg.id,
        });

        break;
      }
    }
  }

  return deadlines;
}
