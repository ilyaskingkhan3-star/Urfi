import React, { useState, useEffect, useRef } from 'react';
import { UrfiMoodType } from '../types';
import { analyzeUrduSentiment, SentimentAnalysisResult } from '../services/sentimentService';

export type { UrfiMoodType };
export { analyzeUrduSentiment };
export type { SentimentAnalysisResult };

export interface UrfiMoodDetails {
  type: UrfiMoodType;
  label: string;
  romanUrduLabel: string;
  urduScript: string;
  color: string;
  glowColor: string;
  pulseRingColor: string;
  pulseSpeed: string;
  bgClass: string;
  borderClass: string;
  iconSvg: React.ReactNode;
  description: string;
}

export const URFI_MOODS: Record<UrfiMoodType, UrfiMoodDetails> = {
  happy: {
    type: 'happy',
    label: 'Happy',
    romanUrduLabel: 'Khush-Gawaar',
    urduScript: 'خوش گوار',
    color: '#10b981', // Emerald
    glowColor: 'rgba(16, 185, 129, 0.45)',
    pulseRingColor: 'rgba(16, 185, 129, 0.65)',
    pulseSpeed: '1.5s',
    bgClass: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/35',
    iconSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 13c1.5 2.5 6.5 2.5 8 0"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
    description: 'Urfi ne aap ki khushi aur musbat jazbaat ko detect kiya hai.'
  },
  concerned: {
    type: 'concerned',
    label: 'Concerned',
    romanUrduLabel: 'Fikarmand',
    urduScript: 'فکرمند',
    color: '#f43f5e', // Rose
    glowColor: 'rgba(244, 63, 94, 0.5)',
    pulseRingColor: 'rgba(244, 63, 94, 0.75)',
    pulseSpeed: '1.2s',
    bgClass: 'bg-rose-500/15',
    borderClass: 'border-rose-500/35',
    iconSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
        <path d="M7.5 8 9.5 9"/>
        <path d="M16.5 8 14.5 9"/>
      </svg>
    ),
    description: 'Urfi ne aap ke alfaaz mein pareshani ya fikar mehsoos ki hai aur poori hamdardi se madad ke liye tayyar hai.'
  },
  neutral: {
    type: 'neutral',
    label: 'Neutral',
    romanUrduLabel: 'Mutawazan',
    urduScript: 'متوازن',
    color: '#0ea5e9', // Sky Blue
    glowColor: 'rgba(14, 165, 233, 0.45)',
    pulseRingColor: 'rgba(14, 165, 233, 0.65)',
    pulseSpeed: '2.5s',
    bgClass: 'bg-sky-500/15',
    borderClass: 'border-sky-500/35',
    iconSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="8" y1="14" x2="16" y2="14"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
    description: 'Urdu guftugu mutawazan aur aam rawani mein hai.'
  },
  cheerful: {
    type: 'cheerful',
    label: 'Cheerful',
    romanUrduLabel: 'Khush-Gawaar',
    urduScript: 'خوش گوار',
    color: '#10b981', // Emerald
    glowColor: 'rgba(16, 185, 129, 0.45)',
    pulseRingColor: 'rgba(16, 185, 129, 0.65)',
    pulseSpeed: '1.6s',
    bgClass: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/35',
    iconSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
    description: 'Urfi is enthusiastic, warm, and happy to assist you.'
  },
  analytical: {
    type: 'analytical',
    label: 'Analytical',
    romanUrduLabel: 'Tajziyati',
    urduScript: 'تجزیاتی',
    color: '#06b6d4', // Cyan
    glowColor: 'rgba(6, 182, 212, 0.45)',
    pulseRingColor: 'rgba(6, 182, 212, 0.65)',
    pulseSpeed: '2.0s',
    bgClass: 'bg-cyan-500/15',
    borderClass: 'border-cyan-500/35',
    iconSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4"/>
        <path d="M12 18v4"/>
        <path d="m4.93 4.93 2.83 2.83"/>
        <path d="m16.24 16.24 2.83 2.83"/>
        <path d="M2 12h4"/>
        <path d="M18 12h4"/>
        <circle cx="12" cy="12" r="4"/>
      </svg>
    ),
    description: 'Urfi is deep in thought, calculating logic, facts, and structure.'
  },
  empathetic: {
    type: 'empathetic',
    label: 'Empathetic',
    romanUrduLabel: 'Hamdardana',
    urduScript: 'ہمدردانہ',
    color: '#a855f7', // Purple
    glowColor: 'rgba(168, 85, 247, 0.45)',
    pulseRingColor: 'rgba(168, 85, 247, 0.65)',
    pulseSpeed: '2.4s',
    bgClass: 'bg-purple-500/15',
    borderClass: 'border-purple-500/35',
    iconSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      </svg>
    ),
    description: 'Urfi is supportive, gentle, caring, and understanding.'
  },
  creative: {
    type: 'creative',
    label: 'Creative',
    romanUrduLabel: 'Takhleeqi',
    urduScript: 'تخلیقی',
    color: '#f59e0b', // Amber/Gold
    glowColor: 'rgba(245, 158, 11, 0.45)',
    pulseRingColor: 'rgba(245, 158, 11, 0.65)',
    pulseSpeed: '1.8s',
    bgClass: 'bg-amber-500/15',
    borderClass: 'border-amber-500/35',
    iconSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      </svg>
    ),
    description: 'Urfi is inspired, imaginative, and generating visual or verbal artistry.'
  },
  focused: {
    type: 'focused',
    label: 'Focused',
    romanUrduLabel: 'Pur-Azm',
    urduScript: 'پُرعزم',
    color: '#3b82f6', // Blue
    glowColor: 'rgba(59, 130, 246, 0.45)',
    pulseRingColor: 'rgba(59, 130, 246, 0.65)',
    pulseSpeed: '1.5s',
    bgClass: 'bg-blue-500/15',
    borderClass: 'border-blue-500/35',
    iconSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="2" r="2"/>
      </svg>
    ),
    description: 'Urfi is tuned in, laser-focused, and ready for your commands.'
  },
  serene: {
    type: 'serene',
    label: 'Serene',
    romanUrduLabel: 'Pursukoon',
    urduScript: 'پُرسکون',
    color: '#14b8a6', // Teal
    glowColor: 'rgba(20, 184, 166, 0.45)',
    pulseRingColor: 'rgba(20, 184, 166, 0.65)',
    pulseSpeed: '3.0s',
    bgClass: 'bg-teal-500/15',
    borderClass: 'border-teal-500/35',
    iconSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </svg>
    ),
    description: 'Urfi is in a calm, balanced, and peaceful equilibrium.'
  },
};

