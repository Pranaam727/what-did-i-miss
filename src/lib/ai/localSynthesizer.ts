import {
  AnalysisResult,
  ChatMessage,
  ParticipantStat,
  UrgencyLevel,
} from '@/types/chat';
import { scoreMessageUrgency, calculateOverallUrgency } from '../nlp/urgencyScorer';
import { extractActionItems } from '../nlp/actionItemExtractor';
import { extractDecisions } from '../nlp/decisionExtractor';
import { extractDeadlines } from '../nlp/deadlineExtractor';

/**
 * Generates instant executive briefing and comprehensive analysis directly in-browser.
 */
export function synthesizeConversationAnalysis(
  rawMessages: ChatMessage[],
  targetUser: string = 'PRANAAM'
): AnalysisResult {
  const startTime = performance.now();
  const normalizedTarget = targetUser.toLowerCase().replace(/^@/, '');

  // 1. Score urgency and detect flags for all messages
  const enrichedMessages: ChatMessage[] = rawMessages.map((msg) => {
    const { score, level } = scoreMessageUrgency(msg, targetUser);
    const textLower = msg.content.toLowerCase();
    const hasMention =
      textLower.includes(`@${normalizedTarget}`) ||
      textLower.includes(normalizedTarget) ||
      textLower.includes('@here') ||
      textLower.includes('@channel') ||
      textLower.includes('@everyone');

    return {
      ...msg,
      urgency: level,
      urgencyScore: score,
      hasMention,
    };
  });

  // 2. Extract action items, decisions, and deadlines
  const actionItems = extractActionItems(enrichedMessages, targetUser);
  const decisions = extractDecisions(enrichedMessages);
  const deadlines = extractDeadlines(enrichedMessages);

  // 3. Extract user mentions
  const mentions = enrichedMessages.filter((m) => m.hasMention);

  // 4. Compute participant statistics
  const participantMap = new Map<string, { count: number; mentions: number }>();
  for (const m of enrichedMessages) {
    const current = participantMap.get(m.sender) || { count: 0, mentions: 0 };
    current.count += 1;
    if (m.hasMention) current.mentions += 1;
    participantMap.set(m.sender, current);
  }

  const participants: ParticipantStat[] = Array.from(participantMap.entries())
    .map(([name, stat]) => ({
      name,
      count: stat.count,
      mentionCount: stat.mentions,
    }))
    .sort((a, b) => b.count - a.count);

  // 5. Urgency distribution
  const urgencyDistribution = {
    critical: enrichedMessages.filter((m) => m.urgency === 'CRITICAL').length,
    high: enrichedMessages.filter((m) => m.urgency === 'HIGH').length,
    medium: enrichedMessages.filter((m) => m.urgency === 'MEDIUM').length,
    low: enrichedMessages.filter((m) => m.urgency === 'LOW').length,
  };

  const overallUrgency: UrgencyLevel = calculateOverallUrgency(enrichedMessages);

  // 6. Generate Executive Bullet Points & Briefing
  const executiveBulletPoints: string[] = [];

  // Urgency overview
  if (overallUrgency === 'CRITICAL') {
    executiveBulletPoints.push(
      `🚨 Critical situation detected: ${urgencyDistribution.critical} urgent blocker(s) require immediate intervention.`
    );
  } else if (overallUrgency === 'HIGH') {
    executiveBulletPoints.push(
      `⚠️ High priority discussion: ${urgencyDistribution.high} time-sensitive item(s) pending resolution.`
    );
  } else {
    executiveBulletPoints.push(
      `📋 Standard updates: Conversation progressed across ${enrichedMessages.length} messages with steady momentum.`
    );
  }

  // Personal mentions / Direct asks
  const personalMentions = mentions.filter(
    (m) =>
      m.content.toLowerCase().includes(`@${normalizedTarget}`) ||
      m.content.toLowerCase().includes(normalizedTarget)
  );
  if (personalMentions.length > 0) {
    executiveBulletPoints.push(
      `🔔 You were directly mentioned ${personalMentions.length} time(s) by ${Array.from(
        new Set(personalMentions.map((m) => m.sender))
      ).join(', ')}.`
    );
  }

  // Action items highlight
  const userActionItems = actionItems.filter(
    (a) => a.assignee?.toLowerCase() === normalizedTarget
  );
  if (userActionItems.length > 0) {
    executiveBulletPoints.push(
      `⚡ ${userActionItems.length} task(s) assigned specifically to you: "${userActionItems[0].task}".`
    );
  } else if (actionItems.length > 0) {
    executiveBulletPoints.push(
      `📌 ${actionItems.length} action item(s) assigned to team members.`
    );
  }

  // Key decisions highlight
  if (decisions.length > 0) {
    executiveBulletPoints.push(
      `🎯 ${decisions.length} key decision(s) reached, including: "${decisions[0].decision}".`
    );
  }

  // Upcoming deadlines highlight
  if (deadlines.length > 0) {
    executiveBulletPoints.push(
      `⏳ Key timeline constraint: "${deadlines[0].deadlineText}" flagged by ${deadlines[0].sender}.`
    );
  }

  // Baseline cohesive executive summary paragraph
  let summary = '';
  if (enrichedMessages.length > 0) {
    const topSpeakers = participants.slice(0, 3).map((p) => p.name).join(', ');
    const criticalMsgs = enrichedMessages.filter((m) => m.urgency === 'CRITICAL' || m.urgency === 'HIGH');
    
    summary = `Conversation between ${topSpeakers || 'the team'} spanning ${enrichedMessages.length} messages. `;
    if (criticalMsgs.length > 0) {
      summary += `Primary focus was centered on resolving ${criticalMsgs[0].content.slice(0, 100)}... `;
    }
    if (decisions.length > 0) {
      summary += `The group reached consensus that ${decisions[0].decision.toLowerCase()}. `;
    }
    if (actionItems.length > 0) {
      summary += `Next major steps involve ${actionItems.length} active tasks, with key deadlines noted around ${deadlines[0]?.deadlineText || 'the upcoming milestone'}.`;
    }
  }

  const processingTimeMs = Math.round(performance.now() - startTime);

  return {
    summary: summary || 'No significant messages to summarize.',
    executiveBulletPoints,
    totalMessages: enrichedMessages.length,
    participants,
    urgencyDistribution,
    overallUrgency,
    actionItems,
    decisions,
    deadlines,
    mentions,
    allMessages: enrichedMessages,
    processingTimeMs,
    aiEngineStatus: 'instant-nlp',
    aiModelName: 'Local-First Hybrid Engine (WASM + Linguistic NLP)',
  };
}
