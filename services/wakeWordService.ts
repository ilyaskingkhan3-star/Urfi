/**
 * Wake Word Detection Service for Urfi Assistant
 * Uses local browser SpeechRecognition / webkitSpeechRecognition API
 * without sending continuous background audio to external servers.
 */

import { WakeWordConfig } from '../types';

export const DEFAULT_WAKE_WORD_CONFIG: WakeWordConfig = {
  enabled: false,
  phrase: 'Hey Urfi',
  autoConnectLive: true,
  playChime: true,
  sensitivity: 'standard'
};

export const POPULAR_WAKE_WORDS = [
  { phrase: 'Hey Urfi', label: 'Hey Urfi', tag: 'Standard' },
  { phrase: 'Suno Urfi', label: 'Suno Urfi', tag: 'Urdu / سنیں' },
  { phrase: 'Urfi', label: 'Urfi', tag: 'Quick' },
  { phrase: 'Salam Urfi', label: 'Salam Urfi', tag: 'Adab / سلام' },
  { phrase: 'Jarvis', label: 'Jarvis', tag: 'Classic AI' },
  { phrase: 'Hello Urfi', label: 'Hello Urfi', tag: 'Casual' },
];

/**
 * Check if the browser environment supports local SpeechRecognition
 */
export function isLocalSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

/**
 * Synthesizes an elegant 2-tone futuristic chime using browser Web Audio API
 */
export function playWakeChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First note: C5 (523.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.36);

    // Second note: G5 (783.99 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.22, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.56);

    // Clean up AudioContext after sound finishes
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 800);
  } catch (err) {
    console.warn('Audio chime playback failed:', err);
  }
}

/**
 * Normalizes strings for robust wake word phonetic & substring matching
 */
