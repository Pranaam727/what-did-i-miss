import React from 'react';
import { ShieldCheck, Lock, WifiOff, Cpu, X, CheckCircle2 } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-200 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Strict Local-First Guarantee</h3>
            <p className="text-xs text-emerald-400 font-medium">
              Zero Network Calls • 100% In-Browser Execution
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-5">
          In compliance with the <strong className="text-white">ProtocolX Hackathon</strong> technical specifications, 
          &quot;What Did I Miss?&quot; executes every NLP parsing, scoring, action extraction, and model summarization step
          exclusively on your local device.
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <Lock className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-white">Zero Cloud Leakage</h4>
              <p className="text-xs text-slate-400">
                Your chat logs, WhatsApp exports, Slack channels, and transcripts are never transmitted to any external API or cloud server.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <Cpu className="h-5 w-5 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-white">Browser WebAssembly & Web Workers</h4>
              <p className="text-xs text-slate-400">
                Powered by <code>@xenova/transformers</code> with ONNX Runtime Web. Neural pipelines run in a dedicated Web Worker thread for seamless UX.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <WifiOff className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-white">True Offline Compatibility</h4>
              <p className="text-xs text-slate-400">
                The hybrid linguistic and heuristic summarization engines operate fully offline without an internet connection.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Audited for ProtocolX Hackathon</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
