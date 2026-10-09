import React, { useState } from 'react';
import { Download, Copy, Check, X, Share2 } from 'lucide-react';
import { AnalysisResult } from '@/types/chat';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult;
  targetUser: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  result,
  targetUser,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdownReport = (): string => {
    return `# 📋 Briefing: "What Did I Miss?"
*Generated autonomously on-device for @${targetUser} via Local-First AI*
*Author Attribution: PRANAAM | ProtocolX Hackathon*

---

### 🚨 Urgency Level: **${result.overallUrgency}**
**Executive Summary:**
${result.summary}

---

### 🔑 Critical Highlights:
${result.executiveBulletPoints.map((pt) => `- ${pt}`).join('\n')}

---

### 📌 Action Items (${result.actionItems.length}):
${
  result.actionItems.length > 0
    ? result.actionItems
        .map(
          (a) =>
            `- [ ] **${a.task}** (Urgency: ${a.urgency}${
              a.assignee ? ` | Assignee: @${a.assignee}` : ''
            })`
        )
        .join('\n')
    : '_No action items detected._'
}

---

### 🎯 Key Decisions Reached:
${
  result.decisions.length > 0
    ? result.decisions
        .map((d) => `- **${d.decision}** (Decided by: ${d.decidedBy})`)
        .join('\n')
    : '_No explicit decisions recorded._'
}

---

### ⏳ Upcoming Deadlines:
${
  result.deadlines.length > 0
    ? result.deadlines
        .map((dl) => `- **${dl.deadlineText}**: ${dl.taskOrEvent}`)
        .join('\n')
    : '_No hard deadlines detected._'
}

---
*Processing Details: Analyzed ${result.totalMessages} messages across ${
      result.participants.length
    } participants in ${result.processingTimeMs}ms.*
`;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownReport();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `what-did-i-miss-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const mdText = generateMarkdownReport();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Export &amp; Share Briefing</h3>
              <p className="text-xs text-slate-400">
                Ready to paste into Slack, Microsoft Teams, or Jira
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Markdown Preview Area */}
        <div className="flex-1 overflow-y-auto mb-4 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-all">
          {mdText}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={handleDownloadJSON}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download Raw JSON</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyMarkdown}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-300" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Markdown Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
