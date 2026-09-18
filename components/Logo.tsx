
import React from 'react';
import { ThemeId, THEMES } from '../services/theme';

interface LogoProps {
  className?: string;
  size?: number;
  theme?: ThemeId;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 40, theme = 'neon-cyan' }) => {
  const themeConfig = THEMES[theme] || THEMES['neon-cyan'];

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Background Glow */}
      <div 
        className="absolute inset-0 blur-xl rounded-full animate-pulse transition-colors duration-500"
        style={{ backgroundColor: themeConfig.glowColor }}
      />
      
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full relative z-10 overflow-visible"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={themeConfig.primaryColor} />
            <stop offset="100%" stopColor={themeConfig.accentColor} />
          </linearGradient>
          
          <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Circuit Ring */}
        <circle 
          cx="50" cy="50" r="45" 
          stroke="url(#logoGradient)" 
          strokeWidth="1" 
          strokeDasharray="10 5" 
          className="opacity-30 animate-[spin_20s_linear_infinite]"
        />

        {/* Inner Neural Nodes */}
        <g className="animate-pulse">
          <circle cx="50" cy="50" r="8" fill="url(#logoGradient)" filter="url(#logoGlow)" />
          
          {/* Synaptic Connectors */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <line 
              key={i}
              x1="50" y1="50" 
              x2={50 + 25 * Math.cos(angle * Math.PI / 180)} 
              y2={50 + 25 * Math.sin(angle * Math.PI / 180)} 
              stroke="url(#logoGradient)" 
              strokeWidth="1.5"
              strokeLinecap="round"
              className="opacity-60"
            />
          ))}
          
          {/* Outer Nodes */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <circle 
              key={`node-${i}`}
              cx={50 + 25 * Math.cos(angle * Math.PI / 180)} 
              cy={50 + 25 * Math.sin(angle * Math.PI / 180)} 
              r="3" 
              fill="#fff" 
              filter="url(#logoGlow)"
            />
          ))}
        </g>

        {/* Abstract Waveform Overlay */}
        <path 
          d="M25,50 C35,30 45,70 55,30 C65,70 75,50 85,50" 
          stroke="#fff" 
          strokeWidth="1" 
          strokeLinecap="round" 
          className="opacity-40"
        >
          <animate 
            attributeName="d" 
            dur="3s" 
            repeatCount="indefinite"
            values="
              M25,50 C35,30 45,70 55,30 C65,70 75,50 85,50;
              M25,50 C35,70 45,30 55,70 C65,30 75,50 85,50;
              M25,50 C35,30 45,70 55,30 C65,70 75,50 85,50
            "
          />
        </path>
      </svg>
    </div>
  );
};

export default Logo;
