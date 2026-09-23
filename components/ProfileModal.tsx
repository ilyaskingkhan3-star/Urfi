import React, { useState } from 'react';
import { User, Shield, Sparkles, Heart, Globe, Volume2, Palette, X, Save, Check, Type, Sliders, Zap, BookOpen } from 'lucide-react';
import { UserProfile, UserLanguage, ThemeMode, ChatScriptMode, PromptRefinerMode } from '../types';

interface ProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSaveProfile,
}) => {
  const [name, setName] = useState(profile.name || 'Ilyas');
  const [language, setLanguage] = useState<UserLanguage>(profile.language || 'ur');
  const [chatScriptMode, setChatScriptMode] = useState<ChatScriptMode>(() => {
    if (profile.chatScriptMode) return profile.chatScriptMode;
    try {
      const saved = localStorage.getItem('urfi_chat_script_mode');
      if (saved === 'nastaliq' || saved === 'roman') return saved;
    } catch (_) {}
    return 'roman';
  });
  const [promptRefinerMode, setPromptRefinerMode] = useState<PromptRefinerMode>(() => {
    if (profile.promptRefinerMode) return profile.promptRefinerMode;
    try {
      const saved = localStorage.getItem('urfi_prompt_refiner_mode');
      if (saved === 'detailed' || saved === 'concise') return saved;
    } catch (_) {}
    return 'concise';
  });
  const [voice, setVoice] = useState(profile.voice || 'Kore');
  const [theme, setTheme] = useState<ThemeMode>(profile.theme || 'urfi-futuristic');
  const [topicsInput, setTopicsInput] = useState(profile.favoriteTopics.join(', '));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isUrdu = profile.language === 'ur';
  const isRoman = profile.language === 'roman-ur';

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('urfi_chat_script_mode', chatScriptMode);
      localStorage.setItem('urfi_prompt_refiner_mode', promptRefinerMode);
    } catch (_) {}

    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'Ilyas',
      language,
      chatScriptMode,
      promptRefinerMode,
      voice,
      theme,
      favoriteTopics: topicsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-[var(--theme-border)] shadow-2xl p-6 md:p-8 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--theme-badge-bg)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-primary)] glow-theme">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Verified
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              {isUrdu ? 'ذاتی پروفائل اور ترجیحات' : 'Personal Profile & Memory Settings'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
              {isUrdu ? 'صارف کا نام (Name)' : 'User Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-[var(--theme-primary)]"
            />
          </div>

          {/* Language preference */}
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
              <span>{isUrdu ? 'بنیادی زبان (Primary Language)' : 'Preferred Language'}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ur', label: 'اردو (Urdu)' },
                { id: 'roman-ur', label: 'Roman Urdu' },
                { id: 'en', label: 'English' },
              ].map((lang) => (
                <button
                  type="button"
                  key={lang.id}
                  onClick={() => setLanguage(lang.id as UserLanguage)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    language === lang.id
                      ? 'bg-[var(--theme-primary)] text-slate-950 border-[var(--theme-primary)]'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Chat Response Script Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                <span>{isUrdu ? 'متنی رسم الخط (Chat Script)' : 'Chat Response Script'}</span>
              </span>
              <span className="text-[10px] text-[var(--theme-primary)] font-bold">
                {chatScriptMode === 'nastaliq' ? 'نستعلیق رسم الخط' : 'Roman Urdu'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChatScriptMode('roman')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  chatScriptMode === 'roman'
                    ? 'bg-[var(--theme-primary)] text-slate-950 border-[var(--theme-primary)] shadow-md'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="font-bold font-mono">Roman Urdu</span>
                <span className="text-[10px] opacity-75">English / Latin Letters</span>
              </button>
              <button
                type="button"
                onClick={() => setChatScriptMode('nastaliq')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  chatScriptMode === 'nastaliq'
                    ? 'bg-[var(--theme-primary)] text-slate-950 border-[var(--theme-primary)] shadow-md'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="font-bold font-nastaliq text-sm">نستعلیق رسم الخط</span>
                <span className="text-[10px] opacity-75">Native Urdu Script</span>
              </button>
            </div>
          </div>

          {/* Smart Prompt Refiner Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                <span>Smart Prompt Refiner</span>
              </span>
              <span className="text-[10px] text-[var(--theme-primary)] font-bold uppercase">
                {promptRefinerMode === 'concise' ? '⚡ Concise' : '📖 Detailed'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPromptRefinerMode('concise')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  promptRefinerMode === 'concise'
                    ? 'bg-[var(--theme-primary)] text-slate-950 border-[var(--theme-primary)] shadow-md'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-1 font-bold">
                  <Zap className="w-3 h-3" />
                  <span>Concise</span>
                </div>
                <span className="text-[10px] opacity-75">Direct & Crisp (~2-4 lines)</span>
              </button>
              <button
                type="button"
                onClick={() => setPromptRefinerMode('detailed')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  promptRefinerMode === 'detailed'
                    ? 'bg-[var(--theme-primary)] text-slate-950 border-[var(--theme-primary)] shadow-md'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-1 font-bold">
                  <BookOpen className="w-3 h-3" />
                  <span>Detailed</span>
                </div>
                <span className="text-[10px] opacity-75">Thorough & In-Depth</span>
              </button>
            </div>
          </div>

          {/* Voice preference */}
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
              <span>{isUrdu ? 'آواز کا انداز (Voice Model)' : 'Voice Style'}</span>
            </label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--theme-primary)]"
            >
              <option value="Kore">Kore (Urfi Natural Calm Female)</option>
              <option value="Aoede">Aoede (Warm Melodic)</option>
              <option value="Charon">Charon (Deep Resonant)</option>
              <option value="Fenrir">Fenrir (Authoritative Precise)</option>
              <option value="Zephyr">Zephyr (Bright Dynamic)</option>
            </select>
          </div>

          {/* Favorite Topics */}
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>{isUrdu ? 'پسندیدہ موضوعات (Topics of Interest)' : 'Favorite Topics'}</span>
            </label>
            <input
              type="text"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              placeholder="e.g. Technology, Pakistan News, Science, Study"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[var(--theme-primary)]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
            >
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl font-bold text-xs text-slate-950 transition-all flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
              style={{
                backgroundColor: 'var(--theme-primary)',
              }}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isUrdu ? 'محفوظ ہو گیا!' : 'Saved!'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isUrdu ? 'ترجیحات محفوظ کریں' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
