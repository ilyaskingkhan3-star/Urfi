import React, { useState, useEffect, useRef } from 'react';
import { ThemeId, THEMES } from '../services/theme';
import { UrfiMoodType } from '../types';

export type NeuralCoreMode = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface MoodVisualEffect {
  primary: string;
  secondary: string;
  glow: string;
  cssClass: string;
  label: string;
  romanUrdu: string;
  effectName: string;
  rippleColor: string;
}

export const URFI_MOOD_EFFECTS: Record<UrfiMoodType, MoodVisualEffect> = {
  focused: {
    primary: '#3b82f6', // Calm Blue
    secondary: '#1d4ed8',
    glow: 'rgba(59, 130, 246, 0.75)',
    cssClass: 'neural-mood-focused',
    label: 'Focused',
    romanUrdu: 'Pur-Azm',
    effectName: 'Calm Blue Shift',
    rippleColor: '#3b82f6',
  },
  empathetic: {
    primary: '#f59e0b', // Warm Amber
    secondary: '#d97706',
    glow: 'rgba(245, 158, 11, 0.8)',
    cssClass: 'neural-mood-empathetic',
    label: 'Empathetic',
    romanUrdu: 'Hamdardana',
    effectName: 'Warm Amber Pulse',
    rippleColor: '#f59e0b',
  },
  creative: {
    primary: '#f59e0b',
    secondary: '#ec4899',
    glow: 'rgba(245, 158, 11, 0.75)',
    cssClass: 'neural-mood-creative',
    label: 'Creative',
    romanUrdu: 'Takhleeqi',
    effectName: 'Golden Prismatic Flare',
    rippleColor: '#fbbf24',
  },
  analytical: {
    primary: '#06b6d4', // Laser Cyan
    secondary: '#0284c7',
    glow: 'rgba(6, 182, 212, 0.75)',
    cssClass: 'neural-mood-analytical',
    label: 'Analytical',
    romanUrdu: 'Tajziyati',
    effectName: 'Precision Cyan Scan',
    rippleColor: '#06b6d4',
  },
  cheerful: {
    primary: '#10b981', // Emerald
    secondary: '#059669',
    glow: 'rgba(16, 185, 129, 0.75)',
    cssClass: 'neural-mood-cheerful',
    label: 'Cheerful',
    romanUrdu: 'Khush-Gawaar',
    effectName: 'Emerald Bloom',
    rippleColor: '#10b981',
  },
  happy: {
    primary: '#10b981',
    secondary: '#059669',
    glow: 'rgba(16, 185, 129, 0.75)',
    cssClass: 'neural-mood-happy',
    label: 'Happy',
    romanUrdu: 'Khush',
    effectName: 'Emerald Bloom',
    rippleColor: '#10b981',
  },
  serene: {
    primary: '#14b8a6', // Tranquil Teal
    secondary: '#0f766e',
    glow: 'rgba(20, 184, 166, 0.7)',
    cssClass: 'neural-mood-serene',
    label: 'Serene',
    romanUrdu: 'Pursukoon',
    effectName: 'Tranquil Teal Tide',
    rippleColor: '#14b8a6',
  },
  concerned: {
    primary: '#f43f5e', // Rose
    secondary: '#be123c',
    glow: 'rgba(244, 63, 94, 0.75)',
    cssClass: 'neural-mood-concerned',
    label: 'Concerned',
    romanUrdu: 'Fikarmand',
    effectName: 'Protective Rose Pulse',
    rippleColor: '#f43f5e',
  },
  neutral: {
    primary: '#0ea5e9', // Sky Blue
    secondary: '#6366f1',
    glow: 'rgba(14, 165, 233, 0.65)',
    cssClass: 'neural-mood-neutral',
    label: 'Neutral',
    romanUrdu: 'Mutawazan',
    effectName: 'Harmonic Equilibrium',
    rippleColor: '#0ea5e9',
  },
};

