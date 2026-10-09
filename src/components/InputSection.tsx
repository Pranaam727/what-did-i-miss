import React, { useRef } from 'react';
import { Upload, Sparkles, RefreshCw, FileText, User, FileCode, Check } from 'lucide-react';
import { SAMPLE_PRESETS, SamplePreset } from '@/lib/presets/sampleData';

interface InputSectionProps {
  chatInput: string;
  setChatInput: (val: string) => void;
  targetUser: string;
  setTargetUser: (val: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  activePresetId: string | null;
  onSelectPreset: (preset: SamplePreset) => void;
  onClear: () => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  chatInput,
  setChatInput,
  targetUser,
  setTargetUser,
  onAnalyze,
  isAnalyzing,
  activePresetId,
  onSelectPreset,
  onClear,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setChatInput(text);
      }
    };
    reader.readAsText(file);
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const lineCount = chatInput.trim() ? chatInput.split('\n').length : 0;
  const charCount = chatInput.length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-black/20">
      {/* Top Bar: Sample Presets & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-400" />
            Input Conversation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Paste WhatsApp, Slack, Discord exports or select a hackathon preset
          </p>
        </div>

        {/* Preset Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Presets:</span>
          {SAMPLE_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-semibold shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <span>{preset.title.split(':')[0]}</span>
                {isSelected && <Check className="h-3 w-3 text-cyan-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target User & Format Guidance Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Highlight Mentions &amp; Tasks For:
            </label>
            <input
              type="text"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              placeholder="e.g. PRANAAM or your name"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-slate-500" />
            <span>Supported: WhatsApp, Slack, Teams, Discord, Plain</span>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 text-cyan-400" />
            <span>Upload File (.txt)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.json,.csv,.log"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Text Area */}
      <div className="relative">
        <textarea
          rows={7}
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder={`Paste your chat transcript here... Examples:
[10/09/2026, 14:02:11] Alice: @PRANAAM we need to deploy the update before 5 PM!
Bob: I will handle the unit tests.
[10/09/2026, 14:05:00] Alice: We decided to go with Next.js.`}
          className="w-full font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-y leading-relaxed"
        />

        {/* Counter Pill */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 text-[10px] text-slate-500 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 pointer-events-none">
          <span>{lineCount} lines</span>
          <span>•</span>
          <span>{charCount} chars</span>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80">
        <button
          onClick={onClear}
          disabled={!chatInput}
          className="text-xs px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          Clear Input
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onAnalyze}
            disabled={!chatInput.trim() || isAnalyzing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>Processing Locally...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-cyan-200" />
                <span>Analyze &amp; Prioritize</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
