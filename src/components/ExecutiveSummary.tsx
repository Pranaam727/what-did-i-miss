import React from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Target,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AnalysisResult, UrgencyLevel } from '@/types/chat';

interface ExecutiveSummaryProps {
  result: AnalysisResult;
  targetUser: string;
  isAiGenerating?: boolean;
  workerProgress?: { progress?: number; message?: string };
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  result,
  targetUser,
  isAiGenerating,
  workerProgress,
}) => {
  const getUrgencyConfig = (level: UrgencyLevel) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-950/40 border-rose-600/50 text-rose-300',
          badge: 'bg-rose-600 text-white',
          pulse: 'bg-rose-500 animate-ping',
          label: 'CRITICAL ATTENTION REQUIRED',
          icon: AlertTriangle,
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-950/40 border-amber-600/50 text-amber-300',
          badge: 'bg-amber-600 text-white',
          pulse: 'bg-amber-500 animate-ping',
          label: 'HIGH URGENCY',
          icon: AlertTriangle,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-blue-950/40 border-blue-600/50 text-blue-300',
          badge: 'bg-blue-600 text-white',
          pulse: 'bg-blue-500',
          label: 'MODERATE / IMPORTANT',
          icon: Clock,
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300',
          badge: 'bg-emerald-600 text-white',
          pulse: 'bg-emerald-500',
          label: 'ROUTINE / LOW URGENCY',
          icon: CheckCircle2,
        };
    }
  };

  const config = getUrgencyConfig(result.overallUrgency);
  const UrgencyIcon = config.icon;

  return (
    <div className="space-y-4">
      {/* Top Banner: Urgency + Executive Summary Card */}
      <div className={`p-6 rounded-2xl border ${config.bg} shadow-xl relative overflow-hidden backdrop-blur-md`}>
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm ${config.badge}`}>
              <UrgencyIcon className="h-3.5 w-3.5" />
              <span>{config.label}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Local Analysis in {result.processingTimeMs}ms</span>
            </div>
          </div>

          {/* Model / Local Pipeline indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-mono text-[11px] text-cyan-300">
              {result.aiModelName}
            </span>
          </div>
        </div>

        {/* Worker In-Progress Banner */}
        {isAiGenerating && (
          <div className="mb-4 p-3 rounded-xl bg-slate-900/90 border border-cyan-800/60 flex items-center justify-between gap-3 text-xs text-cyan-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>{workerProgress?.message || 'Refining summary with in-browser ONNX model...'}</span>
            </div>
            {workerProgress?.progress !== undefined && (
              <span className="font-mono text-[11px] text-cyan-400 font-semibold">
                {Math.round(workerProgress.progress)}%
              </span>
            )}
          </div>
        )}

        {/* Executive Summary Paragraph */}
        <div className="mb-5">
          <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">
            Executive Briefing for @{targetUser}:
          </h3>
          <p className="text-base text-slate-100 font-normal leading-relaxed">
            {result.summary}
          </p>
        </div>

        {/* Key Takeaway Bullet Points */}
        {result.executiveBulletPoints.length > 0 && (
          <div className="pt-4 border-t border-slate-800/80">
            <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2.5">
              Key Critical Highlights:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {result.executiveBulletPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-200 leading-normal flex items-start gap-2"
                >
                  <span className="text-slate-500 font-mono text-[11px] select-none mt-0.5">
                    0{idx + 1}
                  </span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Messages */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{result.totalMessages}</div>
            <div className="text-[11px] text-slate-400">Total Messages</div>
          </div>
        </div>

        {/* Action Items */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{result.actionItems.length}</div>
            <div className="text-[11px] text-slate-400">Action Items</div>
          </div>
        </div>

        {/* Key Decisions */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{result.decisions.length}</div>
            <div className="text-[11px] text-slate-400">Key Decisions</div>
          </div>
        </div>

        {/* Active Participants */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{result.participants.length}</div>
            <div className="text-[11px] text-slate-400">Participants</div>
          </div>
        </div>
      </div>
    </div>
  );
};
