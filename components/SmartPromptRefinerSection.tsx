import React, { useState } from 'react';
import { Sliders, Zap, BookOpen, Check, Sparkles, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { PromptRefinerMode, ThemeMode } from '../types';
import { THEMES } from '../services/theme';
import { getRefinerDirective } from '../services/promptRefiner';

interface SmartPromptRefinerSectionProps {
  mode: PromptRefinerMode;
  onModeChange: (newMode: PromptRefinerMode) => void;
  systemPrompt: string;
  currentTheme?: ThemeMode;
}

export const SmartPromptRefinerSection: React.FC<SmartPromptRefinerSectionProps> = ({
  mode,
  onModeChange,
  systemPrompt,
  currentTheme = 'urfi-futuristic',
}) => {
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const activeColor = THEMES[currentTheme]?.primaryColor || '#06b6d4';
  const currentDirective = getRefinerDirective(mode);

  return (
    <section className="space-y-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="w-7 h-7 rounded-xl flex items-center justify-center border"
            style={{ 
              backgroundColor: `${activeColor}15`, 
              borderColor: `${activeColor}40`,
              color: activeColor 
            }}
          >
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                Smart Prompt Refiner
              </h3>
              <span 
                className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider border flex items-center gap-1"
                style={{
                  backgroundColor: `${activeColor}20`,
                  borderColor: `${activeColor}50`,
                  color: activeColor
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: activeColor }} />
                {mode === 'concise' ? 'Concise Mode' : 'Detailed Mode'}
              </span>
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">
              Dynamically modulates Gemini API <span className="font-mono text-cyan-300">systemPrompt</span> instruction
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selector Cards */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {/* Concise Mode Card */}
        <button
          type="button"
          onClick={() => onModeChange('concise')}
          className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98] ${
            mode === 'concise'
              ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
              : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
          }`}
        >
          {mode === 'concise' && (
            <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          )}
          
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${mode === 'concise' ? 'bg-cyan-400 text-slate-950' : 'bg-white/10 text-slate-300'}`}>
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
                <span>Concise</span>
                <span className="text-[10px] text-cyan-400 font-nastaliq opacity-90">(مختصر)</span>
              </div>
              <span className="text-[9px] font-mono text-cyan-300/80">Direct & Crisp</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-tight">
            Short, direct 2–4 sentence answers. Zero filler, quick bullet points.
          </p>

          <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-500">
            <span>Focus: Speed & Brevity</span>
            <span className="font-mono text-cyan-400">~50-100 words</span>
          </div>
        </button>

        {/* Detailed Mode Card */}
        <button
          type="button"
          onClick={() => onModeChange('detailed')}
          className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98] ${
            mode === 'detailed'
              ? 'bg-violet-500/15 border-violet-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
              : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
          }`}
        >
          {mode === 'detailed' && (
            <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-violet-400 text-slate-950 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          )}

          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${mode === 'detailed' ? 'bg-violet-400 text-slate-950' : 'bg-white/10 text-slate-300'}`}>
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
                <span>Detailed</span>
                <span className="text-[10px] text-violet-400 font-nastaliq opacity-90">(تفصیلی)</span>
              </div>
              <span className="text-[9px] font-mono text-violet-300/80">In-Depth & Contextual</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-tight">
            Comprehensive explanations, background context, step-by-step guides.
          </p>

          <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-500">
            <span>Focus: Deep Understanding</span>
            <span className="font-mono text-violet-400">Thorough & Rich</span>
          </div>
        </button>
      </div>

      {/* Urdu Explanation Footnote */}
      <div className="text-[10px] text-slate-300/80 bg-black/30 p-2 rounded-xl border border-white/5 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          {mode === 'concise' ? (
            <span>
              <strong className="text-cyan-300">Concise Mode Active:</strong> URFI ab aap ko fori, mukhtasar aur to-the-point jawabaat degi baghair fazool lambi baaton ke.
            </span>
          ) : (
            <span>
              <strong className="text-violet-300">Detailed Mode Active:</strong> URFI ab har sawal ki poori wazahat, aasan misaalain aur tafseeli background faraham karegi.
            </span>
          )}
        </div>
      </div>

      {/* Live System Prompt Directive Preview Accordion */}
      <div className="border border-white/5 rounded-xl bg-black/40 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPromptPreview(!showPromptPreview)}
          className="w-full px-3 py-2 flex items-center justify-between text-slate-300 hover:text-white transition-colors text-[10px] font-mono"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Active Gemini systemInstruction modifier</span>
          </span>
          <span className="flex items-center gap-1 text-[9px] text-cyan-400/80">
            <span>{showPromptPreview ? 'Hide' : 'Inspect'}</span>
            {showPromptPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </span>
        </button>

        {showPromptPreview && (
          <div className="p-2.5 pt-0 text-[9px] font-mono text-cyan-200/90 leading-relaxed border-t border-white/5 bg-slate-950/60">
            <div className="p-2 rounded-lg bg-black/60 border border-cyan-500/20 whitespace-pre-wrap selection:bg-cyan-500 selection:text-black">
              {currentDirective}
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[8px] text-slate-400">
              <span>Status: Dynamically injected into all Gemini API requests</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live on API
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SmartPromptRefinerSection;
