import { ChatMessage } from '@/types/chat';

/**
 * Universal Chat Parser for WhatsApp, Slack, Discord, Microsoft Teams, and Generic logs.
 * Preserves multi-line messages, extracts timestamps, sender identities, and clean text.
 */
export function parseChatLog(rawText: string, targetUser: string = 'PRANAAM'): ChatMessage[] {
  if (!rawText || !rawText.trim()) {
    return [];
  }

  const lines = rawText.split(/\r?\n/);
  const parsedMessages: Array<{
    sender: string;
    content: string;
    timestamp?: string;
    date?: string;
    rawLines: string[];
  }> = [];

  // Regex patterns for various chat exports:
  // 1. WhatsApp with brackets: [12/10/24, 10:14:22 AM] Alice: Message or [10/12/2024, 10:14] Alice: Message
  const whatsappBracketRegex = /^\[(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}[, ]+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]\s+([^:]+?):\s+(.*)$/;

  // 2. WhatsApp standard: 12/10/24, 10:14 - Alice: Message or 12/10/2024, 10:14 AM - Alice: Message
  const whatsappStandardRegex = /^(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}[, ]+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\s*[-–—]\s*([^:]+?):\s+(.*)$/;

  // 3. Slack / Teams timestamp format: Alice [10:14 AM]: Message or [10:14 AM] Alice: Message
  const slackBracketRegex = /^([^[\]\n]+?)\s+\[(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]:\s*(.*)$/;
  const bracketSpeakerRegex = /^\[(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]\s+([^:]+?):\s+(.*)$/;

  // 4. Discord format: Alice — Today at 10:14 AM: Message or Alice — 10/12/2024 10:14 AM: Message
  const discordRegex = /^([^—–\n]+?)\s*[-—–]\s*(?:Today at|Yesterday at|\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4})?\s*(\d{1,2}:\d{2}(?:\s*[APap][Mm])?):\s*(.*)$/i;

  // 5. Simple Speaker Prefix: Alice: Message or Alice (10:14 AM): Message
  const simpleSpeakerRegex = /^([^:\n]{2,30}?)(?:\s*\(([^)]+)\))?:\s+(.*)$/;

  let currentMsg: {
    sender: string;
    content: string;
    timestamp?: string;
    date?: string;
    rawLines: string[];
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (currentMsg) {
        currentMsg.content += '\n';
        currentMsg.rawLines.push('');
      }
      continue;
    }

    // Ignore known system messages
    if (
      line.includes('Messages and calls are end-to-end encrypted') ||
      line.includes('joined using this group\'s invite link') ||
      line.includes('left the group') ||
      line.includes('created group') ||
      line.includes('changed the group description') ||
      line.includes('added you')
    ) {
      continue;
    }

    let matched = false;

    // Try WhatsApp bracket
    const m1 = line.match(whatsappBracketRegex);
    if (m1) {
      if (currentMsg) parsedMessages.push(currentMsg);
      const dateTime = m1[1];
      const [datePart, ...timeParts] = dateTime.split(/,\s*/);
      currentMsg = {
        sender: m1[2].trim(),
        content: m1[3].trim(),
        date: datePart,
        timestamp: timeParts.join(' ') || dateTime,
        rawLines: [line],
      };
      matched = true;
    }

    // Try WhatsApp standard dash
    if (!matched) {
      const m2 = line.match(whatsappStandardRegex);
      if (m2) {
        if (currentMsg) parsedMessages.push(currentMsg);
        const dateTime = m2[1];
        const [datePart, ...timeParts] = dateTime.split(/,\s*/);
        currentMsg = {
          sender: m2[2].trim(),
          content: m2[3].trim(),
          date: datePart,
          timestamp: timeParts.join(' ') || dateTime,
          rawLines: [line],
        };
        matched = true;
      }
    }

    // Try Slack bracket
    if (!matched) {
      const m3 = line.match(slackBracketRegex);
      if (m3) {
        if (currentMsg) parsedMessages.push(currentMsg);
        currentMsg = {
          sender: m3[1].trim(),
          content: m3[3].trim(),
          timestamp: m3[2].trim(),
          rawLines: [line],
        };
        matched = true;
      }
    }

    // Try Bracket speaker
    if (!matched) {
      const m4 = line.match(bracketSpeakerRegex);
      if (m4) {
        if (currentMsg) parsedMessages.push(currentMsg);
        currentMsg = {
          sender: m4[2].trim(),
          content: m4[3].trim(),
          timestamp: m4[1].trim(),
          rawLines: [line],
        };
        matched = true;
      }
    }

    // Try Discord format
    if (!matched) {
      const m5 = line.match(discordRegex);
      if (m5) {
        if (currentMsg) parsedMessages.push(currentMsg);
        currentMsg = {
          sender: m5[1].trim(),
          content: m5[3].trim(),
          timestamp: m5[2].trim(),
          rawLines: [line],
        };
        matched = true;
      }
    }

    // Try simple speaker pattern (only if line doesn't look like an arbitrary URL or bullet point)
    if (!matched) {
      const m6 = line.match(simpleSpeakerRegex);
      // Ensure the sender name doesn't look like http:, Note:, Step 1:, etc.
      if (
        m6 &&
        !['http', 'https', 'note', 'warn', 'error', 'todo', 'ps', 're', 'fwd'].includes(m6[1].trim().toLowerCase()) &&
        !m6[1].includes('/') &&
        !m6[1].includes('\\')
      ) {
        if (currentMsg) parsedMessages.push(currentMsg);
        currentMsg = {
          sender: m6[1].trim(),
          content: m6[3].trim(),
          timestamp: m6[2]?.trim(),
          rawLines: [line],
        };
        matched = true;
      }
    }

    // If no pattern matched, append to the ongoing message (multi-line message)
    if (!matched) {
      if (currentMsg) {
        currentMsg.content += (currentMsg.content ? '\n' : '') + line;
        currentMsg.rawLines.push(line);
      } else {
        // Fallback for first line if no header matched
        currentMsg = {
          sender: 'Unknown Speaker',
          content: line,
          rawLines: [line],
        };
      }
    }
  }

  if (currentMsg) {
    parsedMessages.push(currentMsg);
  }

  // Convert to ChatMessage models with preliminary flags
  const normalizedTarget = targetUser.toLowerCase().replace(/^@/, '');

  return parsedMessages.map((msg, index) => {
    const contentLower = msg.content.toLowerCase();
    const hasMention =
      contentLower.includes(`@${normalizedTarget}`) ||
      contentLower.includes(normalizedTarget) ||
      contentLower.includes('@here') ||
      contentLower.includes('@channel') ||
      contentLower.includes('@everyone');

    return {
      id: `msg-${index + 1}`,
      sender: msg.sender,
      content: msg.content,
      timestamp: msg.timestamp || 'N/A',
      date: msg.date,
      raw: msg.rawLines.join('\n'),
      urgency: 'LOW',
      urgencyScore: 0,
      hasMention,
      hasDeadline: false,
      isDecision: false,
      isActionItem: false,
    };
  });
}
