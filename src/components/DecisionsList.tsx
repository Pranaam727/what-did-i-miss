import React from 'react';
import { Target, User, Clock, CheckCircle } from 'lucide-react';
import { KeyDecision } from '@/types/chat';

interface DecisionsListProps {
  decisions: KeyDecision[];
}

export const DecisionsList: React.FC<DecisionsListProps> = ({ decisions }) => {
  if (decisions.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
        <Target className="h-8 w-8 text-indigo-400 mx-auto mb-2 opacity-60" />
        <h4 className="text-sm font-semibold text-slate-300">No Key Decisions Detected</h4>
        <p className="text-xs text-slate-500 mt-1">
          No definitive consensus or agreed decisions identified in this thread.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-400" />
            Key Decisions Reached
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Confirmed team agreements and architectural choices
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
          <span>{decisions.length} recorded</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {decisions.map((dec) => (
          <div
            key={dec.id}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mt-0.5">
                <CheckCircle className="h-3.5 w-3.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-500" />
                    <span className="text-slate-300 font-semibold">{dec.decidedBy}</span>
                  </span>

                  {dec.sourceTimestamp && (
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{dec.sourceTimestamp}</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-100 font-medium leading-relaxed">
                  {dec.decision}
                </p>

                <div className="mt-2 text-[11px] text-slate-400 italic bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800/60 truncate">
                  &quot;{dec.context}&quot;
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
