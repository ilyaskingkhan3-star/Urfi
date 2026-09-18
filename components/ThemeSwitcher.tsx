import React, { useState, useRef, useEffect } from 'react';
import { ThemeId, THEMES, ThemeConfig } from '../services/theme';

interface ThemeSwitcherProps {
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  compact?: boolean;
}

const PaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const ThemeQuickSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const currentConfig = THEMES[currentTheme];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const themesList = Object.values(THEMES);

  return (
    <div className="relative" ref={menuRef}>
      <button
        id="theme-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full transition-all duration-300 flex items-center gap-1.5 hover:bg-white/5 active:scale-95 border border-transparent hover:border-[var(--theme-border)]"
        title={`Current Theme: ${currentConfig.name} (Click to switch)`}
        style={{
          color: currentConfig.primaryColor,
        }}
      >
        <div 
          className="w-3.5 h-3.5 rounded-full shadow-sm transition-all duration-300 animate-pulse-slow"
          style={{ 
            backgroundColor: currentConfig.primaryColor,
            boxShadow: `0 0 10px ${currentConfig.glowColor}` 
          }}
        />
        <PaletteIcon />
      </button>

      {isOpen && (
        <div 
          id="theme-switcher-menu"
          className="absolute right-0 mt-2 w-72 md:w-80 rounded-2xl glass-panel shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-200 border border-[var(--theme-border)]"
          style={{
            backdropFilter: 'blur(20px)',
            background: 'var(--theme-bg-glass, rgba(15, 23, 42, 0.9))'
          }}
        >
          <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-white/10">
            <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] animate-ping" />
              Urfi Visual Personality
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              {currentConfig.badge}
            </span>
          </div>

          <div className="space-y-1.5">
            {themesList.map((theme: ThemeConfig) => {
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  id={`theme-option-${theme.id}`}
                  onClick={() => {
                    onThemeChange(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition-all duration-300 flex items-center justify-between group ${
                    isSelected 
                      ? 'bg-white/10 border border-white/20 shadow-md' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Glowing Orb */}
                    <div 
                      className="w-5 h-5 rounded-full relative flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                        boxShadow: `0 0 12px ${theme.glowColor}`
                      }}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white tracking-wide">
                          {theme.name}
                        </span>
                        <span 
                          className="text-[8px] font-mono px-1.5 py-0.2 rounded-full border tracking-wider uppercase"
                          style={{
                            borderColor: theme.secondaryColor,
                            color: theme.primaryColor,
                            backgroundColor: `${theme.primaryColor}15`
                          }}
                        >
                          {theme.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono line-clamp-1">
                        {theme.subtitle}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div 
                      className="p-1 rounded-full text-slate-950 font-bold shrink-0 ml-2"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      <CheckIcon />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const ThemeSettingsSection: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
  const themesList = Object.values(THEMES);

  return (
    <section id="theme-settings-section" className="space-y-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] animate-pulse" />
          <h3 className="text-[10px] md:text-xs text-[var(--theme-primary)] tracking-widest uppercase font-bold">
            Visual Personality & Theme
          </h3>
        </div>
        <span className="text-[9px] font-mono text-slate-400">
          Instant Neural Transition
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {themesList.map((theme: ThemeConfig) => {
          const isSelected = theme.id === currentTheme;
          return (
            <button
              key={theme.id}
              id={`settings-theme-card-${theme.id}`}
              onClick={() => onThemeChange(theme.id)}
              className={`p-3.5 rounded-2xl text-left transition-all duration-300 relative flex flex-col justify-between overflow-hidden border ${
                isSelected 
                  ? 'bg-slate-900/90 shadow-xl scale-[1.02]' 
                  : 'bg-slate-950/40 hover:bg-slate-900/50 opacity-70 hover:opacity-100'
              }`}
              style={{
                borderColor: isSelected ? theme.primaryColor : 'rgba(255,255,255,0.08)',
                boxShadow: isSelected ? `0 0 20px ${theme.glowColor}` : 'none'
              }}
            >
              {/* Corner Ambient Glow */}
              <div 
                className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-40 transition-opacity"
                style={{ backgroundColor: theme.primaryColor }}
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                      boxShadow: `0 0 10px ${theme.glowColor}`
                    }}
                  />
                  <span 
                    className="text-[8px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
                    style={{
                      borderColor: theme.secondaryColor,
                      color: theme.primaryColor,
                      backgroundColor: `${theme.primaryColor}15`
                    }}
                  >
                    {theme.badge}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white tracking-wide">
                  {theme.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {theme.subtitle}
                </p>

                <p className="text-[9px] text-slate-400/90 mt-2 font-mono leading-relaxed line-clamp-2">
                  {theme.personality}
                </p>
              </div>

              {/* Color Swatch Bars */}
              <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-white/5">
                {theme.previewColors.map((col, idx) => (
                  <div 
                    key={idx} 
                    className="h-1.5 flex-1 rounded-full"
                    style={{ backgroundColor: col }}
                  />
                ))}
                {isSelected && (
                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-white ml-1">
                    ACTIVE
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
