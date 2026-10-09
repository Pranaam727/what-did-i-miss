import React from 'react';
import { AtSign, Clock, User, Bell } from 'lucide-react';
import { ChatMessage, UrgencyLevel } from '@/types/chat';

interface MentionsViewProps {
  mentions: ChatMessage[];
  targetUser: string;
}

export const MentionsView: React.FC<MentionsViewProps> = ({
  mentions,
  targetUser,
}) => {
  if (mentions.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
        <Bell className="h-8 w-8 text-cyan-400 mx-auto mb-2 opacity-60" />
        <h4 className="text-sm font-semibold text-slate-300">No Mentions For You</h4>
        <p className="text-xs text-slate-500 mt-1">
          You ({targetUser}) were not directly tagged or mentioned in this conversation.
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
            <AtSign className="h-4 w-4 text-cyan-400" />
            Direct Mentions &amp; Asks for @{targetUser}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Messages requiring your specific attention or response
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
          <span>{mentions.length} mention(s)</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {mentions.map((msg) => (
          <div
            key={msg.id}
            className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/20 to-slate-950/80 border border-cyan-900/50 hover:border-cyan-700/60 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mt-0.5">
                <AtSign className="h-3.5 w-3.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-500" />
                    <span className="font-semibold text-white">{msg.sender}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getUrgencyBadge(
                        msg.urgency
                      )}`}
                    >
                      {msg.urgency} ({msg.urgencyScore}%)
                    </span>
                    {msg.timestamp && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{msg.timestamp}</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  {msg.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
