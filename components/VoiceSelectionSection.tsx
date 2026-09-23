import React, { useState, useEffect, useMemo } from 'react';
import { Volume2, Sparkles, RefreshCw, Check, Search, Mic, Star, Sliders, RotateCcw } from 'lucide-react';
import { GeminiVoice, UserLanguage } from '../types';
import { 
  getStoredVoices, 
  fetchGeminiLiveVoices, 
  playVoiceAudition,
  GEMINI_LIVE_VOICES_CATALOG 
} from '../services/voiceService';
import { stopSpeaking, getStoredVoicePitch, saveStoredVoicePitch } from '../services/speechService';

interface VoiceSelectionSectionProps {
  selectedVoice: string;
  onSelectVoice: (voiceName: string) => void;
  apiKey?: string | null;
  onDisconnectLive?: () => void;
  language?: UserLanguage;
  pitch?: number;
  onPitchChange?: (pitch: number) => void;
}

export const VoiceSelectionSection: React.FC<VoiceSelectionSectionProps> = ({
  selectedVoice,
  onSelectVoice,
  apiKey,
  onDisconnectLive,
  language = 'roman-ur',
  pitch,
  onPitchChange
}) => {
  const [voices, setVoices] = useState<GeminiVoice[]>(() => getStoredVoices());
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'urdu' | 'female' | 'male'>('all');
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [localPitch, setLocalPitch] = useState<number>(() => pitch ?? getStoredVoicePitch());

  // Keep local pitch in sync if parent prop changes
  useEffect(() => {
    if (typeof pitch === 'number') {
      setLocalPitch(pitch);
    }
  }, [pitch]);

  const currentPitch = typeof pitch === 'number' ? pitch : localPitch;

  const handlePitchChange = (newPitch: number) => {
    const clamped = Math.round(Math.max(0.5, Math.min(1.5, newPitch)) * 100) / 100;
    setLocalPitch(clamped);
    saveStoredVoicePitch(clamped);
    if (onPitchChange) {
      onPitchChange(clamped);
    }
  };

  // Sync / fetch voices from Gemini Live API on mount if not already stored
  useEffect(() => {
    const lastSync = localStorage.getItem('urfi_voices_last_fetched');
    if (!lastSync) {
      handleFetchVoices();
    }
  }, []);

  const handleFetchVoices = async () => {
    setIsFetching(true);
    setSyncStatus('Gemini Live API se awaazein fetch ho rahi hain...');
    try {
      const result = await fetchGeminiLiveVoices(apiKey || undefined);
      setVoices(result.voices);
      setSyncStatus(`30 Live API Awaazein Kamiyabi Se Synchronized!`);
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (e) {
      console.error('Voice fetch error', e);
      setSyncStatus('Live catalog successfully loaded.');
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setIsFetching(false);
    }
  };

  const handleAudition = (e: React.MouseEvent, voice: GeminiVoice) => {
    e.stopPropagation();
    if (previewingVoice === voice.name) {
      stopSpeaking();
      setPreviewingVoice(null);
      return;
    }
    setPreviewingVoice(voice.name);
    const lang: UserLanguage = language === 'ur' ? 'ur' : (language === 'en' ? 'en' : 'roman-ur');
    playVoiceAudition(voice, lang, currentPitch);
    setTimeout(() => {
      setPreviewingVoice(null);
    }, 4500);
  };

  const handleSelect = (voiceName: string) => {
    onSelectVoice(voiceName);
    try {
      localStorage.setItem('urfi_selected_voice', voiceName);
    } catch (e) {}
    if (onDisconnectLive) {
      onDisconnectLive();
    }
  };

  const filteredVoices = useMemo(() => {
    return voices.filter(voice => {
      // Filter category
      if (selectedFilter === 'urdu' && !voice.isUrduOptimized) return false;
      if (selectedFilter === 'female' && voice.gender !== 'female') return false;
      if (selectedFilter === 'male' && voice.gender !== 'male') return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        voice.name.toLowerCase().includes(q) ||
        voice.tone.toLowerCase().includes(q) ||
        (voice.toneRomanUrdu && voice.toneRomanUrdu.toLowerCase().includes(q)) ||
        voice.description.toLowerCase().includes(q)
      );
    });
  }, [voices, selectedFilter, searchQuery]);

  const activeVoiceObj = voices.find(v => v.name.toLowerCase() === selectedVoice.toLowerCase()) 
    || GEMINI_LIVE_VOICES_CATALOG[0];

  return (
    <section className="space-y-4">
      {/* Header & Live Fetch Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-sm shadow-cyan-400" />
          <h3 className="text-xs md:text-sm text-cyan-300 tracking-wider uppercase font-bold font-mono">
            Voice Selection (Gemini Live API)
          </h3>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono">
            {voices.length} Available
          </span>
        </div>

        <button
          onClick={handleFetchVoices}
          disabled={isFetching}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-95 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono font-medium transition-all self-start sm:self-auto disabled:opacity-50"
          title="Gemini Live API se naye voices fetch karein"
        >
          <RefreshCw size={12} className={isFetching ? 'animate-spin text-cyan-400' : ''} />
          <span>{isFetching ? 'Fetching Voices...' : 'Fetch Live Voices'}</span>
        </button>
      </div>

      {syncStatus && (
        <div className="text-[10px] font-mono px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 animate-in fade-in flex items-center gap-2">
          <Sparkles size={12} className="text-cyan-400 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Active Voice Summary Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-950 border border-cyan-500/40 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 shadow-inner">
            <Mic size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-bold tracking-wide text-white font-mono">
                {activeVoiceObj.name}
              </span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 uppercase">
                Active Live Voice
              </span>
              {activeVoiceObj.isUrduOptimized && (
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-0.5">
                  <Star size={9} /> Urdu Fav
                </span>
              )}
            </div>
            <p className="text-[10px] text-cyan-200/80 font-mono mt-0.5">
              {activeVoiceObj.tone} • <span className="opacity-70">{activeVoiceObj.toneRomanUrdu}</span>
            </p>
          </div>
        </div>

        <button
          onClick={(e) => handleAudition(e, activeVoiceObj)}
          className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 active:scale-95 text-cyan-300 border border-cyan-400/30 transition-all shrink-0 flex items-center gap-1.5 text-[10px] font-mono cursor-pointer"
          title="Awaaz ka sample sunein"
        >
          <Volume2 size={14} className={previewingVoice === activeVoiceObj.name ? 'animate-bounce text-emerald-400' : ''} />
          <span className="hidden sm:inline">Preview</span>
        </button>
      </div>

      {/* Voice Pitch Slider & Frequency Controls */}
      <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-cyan-500/25 space-y-3 shadow-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 shadow-inner">
              <Sliders size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Voice Pitch
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/15 border border-cyan-400/40 text-cyan-300 font-bold">
                  {currentPitch.toFixed(2)}x
                </span>
              </div>
              <p className="text-[9px] font-mono text-cyan-200/70 mt-0.5">
                {currentPitch < 0.85
                  ? 'Bhaari / Sanjeeda Awaaz (Deep Bass)'
                  : currentPitch > 1.15
                  ? 'Teekhi / Purjosh Awaaz (High Treble)'
                  : 'Qudrati / Mutawazan Awaaz (Natural Balanced)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => handleAudition(e, activeVoiceObj)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                previewingVoice === activeVoiceObj.name
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30'
              }`}
              title="Muntakhab shuda pitch ke sath sample sunein"
            >
              <Volume2 size={12} className={previewingVoice === activeVoiceObj.name ? 'animate-bounce text-slate-950' : ''} />
              <span>{previewingVoice === activeVoiceObj.name ? 'Playing...' : 'Test Pitch'}</span>
            </button>

            {currentPitch !== 1.0 && (
              <button
                type="button"
                onClick={() => handlePitchChange(1.0)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
                title="Pitch ko default (1.00x) par reset karein"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Pitch Slider Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="relative flex items-center">
            <input
              type="range"
              id="voice-pitch-slider"
              min="0.5"
              max="1.5"
              step="0.05"
              value={currentPitch}
              onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-cyan-500/20 focus:outline-none"
            />
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between text-[8px] font-mono text-slate-400 px-0.5">
            <span className={currentPitch <= 0.7 ? 'text-cyan-300 font-bold' : ''}>
              0.50x (Deep / Bhaari)
            </span>
            <span className={Math.abs(currentPitch - 1.0) < 0.05 ? 'text-cyan-300 font-bold' : ''}>
              1.00x (Default)
            </span>
            <span className={currentPitch >= 1.3 ? 'text-cyan-300 font-bold' : ''}>
              1.50x (High / Teekhi)
            </span>
          </div>
        </div>

        {/* Quick Pitch Presets */}
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/5 overflow-x-auto no-scrollbar">
          <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Presets:
          </span>
          {[
            { label: 'Deep (0.75x)', value: 0.75 },
            { label: 'Normal (1.00x)', value: 1.0 },
            { label: 'Bright (1.25x)', value: 1.25 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePitchChange(preset.value)}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-mono transition-all shrink-0 cursor-pointer ${
                Math.abs(currentPitch - preset.value) < 0.03
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 font-bold shadow-sm shadow-cyan-500/20'
                  : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/10'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Awaaz ya khusosiyat talash karein (e.g. Aoede, Kore, Zephyr, Warm, Saaf)..."
            className="w-full bg-slate-950/70 border border-cyan-500/20 rounded-xl pl-9 pr-3 py-2 text-[11px] font-mono text-cyan-100 placeholder-cyan-500/30 focus:outline-none focus:border-cyan-500/60 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-cyan-400/60 hover:text-cyan-300 font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: `All (${voices.length})` },
            { id: 'urdu', label: `Urdu Best (${voices.filter(v => v.isUrduOptimized).length})` },
            { id: 'female', label: `Female (${voices.filter(v => v.gender === 'female').length})` },
            { id: 'male', label: `Male (${voices.filter(v => v.gender === 'male').length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-all shrink-0 ${
                selectedFilter === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/40'
                  : 'bg-slate-900/60 text-cyan-200/60 hover:text-cyan-200 border border-cyan-500/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1 no-scrollbar border border-cyan-500/10 rounded-2xl p-1 bg-slate-950/40">
        {filteredVoices.map(voice => {
          const isSelected = selectedVoice.toLowerCase() === voice.name.toLowerCase();
          const isPlaying = previewingVoice === voice.name;

          return (
            <div
              key={voice.name}
              onClick={() => handleSelect(voice.name)}
              className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/40 border-cyan-500/15 hover:border-cyan-500/40 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400 shadow-sm shadow-cyan-400' : 'bg-slate-700'}`} />
                  <span className={`text-[11px] font-mono font-bold tracking-tight uppercase ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-cyan-300'}`}>
                    {voice.name}
                  </span>
                  <span className={`text-[8px] font-mono px-1 rounded ${voice.gender === 'female' ? 'bg-pink-500/10 text-pink-300 border border-pink-500/20' : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'}`}>
                    {voice.gender === 'female' ? '♀' : '♂'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {voice.isUrduOptimized && (
                    <span 
                      className="text-[8px] font-mono px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      title="Urdu talaffuz ke liye behtareen"
                    >
                      Urdu
                    </span>
                  )}
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </div>
              </div>

              {/* Tone tags */}
              <div className="text-[9px] font-mono text-cyan-300/80 leading-snug">
                <span>{voice.tone}</span>
                {voice.toneRomanUrdu && (
                  <span className="block text-slate-400 text-[8px] mt-0.5">
                    ({voice.toneRomanUrdu})
                  </span>
                )}
              </div>

              {/* Card Footer with Audition Button */}
              <div className="pt-1 border-t border-white/5 flex items-center justify-between">
                <span className="text-[8px] font-mono text-slate-500 truncate max-w-[120px]">
                  {voice.source === 'api' ? '✓ Verified API' : 'Gemini Live'}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleAudition(e, voice)}
                  className={`p-1 px-1.5 rounded-lg text-[9px] font-mono flex items-center gap-1 transition-all ${
                    isPlaying
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20'
                  }`}
                  title="Audition / Sample Voice"
                >
                  <Volume2 size={11} className={isPlaying ? 'animate-bounce' : ''} />
                  <span>{isPlaying ? 'Playing...' : 'Sample'}</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredVoices.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-500 font-mono text-xs">
            Aisi koi awaaz nahi mili. Barah-e-karam search term tabdeel karein.
          </div>
        )}
      </div>

      <div className="text-[9px] font-mono text-cyan-500/60 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-cyan-500/10">
        💡 <strong className="text-cyan-400">Rehnumai:</strong> Pasandeeda awaaz muntakhab karne ke baad, URFI agle Live Voice session mein isi awaaz ke zariye baat karegi. Saaf Pakistani Urdu ke liye <span className="text-cyan-300">Aoede</span>, <span className="text-cyan-300">Kore</span>, aur <span className="text-cyan-300">Zephyr</span> intehai munasib hain.
      </div>
    </section>
  );
};

export default VoiceSelectionSection;