interface NeuralCoreProps {
  isActive: boolean;
  status?: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
  audioLevel?: number;
  theme?: ThemeId;
  mode?: NeuralCoreMode;
  mood?: UrfiMoodType;
}

const NeuralCore: React.FC<NeuralCoreProps> = ({ 
  isActive, 
  status = 'DISCONNECTED', 
  audioLevel = 0, 
  theme = 'neural-aurora',
  mode,
  mood = 'focused'
}) => {
  const themeConfig = THEMES[theme] || THEMES['neural-aurora'];
  const defaultPrimaryColor = themeConfig.primaryColor || '#00f0ff';
  const defaultSecondaryColor = themeConfig.secondaryColor || '#a855f7';

  // Mood shift animation state
  const [isMoodShifting, setIsMoodShifting] = useState(false);
  const [moodShiftKey, setMoodShiftKey] = useState(0);
  const prevMoodRef = useRef<UrfiMoodType | undefined>(undefined);

  const moodEffect = URFI_MOOD_EFFECTS[mood] || URFI_MOOD_EFFECTS.focused;

  useEffect(() => {
    // Only trigger animation when mood actually transitions
    if (prevMoodRef.current !== undefined && prevMoodRef.current !== mood) {
      setIsMoodShifting(true);
      setMoodShiftKey(prev => prev + 1);
      const timer = setTimeout(() => {
        setIsMoodShifting(false);
      }, 2300);
      prevMoodRef.current = mood;
      return () => clearTimeout(timer);
    }
    prevMoodRef.current = mood;
  }, [mood]);

  // Blend theme and active mood color
  const primaryColor = isMoodShifting ? moodEffect.primary : (mood ? moodEffect.primary : defaultPrimaryColor);
  const violetColor = isMoodShifting ? moodEffect.secondary : (mood ? moodEffect.secondary : defaultSecondaryColor);
  const glowColor = moodEffect.glow;

  // Determine current operating state
  const computedMode: NeuralCoreMode = mode || (() => {
    if (status === 'CONNECTING') return 'thinking';
    if (status === 'CONNECTED') {
      if (audioLevel > 0.06) return 'listening';
      return 'idle';
    }
    return 'idle';
  })();

  // Dynamic values based on mode & audioLevel
  const normalizedLevel = Math.min(Math.max(audioLevel, 0), 1);
  const coreScale = 1 + normalizedLevel * (computedMode === 'speaking' ? 0.35 : 0.2);

  return (
    <div 
      className={`relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 flex items-center justify-center select-none ${isMoodShifting ? moodEffect.cssClass : ''}`}
      role="img"
      aria-label={`Urfi Neural Core: ${computedMode}, Mood: ${moodEffect.label}`}
      style={{
        transition: 'filter 0.6s ease, transform 0.6s ease'
      }}
    >
      {/* Dynamic Holographic Mood Shift Badge */}
      {isMoodShifting && (
        <div 
          key={`holo-${moodShiftKey}-${mood}`}
          className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30 neural-mood-holo-badge flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase backdrop-blur-md shadow-2xl border"
          style={{
            backgroundColor: `${moodEffect.primary}22`,
            borderColor: `${moodEffect.primary}80`,
            color: '#ffffff',
            boxShadow: `0 0 24px ${glowColor}`
          }}
        >
          <span 
            className="w-2 h-2 rounded-full animate-ping shrink-0" 
            style={{ backgroundColor: moodEffect.primary }} 
          />
          <span className="font-semibold text-white drop-shadow-sm whitespace-nowrap">
            {moodEffect.romanUrdu} • {moodEffect.effectName}
          </span>
        </div>
      )}

      {/* Concentric Expanding Mood Shift Ripple Waves */}
      {isMoodShifting && (
        <>
          <div 
            key={`ripple-1-${moodShiftKey}`}
            className="absolute inset-2 rounded-full pointer-events-none neural-core-mood-ripple z-0"
            style={{
              border: `2px solid ${moodEffect.rippleColor}`,
              boxShadow: `0 0 28px ${glowColor}`,
              animationDuration: '2.0s'
            }}
          />
          <div 
            key={`ripple-2-${moodShiftKey}`}
            className="absolute inset-6 rounded-full pointer-events-none neural-core-mood-ripple z-0"
            style={{
              border: `1.5px solid ${moodEffect.primary}`,
              boxShadow: `0 0 20px ${glowColor}`,
              animationDuration: '2.4s',
              animationDelay: '0.35s'
            }}
          />
        </>
      )}

      {/* 1. Deep Atmospheric Ambient Glow with Mood Color Adaptability */}
      <div 
        className="absolute inset-0 rounded-full transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${primaryColor}40 0%, ${violetColor}25 40%, transparent 70%)`,
          filter: `blur(${32 + normalizedLevel * 40}px)`,
          transform: `scale(${coreScale * (computedMode === 'listening' ? 1.25 : 1.05)})`,
          opacity: isActive ? 0.9 : 0.45,
          boxShadow: isMoodShifting ? `0 0 45px ${glowColor}` : 'none'
        }}
      />

      {/* 2. Mode-Specific Outer Expanding Waves (Listening & Speaking) */}
      {isActive && computedMode === 'listening' && (
        <>
          <div 
            className="absolute inset-2 rounded-full border border-cyan-400/30 animate-ping duration-1000 pointer-events-none"
            style={{ animationDuration: '2.4s' }}
          />
          <div 
            className="absolute -inset-4 rounded-full border border-cyan-300/20 animate-ping duration-1000 pointer-events-none"
            style={{ animationDuration: '3.2s', animationDelay: '0.8s' }}
          />
        </>
      )}

      {isActive && computedMode === 'speaking' && (
        <div 
          className="absolute -inset-2 rounded-full border border-violet-400/30 animate-pulse pointer-events-none"
          style={{ 
            animationDuration: '1.2s',
            transform: `scale(${1 + normalizedLevel * 0.15})`
          }}
        />
      )}

      {/* 3. High-Tech SVG Neural Intelligence Orb */}
      <svg 
        viewBox="0 0 240 240" 
        className="w-full h-full relative z-10 overflow-visible"
      >
        <defs>
          {/* Radial Gradient for the Core */}
          <radialGradient id="auroraCoreGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="25%" stopColor={primaryColor} stopOpacity="0.9" />
            <stop offset="65%" stopColor={violetColor} stopOpacity="0.65" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Secondary Soft Ambient Gradient */}
          <radialGradient id="auroraVioletAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={violetColor} stopOpacity="0.45" />
            <stop offset="60%" stopColor={primaryColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Refined Soft Glow Filter */}
          <filter id="auroraGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- Outer Subtle Orbital Rings --- */}
        <g className="transition-all duration-1000" style={{ transformOrigin: '120px 120px' }}>
          {/* Ring 1: Very subtle dashed outer trajectory */}
          <circle
            cx="120"
            cy="120"
            r="104"
            fill="none"
            stroke={primaryColor}
            strokeWidth="0.75"
            strokeDasharray="3 9"
            className={`opacity-35 ${computedMode === 'thinking' ? 'animate-[spin_24s_linear_infinite]' : 'animate-[spin_60s_linear_infinite]'}`}
            style={{ transformOrigin: '120px 120px', transition: 'stroke 0.8s ease' }}
          />

          {/* Ring 2: Subtle counter-rotating ring */}
          <circle
            cx="120"
            cy="120"
            r="90"
            fill="none"
            stroke={violetColor}
            strokeWidth="0.75"
            strokeDasharray="16 28"
            className={`opacity-40 ${computedMode === 'thinking' ? 'animate-[spin_18s_linear_infinite_reverse]' : 'animate-[spin_45s_linear_infinite_reverse]'}`}
            style={{ transformOrigin: '120px 120px', transition: 'stroke 0.8s ease' }}
          />

          {/* Ring 3: Delicate inner halo */}
          <circle
            cx="120"
            cy="120"
            r="74"
            fill="none"
            stroke={primaryColor}
            strokeWidth="1"
            strokeDasharray={computedMode === 'speaking' ? '8 6' : '30 15'}
            className={`opacity-45 ${computedMode === 'speaking' ? 'animate-[spin_12s_linear_infinite]' : 'animate-[spin_35s_linear_infinite]'}`}
            style={{ transformOrigin: '120px 120px', transition: 'stroke 0.8s ease' }}
          />
        </g>

        {/* --- Subtle Rotating Neural Particles --- */}
        <g 
          className={`transition-opacity duration-700 ${computedMode === 'thinking' ? 'animate-[spin_15s_linear_infinite]' : 'animate-[spin_40s_linear_infinite]'}`}
          style={{ transformOrigin: '120px 120px' }}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const r = 90;
            const cx = 120 + r * Math.cos(rad);
            const cy = 120 + r * Math.sin(rad);
            const isViolet = i % 2 === 1;
            return (
              <g key={angle}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={computedMode === 'thinking' ? 1.8 : 1.2}
                  fill={isViolet ? violetColor : primaryColor}
                  className="opacity-75 transition-colors duration-700"
                  filter="url(#auroraGlow)"
                />
                {/* Micro connecting neural filament */}
                {isActive && (
                  <line
                    x1="120"
                    y1="120"
                    x2={cx}
                    y2={cy}
                    stroke={isViolet ? violetColor : primaryColor}
                    strokeWidth="0.4"
                    strokeDasharray="2 6"
                    className="opacity-25 transition-colors duration-700"
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* --- Waveform Waves for Listening / Speaking --- */}
        {isActive && (computedMode === 'listening' || computedMode === 'speaking') && (
          <g style={{ transformOrigin: '120px 120px' }}>
            {[1, 2, 3].map((ringIdx) => (
              <circle
                key={ringIdx}
                cx="120"
                cy="120"
                r={44 + ringIdx * 14 + normalizedLevel * 18}
                fill="none"
                stroke={ringIdx % 2 === 0 ? violetColor : primaryColor}
                strokeWidth="0.75"
                className="opacity-50 animate-pulse transition-colors duration-700"
                style={{
                  animationDuration: `${1.4 + ringIdx * 0.4}s`,
                  animationDelay: `${ringIdx * 0.25}s`,
                }}
              />
            ))}
          </g>
        )}

        {/* --- Central Living Neural Intelligence Orb --- */}
        <g 
          className="transition-transform duration-300"
          style={{ 
            transform: `scale(${coreScale})`, 
            transformOrigin: '120px 120px' 
          }}
        >
          {/* Outer Atmospheric Aura */}
          <circle
            cx="120"
            cy="120"
            r={50 + normalizedLevel * 8}
            fill="url(#auroraVioletAura)"
            className={computedMode === 'idle' ? 'animate-pulse-slow' : 'animate-pulse'}
            style={{ animationDuration: computedMode === 'idle' ? '4s' : '1.8s' }}
          />

          {/* Living Luminescent Core */}
          <circle
            cx="120"
            cy="120"
            r={32 + normalizedLevel * 6}
            fill="url(#auroraCoreGradient)"
            filter="url(#auroraGlow)"
            className={computedMode === 'idle' ? 'animate-pulse-slow' : 'animate-pulse'}
            style={{ animationDuration: computedMode === 'idle' ? '3.5s' : '1.2s' }}
          />

          {/* Subtle Organic Neural Nucleus Lines */}
          <g className="opacity-75">
            {/* Center diamond ring */}
            <path
              d="M120 106 L134 120 L120 134 L106 120 Z"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.8"
              strokeDasharray="2 3"
              className="opacity-70"
            />
            {/* Core horizontal beacon */}
            <line
              x1="110"
              y1="120"
              x2="130"
              y2="120"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="opacity-90"
              filter="url(#auroraGlow)"
            />
            {/* Micro heart dot */}
            <circle
              cx="120"
              cy="120"
              r="2.5"
              fill="#ffffff"
              filter="url(#auroraGlow)"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default NeuralCore;