/**
 * Detects Urfi's mood from text (supporting Roman Urdu, Urdu Script, and English)
 * utilizing the comprehensive emotional sentiment analyzer.
 */
export function detectUrfiMood(text: string): UrfiMoodType {
  if (!text || text.trim().length === 0) return 'neutral';
  
  const result = analyzeUrduSentiment(text);
  return result.mood;
}

interface UrfiMoodIndicatorProps {
  mood: UrfiMoodType;
  showDetails?: boolean;
  detectedSentiment?: SentimentAnalysisResult | null;
  onMoodChange?: (mood: UrfiMoodType) => void;
}

export const UrfiMoodIndicator: React.FC<UrfiMoodIndicatorProps> = ({ 
  mood, 
  detectedSentiment, 
  onMoodChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isShifting, setIsShifting] = useState(false);
  const [isAutoCycling, setIsAutoCycling] = useState(false);
  const prevMoodRef = useRef<UrfiMoodType>(mood);
  const cycleTimerRef = useRef<any>(null);
  const details = URFI_MOODS[mood] || URFI_MOODS.neutral || URFI_MOODS.focused;

  const MOOD_KEYS: UrfiMoodType[] = [
    'focused',
    'empathetic',
    'creative',
    'analytical',
    'cheerful',
    'serene',
    'concerned',
    'neutral',
  ];

  const MOOD_ANIM_EFFECTS: Record<UrfiMoodType, string> = {
    focused: 'Calm Blue Shift',
    empathetic: 'Warm Amber Pulse',
    creative: 'Golden Flare Shimmer',
    analytical: 'Precision Cyan Scan',
    cheerful: 'Emerald Bloom Surge',
    happy: 'Emerald Bloom Surge',
    serene: 'Tranquil Teal Tide',
    concerned: 'Protective Rose Pulse',
    neutral: 'Harmonic Equilibrium',
  };

  useEffect(() => {
    if (prevMoodRef.current !== mood) {
      setIsShifting(true);
      prevMoodRef.current = mood;
      const timer = setTimeout(() => {
        setIsShifting(false);
      }, 2300);
      return () => clearTimeout(timer);
    }
  }, [mood]);

  // Clean up auto-cycling on unmount
  useEffect(() => {
    return () => {
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
    };
  }, []);

  const handleSelectMood = (selectedMood: UrfiMoodType) => {
    if (onMoodChange) {
      onMoodChange(selectedMood);
    }
  };

  const toggleAutoCycle = () => {
    if (isAutoCycling) {
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
      setIsAutoCycling(false);
    } else {
      setIsAutoCycling(true);
      let idx = MOOD_KEYS.indexOf(mood);
      cycleTimerRef.current = setInterval(() => {
        idx = (idx + 1) % MOOD_KEYS.length;
        if (onMoodChange) {
          onMoodChange(MOOD_KEYS[idx]);
        }
      }, 2600);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        id="urfi-mood-badge"
        onClick={() => setIsOpen(!isOpen)}
        title={`Urfi Mood: ${details.label} (${details.romanUrduLabel}) • Neural Core: ${MOOD_ANIM_EFFECTS[mood]}`}
        className={`relative group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider backdrop-blur-md border ${details.bgClass} ${details.borderClass} hover:scale-105 active:scale-95 shadow-sm overflow-visible cursor-pointer ${isShifting ? 'urfi-mood-shifting' : ''}`}
        style={{
          '--mood-color': details.color,
          '--mood-glow': details.glowColor,
          '--mood-pulse-ring': details.pulseRingColor,
          boxShadow: `0 0 12px ${details.glowColor}`,
          color: details.color,
          transition: 'color 0.6s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.6s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.6s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        } as React.CSSProperties}
      >
        {/* Concentric Aura Pulse Ring on Mood State Shift */}
        {isShifting && (
          <span 
            key={`pulse-ring-${mood}`}
            className="absolute -inset-1.5 rounded-full pointer-events-none urfi-mood-pulse-ring z-0"
            style={{
              border: `2px solid ${details.color}`,
              '--mood-glow': details.glowColor,
            } as React.CSSProperties}
          />
        )}

        {/* Ambient Color Glow Wave during Transition */}
        {isShifting && (
          <span 
            key={`aura-${mood}`}
            className="absolute inset-0 rounded-full opacity-35 pointer-events-none animate-ping"
            style={{ backgroundColor: details.color }}
          />
        )}

        {/* Dynamic Frequency Status Beacon Dot */}
        <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0 z-10">
          <span 
            className="absolute inline-flex h-full w-full rounded-full opacity-70"
            style={{ 
              backgroundColor: details.color,
              animation: `moodBeaconPing ${details.pulseSpeed} ease-in-out infinite`,
              boxShadow: `0 0 6px ${details.color}`
            }}
          />
          <span 
            className="relative inline-flex rounded-full h-1.5 w-1.5 transition-colors duration-500"
            style={{ backgroundColor: details.color }}
          />
        </span>

        {/* Icon with Pop & Morph Animation on Mood Change */}
        <span 
          key={mood}
          className="shrink-0 transition-transform duration-300 urfi-mood-icon-pop flex items-center justify-center z-10"
        >
          {details.iconSvg}
        </span>

        {/* Roman Urdu and English Mood Labels */}
        <span className="font-semibold uppercase tracking-widest hidden sm:inline transition-all duration-500 z-10">
          {details.romanUrduLabel}
        </span>
        <span className="opacity-70 text-[9px] font-normal hidden md:inline transition-opacity duration-500 z-10">
          ({details.label})
        </span>

        {/* Live Active Animation Tag */}
        {isShifting && (
          <span 
            className="hidden lg:inline px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase tracking-tight bg-white/10 text-white animate-pulse"
          >
            ⚡ {MOOD_ANIM_EFFECTS[mood]}
          </span>
        )}
      </button>

      {/* Popover explaining Urfi's current sentiment & Interactive Mood Switcher */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setIsOpen(false)} 
          />
          <div 
            className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-80 sm:w-88 p-4 rounded-2xl glass-panel border z-40 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
            style={{
              borderColor: `${details.color}50`,
              boxShadow: `0 12px 36px rgba(0, 0, 0, 0.85), 0 0 24px ${details.glowColor}`,
              transition: 'border-color 0.5s ease, box-shadow 0.5s ease'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5 pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                  style={{ backgroundColor: `${details.color}25`, color: details.color, border: `1px solid ${details.color}40` }}
                >
                  {details.iconSvg}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    Urfi Mood: <span style={{ color: details.color }}>{details.romanUrduLabel}</span>
                  </div>
                  <div className="text-[9px] text-slate-300 font-mono">
                    {details.label} • {details.urduScript}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 text-xs cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* NeuralCore Trigger Effect Banner */}
            <div 
              className="mb-3 px-3 py-2 rounded-xl text-[11px] font-mono flex items-center justify-between gap-2 border"
              style={{
                backgroundColor: `${details.color}15`,
                borderColor: `${details.color}35`,
                color: details.color
              }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-ping shrink-0" style={{ backgroundColor: details.color }} />
                <span className="font-semibold">NeuralCore Effect:</span>
              </div>
              <span className="font-bold text-white drop-shadow-sm">
                {MOOD_ANIM_EFFECTS[mood]}
              </span>
            </div>

            {/* Urdu / Sentiment Description */}
            <p className="text-[11px] text-slate-200 leading-relaxed font-sans mb-3">
              {details.description}
            </p>

            {/* Interactive Mood Selector Grid */}
            <div className="pt-2.5 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-300">
                  Mizaaj Badlein (Trigger Animation):
                </span>
                <button
                  onClick={toggleAutoCycle}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold transition-all cursor-pointer ${
                    isAutoCycling 
                      ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50 animate-pulse' 
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                  title="Cycle through all moods automatically"
                >
                  {isAutoCycling ? '⏸ Stop Cycle' : '▶ Auto Cycle'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {MOOD_KEYS.map((mKey) => {
                  const item = URFI_MOODS[mKey];
                  if (!item) return null;
                  const isSelected = mood === mKey;
                  return (
                    <button
                      key={mKey}
                      onClick={() => handleSelectMood(mKey)}
                      className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'border-white/60 bg-white/15 shadow-md'
                          : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20'
                      }`}
                      style={{
                        borderColor: isSelected ? item.color : undefined,
                        boxShadow: isSelected ? `0 0 12px ${item.glowColor}` : undefined
                      }}
                    >
                      <div 
                        className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${item.color}25`, color: item.color }}
                      >
                        {item.iconSvg}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-[10px] font-bold text-white truncate leading-tight flex items-center gap-1">
                          {item.romanUrduLabel}
                          {isSelected && <span className="text-[8px]" style={{ color: item.color }}>●</span>}
                        </div>
                        <div className="text-[8px] font-mono text-slate-400 truncate">
                          {MOOD_ANIM_EFFECTS[mKey]}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detected Keywords Section */}
            {detectedSentiment && detectedSentiment.detectedKeywords.length > 0 && (
              <div className="mt-3 pt-2 border-t border-white/10">
                <div className="text-[9px] font-mono text-slate-400 mb-1">
                  Pehchanay Gaye Alfaaz:
                </div>
                <div className="flex flex-wrap gap-1">
                  {detectedSentiment.detectedKeywords.map((kw, i) => (
                    <span 
                      key={i} 
                      className="px-1.5 py-0.5 rounded text-[8px] font-mono border"
                      style={{
                        backgroundColor: `${details.color}15`,
                        borderColor: `${details.color}35`,
                        color: details.color
                      }}
                    >
                      "{kw}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400 font-mono">
              <span>Urdu Sentiment Engine</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                NeuralCore Live Synced
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UrfiMoodIndicator;
