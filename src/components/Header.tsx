import React from 'react';
import { ShieldCheck, Award, Zap } from 'lucide-react';

interface HeaderProps {
  onOpenPrivacyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPrivacyModal }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Zap className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                What Did I Miss?
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                v1.0 Local-First
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous In-Browser Chat Briefing & Prioritization Engine
            </p>
          </div>
        </div>

        {/* Hackathon, Author & Privacy Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* ProtocolX Hackathon Tag */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-950/70 border border-indigo-800/60 text-xs text-indigo-300">
            <Award className="h-3.5 w-3.5 text-indigo-400" />
            <span>ProtocolX Hackathon</span>
          </div>

          {/* Author Attribution */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-500">Author:</span>
            <span className="font-semibold text-emerald-400">PRANAAM</span>
          </div>

          {/* Privacy Guarantee Pill */}
          <button
            onClick={onOpenPrivacyModal}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-xs text-emerald-300 hover:bg-emerald-900/60 transition-colors shadow-sm"
            title="Click to view client-side privacy architecture"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-medium">100% Client-Side AI</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
