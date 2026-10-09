import React, { useState } from 'react';
import { CheckSquare, Square, User, Clock, CheckCircle } from 'lucide-react';
import { ActionItem, UrgencyLevel } from '@/types/chat';

interface ActionItemsListProps {
  actionItems: ActionItem[];
  targetUser: string;
}

export const ActionItemsList: React.FC<ActionItemsListProps> = ({
  actionItems,
  targetUser,
}) => {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  const toggleComplete = (id: string) => {
    setCompletedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const normalizedTarget = targetUser.toLowerCase().replace(/^@/, '');

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'MEDIUM':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      case 'LOW':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  if (actionItems.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
        <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-60" />
        <h4 className="text-sm font-semibold text-slate-300">No Action Items Found</h4>
        <p className="text-xs text-slate-500 mt-1">
          No explicit tasks or actionable requests detected in this conversation.
        </p>
      </div>
    );
  }

  const completedCount = Object.values(completedMap).filter(Boolean).length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-cyan-400" />
            Action Items &amp; Assigned Tasks
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tasks extracted and prioritized by local AI
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
          <span>{completedCount} of {actionItems.length} completed</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {actionItems.map((item) => {
          const isDone = !!completedMap[item.id];
          const isAssignedToUser =
            item.assignee?.toLowerCase() === normalizedTarget ||
            item.assignee?.toLowerCase() === `@${normalizedTarget}`;

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isDone
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : isAssignedToUser
                  ? 'bg-gradient-to-r from-cyan-950/30 to-indigo-950/30 border-cyan-800/80 shadow-sm shadow-cyan-500/10'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleComplete(item.id)}
                  className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {isDone ? (
                    <CheckSquare className="h-4 w-4 text-cyan-400" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {/* Urgency Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getUrgencyBadge(
                        item.urgency
                      )}`}
                    >
                      {item.urgency}
                    </span>

                    {/* Assignee Badge */}
                    {item.assignee && (
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isAssignedToUser
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <User className="h-3 w-3" />
                        <span>{item.assignee}</span>
                        {isAssignedToUser && <span className="text-[10px] text-cyan-400 font-bold">(You)</span>}
                      </span>
                    )}

                    {/* Source Timestamp */}
                    {item.sourceTimestamp && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 ml-auto">
                        <Clock className="h-3 w-3" />
                        <span>{item.sourceTimestamp}</span>
                      </span>
                    )}
                  </div>

                  {/* Task text */}
                  <p
                    className={`text-xs text-slate-200 font-medium leading-relaxed ${
                      isDone ? 'line-through text-slate-500' : ''
                    }`}
                  >
                    {item.task}
                  </p>

                  {/* Context quote */}
                  <div className="mt-2 text-[11px] text-slate-400 italic bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800/60 flex items-center gap-1.5">
                    <span className="text-slate-500 not-italic">{item.sourceSender}:</span>
                    <span className="truncate">&quot;{item.context}&quot;</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
