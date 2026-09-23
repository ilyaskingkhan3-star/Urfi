import { UserLanguage } from '../types';

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

const PITCH_STORAGE_KEY = 'urfi_voice_pitch';

export function getStoredVoicePitch(): number {
  if (typeof window === 'undefined') return 1.0;
  try {
    const val = localStorage.getItem(PITCH_STORAGE_KEY);
    if (val) {
      const parsed = parseFloat(val);
      if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 1.5) {
        return parsed;
      }
    }
  } catch (e) {}
  return 1.0;
}

export function saveStoredVoicePitch(pitch: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PITCH_STORAGE_KEY, String(pitch));
  } catch (e) {}
}

export function speakText(
  text: string,
  language: UserLanguage = 'ur',
  voiceName?: string,
  rate = 1.0,
  pitchOrOnEnd?: number | (() => void),
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    const cb = typeof pitchOrOnEnd === 'function' ? pitchOrOnEnd : onEnd;
    if (cb) cb();
    return;
  }

  stopSpeaking();

  // Strip markdown symbols and emojis for cleaner speech
  const cleanText = text
    .replace(/[#*_~`>[\]()]/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .trim();

  const cb = typeof pitchOrOnEnd === 'function' ? pitchOrOnEnd : onEnd;
  if (!cleanText) {
    if (cb) cb();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  currentUtterance = utterance;
  utterance.rate = rate;

  const effectivePitch = typeof pitchOrOnEnd === 'number' ? pitchOrOnEnd : getStoredVoicePitch();
  utterance.pitch = Math.max(0.5, Math.min(1.5, effectivePitch));

  const voices = window.speechSynthesis.getVoices();

  // Find optimal voice based on language and preference (prioritizing clear female voices)
  if (language === 'ur') {
    const femaleUrduVoice = voices.find(v => (v.lang.startsWith('ur') || v.lang.includes('PK')) && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('uzma')));
    const urduVoice = femaleUrduVoice || voices.find(v => v.lang.startsWith('ur') || v.lang.includes('PK'));
    const femaleHindiVoice = voices.find(v => v.lang.startsWith('hi') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('swara') || v.name.toLowerCase().includes('kalpana')));
    const hindiVoice = femaleHindiVoice || voices.find(v => v.lang.startsWith('hi'));
    if (urduVoice) {
      utterance.voice = urduVoice;
      utterance.lang = urduVoice.lang;
    } else if (hindiVoice) {
      utterance.voice = hindiVoice;
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'ur-PK';
    }
  } else if (language === 'roman-ur') {
    // For Roman Urdu, a South Asian English female voice or clear natural female voice sounds best
    const femaleIndVoice = voices.find(v => (v.lang.includes('IN') || v.name.includes('India')) && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('neerja') || v.name.toLowerCase().includes('priya')));
    const indVoice = femaleIndVoice || voices.find(v => v.lang.includes('IN') || v.name.includes('India'));
    const naturalFemaleVoice = voices.find(v => (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Jenny')) && v.lang.startsWith('en'));
    if (femaleIndVoice) {
      utterance.voice = femaleIndVoice;
      utterance.lang = femaleIndVoice.lang;
    } else if (indVoice) {
      utterance.voice = indVoice;
      utterance.lang = indVoice.lang;
    } else if (naturalFemaleVoice) {
      utterance.voice = naturalFemaleVoice;
      utterance.lang = naturalFemaleVoice.lang;
    } else {
      utterance.lang = 'en-US';
    }
  } else {
    // English
    if (voiceName) {
      const preferred = voices.find(v => v.name.toLowerCase().includes(voiceName.toLowerCase()));
      if (preferred) utterance.voice = preferred;
    }
    if (!utterance.voice) {
      const femaleVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha')));
      if (femaleVoice) utterance.voice = femaleVoice;
    }
    utterance.lang = 'en-US';
  }

  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('SpeechSynthesis error:', e);
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

// STT Recognition Helper
export function createSpeechRecognizer(
  language: UserLanguage,
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (err: any) => void,
  onEnd: () => void
) {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Set speech recognition language
    if (language === 'ur') {
      recognition.lang = 'ur-PK';
    } else if (language === 'roman-ur') {
      recognition.lang = 'en-IN'; // Works very well for Roman Urdu phonetics
    } else {
      recognition.lang = 'en-US';
    }

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      onResult(final || interim, Boolean(final));
    };

    recognition.onerror = (event: any) => {
      onError(event.error);
    };

    recognition.onend = () => {
      onEnd();
    };

    return recognition;
  } catch (e) {
    console.error('Speech recognition init error:', e);
    return null;
  }
}
