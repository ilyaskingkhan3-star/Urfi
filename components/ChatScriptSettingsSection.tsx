import React from 'react';
import { Type, BookOpen, CheckCircle2, Sparkles, Globe, Languages } from 'lucide-react';
import { ChatScriptMode } from '../types';
import { ThemeId, THEMES } from '../services/theme';

interface ChatScriptSettingsSectionProps {
  scriptMode: ChatScriptMode;
  onChangeScriptMode: (mode: ChatScriptMode) => void;
  currentTheme?: ThemeId;
}

export const ChatScriptSettingsSection: React.FC<ChatScriptSettingsSectionProps> = ({
  scriptMode,
  onChangeScriptMode,
  currentTheme = 'neural-aurora',
}) => {
  const theme = THEMES[currentTheme] || THEMES['neural-aurora'];
  const primaryColor = theme.primaryColor || '#00f0ff';
  const secondaryColor = theme.secondaryColor || '#a855f7';

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full animate-pulse" 
            style={{ backgroundColor: primaryColor }} 
          />
          <h3 
            className="text-[10px] md:text-xs tracking-widest uppercase font-bold flex items-center gap-1.5"
            style={{ color: primaryColor }}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Chat Response Script (اردو رسم الخط)</span>
          </h3>
        </div>
        <span 
          className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border"
          style={{
            backgroundColor: `${primaryColor}15`,
            borderColor: `${primaryColor}40`,
            color: primaryColor,
          }}
        >
          {scriptMode === 'nastaliq' ? 'نستعلیق فعال ہے' : 'Roman Urdu Active'}
        </span>
      </div>

      <p className="text-[10px] md:text-[11px] text-slate-300 leading-relaxed">
        Text chat mein Urfi ke jawabaat ka andaz aur font muntakhab karein. Aap Roman Urdu (English letters) ya riwayati Noto Nastaliq Urdu script mein se chun sakti hain:
      </p>

      {/* Script Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Option 1: Roman Urdu */}
        <button
          type="button"
          onClick={() => onChangeScriptMode('roman')}
          className={`relative p-3.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden group ${
            scriptMode === 'roman'
              ? 'bg-slate-900/90 shadow-lg script-toggle-glow'
              : 'bg-slate-950/40 hover:bg-slate-900/40 border-white/10 hover:border-white/20'
          }`}
          style={{
            borderColor: scriptMode === 'roman' ? primaryColor : undefined,
          }}
        >
          {/* Active Highlight Banner */}
          {scriptMode === 'roman' && (
            <div 
              className="absolute top-0 left-0 right-0 h-0.5" 
              style={{ backgroundColor: primaryColor }} 
            />
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shadow-inner"
                  style={{
                    backgroundColor: scriptMode === 'roman' ? `${primaryColor}30` : 'rgba(255,255,255,0.05)',
                    color: scriptMode === 'roman' ? primaryColor : '#94a3b8',
                    border: `1px solid ${scriptMode === 'roman' ? `${primaryColor}60` : 'rgba(255,255,255,0.1)'}`
                  }}
                >
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    Roman Urdu
                    {scriptMode === 'roman' && (
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    )}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    رومن اردو (English Letters)
                  </div>
                </div>
              </div>

              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                Latin / Phonetic
              </span>
            </div>

            <p className="text-[10px] text-slate-300 leading-snug mb-3">
              Urdu alfaaz English حروف mein likhe jayenge. Mobile aur fast messaging ke liye nihayat aasan aur aam feham andaz.
            </p>
          </div>

          {/* Sample Snippet */}
          <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 text-[10px] font-mono text-cyan-200/90 leading-relaxed">
            <span className="text-slate-500 block text-[8px] uppercase tracking-wider mb-0.5">Sample Output:</span>
            "Main aap ki kya madad kar sakti hoon? Aaj ka mausam khush-gawar hai."
          </div>

          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-slate-400">
            <span>Font: JetBrains Mono</span>
            <span className="text-slate-500">Direction: LTR</span>
          </div>
        </button>

        {/* Option 2: Native Urdu Script (Nastaliq) */}
        <button
          type="button"
          onClick={() => onChangeScriptMode('nastaliq')}
          className={`relative p-3.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden group ${
            scriptMode === 'nastaliq'
              ? 'bg-slate-900/90 shadow-lg script-toggle-glow'
              : 'bg-slate-950/40 hover:bg-slate-900/40 border-white/10 hover:border-white/20'
          }`}
          style={{
            borderColor: scriptMode === 'nastaliq' ? secondaryColor : undefined,
          }}
        >
          {/* Active Highlight Banner */}
          {scriptMode === 'nastaliq' && (
            <div 
              className="absolute top-0 left-0 right-0 h-0.5" 
              style={{ backgroundColor: secondaryColor }} 
            />
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner font-nastaliq"
                  style={{
                    backgroundColor: scriptMode === 'nastaliq' ? `${secondaryColor}30` : 'rgba(255,255,255,0.05)',
                    color: scriptMode === 'nastaliq' ? secondaryColor : '#94a3b8',
                    border: `1px solid ${scriptMode === 'nastaliq' ? `${secondaryColor}60` : 'rgba(255,255,255,0.1)'}`
                  }}
                >
                  ن
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    Native Urdu Script
                    {scriptMode === 'nastaliq' && (
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: secondaryColor }} />
                    )}
                  </div>
                  <div className="text-[9px] text-slate-400 font-nastaliq">
                    اردو رسم الخط (نستعلیق فونٹ)
                  </div>
                </div>
              </div>

              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                Nastaliq Font
              </span>
            </div>

            <p className="text-[10px] text-slate-300 leading-snug mb-3">
              خالص اردو حروف اور دلکش نستعلیق خطاطی۔ مستند کتابی اور ادبی اردو پڑھنے کے شوقین افراد کے لیے بہترین۔
            </p>
          </div>

          {/* Sample Snippet in Authentic Nastaliq */}
          <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 urdu-bubble-nastaliq text-[13px] text-violet-200 leading-[2.1]">
            <span className="text-slate-500 block text-[8px] uppercase tracking-wider font-mono mb-0.5 text-left" dir="ltr">
              Sample Output:
            </span>
            "میں آپ کی کیا مدد کر سکتی ہوں؟ آج کا موسم خوشگوار ہے۔"
          </div>

          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-slate-400">
            <span>Font: Noto Nastaliq Urdu</span>
            <span className="text-slate-500">Direction: RTL (دائیں سے بائیں)</span>
          </div>
        </button>
      </div>

      {/* Live Preview Card */}
      <div 
        className="p-3.5 rounded-2xl bg-slate-950/70 border relative overflow-hidden transition-all duration-300"
        style={{
          borderColor: scriptMode === 'nastaliq' ? `${secondaryColor}40` : `${primaryColor}40`,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              Live Preview • کیسا دکھائی دے گا
            </span>
          </div>
          <span 
            className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: scriptMode === 'nastaliq' ? `${secondaryColor}25` : `${primaryColor}25`,
              color: scriptMode === 'nastaliq' ? secondaryColor : primaryColor
            }}
          >
            {scriptMode === 'nastaliq' ? 'Noto Nastaliq Calligraphy' : 'Latin Monospace'}
          </span>
        </div>

        {scriptMode === 'nastaliq' ? (
          <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 text-slate-100 urdu-bubble-nastaliq text-sm sm:text-base leading-[2.3]">
            <div className="text-[9px] font-mono text-violet-300 mb-1 flex items-center gap-1.5 justify-end" dir="rtl">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
              <span>عُرفی (نستعلیق رسم الخط):</span>
            </div>
            "اَلسَّلَامُ عَلَيْكُم! میں عُرفی ہوں، آپ کی ذاتی ذہین آواز اور معاون۔ آپ کسی بھی موضوع پر گفتگو کر سکتے ہیں یا تحقیق و منصوبہ بندی میں مجھ سے رہنمائی لے سکتے ہیں۔"
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-100 roman-bubble-script text-xs sm:text-sm">
            <div className="text-[9px] font-mono text-cyan-400 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>URFI (Roman Urdu):</span>
            </div>
            "As-salamu alaykum! Main URFI hoon, aap ki personal intelligent voice assistant. Aap kisi bhi topic par baat kar sakte hain ya research aur planning mein meri madad le sakte hain."
          </div>
        )}
      </div>
    </section>
  );
};

export default ChatScriptSettingsSection;
