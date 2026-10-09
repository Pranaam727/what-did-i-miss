'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { InputSection } from '@/components/InputSection';
import { ExecutiveSummary } from '@/components/ExecutiveSummary';
import { ActionItemsList } from '@/components/ActionItemsList';
import { DecisionsList } from '@/components/DecisionsList';
import { DeadlinesView } from '@/components/DeadlinesView';
import { MentionsView } from '@/components/MentionsView';
import { UrgencyMatrix } from '@/components/UrgencyMatrix';
import { PrivacyModal } from '@/components/PrivacyBadge';
import { ExportModal } from '@/components/ExportModal';
import { SAMPLE_PRESETS, SamplePreset } from '@/lib/presets/sampleData';
import { parseChatLog } from '@/lib/parser/chatParser';
import { synthesizeConversationAnalysis } from '@/lib/ai/localSynthesizer';
import { AnalysisResult } from '@/types/chat';
import {
  Share2,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export default function Home() {
  const [chatInput, setChatInput] = useState<string>(SAMPLE_PRESETS[0].rawChat);
  const [targetUser, setTargetUser] = useState<string>('PRANAAM');
  const [activePresetId, setActivePresetId] = useState<string | null>(SAMPLE_PRESETS[0].id);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(() =>
    synthesizeConversationAnalysis(parseChatLog(SAMPLE_PRESETS[0].rawChat, 'PRANAAM'), 'PRANAAM')
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [workerProgress, setWorkerProgress] = useState<{ progress?: number; message?: string }>({});
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'all' | 'actions' | 'decisions' | 'deadlines' | 'mentions'>('all');

  const workerRef = useRef<Worker | null>(null);

  // Initialize Web Worker for client-side background model inference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const worker = new Worker(new URL('../lib/ai/worker.ts', import.meta.url), {
          type: 'module',
        });

        worker.onmessage = (event: MessageEvent) => {
          const { status, summary, progress, message, error } = event.data;
          if (status === 'progress') {
            setWorkerProgress({ progress, message });
          } else if (status === 'summary_complete') {
            setIsAiGenerating(false);
            setWorkerProgress({ message: 'Summary synthesized locally via WASM!' });
            if (summary && summary.trim()) {
              setAnalysisResult((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  summary: summary.trim(),
                  aiEngineStatus: 'worker-complete',
                  aiModelName: 'DistilBART-CNN (WASM In-Browser Neural Model)',
                };
              });
            }
          } else if (status === 'error') {
            setIsAiGenerating(false);
            setWorkerProgress({ message: error || 'Using local NLP synthesis' });
          }
        };

        workerRef.current = worker;
      } catch (e) {
        console.warn('Web Worker initialization deferred:', e);
      }
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleRunAnalysis = (textToAnalyze = chatInput, user = targetUser) => {
    if (!textToAnalyze.trim()) return;

    setIsAnalyzing(true);
    // Parse chat messages
    const parsedMessages = parseChatLog(textToAnalyze, user);
    // Synthesize instant analysis
    const result = synthesizeConversationAnalysis(parsedMessages, user);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleTriggerDeepNeuralAI = () => {
    if (!chatInput.trim() || !workerRef.current) return;
    setIsAiGenerating(true);
    setWorkerProgress({ message: 'Starting client-side WASM transformer...' });

    // Send condensed conversation text to the Web Worker for abstractive summarization
    const formattedTranscript = (analysisResult?.allMessages || [])
      .map((m) => `${m.sender}: ${m.content}`)
      .slice(0, 25)
      .join(' | ');

    workerRef.current.postMessage({
      action: 'summarize',
      text: formattedTranscript || chatInput.slice(0, 1500),
      maxTokens: 100,
    });
  };

  const handleSelectPreset = (preset: SamplePreset) => {
    setActivePresetId(preset.id);
    setChatInput(preset.rawChat);
    handleRunAnalysis(preset.rawChat, targetUser);
  };

  const handleClear = () => {
    setChatInput('');
    setActivePresetId(null);
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Global Top Navbar */}
      <Header onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)} />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hero Section Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-6 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                  ProtocolX Submission
                </span>
                <span className="text-xs text-slate-400">
                  Built by <strong className="text-emerald-400 font-semibold">PRANAAM</strong>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Never Drown in Unread Chats Again.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                Triage hundreds of WhatsApp, Slack, and Discord messages instantly. Automatically isolates 
                <strong className="text-slate-200"> P0 blockers</strong>, highlights 
                <strong className="text-slate-200"> deadlines</strong>, and flags direct asks for 
                <strong className="text-cyan-300 font-semibold"> @{targetUser}</strong> — completely on your device with 
                zero cloud API calls.
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0">
              <button
                onClick={() => setIsExportModalOpen(true)}
                disabled={!analysisResult}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Export Briefing</span>
              </button>

              <button
                onClick={handleTriggerDeepNeuralAI}
                disabled={!analysisResult || isAiGenerating}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-300 disabled:opacity-40 transition-colors cursor-pointer"
                title="Run in-browser ONNX neural transformer for abstractive summarization"
              >
                <Cpu className={`h-3.5 w-3.5 text-indigo-400 ${isAiGenerating ? 'animate-spin' : ''}`} />
                <span>{isAiGenerating ? 'Running WASM Model...' : 'Enhance with Neural AI'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <InputSection
          chatInput={chatInput}
          setChatInput={setChatInput}
          targetUser={targetUser}
          setTargetUser={(val) => {
            setTargetUser(val);
            if (chatInput.trim()) {
              handleRunAnalysis(chatInput, val);
            }
          }}
          onAnalyze={() => handleRunAnalysis()}
          isAnalyzing={isAnalyzing}
          activePresetId={activePresetId}
          onSelectPreset={handleSelectPreset}
          onClear={handleClear}
        />

        {/* Results Dashboard */}
        {analysisResult && (
          <div className="space-y-6 pt-2">
            {/* Executive Summary & Metrics */}
            <ExecutiveSummary
              result={analysisResult}
              targetUser={targetUser}
              isAiGenerating={isAiGenerating}
              workerProgress={workerProgress}
            />

            {/* View Tabs Selector */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveViewTab('all')}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                  activeViewTab === 'all'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Insights
              </button>
              <button
                onClick={() => setActiveViewTab('actions')}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activeViewTab === 'actions'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Action Items</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-cyan-400">
                  {analysisResult.actionItems.length}
                </span>
              </button>
              <button
                onClick={() => setActiveViewTab('decisions')}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activeViewTab === 'decisions'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Key Decisions</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-indigo-400">
                  {analysisResult.decisions.length}
                </span>
              </button>
              <button
                onClick={() => setActiveViewTab('deadlines')}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activeViewTab === 'deadlines'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Deadlines</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-400">
                  {analysisResult.deadlines.length}
                </span>
              </button>
              <button
                onClick={() => setActiveViewTab('mentions')}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activeViewTab === 'mentions'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Mentions (@{targetUser})</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-emerald-400">
                  {analysisResult.mentions.length}
                </span>
              </button>
            </div>

            {/* Modular Views Content */}
            <div className="space-y-6">
              {(activeViewTab === 'all' || activeViewTab === 'mentions') && (
                <MentionsView
                  mentions={analysisResult.mentions}
                  targetUser={targetUser}
                />
              )}

              {(activeViewTab === 'all' || activeViewTab === 'actions') && (
                <ActionItemsList
                  actionItems={analysisResult.actionItems}
                  targetUser={targetUser}
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(activeViewTab === 'all' || activeViewTab === 'decisions') && (
                  <DecisionsList decisions={analysisResult.decisions} />
                )}

                {(activeViewTab === 'all' || activeViewTab === 'deadlines') && (
                  <DeadlinesView deadlines={analysisResult.deadlines} />
                )}
              </div>

              {/* Triage Matrix */}
              {activeViewTab === 'all' && (
                <UrgencyMatrix messages={analysisResult.allMessages} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>&quot;What Did I Miss?&quot;</span>
            <span>•</span>
            <span>ProtocolX Hackathon Submission</span>
            <span>•</span>
            <span>Author: <strong className="text-slate-300 font-semibold">PRANAAM</strong></span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Local-First Guarantee</span>
            </button>
            <a
              href="https://github.com/Pranaam727/what-did-i-miss"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {analysisResult && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          result={analysisResult}
          targetUser={targetUser}
        />
      )}
    </div>
  );
}
