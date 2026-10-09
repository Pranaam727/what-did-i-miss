import React from 'react';
import { CalendarClock, Clock, User } from 'lucide-react';
import { DeadlineItem, UrgencyLevel } from '@/types/chat';

interface DeadlinesViewProps {
  deadlines: DeadlineItem[];
}

export const DeadlinesView: React.FC<DeadlinesViewProps> = ({ deadlines }) => {
  if (deadlines.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
        <CalendarClock className="h-8 w-8 text-amber-400 mx-auto mb-2 opacity-60" />
        <h4 className="text-sm font-semibold text-slate-300">No Hard Deadlines Found</h4>
        <p className="text-xs text-slate-500 mt-1">
          No explicit timestamps, dates, or time constraints mentioned.
        </p>
      </div>
    );
  }

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'MEDIUM':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      case 'LOW':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-amber-400" />
            Deadlines &amp; Time Constraints
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Extracted milestones, due dates, and cutoffs
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
          <span>{deadlines.length} deadline(s)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {deadlines.map((dl) => (
          <div
            key={dl.id}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-800/50">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>{dl.deadlineText}</span>
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getUrgencyBadge(
                    dl.urgency
                  )}`}
                >
                  {dl.urgency}
                </span>
              </div>

              <p className="text-xs text-slate-200 font-medium leading-relaxed mb-2">
                {dl.taskOrEvent}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Flagged by {dl.sender}</span>
              </span>
              {dl.timestamp && <span>{dl.timestamp}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
