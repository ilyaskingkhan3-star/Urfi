import React, { useState, useRef } from 'react';
import { FileUp, FileText, Sparkles, HelpCircle, Check, Copy, Volume2, X } from 'lucide-react';
import { UserProfile } from '../types';
import { analyzeDocument } from '../services/geminiService';
import { speakText } from '../services/speechService';

interface DocumentAssistantViewProps {
  profile: UserProfile;
}

export const DocumentAssistantView: React.FC<DocumentAssistantViewProps> = ({ profile }) => {
  const [fileData, setFileData] = useState<{ name: string; content: string; size: number } | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUrdu = profile.language === 'ur';
  const isRoman = profile.language === 'roman-ur';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setFileData({
        name: file.name,
        content: text,
        size: file.size,
      });
      setAnalysis(null);
    };
    reader.readAsText(file);
  };

  const handleRunAnalysis = async (queryPrompt?: string) => {
    if (!fileData || isLoading) return;

    setIsLoading(true);
    setAnalysis(null);
    try {
      const res = await analyzeDocument({
        content: fileData.content,
        filename: fileData.name,
        query: queryPrompt || customQuestion,
        profile,
      });
      setAnalysis(res);

      if (profile.autoSpeak) {
        speakText(res, profile.language, profile.voice, profile.speechRate || 1.0);
      }
    } catch (e) {
      setAnalysis(
        isUrdu
          ? 'معذرت، فائل کا جائزہ لینے میں دشواری پیش آئی ہے۔'
          : 'Failed to analyze document.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt,.md,.csv,.json,.doc,.docx,.pdf,.log"
        className="hidden"
      />

      {!fileData ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--theme-border)] hover:border-[var(--theme-primary)] rounded-3xl p-10 text-center cursor-pointer glass-panel transition-all space-y-4 group"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--theme-badge-bg)] text-[var(--theme-primary)] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <FileUp className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isUrdu ? 'دستاویز یا فائل اپلوڈ کریں' : isRoman ? 'Document ya file upload karein' : 'Upload Document or File'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports TXT, MD, CSV, JSON, Notes, Reports & PDFs
            </p>
          </div>
          <button
            type="button"
            className="px-5 py-2 rounded-full font-bold text-xs text-slate-950 transition-all inline-flex items-center gap-2 shadow-lg"
            style={{
              backgroundColor: 'var(--theme-primary)',
            }}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'فائل منتخب کریں' : 'Choose Document'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Card */}
          <div className="p-6 rounded-3xl glass-panel border border-[var(--theme-border)] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[var(--theme-badge-bg)] text-[var(--theme-primary)]">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{fileData.name}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {Math.round(fileData.size / 1024)} KB • {fileData.content.length} characters
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setFileData(null);
                  setAnalysis(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick action triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                onClick={() => handleRunAnalysis('Please provide a concise executive summary and key findings of this document in Urdu/Roman Urdu.')}
                disabled={isLoading}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 text-left font-medium transition-all flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                <span>{isUrdu ? 'مکمل خلاصہ (Executive Summary)' : 'Executive Summary'}</span>
              </button>

              <button
                onClick={() => handleRunAnalysis('Extract all important action items, tasks, and deadlines from this file.')}
                disabled={isLoading}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 text-left font-medium transition-all flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>{isUrdu ? 'اہم ایکشن پوائنٹس نکالیں' : 'Extract Action Items'}</span>
              </button>

              <button
                onClick={() => handleRunAnalysis('Explain the main concepts and key facts in simple everyday language.')}
                disabled={isLoading}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 text-left font-medium transition-all flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isUrdu ? 'آسان الفاظ میں سمجھائیں' : 'Explain in Simple Words'}</span>
              </button>
            </div>

            {/* Custom Query Input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder={isUrdu ? 'اس فائل کے بارے میں کوئی مخصوص سوال پوچھیں...' : 'Ask specific question about this document...'}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[var(--theme-primary)]"
              />
              <button
                onClick={() => handleRunAnalysis()}
                disabled={isLoading || !customQuestion.trim()}
                className="px-4 py-2 rounded-xl font-bold text-xs text-slate-950 transition-all cursor-pointer disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--theme-primary)',
                }}
              >
                {isLoading ? '...' : (isUrdu ? 'دریافت' : 'Analyze')}
              </button>
            </div>
          </div>

          {/* Analysis View */}
          {isLoading && (
            <div className="p-8 rounded-3xl glass-panel border border-[var(--theme-border-subtle)] text-center space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-[var(--theme-primary)] animate-spin" />
              <p className="text-xs text-slate-300">
                {isUrdu ? 'عرفی فائل کا تجزیہ کر رہی ہے...' : 'Analyzing document content...'}
              </p>
            </div>
          )}

          {analysis && (
            <div className="p-6 rounded-3xl glass-panel border border-[var(--theme-border)] shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--theme-primary)] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'دستاویز کا جائزہ' : 'Document Insights'}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakText(analysis, profile.language, profile.voice, profile.speechRate || 1.0)}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Speak"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                {analysis}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentAssistantView;
