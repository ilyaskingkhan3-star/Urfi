import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X, Settings2 } from 'lucide-react';
import { UserProfile, Message } from '../types';
import { askGemini } from '../services/geminiService';
import { speakText, stopSpeaking, isSpeaking, createSpeechRecognizer } from '../services/speechService';
import NeuralCore from './NeuralCore';
import { ThemeId } from '../services/theme';

interface VoiceModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onAddMessage?: (msg: Message) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  profile,
  isOpen,
  onClose,
  onAddMessage,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const recognizerRef = useRef<any>(null);

  const isUrdu = profile.language === 'ur';
  const isRoman = profile.language === 'roman-ur';

  // Toggle listening
  const startListening = () => {
    stopSpeaking();
    setTranscript('');
    setResponse('');

    const recognizer = createSpeechRecognizer(
      profile.language,
      (text, isFinal) => {
        setTranscript(text);
        setAudioLevel(Math.min(1, text.length * 0.05 + 0.3));
        if (isFinal && text.trim().length > 2) {
          handleVoiceQuery(text);
        }
      },
      (err) => {
        console.warn('Speech recognition notice:', err);
        setIsListening(false);
        setAudioLevel(0);
      },
      () => {
        setIsListening(false);
        setAudioLevel(0);
      }
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      try {
        recognizer.start();
        setIsListening(true);
      } catch (e) {
        console.error('Cannot start recognizer:', e);
      }
    } else {
      // Fallback message
      setResponse(
        isUrdu
          ? 'معذرت، اس براؤزر میں مائیکروفون کی براہ راست شناخت دستیاب نہیں ہے۔ آپ چیٹ میں لکھ سکتے ہیں۔'
          : 'Voice recognition is not fully supported in this browser mode. Please use text chat.'
      );
    }
  };

  const stopListening = () => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setAudioLevel(0);
  };

  const handleVoiceQuery = async (queryText: string) => {
    stopListening();
    setIsProcessing(true);

    if (onAddMessage) {
      onAddMessage({
        id: `voice-user-${Date.now()}`,
        role: 'user',
        text: queryText,
        timestamp: Date.now(),
      });
    }

    try {
      const res = await askGemini({
        prompt: queryText,
        profile,
        useSearch: false,
      });

      setResponse(res.text);

      if (onAddMessage) {
        onAddMessage({
          id: `voice-bot-${Date.now()}`,
          role: 'assistant',
          text: res.text,
          timestamp: Date.now(),
        });
      }

      speakText(res.text, profile.language, profile.voice, profile.speechRate || 1.0, () => {
        setAudioLevel(0);
      });
    } catch (e) {
      const errMsg = isUrdu
        ? 'معذرت، جواب موصول نہیں ہو سکا۔'
        : 'Sorry, could not process voice request.';
      setResponse(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      stopSpeaking();
    } else {
      // auto start listening when modal opens
      startListening();
    }
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-[var(--theme-border)] shadow-2xl p-6 md:p-8 flex flex-col items-center text-center space-y-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-badge-bg)] text-[var(--theme-primary)] text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>URFI Voice Mode • {profile.name}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            {isListening
              ? isUrdu ? 'میں سن رہی ہوں...' : isRoman ? 'Main sun rahi hoon...' : 'Listening to you...'
              : isProcessing
              ? isUrdu ? 'سوچ رہی ہوں...' : isRoman ? 'Soch rahi hoon...' : 'Processing...'
              : isUrdu ? 'آواز سے بات کیجیے' : isRoman ? 'Boliye, main sun rahi hoon' : 'Tap mic to talk'}
          </h2>
        </div>

        {/* Visualizer NeuralCore */}
        <div className="relative my-2 py-4">
          <NeuralCore
            isActive={isListening || isSpeaking() || isProcessing}
            audioLevel={audioLevel || (isSpeaking() ? 0.6 : 0.1)}
            theme={profile.theme as ThemeId}
          />
        </div>

        {/* Transcribed text or Response */}
        <div className="w-full min-h-[90px] max-h-[160px] overflow-y-auto px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm leading-relaxed text-slate-200 font-sans flex items-center justify-center">
          {transcript ? (
            <p className="italic text-[var(--theme-text-light)]">"{transcript}"</p>
          ) : response ? (
            <p className="text-left font-medium">{response}</p>
          ) : (
            <p className="text-slate-400 text-xs">
              {isUrdu
                ? 'اپنا سوال یا بات واضح انداز میں کہیے۔ عرفی صوتی طور پر جواب دے گی۔'
                : isRoman
                ? 'Apna sawal bolein, Urfi bol kar jawab degi.'
                : 'Speak clearly into your microphone. Urfi will speak back.'}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            id="voice-mic-toggle-btn"
            onClick={isListening ? stopListening : startListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-slate-950 font-bold shadow-2xl transition-all duration-300 active:scale-90 cursor-pointer ${
              isListening ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : ''
            }`}
            style={!isListening ? {
              backgroundColor: 'var(--theme-primary)',
              boxShadow: '0 0 25px var(--theme-glow)',
            } : undefined}
          >
            {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </button>

          {isSpeaking() && (
            <button
              onClick={() => stopSpeaking()}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition-all cursor-pointer"
              title="Stop Speech"
            >
              <VolumeX className="w-5 h-5 text-red-400" />
            </button>
          )}
        </div>

        <p className="text-[11px] text-slate-400 font-mono">
          Language: <span className="text-[var(--theme-primary)] font-semibold">{profile.language.toUpperCase()}</span> • Voice: {profile.voice}
        </p>
      </div>
    </div>
  );
};

export default VoiceModal;
