import React, { useState } from 'react';
import { Layers, User } from 'lucide-react';
import { ChatMessage, UrgencyLevel } from '@/types/chat';

interface UrgencyMatrixProps {
  messages: ChatMessage[];
}

export const UrgencyMatrix: React.FC<UrgencyMatrixProps> = ({ messages }) => {
  const [activeTab, setActiveTab] = useState<UrgencyLevel | 'ALL'>('ALL');

  const filteredMessages =
    activeTab === 'ALL'
      ? messages
      : messages.filter((m) => m.urgency === activeTab);

  const counts = {
    ALL: messages.length,
    CRITICAL: messages.filter((m) => m.urgency === 'CRITICAL').length,
    HIGH: messages.filter((m) => m.urgency === 'HIGH').length,
    MEDIUM: messages.filter((m) => m.urgency === 'MEDIUM').length,
    LOW: messages.filter((m) => m.urgency === 'LOW').length,
  };

  const tabs: Array<{ id: UrgencyLevel | 'ALL'; label: string; count: number; color: string }> = [
    { id: 'ALL', label: 'All Messages', count: counts.ALL, color: 'text-slate-300' },
    { id: 'CRITICAL', label: 'Critical (P0)', count: counts.CRITICAL, color: 'text-rose-400' },
    { id: 'HIGH', label: 'High (P1)', count: counts.HIGH, color: 'text-amber-400' },
    { id: 'MEDIUM', label: 'Medium (P2)', count: counts.MEDIUM, color: 'text-blue-400' },
    { id: 'LOW', label: 'Routine (FYI)', count: counts.LOW, color: 'text-emerald-400' },
  ];

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            Urgency Triage Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Filter all conversation threads by urgency score and priority tier
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={tab.color}>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-400">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {filteredMessages.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No messages found in this urgency tier.
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-500" />
                    <span>{msg.sender}</span>
                  </span>
                  {msg.timestamp && (
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className={`h-full ${
                        msg.urgency === 'CRITICAL'
                          ? 'bg-rose-500'
                          : msg.urgency === 'HIGH'
                          ? 'bg-amber-500'
                          : msg.urgency === 'MEDIUM'
                          ? 'bg-blue-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${msg.urgencyScore}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getUrgencyBadge(
                      msg.urgency
                    )}`}
                  >
                    {msg.urgency} ({msg.urgencyScore}%)
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {msg.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
