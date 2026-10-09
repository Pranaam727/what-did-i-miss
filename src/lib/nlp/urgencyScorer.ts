import { ChatMessage, UrgencyLevel } from '@/types/chat';

interface UrgencyKeywordWeight {
  pattern: RegExp;
  score: number;
}

const CRITICAL_PATTERNS: UrgencyKeywordWeight[] = [
  { pattern: /\b(p0|sev-?0|sev-?1|outage|down in prod|production down|system failure)\b/i, score: 45 },
  { pattern: /\b(emergency|blocker|catastrophic|critical bug|data loss|security breach)\b/i, score: 40 },
  { pattern: /\b(immediately|right now|drop everything|asap|stopping submissions)\b/i, score: 35 },
  { pattern: /\b(payment.*fail|database down|service 500|server crashed)\b/i, score: 35 },
];

const HIGH_PATTERNS: UrgencyKeywordWeight[] = [
  { pattern: /\b(urgent|high priority|must have|time sensitive|deadline is today)\b/i, score: 25 },
  { pattern: /\b(blocked by|blocking|failing tests|build broken|broken pipeline)\b/i, score: 20 },
  { pattern: /\b(by eod|by 5 ?pm|by tonight|within \d+ hours?|expiring)\b/i, score: 20 },
  { pattern: /\b(cannot submit|disqualification|cannot proceed|unresolved)\b/i, score: 20 },
];

const MEDIUM_PATTERNS: UrgencyKeywordWeight[] = [
  { pattern: /\b(please review|needs review|action required|can you check)\b/i, score: 15 },
  { pattern: /\b(follow-?up|reminder|pending approval|waiting on|todo)\b/i, score: 12 },
  { pattern: /\b(tomorrow|by monday|this week|target date)\b/i, score: 10 },
  { pattern: /\b(important update|please confirm|heads up)\b/i, score: 10 },
];

const LOW_PATTERNS: UrgencyKeywordWeight[] = [
  { pattern: /\b(fyi|for your information|nice to have|low priority|whenever)\b/i, score: -10 },
  { pattern: /\b(thanks|thank you|lol|haha|great work|good morning|gg|awesome)\b/i, score: -15 },
  { pattern: /\b(lunch|coffee|random|fun fact|meme)\b/i, score: -15 },
];

/**
 * Computes multi-factor urgency score for an individual message.
 * Incorporates lexical heuristics, uppercase emphasis, punctuation, and direct mentions.
 */
export function scoreMessageUrgency(msg: ChatMessage, targetUser: string = 'PRANAAM'): {
  score: number;
  level: UrgencyLevel;
} {
  let score = 20; // baseline neutral score
  const text = msg.content;
  const targetLower = targetUser.toLowerCase().replace(/^@/, '');

  // 1. Critical pattern matches
  for (const { pattern, score: s } of CRITICAL_PATTERNS) {
    if (pattern.test(text)) score += s;
  }

  // 2. High pattern matches
  for (const { pattern, score: s } of HIGH_PATTERNS) {
    if (pattern.test(text)) score += s;
  }

  // 3. Medium pattern matches
  for (const { pattern, score: s } of MEDIUM_PATTERNS) {
    if (pattern.test(text)) score += s;
  }

  // 4. Low pattern mitigations
  for (const { pattern, score: s } of LOW_PATTERNS) {
    if (pattern.test(text)) score += s;
  }

  // 5. Casing emphasis (e.g. ALL CAPS words like "URGENT", "NOW", "HELP")
  const capsWords = text.match(/\b[A-Z]{3,}\b/g);
  if (capsWords && capsWords.length >= 2) {
    score += Math.min(capsWords.length * 5, 20);
  }

  // 6. Exclamation emphasis
  const exclamations = (text.match(/!{2,}/g) || []).length;
  if (exclamations > 0) {
    score += Math.min(exclamations * 8, 16);
  }

  // 7. Direct User Mention boost (if user is explicitly tagged, urgency increases)
  if (text.toLowerCase().includes(`@${targetLower}`) || text.toLowerCase().includes(targetLower)) {
    score += 18;
  }

  // Bound score between 0 and 100
  const normalizedScore = Math.max(5, Math.min(100, Math.round(score)));

  // Categorize
  let level: UrgencyLevel = 'LOW';
  if (normalizedScore >= 70) {
    level = 'CRITICAL';
  } else if (normalizedScore >= 50) {
    level = 'HIGH';
  } else if (normalizedScore >= 30) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  return { score: normalizedScore, level };
}

/**
 * Computes overall urgency of the entire conversation.
 */
export function calculateOverallUrgency(messages: ChatMessage[]): UrgencyLevel {
  if (messages.length === 0) return 'LOW';

  const criticalCount = messages.filter((m) => m.urgency === 'CRITICAL').length;
  const highCount = messages.filter((m) => m.urgency === 'HIGH').length;

  if (criticalCount >= 2 || (criticalCount >= 1 && messages.length <= 10)) {
    return 'CRITICAL';
  }
  if (highCount >= 2 || criticalCount >= 1) {
    return 'HIGH';
  }
  const mediumCount = messages.filter((m) => m.urgency === 'MEDIUM').length;
  if (mediumCount >= messages.length * 0.3) {
    return 'MEDIUM';
  }
  return 'LOW';
}
