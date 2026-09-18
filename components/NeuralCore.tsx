
import React from 'react';
import { ThemeId, THEMES } from '../services/theme';

interface NeuralCoreProps {
  isActive: boolean;
  status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
  audioLevel?: number;
  theme?: ThemeId;
}

const NeuralCore: React.FC<NeuralCoreProps> = ({ isActive, status, audioLevel = 0, theme = 'neon-cyan' }) => {
  const themeConfig = THEMES[theme] || THEMES['neon-cyan'];

  const getColor = () => {
    switch (status) {
      case 'ERROR': return '#ef4444';
      case 'CONNECTING': return '#eab308';
      case 'CONNECTED': return isActive ? themeConfig.primaryColor : themeConfig.accentColor;
      default: return '#1e293b';
    }
  };

  const color = getColor();
  const scale = 1 + audioLevel * 0.5;

  return (
    <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 flex items-center justify-center">
      {/* Deep Atmospheric Glow */}
      <div 
        className={`absolute inset-0 rounded-full transition-all duration-300 ${isActive ? 'scale-150 opacity-50' : 'scale-100 opacity-10'}`}
        style={{ 
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          filter: `blur(${20 + audioLevel * 50}px)`,
          transform: `scale(${scale})`
        }}
      />
      
      <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 overflow-visible">
        <defs>
          <radialGradient id="neuralGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" />
            <stop offset="40%" stopColor={color} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <filter id="neuralGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Animation for Data Pulses */}
          <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="white" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Outer Neural Web - Organic Filaments */}
        <g className={`transition-opacity duration-1000 ${isActive ? 'opacity-40' : 'opacity-10'}`}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <g key={angle} transform={`rotate(${angle} 100 100)`}>
              <path 
                d="M100 100 C120 60, 160 80, 180 40" 
                fill="none" 
                stroke={color} 
                strokeWidth="0.5" 
                className={isActive ? 'animate-pulse' : ''}
                style={{ animationDelay: `${i * 0.3}s` }}
              />
              <circle cx="180" cy="40" r="1.5" fill={color} />
            </g>
          ))}
        </g>

        {/* Breathing Neural Shells */}
        <g className={`transition-all duration-1000 ${isActive ? 'scale-110' : 'scale-100'}`}>
          <circle 
            cx="100" cy="100" r="60" 
            fill="none" 
            stroke={color} 
            strokeWidth="0.5" 
            strokeDasharray="4 8"
            className={`opacity-20 ${isActive ? 'animate-[spin_30s_linear_infinite]' : ''}`}
          />
          <circle 
            cx="100" cy="100" r="45" 
            fill="none" 
            stroke={color} 
            strokeWidth="1" 
            strokeDasharray="20 10"
            className={`opacity-30 ${isActive ? 'animate-[spin_20s_linear_infinite_reverse]' : ''}`}
          />
        </g>

        {/* Central "Alive" Core - The Brain Node */}
        <g className="transition-transform duration-100" style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
          {/* Inner Glow */}
          <circle 
            cx="100" cy="100" r={25 + audioLevel * 10} 
            fill="url(#neuralGradient)" 
            className={`transition-all duration-100 ${isActive ? 'animate-pulse' : 'opacity-40'}`}
            filter="url(#neuralGlow)"
          />
          
          {/* Organic Core Detail */}
          <path 
            d="M85 100 Q92 85 100 85 Q108 85 115 100 Q108 115 100 115 Q92 115 85 100" 
            fill="none" 
            stroke="white" 
            strokeWidth="0.5" 
            className="opacity-40"
          />
          <path 
            d="M90 100 Q95 92 100 92 Q105 92 110 100 Q105 108 100 108 Q95 108 90 100" 
            fill="none" 
            stroke="white" 
            strokeWidth="1" 
            className="opacity-60"
          />
        </g>

        {/* Synaptic Data Pulses - Moving along paths */}
        {isActive && (
          <g>
            {[0, 90, 180, 270].map((angle, i) => (
              <g key={`pulse-${angle}`} transform={`rotate(${angle} 100 100)`}>
                <circle r="2" fill="white" filter="url(#neuralGlow)">
                  <animateMotion 
                    dur={`${2 + i * 0.5}s`} 
                    repeatCount="indefinite" 
                    path="M100 100 C120 60, 160 80, 180 40" 
                  />
                </circle>
              </g>
            ))}
          </g>
        )}

        {/* Floating Synaptic Nodes */}
        <g className={isActive ? 'animate-[spin_40s_linear_infinite]' : 'opacity-20'}>
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
            <circle 
              key={angle} 
              cx={100 + 85 * Math.cos(angle * Math.PI / 180)} 
              cy={100 + 85 * Math.sin(angle * Math.PI / 180)} 
              r="1" 
              fill={color} 
              className={isActive ? 'animate-ping' : ''}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export default NeuralCore;


