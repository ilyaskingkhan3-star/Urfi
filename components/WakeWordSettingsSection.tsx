import React, { useState, useEffect, useRef } from 'react';
import { WakeWordConfig } from '../types';
import { 
  isLocalSpeechRecognitionSupported, 
  POPULAR_WAKE_WORDS, 
  playWakeChime, 
  matchesWakeWord,
  normalizePhrase
} from '../services/wakeWordService';

interface WakeWordSettingsSectionProps {
  config: WakeWordConfig;
  onChangeConfig: (newConfig: WakeWordConfig) => void;
  isListeningNow?: boolean;
  onTestTrigger?: () => void;
  language?: 'ur' | 'en' | 'roman-ur';
}

export const WakeWordSettingsSection: React.FC<WakeWordSettingsSectionProps> = ({
  config,
  onChangeConfig,
  isListeningNow = false,
  language = 'roman-ur'
}) => {
  const [customInput, setCustomInput] = useState(config.phrase);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'listening' | 'success' | 'miss'>('idle');
  const [lastHeardSpeech, setLastHeardSpeech] = useState<string>('');
  const [testCountdown, setTestCountdown] = useState<number>(0);
  const testRecognitionRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);

  const isSupported = isLocalSpeechRecognitionSupported();

  useEffect(() => {
    setCustomInput(config.phrase);
  }, [config.phrase]);

  // Clean up any ongoing test on unmount
  useEffect(() => {
    return () => {
      stopTest();
    };
  }, []);

  const handleToggleEnable = () => {
    const updated = { ...config, enabled: !config.enabled };
    onChangeConfig(updated);
  };

  const handleApplyPhrase = (phrase: string) => {
    const trimmed = phrase.trim();
    if (!trimmed) return;
    setCustomInput(trimmed);
    onChangeConfig({ ...config, phrase: trimmed });
  };

  const startTest = () => {
    if (!isSupported) return;
    stopTest();

    setIsTesting(true);
    setTestResult('listening');
    setLastHeardSpeech('');
    setTestCountdown(8);

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = language === 'ur' ? 'ur-PK' : 'en-IN';

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setLastHeardSpeech(transcript);

        if (matchesWakeWord(transcript, config.phrase, config.sensitivity)) {
          setTestResult('success');
          if (config.playChime) playWakeChime();
          stopTest(true);
        }
      };

      rec.onerror = (e: any) => {
        console.warn('Wake word test error:', e);
      };

      rec.start();
      testRecognitionRef.current = rec;

      // Countdown interval
      countdownTimerRef.current = setInterval(() => {
        setTestCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current);
            stopTest(false);
            setTestResult(curr => curr === 'success' ? 'success' : 'miss');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('Could not start test speech recognizer:', err);
      setIsTesting(false);
      setTestResult('idle');
    }
  };

  const stopTest = (preserveResult = false) => {
    if (testRecognitionRef.current) {
      try {
        testRecognitionRef.current.stop();
      } catch (_) {}
      testRecognitionRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setIsTesting(false);
    if (!preserveResult) {
      setTestCountdown(0);
    }
  };

  return (
    <section className="space-y-4 pt-4 border-t border-cyan-500/10">
      {/* Header and Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.enabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-[10px] md:text-xs text-cyan-400 tracking-widest uppercase font-bold flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                </svg>
                Wake Word Trigger
              </h3>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-mono">
                Local STT
              </span>
            </div>
            <span className="text-[8px] text-cyan-500/50 mt-0.5">
              Urfi ko pukaar kar aawaz se activate karein (Zero cloud latency)
            </span>
          </div>
        </div>

        {/* Switch */}
        <button
          onClick={handleToggleEnable}
          disabled={!isSupported}
          className={`w-11 h-6 rounded-full transition-all relative p-0.5 ${
            !isSupported 
              ? 'opacity-40 cursor-not-allowed bg-slate-800' 
              : config.enabled 
                ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                : 'bg-slate-800 hover:bg-slate-700'
          }`}
          title={!isSupported ? 'Browser does not support local speech recognition' : 'Toggle wake word listener'}
        >
          <div 
            className={`w-5 h-5 rounded-full bg-white transition-all shadow-md transform ${
              config.enabled ? 'translate-x-5' : 'translate-x-0'
            }`} 
          />
        </button>
      </div>

      {/* Browser Support Alert */}
      {!isSupported && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] flex items-start gap-2.5">
          <span className="text-sm shrink-0">⚠️</span>
          <div className="space-y-1">
            <div className="font-bold">Local Speech Recognition Unavailable</div>
            <p className="text-amber-200/70 text-[9px] leading-relaxed">
              Aapka browser background local speech recognition support nahi karta. Behtareen experience ke liye Chrome, Edge, ya Brave use karein. Aap manual microphone button se baat jari rakh sakte hain.
            </p>
          </div>
        </div>
      )}

      {/* Main Configuration Card when enabled or available */}
      {isSupported && (
        <div className={`space-y-4 rounded-xl p-3.5 border transition-all ${
          config.enabled 
            ? 'bg-cyan-950/20 border-cyan-500/30 shadow-inner' 
            : 'bg-slate-900/30 border-cyan-500/10 opacity-70'
        }`}>
          {/* Custom Trigger Phrase Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>Custom Trigger Phrase</span>
                <span className="text-slate-400 font-normal text-[8px]">(Urdu / Roman Urdu / English)</span>
              </label>
              <span className="text-[8px] text-cyan-500/50 font-mono">
                Active: <span className="text-cyan-300 font-bold">"{config.phrase}"</span>
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApplyPhrase(customInput);
                  }}
                  placeholder="e.g., Hey Urfi, Suno Urfi, Jarvis..."
                  className="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg px-3 py-2 text-[11px] font-mono text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
                />
                {customInput && customInput !== config.phrase && (
                  <span className="absolute right-2 top-2 text-[8px] text-amber-400 font-mono">
                    Unsaved
                  </span>
                )}
              </div>
              <button
                onClick={() => handleApplyPhrase(customInput)}
                disabled={!customInput.trim() || customInput.trim() === config.phrase}
                className="px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-40 disabled:hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-bold tracking-wider uppercase border border-cyan-500/30 transition-all active:scale-95 shrink-0"
              >
                Save
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="text-[8px] text-cyan-500/60 uppercase font-bold mb-1.5">
              Quick Suggestions (Tayyar Alfaaz)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_WAKE_WORDS.map((item) => {
                const isActive = normalizePhrase(config.phrase) === normalizePhrase(item.phrase);
                return (
                  <button
                    key={item.phrase}
                    onClick={() => handleApplyPhrase(item.phrase)}
                    className={`px-2.5 py-1 rounded-md text-[9px] font-mono transition-all flex items-center gap-1.5 border ${
                      isActive 
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-sm' 
                        : 'bg-slate-900/60 border-cyan-500/20 text-slate-300 hover:border-cyan-500/40 hover:bg-slate-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`text-[7px] px-1 py-0.2 rounded ${
                      isActive ? 'bg-cyan-400/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sensitivity & Matching Behavior */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-cyan-500/10">
            <div>
              <label className="text-[8px] text-cyan-500/60 uppercase font-bold mb-1 block">
                Detection Sensitivity
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['loose', 'standard', 'strict'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onChangeConfig({ ...config, sensitivity: mode })}
                    className={`py-1 text-[9px] uppercase font-bold rounded border transition-all ${
                      config.sensitivity === mode
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm'
                        : 'bg-slate-900/40 border-cyan-500/15 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode === 'loose' ? 'Phonetic' : mode === 'standard' ? 'Standard' : 'Strict'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[8px] text-cyan-500/60 uppercase font-bold mb-1 block">
                Sound Feedback (Chime)
              </label>
              <div className="flex items-center justify-between p-1 px-2.5 rounded-lg bg-slate-900/60 border border-cyan-500/15">
                <span className="text-[9px] text-slate-300">Play Sci-Fi Chime</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playWakeChime()}
                    className="text-[8px] text-cyan-400 hover:text-cyan-300 p-0.5 uppercase underline"
                    title="Preview Chime Sound"
                  >
                    Audition
                  </button>
                  <button
                    onClick={() => onChangeConfig({ ...config, playChime: !config.playChime })}
                    className={`w-7 h-4 rounded-full transition-all relative ${
                      config.playChime ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                      config.playChime ? 'left-3.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Trigger Action */}
          <div className="flex items-center justify-between pt-2 border-t border-cyan-500/10">
            <div className="flex flex-col">
              <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">
                Action on Wake Word
              </span>
              <span className="text-[8px] text-slate-400">
                Automatically initiate real-time Gemini Live Voice call
              </span>
            </div>
            <button
              onClick={() => onChangeConfig({ ...config, autoConnectLive: !config.autoConnectLive })}
              className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold uppercase border transition-all ${
                config.autoConnectLive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {config.autoConnectLive ? 'Auto Live Call' : 'Alert Only'}
            </button>
          </div>

          {/* Live Microphone Audition / Test Box */}
          <div className="pt-2 border-t border-cyan-500/10">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isTesting ? 'bg-rose-500 animate-ping' : isListeningNow ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                  }`} />
                  <span className="text-[10px] text-cyan-300 font-bold uppercase font-mono">
                    {isTesting ? `Say "${config.phrase}" (${testCountdown}s)` : 'Wake Word Test Bench'}
                  </span>
                </div>

                {!isTesting ? (
                  <button
                    onClick={startTest}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    Test Wake Word
                  </button>
                ) : (
                  <button
                    onClick={() => stopTest()}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[9px] font-bold uppercase tracking-wider transition-all"
                  >
                    Stop Test
                  </button>
                )}
              </div>

              {/* Live Wave Feedback during test */}
              {isTesting && (
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-rose-500/20">
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-rose-400 rounded-full animate-pulse" />
                    <span className="w-1 h-5 bg-rose-400 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-2 bg-rose-400 rounded-full animate-pulse delay-150" />
                    <span className="w-1 h-4 bg-rose-400 rounded-full animate-pulse delay-100" />
                    <span className="text-[9px] text-rose-300 font-mono ml-1">Listening locally...</span>
                  </div>
                  {lastHeardSpeech && (
                    <span className="text-[9px] text-slate-400 truncate max-w-[140px] font-mono italic">
                      "{lastHeardSpeech}"
                    </span>
                  )}
                </div>
              )}

              {/* Test Outcomes */}
              {testResult === 'success' && (
                <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] flex items-center gap-2 animate-in fade-in">
                  <span className="text-emerald-400 font-bold text-xs">✓ Verified:</span>
                  <span>Trigger phrase matched perfectly! Urfi detected "{config.phrase}".</span>
                </div>
              )}

              {testResult === 'miss' && (
                <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] flex items-center gap-2">
                  <span>⏱️ Timed out without trigger phrase. Try pronouncing clearly or select "Phonetic" sensitivity.</span>
                </div>
              )}

              {/* Status Note */}
              <div className="flex items-center justify-between text-[8px] text-slate-400 font-mono pt-1">
                <span>Standby Audio: Local browser only (No Cloud Recording)</span>
                <span className={config.enabled ? 'text-emerald-400' : 'text-slate-500'}>
                  {config.enabled ? '● Ready on Standby' : '○ Standby Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default WakeWordSettingsSection;