export function normalizePhrase(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'۔،؟]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Evaluates whether transcript contains or matches the wake word
 */
export function matchesWakeWord(
  transcript: string,
  targetPhrase: string,
  sensitivity: 'loose' | 'standard' | 'strict' = 'standard'
): boolean {
  const normTrans = normalizePhrase(transcript);
  const normTarget = normalizePhrase(targetPhrase);

  if (!normTrans || !normTarget) return false;

  // 1. Strict exact match
  if (sensitivity === 'strict') {
    return normTrans === normTarget;
  }

  // 2. Standard substring match
  if (normTrans.includes(normTarget)) {
    return true;
  }

  // Common phonetic transliterations for "Urfi" in English STT models
  // e.g. "orfi", "arfi", "orfee", "urfee", "erfi", "aarfi"
  const targetWords = normTarget.split(' ');
  const isUrfiTarget = targetWords.some(w => ['urfi', 'orfi', 'urfee'].includes(w));
  
  if (isUrfiTarget) {
    const phoneticVariants = ['urfi', 'orfi', 'arfi', 'urfee', 'orfee', 'erfi', 'aarfi', 'orphi', 'urphi'];
    const prefixWords = targetWords.filter(w => !['urfi', 'orfi', 'urfee'].includes(w));
    
    // Check if any phonetic variant of Urfi is in the transcript
    const transWords = normTrans.split(' ');
    const hasUrfiVariant = transWords.some(tw => phoneticVariants.includes(tw));

    if (prefixWords.length === 0) {
      if (hasUrfiVariant) return true;
    } else {
      // Check if prefix words exist right before or nearby
      const hasPrefix = prefixWords.every(pw => normTrans.includes(pw));
      if (hasPrefix && hasUrfiVariant) return true;
    }
  }

  // 3. Loose sensitivity: match if at least 75% of key target words are present
  if (sensitivity === 'loose' && targetWords.length > 1) {
    let matchedCount = 0;
    for (const tw of targetWords) {
      if (normTrans.includes(tw)) matchedCount++;
    }
    if (matchedCount / targetWords.length >= 0.75) {
      return true;
    }
  }

  return false;
}

export type WakeWordStatus = 'idle' | 'listening' | 'detected' | 'unsupported' | 'error' | 'paused';

export interface WakeWordListenerOptions {
  config: WakeWordConfig;
  language?: string;
  onWake: (detectedPhrase: string, fullTranscript: string) => void;
  onStatusChange?: (status: WakeWordStatus, message?: string) => void;
  isBusy?: () => boolean; // returns true if Live session is connected or TTS is active
}

/**
 * Controller class to manage continuous local background wake-word listening
 */
export class WakeWordManager {
  private recognition: any = null;
  private isRunning: boolean = false;
  private shouldRun: boolean = false;
  private options: WakeWordListenerOptions;
  private restartTimer: any = null;
  private consecutiveErrors: number = 0;

  constructor(options: WakeWordListenerOptions) {
    this.options = options;
  }

  public updateOptions(newOptions: Partial<WakeWordListenerOptions>) {
    this.options = { ...this.options, ...newOptions };
    if (!this.options.config.enabled && this.isRunning) {
      this.stop();
    } else if (this.options.config.enabled && !this.isRunning) {
      this.start();
    }
  }

  public start(): void {
    if (!isLocalSpeechRecognitionSupported()) {
      this.options.onStatusChange?.('unsupported', 'Local Speech Recognition is not supported by your browser.');
      return;
    }

    if (!this.options.config.enabled) {
      this.options.onStatusChange?.('idle', 'Wake word detection is disabled.');
      return;
    }

    this.shouldRun = true;
    this.initAndStart();
  }

  private initAndStart(): void {
    if (this.isRunning) return;

    // Check if assistant is currently busy (e.g., Live session connected)
    if (this.options.isBusy && this.options.isBusy()) {
      this.options.onStatusChange?.('paused', 'Paused during active conversation');
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;

      // Set language: 'en-US' or 'en-IN' works best for Roman Urdu phonetics
      const lang = this.options.language === 'ur' ? 'ur-PK' : 'en-IN';
      this.recognition.lang = lang;

      this.recognition.onstart = () => {
        this.isRunning = true;
        this.consecutiveErrors = 0;
        this.options.onStatusChange?.('listening', `Listening for "${this.options.config.phrase}"`);
      };

      this.recognition.onresult = (event: any) => {
        // If busy speaking or in live call, ignore wake word
        if (this.options.isBusy && this.options.isBusy()) return;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcript = result[0]?.transcript || '';

          if (matchesWakeWord(transcript, this.options.config.phrase, this.options.config.sensitivity)) {
            this.options.onStatusChange?.('detected', `Wake word "${this.options.config.phrase}" detected!`);

            if (this.options.config.playChime) {
              playWakeChime();
            }

            this.options.onWake(this.options.config.phrase, transcript);
            
            // Momentarily pause recognition to let assistant take over
            this.stopTemporary(2000);
            return;
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'aborted') {
          // Normal timeout or silence, no action needed
          return;
        }

        this.consecutiveErrors++;
        console.warn('WakeWord recognition error:', event.error);

        if (event.error === 'not-allowed') {
          this.shouldRun = false;
          this.options.onStatusChange?.('error', 'Microphone access denied for wake word detection.');
        } else {
          this.options.onStatusChange?.('error', `Speech error: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        this.isRunning = false;
        
        // Auto-restart if we should still be running and not busy
        if (this.shouldRun && (!this.options.isBusy || !this.options.isBusy())) {
          const delay = Math.min(300 + this.consecutiveErrors * 400, 3000);
          clearTimeout(this.restartTimer);
          this.restartTimer = setTimeout(() => {
            if (this.shouldRun) {
              this.initAndStart();
            }
          }, delay);
        } else {
          this.options.onStatusChange?.('idle', 'Wake word listener idle');
        }
      };

      this.recognition.start();
    } catch (err) {
      console.warn('WakeWord recognition failed to start:', err);
      this.isRunning = false;
      this.options.onStatusChange?.('error', 'Could not initialize wake word listener');
    }
  }

  public stopTemporary(durationMs: number = 2000): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
    this.isRunning = false;
    clearTimeout(this.restartTimer);

    if (this.shouldRun) {
      this.restartTimer = setTimeout(() => {
        if (this.shouldRun && (!this.options.isBusy || !this.options.isBusy())) {
          this.initAndStart();
        }
      }, durationMs);
    }
  }

  public pause(): void {
    if (this.recognition && this.isRunning) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
    this.isRunning = false;
    clearTimeout(this.restartTimer);
    this.options.onStatusChange?.('paused', 'Wake word listening paused');
  }

  public resume(): void {
    if (this.shouldRun && !this.isRunning) {
      this.initAndStart();
    }
  }

  public stop(): void {
    this.shouldRun = false;
    clearTimeout(this.restartTimer);
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (_) {}
      this.recognition = null;
    }
    this.isRunning = false;
    this.options.onStatusChange?.('idle', 'Wake word listener stopped');
  }
}
