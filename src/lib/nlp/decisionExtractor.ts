import { ChatMessage, KeyDecision } from '@/types/chat';

const DECISION_PATTERNS = [
  /\b(?:we decided to|we've decided to|decided on|team decided to)\s+([^.!?\n]+)/i,
  /\b(?:agreed on|agreed to|mutually agreed to)\s+([^.!?\n]+)/i,
  /\b(?:let's go with|going forward with|chosen to use|settled on)\s+([^.!?\n]+)/i,
  /\b(?:approved|confirmed that|final call is|conclusion is)\s+([^.!?\n]+)/i,
  /\b(?:resolution:|decision:|verdict:)\s*([^.!?\n]+)/i,
];

/**
 * Extracts consensus decisions made by the team during the conversation.
 */
export function extractDecisions(messages: ChatMessage[]): KeyDecision[] {
  const decisions: KeyDecision[] = [];
  const seenDecisions = new Set<string>();

  for (const msg of messages) {
    const text = msg.content;

    for (const pattern of DECISION_PATTERNS) {
      const match = pattern.exec(text);
      if (match) {
        let decisionText = match[1].trim();

        // Basic cleanups
        decisionText = decisionText.replace(/^[\s,:-]+/, '').replace(/[\s,.:]+$/, '');

        // Filter trivial snippets
        if (decisionText.length < 6 || decisionText.split(' ').length < 2) continue;

        const dedupeKey = decisionText.toLowerCase().slice(0, 40);
        if (seenDecisions.has(dedupeKey)) continue;
        seenDecisions.add(dedupeKey);

        msg.isDecision = true;

        decisions.push({
          id: `dec-${decisions.length + 1}`,
          decision: decisionText.charAt(0).toUpperCase() + decisionText.slice(1),
          decidedBy: msg.sender,
          sourceTimestamp: msg.timestamp,
          sourceMessageId: msg.id,
          context: msg.content,
        });

        break;
      }
    }
  }

  return decisions;
}
