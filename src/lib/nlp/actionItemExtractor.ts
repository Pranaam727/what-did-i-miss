import { ActionItem, ChatMessage, UrgencyLevel } from '@/types/chat';

interface ActionPattern {
  regex: RegExp;
  cleaner: (match: RegExpExecArray, fullText: string) => { task: string; assignee?: string };
}

const ACTION_PATTERNS: ActionPattern[] = [
  // 1. Explicit Assignee with Directive: @Alice please deploy the fix / @PRANAAM can you check the logs
  {
    regex: /@([a-zA-Z0-9_-]+)\s+(?:please|could you|can you|kindly|must)\s+([^.!?\n]+)/i,
    cleaner: (m) => ({
      assignee: m[1],
      task: m[2].trim(),
    }),
  },
  // 2. Direct assignment: John to review the PR / Alice will handle the documentation
  {
    regex: /\b([A-Z][a-zA-Z0-9_-]+)\s+(?:will|to|should)\s+(?:handle|take care of|review|deploy|fix|update|implement|write)\s+([^.!?\n]+)/i,
    cleaner: (m) => ({
      assignee: m[1],
      task: `${m[0].trim()}`,
    }),
  },
  // 3. First person commitment: I will update the README / I'll push the commit
  {
    regex: /\b(?:I will|I'll|I'm going to)\s+([^.!?\n]+)/i,
    cleaner: (m) => ({
      task: `I will ${m[1].trim()}`,
    }),
  },
  // 4. Todo or Action Item labels: TODO: fix auth / ACTION ITEM: prepare slides / AI: verify
  {
    regex: /\b(?:TODO|ACTION ITEM|ACTION ITEMS|TASK|AI)[:\-]\s*([^.!?\n]+)/i,
    cleaner: (m) => ({
      task: m[1].trim(),
    }),
  },
  // 5. Imperative demands: Please make sure to test / Need to deploy before 5
  {
    regex: /\b(?:please make sure to|need to|we need to|don't forget to|remember to)\s+([^.!?\n]+)/i,
    cleaner: (m) => ({
      task: `Need to ${m[1].trim()}`,
    }),
  },
  // 6. Direct request question: Can someone review / Could you verify
  {
    regex: /\b(?:can someone|could someone)\s+([^.!?\n]+)/i,
    cleaner: (m) => ({
      task: `Needs someone to ${m[1].trim()}`,
    }),
  },
];

/**
 * Extracts action items and tasks from chat messages.
 */
export function extractActionItems(
  messages: ChatMessage[],
  targetUser: string = 'PRANAAM'
): ActionItem[] {
  const actionItems: ActionItem[] = [];
  const seenTasks = new Set<string>();
  const normalizedTarget = targetUser.toLowerCase().replace(/^@/, '');

  for (const msg of messages) {
    const text = msg.content;
    let foundForMsg = false;

    for (const pattern of ACTION_PATTERNS) {
      const match = pattern.regex.exec(text);
      if (match) {
        const extracted = pattern.cleaner(match, text);
        let taskText = extracted.task;

        // Clean up common leading prepositions or trailing punctuation
        taskText = taskText.replace(/^[\s,:-]+/, '').replace(/[\s,.:]+$/, '');

        // Basic quality filters: skip if too short or trivial greeting
        if (taskText.length < 5 || taskText.split(' ').length < 2) continue;

        const dedupeKey = taskText.toLowerCase().slice(0, 40);
        if (seenTasks.has(dedupeKey)) continue;
        seenTasks.add(dedupeKey);

        let assignee = extracted.assignee;
        if (!assignee) {
          // Check if sender committed to it (e.g. "I will...")
          if (/^(?:I will|I'll)/i.test(match[0])) {
            assignee = msg.sender;
          } else if (text.toLowerCase().includes(`@${normalizedTarget}`)) {
            assignee = targetUser;
          }
        }

        // Determine item urgency (elevate if it mentions target user or message is critical)
        let urgency: UrgencyLevel = msg.urgency;
        if (assignee?.toLowerCase() === normalizedTarget) {
          urgency = urgency === 'LOW' ? 'HIGH' : urgency;
        }

        actionItems.push({
          id: `act-${actionItems.length + 1}`,
          task: taskText.charAt(0).toUpperCase() + taskText.slice(1),
          assignee: assignee || undefined,
          urgency,
          sourceMessageId: msg.id,
          sourceSender: msg.sender,
          sourceTimestamp: msg.timestamp,
          context: msg.content,
          completed: false,
        });

        foundForMsg = true;
        break; // one primary action item per message
      }
    }

    if (foundForMsg) {
      msg.isActionItem = true;
    }
  }

  // Sort action items by urgency: CRITICAL > HIGH > MEDIUM > LOW
  const urgencyWeight: Record<UrgencyLevel, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  return actionItems.sort((a, b) => urgencyWeight[b.urgency] - urgencyWeight[a.urgency]);
}
