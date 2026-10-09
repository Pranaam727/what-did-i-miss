export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp?: string;
  date?: string;
  raw: string;
  urgency: UrgencyLevel;
  urgencyScore: number;
  hasMention: boolean;
  hasDeadline: boolean;
  isDecision: boolean;
  isActionItem: boolean;
}

export interface ActionItem {
  id: string;
  task: string;
  assignee?: string;
  urgency: UrgencyLevel;
  sourceMessageId: string;
  sourceSender: string;
  sourceTimestamp?: string;
  context: string;
  completed?: boolean;
}

export interface KeyDecision {
  id: string;
  decision: string;
  decidedBy: string;
  sourceTimestamp?: string;
  sourceMessageId: string;
  context: string;
}

export interface DeadlineItem {
  id: string;
  taskOrEvent: string;
  deadlineText: string;
  timestamp?: string;
  urgency: UrgencyLevel;
  sender: string;
  sourceMessageId: string;
}

export interface ParticipantStat {
  name: string;
  count: number;
  mentionCount: number;
}

export interface AnalysisResult {
  summary: string;
  executiveBulletPoints: string[];
  totalMessages: number;
  participants: ParticipantStat[];
  urgencyDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  overallUrgency: UrgencyLevel;
  actionItems: ActionItem[];
  decisions: KeyDecision[];
  deadlines: DeadlineItem[];
  mentions: ChatMessage[];
  allMessages: ChatMessage[];
  processingTimeMs: number;
  aiEngineStatus: 'hybrid-local-wasm' | 'instant-nlp' | 'worker-complete';
  aiModelName: string;
}

export interface WorkerProgressPayload {
  status: 'init' | 'downloading' | 'loading' | 'ready' | 'processing' | 'done' | 'error';
  progress?: number;
  message?: string;
  file?: string;
}

export interface WorkerRequestPayload {
  action: 'summarize' | 'init';
  text?: string;
  targetUser?: string;
  maxTokens?: number;
}

export interface WorkerResponsePayload {
  status: 'ready' | 'progress' | 'summary_complete' | 'error';
  summary?: string;
  progress?: number;
  message?: string;
  error?: string;
}
