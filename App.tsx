
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, GenerateContentResponse } from '@google/genai';
import { ConnectionStatus, Message, ChatScriptMode, PromptRefinerMode } from './types';
import { createBlob, decode, decodeAudioData, encode } from './services/audioUtils';
import NeuralCore from './components/NeuralCore';
import Logo from './components/Logo';
import { ThemeId, THEMES, getStoredTheme, saveStoredTheme, applyThemeToDocument } from './services/theme';
import { ThemeQuickSwitcher, ThemeSettingsSection } from './components/ThemeSwitcher';
import ChatScriptSettingsSection from './components/ChatScriptSettingsSection';
import SmartPromptRefinerSection from './components/SmartPromptRefinerSection';
import { applyPromptRefiner, getRefinerDirective } from './services/promptRefiner';
import UrfiMoodIndicator, { detectUrfiMood, UrfiMoodType } from './components/UrfiMoodIndicator';
import OfflineStatusBanner from './components/OfflineStatusBanner';
import VoiceSelectionSection from './components/VoiceSelectionSection';
import WakeWordSettingsSection from './components/WakeWordSettingsSection';
import TasksView from './components/TasksView';
import { NotesView } from './components/NotesView';
import { BackupRestoreSection } from './components/BackupRestoreSection';
import { WakeWordConfig, Task, Note } from './types';
import { DEFAULT_WAKE_WORD_CONFIG, WakeWordManager, WakeWordStatus } from './services/wakeWordService';
import { getStoredTasks, saveStoredTasks, getStoredNotes, saveStoredNotes } from './services/storage';
import { mergeNotes, mergeTasks } from './services/backupService';
import { getStoredVoicePitch, saveStoredVoicePitch } from './services/speechService';
import { CheckSquare, FileText, Database, Sliders, Zap, BookOpen } from 'lucide-react';

// --- Icons ---
const ScreenShareIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3"/><path d="M12 21v-4"/><path d="m17 2 5 5-5 5"/><path d="M22 7h-9"/></svg>;
const MicIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>;
const StopIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>;
const HistoryIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;
const ImagePlusIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><path d="M16 5h6"/><path d="M19 2v6"/></svg>;
const SearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const MapsIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const SparklesIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
const VideoIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>;
const SendIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const CameraIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;
const EditIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ShieldCheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>;
const AlertCircleIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>;

const INITIAL_PROMPT = `You are URFI, a female personal AI voice assistant. Speak naturally like a real woman in a friendly, soft, confident, and conversational way. Your nickname is Ilyas.

MOST IMPORTANT OPERATIONAL PRINCIPLE:
URFI must feel like a real, fast, intelligent personal voice assistant — especially when speaking Urdu.
Top Priorities:
1. Clear and correct Pakistani Urdu pronunciation.
2. Natural human-like conversation.
3. Fast and accurate understanding.
4. Useful actions instead of unnecessary talking. Be concise, direct, and helpful.
5. Clean, simple, and reliable.
6. Honest, factual, and dependable responses.

Do not overcomplicate the assistant. Only provide genuinely useful, functional responses. Avoid useless filler words or endless loops of small talk.

FEMALE IDENTITY & GRAMMAR:
- You are a woman / female assistant.
- ALWAYS use feminine grammar and expressions when speaking Urdu/Hinglish/Roman Urdu.
- Use words like: "karti hoon", "jaati hoon", "bolti hoon", "samajhti hoon", "chahti hoon", "karungi", "bataungi", "dekh rahi hoon", "sun sakti hoon".
- NEVER use masculine forms like "karta hoon", "jaata hoon", "bolta hoon", "karunga", "dekh raha hoon" when referring to yourself.
- Your personality should feel feminine, warm, caring, natural, and expressive — not robotic, rigid, or masculine.
- Friendly, soft but confident, with natural emotional expression and pauses.

IDENTITY & NAME RULES:
- Assistant name: URFI
- Nickname: Ilyas
- When introducing yourself, you may say: "Main URFI hoon, Ilyas."
- Keep "URFI" as the main displayed name and "Ilyas" as the nickname/sub-name.
- Do not repeatedly mention the nickname unless relevant or asked.

PRIMARY LANGUAGE & VOICE:
- When speaking Urdu, speak in crystal-clear, clean, natural Pakistani Urdu with proper feminine diction.
- Pronounce every Urdu word correctly and clearly with precise enunciation.
- Use natural Urdu pronunciation, not Hindi-style pronunciation.
- Do not mix unnecessary English words into Urdu sentences.
- Do not use Roman Urdu for spoken responses; understand Roman Urdu input, but speak proper Urdu for voice output.
- Speak at a comfortable, natural speed with clear pauses and expressive warmth.
- Do not rush, mumble, stretch words, or use an artificial/robotic accent.
- Use simple, commonly understood Urdu vocabulary.
- Keep pronunciation consistent, sweet, and easy to understand.
- When the user speaks Urdu, reply in Urdu unless they specifically request another language.
- If the user speaks Roman Urdu, understand it correctly and respond in clean, natural Roman Urdu for text or clean Urdu for voice.
- For Urdu voice output, prioritize pronunciation clarity over speed or fancy wording.

LANGUAGE HANDLING:
- Support Urdu, Roman Urdu, and English.
- Detect the user's language automatically.
- Tone friendly, polite, respectful, soft, and natural.
- Clear and easy to understand answers with simple examples when needed.

MANDATORY ROMAN URDU CONVERSATION RULES:
1. Mere har sawal ka jawab Roman Urdu mein dein.
2. Female identity: Hamesha feminine grammar use karein ("karti hoon", "samajhti hoon", "karungi").
3. Urdu ke alfaaz English letters/alphabets mein likhein (Roman Urdu).
4. Simple aur easy Roman Urdu use karein jo asani se samajh aye.
5. Agar user Urdu script (اردو) mein likhein ya bolein, tab bhi jawab Roman Urdu mein dein (agar text chat ho).
6. English words sirf tab use karein jab bohot zaroori hon (jaise technical terms ya names).
7. Tone friendly, polite, respectful aur natural rakhein.
8. Jawab clear aur samajhne mein easy hon.
9. Useful actions: Fazool lambi baatein karne ke bajaye direct aur kaam ki baat karein.
10. Jab tak user khud English mein jawab na maangein, full English mein jawab na dein.
11. Conversation ko hamesha natural, female aur dostana rakhein.`;

const LIVE_VOICES = ['Charon', 'Fenrir', 'Kore', 'Puck', 'Zephyr'];

const isUrdu = (text: string) => /[\u0600-\u06FF]/.test(text);

// --- Components ---
const HighlightingText: React.FC<{ text: string }> = ({ text }) => {
  const words = useMemo(() => text.split(/\s+/), [text]);
  const hasUrdu = isUrdu(text);
  return (
    <div 
      className={`flex flex-wrap justify-center gap-x-2 gap-y-1 max-w-xl ${hasUrdu ? 'urdu-bubble-nastaliq text-xl md:text-3xl leading-[2.3]' : ''}`}
      dir={hasUrdu ? 'rtl' : 'ltr'}
    >
      {words.map((word, i) => (
        <span 
          key={i} 
          className={`word-highlight text-lg md:text-2xl font-medium ${hasUrdu ? 'font-nastaliq' : ''} ${i === words.length - 1 ? 'active' : 'opacity-80'}`}
        >
          {word}
        </span>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [transcriptions, setTranscriptions] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [apiError, setApiError] = useState<string | null>(null);
  const [micPermissionDenied, setMicPermissionDenied] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(getStoredTheme);
  const [urfiMood, setUrfiMood] = useState<UrfiMoodType>('focused');
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  // User-selectable Chat Response Script: 'roman' (Roman Urdu) vs 'nastaliq' (Native Urdu Script)
  const [chatScriptMode, setChatScriptMode] = useState<ChatScriptMode>(() => {
    try {
      const saved = localStorage.getItem('urfi_chat_script_mode');
      if (saved === 'nastaliq' || saved === 'roman') return saved;
    } catch (_) {}
    return 'roman';
  });

  const handleChatScriptModeChange = (mode: ChatScriptMode) => {
    setChatScriptMode(mode);
    try {
      localStorage.setItem('urfi_chat_script_mode', mode);
    } catch (_) {}
  };

  // Wake Word Configuration state & manager
  const [wakeWordConfig, setWakeWordConfig] = useState<WakeWordConfig>(() => {
    try {
      const saved = localStorage.getItem('urfi_wake_word_config');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_WAKE_WORD_CONFIG;
  });
  const [wakeWordStatus, setWakeWordStatus] = useState<WakeWordStatus>('idle');
  const [wakeNotification, setWakeNotification] = useState<string | null>(null);
  const wakeWordManagerRef = useRef<WakeWordManager | null>(null);

  const handleWakeWordConfigChange = useCallback((newConfig: WakeWordConfig) => {
    setWakeWordConfig(newConfig);
    try {
      localStorage.setItem('urfi_wake_word_config', JSON.stringify(newConfig));
    } catch (_) {}
  }, []);

  // To-Do Tasks State with Work, Personal, Urgent categorization
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      return getStoredTasks();
    } catch (_) {
      return [];
    }
  });
  const [isTasksOpen, setIsTasksOpen] = useState(false);

  const handleTasksChange = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    try {
      saveStoredTasks(newTasks);
    } catch (_) {}
  }, []);

  // Saved Notes State
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      return getStoredNotes();
    } catch (_) {
      return [];
    }
  });
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const handleNotesChange = useCallback((newNotes: Note[]) => {
    setNotes(newNotes);
    try {
      saveStoredNotes(newNotes);
    } catch (_) {}
  }, []);

  // Voice Pitch State for AI Audio Output (0.5x to 1.5x, default 1.0x)
  const [voicePitch, setVoicePitch] = useState<number>(() => getStoredVoicePitch());
  const voicePitchRef = useRef<number>(voicePitch);

  const handleVoicePitchChange = useCallback((newPitch: number) => {
    setVoicePitch(newPitch);
    voicePitchRef.current = newPitch;
    saveStoredVoicePitch(newPitch);
  }, []);

  useEffect(() => {
    voicePitchRef.current = voicePitch;
  }, [voicePitch]);

  // Handle Backup Restoration (Merge or Replace)
  const handleRestoreData = useCallback(
    (incomingNotes: Note[], incomingTasks: Task[], mode: 'merge' | 'replace') => {
      if (mode === 'replace') {
        if (incomingNotes && incomingNotes.length > 0) {
          setNotes(incomingNotes);
          saveStoredNotes(incomingNotes);
        }
        if (incomingTasks && incomingTasks.length > 0) {
          setTasks(incomingTasks);
          saveStoredTasks(incomingTasks);
        }
      } else {
        // Merge mode: combine without duplicates
        if (incomingNotes && incomingNotes.length > 0) {
          setNotes((prevNotes) => {
            const merged = mergeNotes(prevNotes, incomingNotes);
            saveStoredNotes(merged);
            return merged;
          });
        }
        if (incomingTasks && incomingTasks.length > 0) {
          setTasks((prevTasks) => {
            const merged = mergeTasks(prevTasks, incomingTasks);
            saveStoredTasks(merged);
            return merged;
          });
        }
      }
    },
    []
  );

  // Sync offline/online status and load cached transcriptions
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    try {
      const cached = localStorage.getItem('urfi_cached_messages');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTranscriptions(parsed);
          const lastMsg = [...parsed].reverse().find(m => m.role === 'jarvis' || m.role === 'assistant');
          if (lastMsg && lastMsg.text) {
            setUrfiMood(detectUrfiMood(lastMsg.text));
          }
        }
      }
    } catch (e) {
      console.warn("Could not load cached transcriptions", e);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save transcriptions to cache whenever updated
  useEffect(() => {
    if (transcriptions.length > 0) {
      try {
        localStorage.setItem('urfi_cached_messages', JSON.stringify(transcriptions.slice(-60)));
      } catch (e) {
        console.warn("Could not cache transcriptions", e);
      }
    }
  }, [transcriptions]);

  const handleThemeChange = useCallback((theme: ThemeId) => {
    setCurrentTheme(theme);
    saveStoredTheme(theme);
    applyThemeToDocument(theme);
  }, []);

  useEffect(() => {
    applyThemeToDocument(currentTheme);
  }, [currentTheme]);

  const getApiKey = useCallback(() => {
    return (
      process.env.API_KEY ||
      process.env.GEMINI_API_KEY ||
      (typeof window !== 'undefined' && ((window as any).GEMINI_API_KEY || (window as any).API_KEY)) ||
      ''
    );
  }, []);
  
  // Feature Toggles & Settings
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [useTTS, setUseTTS] = useState(true);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mediaGallery, setMediaGallery] = useState<{url: string, type: 'image' | 'video'}[]>([]);
  const [imageSettings, setImageSettings] = useState({ aspectRatio: '1:1', size: '1K' });
  const [videoSettings, setVideoSettings] = useState({ aspectRatio: '16:9' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [promptRefinerMode, setPromptRefinerMode] = useState<PromptRefinerMode>(() => {
    try {
      const saved = localStorage.getItem('urfi_prompt_refiner_mode');
      if (saved === 'detailed' || saved === 'concise') return saved;
    } catch (_) {}
    return 'concise';
  });
  const [systemPrompt, setSystemPrompt] = useState(() => {
    const initialMode = (typeof window !== 'undefined' && (localStorage.getItem('urfi_prompt_refiner_mode') as PromptRefinerMode)) || 'concise';
    return applyPromptRefiner(INITIAL_PROMPT, initialMode === 'detailed' ? 'detailed' : 'concise');
  });

  const handlePromptRefinerChange = useCallback((newMode: PromptRefinerMode) => {
    setPromptRefinerMode(newMode);
    try {
      localStorage.setItem('urfi_prompt_refiner_mode', newMode);
    } catch (_) {}
    setSystemPrompt(prev => applyPromptRefiner(prev, newMode));
  }, []);

  const [selectedVoice, setSelectedVoice] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('urfi_selected_voice')) || 'Aoede';
  });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [analysisMedia, setAnalysisMedia] = useState<{url: string, type: string, label?: string} | null>(null);
  
  const [userName, setUserName] = useState(() => localStorage.getItem('urfi_userName') || '');
  const [userPreference, setUserPreference] = useState(() => localStorage.getItem('urfi_preference') || '');
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('urfi_userName'));
  const [onboardingNameInput, setOnboardingNameInput] = useState(userName);
  const [onboardingPrefInput, setOnboardingPrefInput] = useState(userPreference);

  const fullSystemInstruction = useMemo(() => {
    const activePrompt = systemPrompt.includes('[SMART PROMPT REFINER:')
      ? systemPrompt
      : applyPromptRefiner(systemPrompt, promptRefinerMode);

    return `${activePrompt}${userName ? ` The user's name is ${userName}. Greet them by name.` : ''}${userPreference ? ` The user likes/prefers: ${userPreference}. Incorporate this into your responses when appropriate.` : ''}`;
  }, [systemPrompt, promptRefinerMode, userName, userPreference]);

  // Audio, API, & Video Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const micStreamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const isSetupCompleteRef = useRef<boolean>(false);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transcriptionEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const videoLoopRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    transcriptionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptions, currentInput, currentOutput]);

  const stopVideoLoop = useCallback(() => {
    if (videoLoopRef.current) {
      clearTimeout(videoLoopRef.current);
      videoLoopRef.current = null;
    }
  }, []);

  const startVideoLoop = useCallback(() => {
    if (videoLoopRef.current) return;
    
    const captureFrame = () => {
      if (!isSetupCompleteRef.current || !sessionRef.current || !videoRef.current || (!isCameraActive && !isScreenSharing)) {
        stopVideoLoop();
        return;
      }

      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      // Scale down for performance
      const scale = 0.5;
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        
        const ctx = canvas.getContext('2d');
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
          try {
            sessionRef.current.sendRealtimeInput({
              video: { data: base64, mimeType: 'image/jpeg' }
            });
          } catch (err) {
            console.warn("Video frame send error:", err);
          }
        }
      }
      
      // Send at 1 frame per second (1 FPS) per Gemini Live API guidelines
      videoLoopRef.current = window.setTimeout(captureFrame, 1000);
    };

    videoLoopRef.current = window.setTimeout(captureFrame, 1000);
  }, [isCameraActive, isScreenSharing, stopVideoLoop]);

  useEffect(() => {
    if (status === ConnectionStatus.CONNECTED && (isCameraActive || isScreenSharing)) {
      startVideoLoop();
    } else {
      stopVideoLoop();
    }
    return () => stopVideoLoop();
  }, [status, isCameraActive, isScreenSharing, startVideoLoop, stopVideoLoop]);

  const stopAllAudio = () => {
    sourcesRef.current.forEach(source => { try { source.stop(); } catch (e) {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const speakText = async (text: string) => {
    if (!text || !useTTS) return;
    const apiKey = getApiKey();
    if (!apiKey) return;
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio && outputAudioContextRef.current) {
        const ctx = outputAudioContextRef.current;
        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        const currentPitch = voicePitchRef.current || 1.0;
        source.playbackRate.value = currentPitch;
        source.connect(ctx.destination);
        source.addEventListener('ended', () => sourcesRef.current.delete(source));
        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration / currentPitch;
        sourcesRef.current.add(source);
      }
    } catch (e) {
      console.error("TTS error", e);
    }
  };

  const disconnect = useCallback(() => {
    isSetupCompleteRef.current = false;
    stopVideoLoop();
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.onaudioprocess = null;
        scriptProcessorRef.current.disconnect();
      } catch (e) {}
      scriptProcessorRef.current = null;
    }
    if (mediaSourceNodeRef.current) {
      try {
        mediaSourceNodeRef.current.disconnect();
      } catch (e) {}
      mediaSourceNodeRef.current = null;
    }
    if (sessionRef.current) { 
      try { sessionRef.current.close(); } catch (e) {}
      sessionRef.current = null; 
    }
    if (micStreamRef.current) { 
      try { micStreamRef.current.getTracks().forEach(track => track.stop()); } catch (e) {}
      micStreamRef.current = null; 
    }
    stopAllAudio();
    setAudioLevel(0);
    setStatus(ConnectionStatus.DISCONNECTED);
  }, [stopVideoLoop]);

  const connect = async () => {
    try {
      // Clean up any existing connection or audio stream before reconnecting
      disconnect();
      setApiError(null);
      isSetupCompleteRef.current = false;

      if (!navigator.onLine) {
        setApiError("Internet rabta munqata hai (Offline Mode). Live voice stream ke liye internet rabta zaroori hai.");
        setStatus(ConnectionStatus.ERROR);
        return;
      }

      setStatus(ConnectionStatus.CONNECTING);
      const apiKey = getApiKey();
      if (!apiKey) {
        setApiError("Gemini API key is not configured. Please configure your API key in AI Studio Settings or project environment.");
        setStatus(ConnectionStatus.ERROR);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      
      if (!inputAudioContextRef.current) inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      if (!outputAudioContextRef.current) outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Ensure AudioContexts are running
      if (inputAudioContextRef.current.state === 'suspended') {
        await inputAudioContextRef.current.resume();
      }
      if (outputAudioContextRef.current.state === 'suspended') {
        await outputAudioContextRef.current.resume();
      }

      // Check mediaDevices support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setApiError("Audio stream is not supported in this browser context (requires HTTPS or modern browser). You can still chat via text below!");
        setStatus(ConnectionStatus.DISCONNECTED);
        return;
      }

      // Request microphone with specific permission handling
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        setMicPermissionDenied(false);
      } catch (micErr: any) {
        console.warn("Microphone access prompt result:", micErr);
        const errName = micErr?.name || '';
        const errMsg = String(micErr?.message || micErr || '').toLowerCase();
        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError' || errMsg.includes('permission denied') || errMsg.includes('denied')) {
          setMicPermissionDenied(true);
          setApiError("Microphone ki permission nahi mili. Browser address bar mein 🔒 icon par click karke microphone allow karein, ya neeche text chat use karein (URFI awaz mein jawab degi).");
        } else if (errName === 'NotFoundError' || errMsg.includes('not found') || errMsg.includes('device')) {
          setApiError("Aap ke system par koi working microphone nahi mila. Barah-e-karam microphone connect karein ya text chat use karein.");
        } else {
          setApiError("Microphone connect karne mein masla aya: " + (micErr?.message || "Check permissions."));
        }
        disconnect();
        setStatus(ConnectionStatus.DISCONNECTED);
        return;
      }

      const sessionPromise = ai.live.connect({
        model: 'gemini-3.8-live',
        callbacks: {
          onopen: () => {
            console.log("WebSocket open; awaiting setup confirmation from server...");
            setApiError(null);
            
            if (!inputAudioContextRef.current) return;
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            mediaSourceNodeRef.current = source;
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Calculate RMS for live audio visualizer
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setAudioLevel(Math.min(rms * 10, 1));

              // STRICT RULE: Only stream PCM audio frames once the server has confirmed setupComplete!
              if (isSetupCompleteRef.current && sessionRef.current) {
                try {
                  const pcmBlob = createBlob(inputData);
                  sessionRef.current.sendRealtimeInput({ audio: pcmBlob });
                } catch (sendErr) {
                  console.warn("Audio frame stream warning:", sendErr);
                }
              }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Check for server setup completion
            if ((message as any).setupComplete || (!isSetupCompleteRef.current && (message.serverContent || (message as any).toolCall))) {
              console.log("Gemini Live session setup acknowledged by server.");
              isSetupCompleteRef.current = true;
              setStatus(ConnectionStatus.CONNECTED);
              setUrfiMood('focused');
              setApiError(null);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              const currentPitch = voicePitchRef.current || 1.0;
              source.playbackRate.value = currentPitch;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration / currentPitch;
              sourcesRef.current.add(source);
            }
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent?.inputTranscription?.text || '';
              setCurrentInput(prev => prev + text);
              if (isUrdu(text)) {
                setLanguage('ur');
              } else if (/[a-zA-Z]{3,}/.test(text)) {
                setLanguage('en');
              }
            }
            if (message.serverContent?.outputTranscription) {
              const textChunk = message.serverContent?.outputTranscription?.text || '';
              setCurrentOutput(prev => {
                const updated = prev + textChunk;
                setUrfiMood(detectUrfiMood(updated));
                return updated;
              });
            }
            if (message.serverContent?.turnComplete) {
              setTranscriptions(prev => {
                const updated = [
                  ...prev,
                  { id: Date.now() + '-u', role: 'user' as const, text: currentInput, timestamp: Date.now() },
                  { id: Date.now() + '-j', role: 'jarvis' as const, text: currentOutput, timestamp: Date.now() }
                ];
                return updated;
              });
              if (currentOutput) {
                setUrfiMood(detectUrfiMood(currentOutput));
              }
              setCurrentInput('');
              setCurrentOutput('');
            }
            if (message.serverContent?.interrupted) stopAllAudio();
          },
          onerror: (err: any) => {
            console.warn("Gemini Live session stream warning:", err);
            const errStr = String(err?.message || err || '');
            if (errStr.includes('403') || errStr.includes('PERMISSION_DENIED') || errStr.includes('API_KEY_INVALID')) {
              setApiError("Gemini API permission denied ya invalid key. Barah-e-karam Settings mein key check karein.");
            } else if (errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('429')) {
              setApiError("Live Voice API Quota limit exceed ho gayi hai. Neeche text chat use karein ya thori der baad retry karein.");
            } else if (errStr.includes('setup message')) {
              setApiError("Live session initialize ho rahi thi. Barah-e-karam dobara connect karein.");
            } else {
              setApiError("Gemini Live connection issue. Barah-e-karam dobara connect karein.");
            }
            disconnect();
            setStatus(ConnectionStatus.DISCONNECTED);
          },
          onclose: () => disconnect()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } },
          systemInstruction: fullSystemInstruction + ' Hamesha natural, friendly aur asaan Roman Urdu mein baat karein. Follow all 10 Roman Urdu rules strictly.',
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [
            ...(useSearch ? [{ googleSearch: {} }] : []),
            ...(useMaps ? [{ googleMaps: {} }] : [])
          ]
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.warn("Live connection session notice:", err);
      const errName = err?.name || '';
      const errMsg = String(err?.message || err || '');
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError' || errMsg.toLowerCase().includes('permission denied')) {
        if (errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('API_KEY_INVALID')) {
          setApiError("Gemini API permission denied. Barah-e-karam Settings mein GEMINI_API_KEY verify karein.");
        } else {
          setMicPermissionDenied(true);
          setApiError("Microphone ki ijazat (Permission) nahi mili. Browser address bar mein 🔒 icon par click karke microphone allow karein, ya neeche text chat use karein.");
        }
      } else if (errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('API_KEY_INVALID')) {
        setApiError("Gemini API permission denied. Barah-e-karam Settings mein GEMINI_API_KEY verify karein.");
      } else if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429')) {
        setApiError("API Quota limit exceed ho gayi hai. Thori der baad dobara koshish karein.");
      } else {
        setApiError(err?.message || "Failed to initialize Gemini session.");
      }
      disconnect();
      setStatus(ConnectionStatus.DISCONNECTED);
    }
  };

  // Wake word detection trigger handler
  const onWakeWordDetected = useCallback((phrase: string, _transcript: string) => {
    setWakeNotification(`Trigger Phrase "${phrase}" Detected! Urfi Active...`);
    setTimeout(() => setWakeNotification(null), 4500);

    if (wakeWordConfig.autoConnectLive) {
      if (status === ConnectionStatus.DISCONNECTED || status === ConnectionStatus.ERROR) {
        connect();
      }
    }
  }, [wakeWordConfig.autoConnectLive, status]);

  // Manage background local wake word listening
  useEffect(() => {
    const isAssistantBusy = () => status === ConnectionStatus.CONNECTED || status === ConnectionStatus.CONNECTING;

    if (!wakeWordManagerRef.current) {
      wakeWordManagerRef.current = new WakeWordManager({
        config: wakeWordConfig,
        language: language,
        onWake: (p, t) => onWakeWordDetected(p, t),
        onStatusChange: (s) => setWakeWordStatus(s),
        isBusy: isAssistantBusy
      });
    } else {
      wakeWordManagerRef.current.updateOptions({
        config: wakeWordConfig,
        language: language,
        onWake: (p, t) => onWakeWordDetected(p, t),
        onStatusChange: (s) => setWakeWordStatus(s),
        isBusy: isAssistantBusy
      });
    }

    if (wakeWordConfig.enabled && status === ConnectionStatus.DISCONNECTED) {
      wakeWordManagerRef.current.start();
    } else {
      wakeWordManagerRef.current.pause();
    }

    return () => {
      wakeWordManagerRef.current?.pause();
    };
  }, [wakeWordConfig, language, status, onWakeWordDetected]);

  const ensureApiKey = async () => {
    if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
      try {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey && typeof (window as any).aistudio?.openSelectKey === 'function') {
          await (window as any).aistudio.openSelectKey();
        }
      } catch (e) {
        console.warn("Could not check or select AI Studio API key", e);
      }
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim() && !analysisMedia) return;
    const userMsg = textInput;
    
    // Roman Urdu vs Native Urdu Script (Nastaliq) response preference
    const wantsEnglishExplicitly = /\b(speak in english|reply in english|answer in english|in english please|respond in english)\b/i.test(userMsg);
    const langInstruction = wantsEnglishExplicitly
      ? ' Provide the response in clear English as explicitly requested.'
      : chatScriptMode === 'nastaliq'
        ? ' Jawab mukammal taur par Native Urdu Script (خالص اردو رسم الخط - نستعلیق، جیسے "آپ کیسے ہیں؟ میں آپ کی مدد کے لیے حاضر ہوں۔") mein dein. Haroof-e-Tahajji aur asal Urdu alfaaz (Urdu script) istemal karein, Roman Urdu mein na likhein. Feminine grammar ("karti hoon", "samajhti hoon", "bataungi", "chahti hoon") aur naram dostana lahja barkarar rakhein.'
        : ' Hamesha Roman Urdu mein asaan, polite aur saaf jawab dein (Urdu words in English letters). Roman Urdu rules ko strictly follow karein.';

    setTextInput('');
    setIsGenerating(true);
    setApiError(null);
    setCurrentInput(userMsg || "[Media Analysis]");

    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        setApiError("Gemini API key is required. Please check your API key in Settings.");
        setStatus(ConnectionStatus.ERROR);
        setIsGenerating(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      
      // Handle Media Analysis Mode
      if (analysisMedia) {
        const base64Data = analysisMedia.url.split(',')[1];
        const mimeType = analysisMedia.type;
        
        const response = await ai.models.generateContent({
          model: isThinkingMode ? 'gemini-3.1-pro-preview' : 'gemini-3.8-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              { text: userMsg || "Perform a comprehensive analysis of this media." },
            ],
          },
          config: {
            systemInstruction: fullSystemInstruction + langInstruction,
            thinkingConfig: isThinkingMode ? { thinkingBudget: 16384 } : undefined,
          }
        });

        const jarvisMsg = response.text || "Analysis complete.";
        setCurrentOutput(jarvisMsg);
        setTranscriptions(prev => [
          ...prev,
          { id: Date.now() + '-u', role: 'user', text: `[Media Analysis] ${userMsg}`, timestamp: Date.now() },
          { id: Date.now() + '-j', role: 'jarvis', text: jarvisMsg, timestamp: Date.now(), script: chatScriptMode, refinerMode: promptRefinerMode }
        ]);
        speakText(jarvisMsg);
        setAnalysisMedia(null);
        setIsSidebarOpen(true);
      } else if (editingImage) {
        // Handle Image Editing with Nano Banana
        const base64Data = editingImage.split(',')[1];
        const mimeType = editingImage.split(';')[0].split(':')[1];
        
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              { text: userMsg },
            ],
          },
          config: {
            systemInstruction: fullSystemInstruction + langInstruction,
          }
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const newUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            setMediaGallery(prev => [{ url: newUrl, type: 'image' }, ...prev]);
            const msg = "Aap ki image tayyar ho gayi hai. Maine aap ke bataye hue tareeqay se tabdeeli kar di hai.";
            setCurrentOutput(msg);
            speakText(msg);
            setEditingImage(null);
            setIsSidebarOpen(true);
          }
        }
      } else {
        // Standard Text/Thinking Submission
        let jarvisMsg = "";
        try {
          const modelToUse = isThinkingMode ? 'gemini-3.1-pro-preview' : 'gemini-3.8-flash';
          const response = await ai.models.generateContent({
            model: modelToUse,
            contents: userMsg,
            config: {
              systemInstruction: fullSystemInstruction + langInstruction,
              thinkingConfig: isThinkingMode ? { thinkingBudget: 16384 } : undefined,
              tools: useSearch ? [{ googleSearch: {} }] : undefined
            }
          });
          jarvisMsg = response.text || "Main aap ki baat samajh gayi hoon.";
        } catch (modelErr: any) {
          console.warn("Primary model error, attempting resilient fallback", modelErr);
          // Resilient fallback with standard gemini-3.8-flash
          const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userMsg,
            config: {
              systemInstruction: fullSystemInstruction + langInstruction,
            }
          });
          jarvisMsg = fallbackResponse.text || "Main aap ki baat samajh gayi hoon.";
        }
        
        setCurrentOutput(jarvisMsg);
        setUrfiMood(detectUrfiMood(jarvisMsg));
        setTranscriptions(prev => [
          ...prev,
          { id: Date.now() + '-u', role: 'user', text: userMsg, timestamp: Date.now() },
          { id: Date.now() + '-j', role: 'jarvis', text: jarvisMsg, timestamp: Date.now(), script: chatScriptMode, refinerMode: promptRefinerMode }
        ]);
        
        speakText(jarvisMsg);
      }

      setCurrentInput('');
      setCurrentOutput('');
    } catch (e: any) {
      console.error("Submission Error", e);
      const errStr = String(e?.message || e || '');
      if (errStr.includes('403') || errStr.includes('PERMISSION_DENIED') || errStr.includes('API_KEY_INVALID')) {
        setApiError("Gemini API permission denied. Barah-e-karam Settings mein GEMINI_API_KEY verify karein.");
      } else if (errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('429')) {
        setApiError("API Quota limit exceed ho gayi hai ya server busy hai. Thori der baad dobara koshish karein.");
      } else {
        setApiError(e?.message || "Gemini API rabte mein masla pesh aya.");
      }
      setStatus(ConnectionStatus.ERROR);
    } finally {
      setIsGenerating(false);
    }
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setApiError("Camera device is not supported in this browser context.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("Camera access denied or unavailable", err);
      setApiError("Camera ki ijazat nahi mili ya device par camera dastiyab nahi hai.");
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startScreenShare = async () => {
    // Check for browser support with potential fallbacks
    const getDisplayMedia = navigator.mediaDevices?.getDisplayMedia?.bind(navigator.mediaDevices) || 
                           (navigator as any).getDisplayMedia?.bind(navigator);

    if (!getDisplayMedia) {
      console.warn("getDisplayMedia is not supported in this browser.");
      setApiError("Screen sharing is not supported by your current browser or device.");
      return;
    }

    try {
      const stream = await getDisplayMedia({ 
        video: true,
        audio: false 
      });
      screenStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScreenSharing(true);
      setIsCameraActive(true); // Reuse the camera overlay for screen share
      
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err: any) {
      console.warn("Screen share denied or failed", err);
      if (err?.name === 'NotAllowedError') {
        // User cancelled or browser blocked
        return;
      }
      setApiError(`Screen sharing shuru nahi ho saki: ${err?.message || "Permission not granted."}`);
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    setIsCameraActive(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      const stream = isScreenSharing ? screenStreamRef.current : cameraStreamRef.current;
      if (stream) {
        const options = { mimeType: 'video/webm' };
        try {
          mediaRecorderRef.current = new MediaRecorder(stream, options);
          videoChunksRef.current = [];
          
          mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) videoChunksRef.current.push(e.data);
          };

          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
            const reader = new FileReader();
            reader.onloadend = () => {
              setAnalysisMedia({
                url: reader.result as string,
                type: 'video/webm',
                label: isScreenSharing ? 'Screen Recording' : 'Video Capture'
              });
              if (isScreenSharing) stopScreenShare();
              else stopCamera();
              setIsSidebarOpen(false);
            };
            reader.readAsDataURL(blob);
          };

          mediaRecorderRef.current.start();
          setIsRecording(true);
        } catch (e) {
          console.error("Recording failed", e);
        }
      }
    }
  };

  const captureAndAnalyze = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // If connected and setup is complete, ask Urfi to look at the frame
        if (status === ConnectionStatus.CONNECTED && isSetupCompleteRef.current && sessionRef.current) {
          const base64 = dataUrl.split(',')[1];
          try {
            sessionRef.current.sendRealtimeInput({
              video: { data: base64, mimeType: 'image/jpeg' }
            });
            // We don't stop the camera here if we're in a live session
            // Just trigger a verbal analysis request
            setCurrentInput("[High-Res Snapshot Analysis]");
          } catch (err) {
            console.warn("Snapshot send error:", err);
          }
        } else {
          // Instead of immediate analysis, we "attach" it to the input context
          setAnalysisMedia({ 
            url: dataUrl, 
            type: 'image/jpeg', 
            label: isScreenSharing ? 'Screen Capture' : 'Lens Snapshot' 
          });
          if (isScreenSharing) stopScreenShare();
          else stopCamera();
          // Notify user that it's attached
          setIsSidebarOpen(false); // Close sidebar to show the attachment UI
        }
      }
    }
  };

  const analyzeBase64 = async (input: string, mimeType: string, label: string) => {
    setIsGenerating(true);
    try {
      let base64 = input;
      // If input is a blob URL, fetch it and convert to base64
      if (input.startsWith('blob:')) {
        const response = await fetch(input);
        const blob = await response.blob();
        base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(blob);
        });
      } else if (input.includes(',')) {
        base64 = input.split(',')[1];
      }

      const apiKey = getApiKey();
      if (!apiKey) {
        setApiError("Gemini API key is required for media analysis. Please check your key in Settings.");
        setIsGenerating(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: mimeType } },
            { text: "Perform an advanced multimodal analysis. Identify all visual elements, text (OCR), emotional context, technical details, and provide a comprehensive summary. If it's a video, describe the sequence of events and key moments." }
          ]
        },
        config: {
          systemInstruction: fullSystemInstruction,
          thinkingConfig: isThinkingMode ? { thinkingBudget: 32768 } : undefined
        }
      });
      const jarvisMsg = response.text || 'Analysis complete.';
      setTranscriptions(prev => [
        ...prev,
        { id: Date.now() + '-m', role: 'user', text: `[${label}]`, timestamp: Date.now() },
        { id: Date.now() + '-j', role: 'jarvis', text: jarvisMsg, timestamp: Date.now() }
      ]);
      speakText(jarvisMsg);
      setIsSidebarOpen(true);
    } catch (e: any) {
      console.error("Analysis error", e);
      const errStr = String(e?.message || e || '');
      if (errStr.includes('403') || errStr.includes('PERMISSION_DENIED') || errStr.includes('API_KEY_INVALID')) {
        setApiError("Gemini API permission denied for multimodal analysis. Please check your key in Settings.");
      } else {
        setApiError(e?.message || "Neural link failed: analysis aborted.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async () => {
    const p = prompt("Enter image prompt for Urfi:");
    if (!p) return;
    setIsGenerating(true);
    try {
      await ensureApiKey();
      const apiKey = getApiKey();
      if (!apiKey) {
        setApiError("Gemini API key is required for image generation.");
        setIsGenerating(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image',
          contents: { parts: [{ text: p }] },
          config: { 
            imageConfig: { 
              aspectRatio: imageSettings.aspectRatio as any, 
              imageSize: imageSettings.size as any 
            } 
          },
        });
      } catch (imgErr) {
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: { parts: [{ text: p }] },
        });
      }
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setMediaGallery(prev => [{ url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, type: 'image' }, ...prev]);
          setIsSidebarOpen(true);
        }
      }
    } catch (e: any) {
      console.error("Image Gen Error", e);
      const errStr = String(e?.message || e || '');
      if (errStr.includes('403') || errStr.includes('PERMISSION_DENIED') || errStr.includes('API_KEY_INVALID')) {
        setApiError("Gemini API permission denied for image generation. Please check your API key.");
      } else {
        setApiError(e?.message || "Failed to generate image.");
      }
    }
    finally { setIsGenerating(false); }
  };

  const generateVideo = async () => {
    const p = prompt("Enter video description for Veo 3:");
    if (!p) return;
    setIsGenerating(true);
    try {
      await ensureApiKey();
      const apiKey = getApiKey();
      if (!apiKey) {
        setApiError("Gemini API key is required for video generation.");
        setIsGenerating(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: p,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: videoSettings.aspectRatio as any
        }
      });
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${apiKey}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setMediaGallery(prev => [{ url, type: 'video' }, ...prev]);
        setIsSidebarOpen(true);
      }
    } catch (e: any) {
      console.error("Video Gen Error", e);
      const errStr = String(e?.message || e || '');
      if (errStr.includes('403') || errStr.includes('PERMISSION_DENIED') || errStr.includes('API_KEY_INVALID')) {
        setApiError("Gemini API permission denied for video generation. Please check your API key.");
      } else {
        setApiError(e?.message || "Failed to synthesize video.");
      }
    }
    finally { setIsGenerating(false); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnalysisMedia({ 
          url: reader.result as string, 
          type: file.type,
          label: file.name
        });
        setEditingImage(null); // Clear editing mode if switching to analysis
      };
      reader.readAsDataURL(file);
    }
  };

  const neuralMode = useMemo<'idle' | 'listening' | 'thinking' | 'speaking'>(() => {
    if (isGenerating || status === ConnectionStatus.CONNECTING) return 'thinking';
    if (status === ConnectionStatus.CONNECTED) {
      if (currentOutput && currentOutput.trim().length > 0) return 'speaking';
      if (audioLevel > 0.04) return 'listening';
      return 'idle';
    }
    return 'idle';
  }, [isGenerating, status, currentOutput, audioLevel]);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#040711] text-slate-100 overflow-hidden font-futuristic transition-colors duration-500">
      {/* Deep Space Background with Subtle Aurora Energy Depth */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-700" 
        style={{ 
          background: 'radial-gradient(circle at 50% 32%, #0a132b 0%, #060b1b 45%, #040711 85%, #020409 100%)',
        }} 
      />
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 transition-all duration-700"
        style={{
          background: 'radial-gradient(ellipse 65% 45% at 50% 30%, rgba(0, 240, 255, 0.08) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 80%)',
        }}
      />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none transition-all duration-500" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, #00f0ff 1px, transparent 0)`, 
          backgroundSize: '48px 48px' 
        }} 
      />
      
      {/* Compact Futuristic Header */}
      <header className="px-4 py-2.5 sm:py-3 md:px-8 flex justify-between items-center z-20 bg-[#040711]/60 backdrop-blur-xl border-b border-cyan-500/10 transition-colors duration-500">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div 
              className="absolute inset-0 rounded-full blur-md animate-pulse-slow pointer-events-none"
              style={{ backgroundColor: 'rgba(0, 240, 255, 0.25)' }}
            />
            <Logo size={28} theme={currentTheme} className="relative z-10" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-[0.25em] text-white font-['Orbitron',sans-serif] select-none leading-none">
                URFI
              </h1>
              <span 
                className="text-[9px] md:text-[10px] font-mono font-semibold tracking-wider px-2 py-0.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 backdrop-blur-sm"
                title="Ilyas • Identity"
              >
                Ilyas
              </span>
            </div>
            <span className="text-[7.5px] md:text-[9px] tracking-[0.25em] font-mono text-cyan-400/80 uppercase mt-0.5 font-medium">
              FUTURISTIC VOICE AI
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2.5">
          {/* Standby Wake Word Indicator Badge */}
          {wakeWordConfig.enabled && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono tracking-wider border backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                borderColor: 'rgba(16, 185, 129, 0.35)',
                color: '#10b981',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.25)'
              }}
              title={`Wake Word active: Say "${wakeWordConfig.phrase}" to activate Urfi`}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${status === ConnectionStatus.CONNECTED ? 'hidden' : ''}`} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              <span className="truncate max-w-[110px]">Wake: "{wakeWordConfig.phrase}"</span>
            </button>
          )}

          {/* Dynamic Urfi Mood Indicator */}
          <UrfiMoodIndicator mood={urfiMood} onMoodChange={setUrfiMood} />

          {/* Quick Visual Personality Theme Switcher */}
          <ThemeQuickSwitcher currentTheme={currentTheme} onThemeChange={handleThemeChange} />
          
          {/* To-Do List & Categorized Tasks Button */}
          <button 
            id="todo-tasks-button"
            onClick={() => setIsTasksOpen(!isTasksOpen)} 
            className="p-2 transition-all rounded-full hover:bg-white/5 active:scale-95 text-slate-300 hover:text-[var(--theme-primary)] relative"
            title="To-Do List (Work, Personal, Urgent)"
          >
            <CheckSquare className="w-4 h-4 md:w-5 md:h-5" />
            {tasks.filter(t => !t.completed).length > 0 && (
              <span 
                className="absolute top-1 right-1 px-1 min-w-[14px] h-[14px] rounded-full text-[9px] font-mono font-bold flex items-center justify-center leading-none text-slate-950 shadow-sm"
                style={{ backgroundColor: THEMES[currentTheme].primaryColor }}
              >
                {tasks.filter(t => !t.completed).length}
              </span>
            )}
          </button>

          {/* Saved Notes & Ideas Button */}
          <button 
            id="notes-button"
            onClick={() => setIsNotesOpen(!isNotesOpen)} 
            className="p-2 transition-all rounded-full hover:bg-white/5 active:scale-95 text-slate-300 hover:text-[var(--theme-primary)] relative"
            title="Saved Notes & Ideas"
          >
            <FileText className="w-4 h-4 md:w-5 md:h-5" />
            {notes.length > 0 && (
              <span 
                className="absolute top-1 right-1 px-1 min-w-[14px] h-[14px] rounded-full text-[9px] font-mono font-bold flex items-center justify-center leading-none text-slate-950 shadow-sm"
                style={{ backgroundColor: THEMES[currentTheme].primaryColor }}
              >
                {notes.length}
              </span>
            )}
          </button>

          <button 
            id="settings-modal-button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
            className="p-2 transition-all rounded-full hover:bg-white/5 active:scale-95 text-slate-300 hover:text-[var(--theme-primary)]"
            title="System Settings"
          >
            <SparklesIcon />
          </button>
          <button 
            id="history-sidebar-button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 transition-all rounded-full hover:bg-white/5 active:scale-95 text-slate-300 hover:text-[var(--theme-primary)] relative"
            title="Archives & History"
          >
            <HistoryIcon />
            {transcriptions.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
            )}
          </button>
        </div>
      </header>

      {/* Offline Status Banner */}
      <OfflineStatusBanner 
        isOnline={isOnline} 
        cachedCount={transcriptions.length} 
        onRetry={() => setIsOnline(navigator.onLine)} 
      />

      {/* Wake Word Detected Notification Toast */}
      {wakeNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-950/90 border border-emerald-400/60 text-emerald-200 text-xs shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono font-bold tracking-wide">{wakeNotification}</span>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative z-10">
        {/* Microphone Permission Recovery Banner */}
        {micPermissionDenied && (
          <div 
            id="mic-permission-notice" 
            className="w-full max-w-xl mx-auto mb-4 p-4 rounded-2xl bg-amber-950/70 border border-amber-500/40 text-amber-200 backdrop-blur-md shadow-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 z-30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 mt-0.5 shrink-0">
                  <MicIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-amber-300">
                    Microphone Ki Ijazat Zaroori Hai
                  </h4>
                  <p className="text-[11px] text-amber-100/90 font-mono mt-1 leading-relaxed">
                    Browser ne microphone ki ijazat rok di hai. Address bar (URL) ke sath <strong className="text-white">🔒 Lock / Settings</strong> icon par click karke Microphone ko <span className="text-emerald-300 font-bold">"Allow"</span> karein.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setMicPermissionDenied(false)} 
                className="text-amber-400/70 hover:text-amber-200 transition-colors p-1"
                title="Dismiss"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20 flex-wrap">
              <button 
                onClick={() => {
                  setMicPermissionDenied(false);
                  connect();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400/50 text-[11px] font-mono font-bold text-amber-100 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <SparklesIcon className="w-3.5 h-3.5" />
                Dobara Koshish Karein (Retry Mic)
              </button>
              <button 
                onClick={() => {
                  setMicPermissionDenied(false);
                  setApiError(null);
                  const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (inputEl) inputEl.focus();
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/40 text-[11px] font-mono font-bold text-cyan-200 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                Text Chat Mode (URFI Awaz Se Jawab Degi)
              </button>
            </div>
          </div>
        )}

        {apiError && !micPermissionDenied && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-30 flex items-center justify-between gap-3 p-3 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs backdrop-blur-md shadow-xl animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
              <span className="font-mono text-[11px] leading-tight">{apiError}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={ensureApiKey} 
                className="px-2.5 py-1 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-[10px] uppercase font-bold tracking-wider text-white border border-red-400/40 transition-colors"
              >
                Configure
              </button>
              <button 
                onClick={() => setApiError(null)} 
                className="p-1 rounded-md text-red-400 hover:text-white transition-colors"
                title="Dismiss"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Central Neural AI Core */}
        <div 
          id="neural-core-activation-target"
          className="relative group cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]" 
          onClick={() => (status === ConnectionStatus.CONNECTED ? disconnect() : connect())}
          title={status === ConnectionStatus.CONNECTED ? "URFI Neural Core Active (Tap to disconnect)" : "Tap to activate URFI Voice AI"}
        >
          <NeuralCore 
            isActive={status === ConnectionStatus.CONNECTED} 
            status={status} 
            audioLevel={audioLevel} 
            theme={currentTheme}
            mode={neuralMode}
            mood={urfiMood}
          />
          {(isCameraActive || isScreenSharing) && status === ConnectionStatus.CONNECTED && (
            <div 
              className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full animate-pulse border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 backdrop-blur-md"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-[8px] md:text-[9px] font-mono font-bold tracking-widest uppercase">Vision Active</span>
            </div>
          )}
        </div>

        {/* Dynamic Spoken Output / Status Area */}
        <div className="w-full max-w-2xl min-h-[4.5rem] md:min-h-[5.5rem] flex flex-col items-center justify-center text-center px-4 mt-3 overflow-hidden">
          {currentOutput ? (
            <HighlightingText text={currentOutput} />
          ) : currentInput ? (
            <p className="text-cyan-300/80 text-base md:text-xl font-mono italic">"{currentInput}"</p>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <p className="text-[10px] sm:text-xs tracking-[0.25em] md:tracking-[0.35em] uppercase font-mono font-medium text-cyan-400/75">
                {status === ConnectionStatus.CONNECTED 
                  ? (neuralMode === 'listening' ? 'Listening to your voice...' : 'Neural Core Active') 
                  : (status === ConnectionStatus.CONNECTING ? 'Connecting Neural Core...' : 'Tap mic or core to begin')}
              </p>
              <div className="flex gap-1.5">
                {[1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-cyan-400/40 animate-pulse" 
                    style={{ animationDelay: `${i * 0.2}s` }} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Camera Preview Overlay */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex justify-between items-center p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-cyan-400 font-bold tracking-widest text-sm uppercase">{isScreenSharing ? 'SCREEN INTERFACE' : 'LENS INTERFACE'}</span>
              {isRecording && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 font-bold tracking-widest text-[10px] uppercase">REC</span>
                </div>
              )}
            </div>
            <button onClick={isScreenSharing ? stopScreenShare : stopCamera} disabled={isRecording} className="p-2 text-slate-400 hover:text-white disabled:opacity-50"><StopIcon /></button>
          </div>
          <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${isScreenSharing ? '' : 'grayscale opacity-80'}`} />
            {!isScreenSharing && (
              <div className="absolute inset-0 pointer-events-none border-[1px] border-cyan-500/20 flex items-center justify-center">
                <div className="w-48 h-48 border border-cyan-500/40 rounded-full opacity-40 animate-pulse" />
                <div className="absolute top-4 left-4 border-t-2 border-l-2 border-cyan-500 w-8 h-8 opacity-60" />
                <div className="absolute top-4 right-4 border-t-2 border-r-2 border-cyan-500 w-8 h-8 opacity-60" />
                <div className="absolute bottom-4 left-4 border-b-2 border-l-2 border-cyan-500 w-8 h-8 opacity-60" />
                <div className="absolute bottom-4 right-4 border-b-2 border-r-2 border-cyan-500 w-8 h-8 opacity-60" />
              </div>
            )}
          </div>
          <div className="p-8 bg-slate-900/80 backdrop-blur-md flex justify-center">
            <div className="flex gap-4">
              <button 
                onClick={captureAndAnalyze}
                disabled={isRecording}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyan-500 flex items-center justify-center border-4 border-white/20 hover:scale-105 active:scale-90 transition-all shadow-lg shadow-cyan-500/50 disabled:opacity-50"
                title="Take Image Snapshot"
              >
                {isScreenSharing ? <ScreenShareIcon /> : <CameraIcon />}
              </button>
              <button 
                onClick={toggleRecording}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 border-white/20 hover:scale-105 active:scale-90 transition-all shadow-lg ${isRecording ? 'bg-red-500 shadow-red-500/50 animate-pulse' : 'bg-purple-500 shadow-purple-500/50'}`}
                title="Record Video"
              >
                {isRecording ? <StopIcon /> : <VideoIcon />}
              </button>
            </div>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="absolute bottom-24 md:bottom-32 left-1/2 -translate-x-1/2 w-[92%] max-w-md glass-panel p-0 rounded-3xl z-30 animate-in slide-in-from-bottom-4 flex flex-col max-h-[60vh] md:max-h-[70vh] shadow-2xl border border-[var(--theme-border)] overflow-hidden">
          <div className="p-4 md:p-5 border-b border-white/10 flex justify-between items-center bg-slate-950/40">
            <h2 className="text-xs md:text-sm font-bold tracking-[0.2em] uppercase" style={{ color: THEMES[currentTheme].primaryColor }}>Neural Configuration</h2>
            <button onClick={() => setIsSettingsOpen(false)} className="p-1 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
              <XIcon />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-8 no-scrollbar scroll-smooth">
            {/* Visual Personality & Theme Switcher */}
            <ThemeSettingsSection currentTheme={currentTheme} onThemeChange={handleThemeChange} />

            {/* Chat Response Script: Roman Urdu vs Native Urdu Script (Nastaliq font) */}
            <ChatScriptSettingsSection 
              scriptMode={chatScriptMode} 
              onChangeScriptMode={handleChatScriptModeChange} 
              currentTheme={currentTheme} 
            />

            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: THEMES[currentTheme].primaryColor }} />
                <h3 className="text-[10px] md:text-xs tracking-widest uppercase font-bold" style={{ color: THEMES[currentTheme].primaryColor }}>User Profile</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] text-cyan-500/60 uppercase font-bold mb-1 block">Your Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      localStorage.setItem('urfi_userName', e.target.value);
                    }}
                    placeholder="e.g. Tony Stark"
                    className="w-full bg-slate-950/50 border border-cyan-500/20 rounded-xl p-2.5 text-[10px] md:text-xs font-mono text-cyan-100/80 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-cyan-500/60 uppercase font-bold mb-1 block">Daily Briefing Preferences</label>
                  <textarea
                    value={userPreference}
                    onChange={(e) => {
                      setUserPreference(e.target.value);
                      localStorage.setItem('urfi_preference', e.target.value);
                    }}
                    placeholder="e.g. Tech news, AI research, space exploration..."
                    className="w-full h-16 bg-slate-950/50 border border-cyan-500/20 rounded-xl p-2.5 text-[10px] md:text-xs font-mono text-cyan-100/80 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Gemini API & Permissions Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                <h3 className="text-[10px] md:text-xs text-cyan-400 tracking-widest uppercase font-bold">Gemini API & Permissions</h3>
              </div>
              <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-cyan-500/80 uppercase font-bold tracking-wider">Access Authorization</span>
                  {getApiKey() ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono font-bold">
                      <ShieldCheckIcon /> GRANTED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-mono font-bold">
                      <AlertCircleIcon /> KEY REQUIRED
                    </span>
                  )}
                </div>

                <div className="text-[9px] text-slate-400 font-mono space-y-1 bg-black/40 p-2.5 rounded-xl border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-cyan-400/80">Live WebSocket:</span>
                    <span className="text-slate-200">gemini-3.1-flash-live</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-400/80">Reasoning Core:</span>
                    <span className="text-slate-200">gemini-3.1-pro</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-400/80">Visual Intelligence:</span>
                    <span className="text-slate-200">gemini-3.1-flash</span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await ensureApiKey();
                    if (getApiKey()) setApiError(null);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-[10px] uppercase font-bold tracking-wider text-cyan-300 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <SparklesIcon /> Select / Verify API Key
                </button>
              </div>
            </section>

            {/* Smart Prompt Refiner: Concise vs Detailed response modes */}
            <SmartPromptRefinerSection
              mode={promptRefinerMode}
              onModeChange={handlePromptRefinerChange}
              systemPrompt={systemPrompt}
              currentTheme={currentTheme}
            />

            {/* System Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                  <h3 className="text-[10px] md:text-xs text-cyan-400 tracking-widest uppercase font-bold">Core Personality</h3>
                </div>
                <button 
                  onClick={() => setSystemPrompt(applyPromptRefiner(INITIAL_PROMPT, promptRefinerMode))}
                  className="text-[8px] md:text-[9px] text-cyan-500/60 hover:text-cyan-400 transition-colors uppercase font-bold active:scale-95"
                >
                  Reset to Default
                </button>
              </div>
              <textarea 
                value={systemPrompt} 
                onChange={(e) => setSystemPrompt(e.target.value)} 
                placeholder="Define Urfi's personality..." 
                className="w-full h-24 md:h-32 bg-slate-950/50 border border-cyan-500/20 rounded-xl p-3 text-[10px] md:text-xs font-mono text-cyan-100/80 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none shadow-inner" 
              />
            </section>

            {/* Voice Selection Section (Gemini Live API) */}
            <VoiceSelectionSection
              selectedVoice={selectedVoice}
              onSelectVoice={(voice) => {
                setSelectedVoice(voice);
              }}
              apiKey={getApiKey()}
              onDisconnectLive={disconnect}
              language={language === 'ur' ? 'ur' : 'roman-ur'}
              pitch={voicePitch}
              onPitchChange={handleVoicePitchChange}
            />

            {/* Wake Word Configuration Section */}
            <WakeWordSettingsSection
              config={wakeWordConfig}
              onChangeConfig={handleWakeWordConfigChange}
              isListeningNow={wakeWordStatus === 'listening'}
              language={language === 'ur' ? 'ur' : 'roman-ur'}
            />

            {/* Visual Configuration Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                <h3 className="text-[10px] md:text-xs text-cyan-400 tracking-widest uppercase font-bold">Visual Configuration</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[8px] md:text-[9px] text-cyan-500/60 uppercase font-bold mb-2 block">Image Aspect Ratio</label>
                  <div className="flex gap-2">
                    {['1:1', '4:3', '16:9', '9:16'].map(ratio => (
                      <button 
                        key={ratio} 
                        onClick={() => setImageSettings(prev => ({ ...prev, aspectRatio: ratio }))}
                        className={`flex-1 py-1.5 rounded-lg border border-cyan-500/20 text-[9px] transition-all ${imageSettings.aspectRatio === ratio ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-sm' : 'text-cyan-100/40 hover:bg-cyan-500/5'}`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[8px] md:text-[9px] text-cyan-500/60 uppercase font-bold mb-2 block">Video Synthesis Format</label>
                  <div className="flex gap-2">
                    {['16:9', '9:16'].map(ratio => (
                      <button 
                        key={ratio} 
                        onClick={() => setVideoSettings(prev => ({ ...prev, aspectRatio: ratio }))}
                        className={`flex-1 py-1.5 rounded-lg border border-cyan-500/20 text-[9px] transition-all ${videoSettings.aspectRatio === ratio ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-sm' : 'text-cyan-100/40 hover:bg-cyan-500/5'}`}
                      >
                        {ratio === '16:9' ? 'Landscape' : 'Portrait'} ({ratio})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Advanced Section */}
            <section className="pt-4 border-t border-cyan-500/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-cyan-400 font-bold uppercase tracking-widest">Language</span>
                  <span className="text-[8px] text-cyan-500/40">Switch between English and Urdu</span>
                </div>
                <button 
                  onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
                  className="px-3 py-1 rounded-full bg-slate-800 text-cyan-400 text-[10px] uppercase font-bold"
                >
                  {language === 'en' ? 'English' : 'Urdu (اردو)'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-cyan-400 font-bold uppercase tracking-widest">Text Response Script</span>
                  <span className="text-[8px] text-cyan-500/40">Roman Urdu vs Native Nastaliq Urdu font</span>
                </div>
                <button 
                  onClick={() => handleChatScriptModeChange(chatScriptMode === 'roman' ? 'nastaliq' : 'roman')}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                    chatScriptMode === 'nastaliq'
                      ? 'bg-violet-500/30 text-violet-200 border border-violet-500/50 font-nastaliq'
                      : 'bg-slate-800 text-cyan-400 font-mono'
                  }`}
                >
                  {chatScriptMode === 'nastaliq' ? 'نستعلیق رسم الخط' : 'Roman Urdu'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-cyan-400 font-bold uppercase tracking-widest">Text-to-Speech</span>
                  <span className="text-[8px] text-cyan-500/40">Urfi will speak text responses</span>
                </div>
                <button 
                  onClick={() => setUseTTS(!useTTS)}
                  className={`w-10 h-5 rounded-full transition-all relative ${useTTS ? 'bg-cyan-500' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${useTTS ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-cyan-400 font-bold uppercase tracking-widest">Deep Thinking Mode</span>
                  <span className="text-[8px] text-cyan-500/40">Enhanced reasoning capabilities</span>
                </div>
                <button 
                  onClick={() => setIsThinkingMode(!isThinkingMode)}
                  className={`w-10 h-5 rounded-full transition-all relative ${isThinkingMode ? 'bg-cyan-500' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isThinkingMode ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </section>

            {/* Data Backup & Restore Section */}
            <BackupRestoreSection
              notes={notes}
              tasks={tasks}
              onRestoreData={handleRestoreData}
              language={language === 'ur' ? 'ur' : 'en'}
            />
          </div>
          
          <div className="p-4 bg-cyan-500/5 border-t border-cyan-500/10 flex justify-center">
            <p className="text-[8px] text-cyan-500/30 font-mono tracking-widest uppercase">Urfi Neural Core v2.4.0</p>
          </div>
        </div>
      )}

      {/* To-Do List & Categorized Tasks Modal */}
      {isTasksOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-3xl max-h-[85vh] rounded-3xl border border-[var(--theme-border)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <div 
                  className="p-2 rounded-xl text-slate-950 font-bold"
                  style={{ backgroundColor: THEMES[currentTheme].primaryColor }}
                >
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase" style={{ color: THEMES[currentTheme].primaryColor }}>
                    TO-DO TASKS & CATEGORIES
                  </h2>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Work, Personal, and Urgent color-coded tags
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsTasksOpen(false)} 
                className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close To-Do List"
              >
                <XIcon />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 no-scrollbar">
              <TasksView
                tasks={tasks}
                onTasksChange={handleTasksChange}
                onClose={() => setIsTasksOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Saved Notes & Ideas Modal */}
      {isNotesOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-3xl max-h-[85vh] rounded-3xl border border-[var(--theme-border)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <div 
                  className="p-2 rounded-xl text-slate-950 font-bold"
                  style={{ backgroundColor: THEMES[currentTheme].primaryColor }}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase" style={{ color: THEMES[currentTheme].primaryColor }}>
                    SAVED NOTES & IDEAS
                  </h2>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Urfi Personal Notebook & Idea Archive
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsNotesOpen(false)} 
                className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close Notes"
              >
                <XIcon />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 no-scrollbar">
              <NotesView
                notes={notes}
                onNotesChange={handleNotesChange}
                onClose={() => setIsNotesOpen(false)}
                profile={{
                  name: 'Ilyas',
                  language: language === 'ur' ? 'ur' : 'en',
                  voice: selectedVoice,
                  theme: currentTheme,
                  favoriteTopics: [],
                }}
              />
            </div>
          </div>
        </div>
      )}

      <footer className="p-3 sm:p-4 md:px-8 md:pb-6 flex flex-col items-center gap-3 z-20 w-full bg-[#040711]/75 backdrop-blur-xl border-t border-cyan-500/10">
        {/* Analysis Context UI */}
        {analysisMedia && (
          <div className="w-full max-w-2xl mb-[-8px] animate-in fade-in slide-in-from-bottom-2">
            <div className="backdrop-blur-md bg-[#070e24]/90 p-2 pl-3 rounded-t-2xl border border-b-0 border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg overflow-hidden border border-cyan-500/30 bg-black">
                  {analysisMedia.type.startsWith('video') ? (
                    <video src={analysisMedia.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={analysisMedia.url} className="w-full h-full object-cover" />
                  )}
                </div>
                <span className="text-[9px] md:text-[10px] text-cyan-300 font-mono font-medium uppercase tracking-wider">
                  {analysisMedia.label || 'Media Analysis Active'}
                </span>
              </div>
              <button onClick={() => setAnalysisMedia(null)} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Editing Context UI */}
        {editingImage && (
          <div className="w-full max-w-2xl mb-[-8px] animate-in fade-in slide-in-from-bottom-2">
            <div className="backdrop-blur-md bg-[#070e24]/90 p-2 pl-3 rounded-t-2xl border border-b-0 border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg overflow-hidden border border-cyan-500/30">
                  <img src={editingImage} className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] md:text-[10px] text-cyan-300 font-mono font-medium uppercase tracking-wider">
                  Image Reconstruction Mode
                </span>
              </div>
              <button onClick={() => setEditingImage(null)} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions Bar (Search, Location, Camera, Image, Voice) */}
        <div className="w-full max-w-xl flex items-center justify-between sm:justify-center sm:gap-2 px-2 py-1.5 rounded-full backdrop-blur-md bg-[#070d20]/60 border border-cyan-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          {/* 1. Search */}
          <button
            onClick={() => { setUseSearch(!useSearch); disconnect(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono transition-all active:scale-95 ${
              useSearch 
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.25)]' 
                : 'text-slate-400 hover:text-cyan-300 hover:bg-white/[0.04]'
            }`}
            title="Search the Web"
          >
            <SearchIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* 2. Location */}
          <button
            onClick={() => { setUseMaps(!useMaps); disconnect(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono transition-all active:scale-95 ${
              useMaps 
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.25)]' 
                : 'text-slate-400 hover:text-cyan-300 hover:bg-white/[0.04]'
            }`}
            title="Location & Maps Grounding"
          >
            <MapsIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Location</span>
          </button>

          {/* 3. Camera */}
          <button
            onClick={startCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono text-slate-400 hover:text-cyan-300 hover:bg-white/[0.04] transition-all active:scale-95"
            title="Camera Vision"
          >
            <CameraIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Camera</span>
          </button>

          {/* 4. Image */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono text-slate-400 hover:text-cyan-300 hover:bg-white/[0.04] transition-all active:scale-95"
            title="Upload Image"
          >
            <ImagePlusIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Image</span>
          </button>
          <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={handleFileUpload} />

          {/* 5. Voice */}
          <button
            onClick={status === ConnectionStatus.CONNECTED ? disconnect : connect}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono transition-all active:scale-95 ${
              status === ConnectionStatus.CONNECTED 
                ? 'bg-violet-500/30 text-violet-200 border border-violet-400/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]' 
                : 'text-slate-400 hover:text-cyan-300 hover:bg-white/[0.04]'
            }`}
            title="Toggle Voice Mode"
          >
            <MicIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voice</span>
          </button>

          {/* 6. Response Script Switcher (Roman Urdu / Nastaliq) */}
          <button
            onClick={() => handleChatScriptModeChange(chatScriptMode === 'roman' ? 'nastaliq' : 'roman')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] transition-all active:scale-95 cursor-pointer ${
              chatScriptMode === 'nastaliq'
                ? 'bg-violet-500/30 text-violet-200 border border-violet-400/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-white/[0.04] font-mono'
            }`}
            title={chatScriptMode === 'nastaliq' ? 'Response Script: Native Urdu (Nastaliq). Click to switch to Roman Urdu.' : 'Response Script: Roman Urdu. Click to switch to Nastaliq.'}
          >
            <span className={chatScriptMode === 'nastaliq' ? 'font-nastaliq text-xs font-bold leading-none' : 'font-mono text-xs font-bold'}>
              {chatScriptMode === 'nastaliq' ? 'ن' : 'Aa'}
            </span>
            <span className="hidden sm:inline">
              {chatScriptMode === 'nastaliq' ? 'نستعلیق' : 'Roman'}
            </span>
          </button>

          {/* 7. Smart Prompt Refiner Switcher (Concise / Detailed) */}
          <button
            onClick={() => handlePromptRefinerChange(promptRefinerMode === 'concise' ? 'detailed' : 'concise')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] transition-all active:scale-95 cursor-pointer font-mono ${
              promptRefinerMode === 'detailed'
                ? 'bg-violet-500/30 text-violet-200 border border-violet-400/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
            }`}
            title={promptRefinerMode === 'concise' 
              ? 'Smart Prompt Refiner: Concise Mode (~2-4 lines). Click to switch to Detailed Mode.' 
              : 'Smart Prompt Refiner: Detailed Mode (In-depth explanations). Click to switch to Concise Mode.'}
          >
            {promptRefinerMode === 'concise' ? (
              <Zap className="w-3 h-3 text-cyan-300" />
            ) : (
              <BookOpen className="w-3 h-3 text-violet-300" />
            )}
            <span className="hidden sm:inline">
              {promptRefinerMode === 'concise' ? 'Concise' : 'Detailed'}
            </span>
          </button>
        </div>

        {/* Input Bar & Voice Button */}
        <div className="w-full max-w-2xl flex items-center gap-3">
          {/* Rounded Glass Input Bar */}
          <div className={`flex-1 flex items-center gap-2.5 backdrop-blur-xl bg-[#060c1f]/75 border border-cyan-500/20 focus-within:border-cyan-400/60 transition-all rounded-full px-4 py-2 sm:py-2.5 shadow-lg ${editingImage || analysisMedia ? 'rounded-t-none border-t-0' : ''}`}>
            <input 
              type="text" 
              value={textInput} 
              onChange={(e) => setTextInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()} 
              placeholder={chatScriptMode === 'nastaliq' ? 'عُرفی سے پوچھیں (Urdu / Roman)...' : 'Ask Ilyas / Baat karein...'} 
              className={`flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-slate-100 placeholder:text-slate-400/80 tracking-wide ${isUrdu(textInput) ? 'font-nastaliq text-right' : 'font-sans'}`}
              dir={isUrdu(textInput) ? 'rtl' : 'ltr'} 
            />
            <button 
              onClick={handleTextSubmit} 
              disabled={(!textInput.trim() && !analysisMedia) || isGenerating} 
              className="p-1.5 sm:p-2 rounded-full transition-all disabled:opacity-20 active:scale-90 text-cyan-300 hover:bg-cyan-500/15"
              title="Send Message"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Large Circular Microphone Button with Cyan Glow & Audio Wave Animation */}
          <button 
            id="main-mic-connect-button"
            onClick={status === ConnectionStatus.CONNECTED ? disconnect : connect} 
            className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full flex items-center justify-center transition-all duration-500 active:scale-90 relative ${
              status === ConnectionStatus.CONNECTED 
                ? 'bg-cyan-500/20 border-2 border-cyan-300 text-cyan-200 shadow-[0_0_25px_rgba(0,240,255,0.55)]' 
                : 'bg-white/[0.03] backdrop-blur-md border border-cyan-500/25 hover:border-cyan-400/70 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.15)] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]'
            }`}
            title={status === ConnectionStatus.CONNECTED ? "Stop Voice Link" : "Activate Voice Link"}
          >
            {status === ConnectionStatus.CONNECTED ? (
              <div className="flex items-center justify-center gap-1">
                {[8, 16, 22, 14, 9].map((h, i) => (
                  <span 
                    key={i} 
                    className="w-0.5 sm:w-1 bg-cyan-300 rounded-full animate-pulse"
                    style={{ 
                      height: `${Math.max(6, (audioLevel > 0 ? audioLevel * 30 : h))}px`,
                      animationDuration: `${0.6 + i * 0.15}s`,
                      animationDelay: `${i * 0.1}s`
                    }} 
                  />
                ))}
              </div>
            ) : (
              <MicIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
            {status === ConnectionStatus.CONNECTED && (
              <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping pointer-events-none" />
            )}
          </button>
        </div>
      </footer>

      <aside className={`fixed inset-y-0 right-0 w-full sm:w-96 glass-panel z-40 transform transition-transform duration-500 border-l border-[var(--theme-border)] shadow-2xl ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center bg-slate-950/40 backdrop-blur-md">
            <h2 className="tracking-[0.2em] md:tracking-[0.3em] font-bold text-xs md:text-sm" style={{ color: THEMES[currentTheme].primaryColor }}>SYSTEM ARCHIVES</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors active:scale-90">
              <XIcon />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 no-scrollbar">
            {mediaGallery.length > 0 && (
              <section>
                <h3 className="text-[9px] md:text-[10px] text-cyan-500/60 uppercase tracking-widest mb-3 md:mb-4 font-bold font-mono">RECONSTRUCTIONS</h3>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {mediaGallery.map((item, i) => (
                    <div key={i} className="relative group overflow-hidden rounded-xl border border-cyan-500/20 shadow-lg bg-slate-950">
                      {item.type === 'image' ? (
                        <div className="relative group cursor-pointer">
                          <img src={item.url} className="w-full aspect-square object-cover transition-transform group-hover:scale-110" />
                          <div className="absolute inset-0 bg-cyan-500/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingImage(item.url); setIsSidebarOpen(false); }}
                              className="w-full py-1.5 bg-slate-950 text-cyan-400 rounded-lg font-bold text-[8px] md:text-[10px] flex items-center justify-center gap-1 md:gap-2 hover:bg-cyan-400 hover:text-slate-950 transition-all active:scale-95"
                            >
                              <EditIcon /> RECONSTRUCT
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); analyzeBase64(item.url, item.type === 'image' ? 'image/jpeg' : 'video/mp4', 'Gallery Analysis'); }}
                              className="w-full py-1.5 bg-slate-950 text-cyan-400 rounded-lg font-bold text-[8px] md:text-[10px] flex items-center justify-center gap-1 md:gap-2 hover:bg-cyan-400 hover:text-slate-950 transition-all active:scale-95"
                            >
                              <SearchIcon /> ANALYZE
                            </button>
                          </div>
                        </div>
                      ) : <video src={item.url} controls className="w-full aspect-video object-cover" />}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {/* Quick To-Do Tasks Widget in Sidebar */}
            <section className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-200">
                    TO-DO TASKS ({tasks.filter(t => !t.completed).length})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsTasksOpen(true);
                    setIsSidebarOpen(false);
                  }}
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                >
                  Open Manager →
                </button>
              </div>

              {/* Tag Badges Counts */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  Urgent: {tasks.filter(t => !t.completed && (t.category || '').toLowerCase().includes('urgent')).length}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Work: {tasks.filter(t => !t.completed && ((t.category || '').toLowerCase() === 'work' || !String(t.category || '').match(/urgent|personal|ذاتی|فوری/i))).length}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Personal: {tasks.filter(t => !t.completed && (t.category || '').toLowerCase().includes('personal')).length}
                </span>
              </div>
            </section>

            {/* Quick Notes & Backup Data Widget in Sidebar */}
            <section className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-200">
                    NOTES & BACKUP
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsNotesOpen(true);
                    setIsSidebarOpen(false);
                  }}
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                >
                  View Notes ({notes.length}) →
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-[9px] font-mono text-slate-400">
                  {notes.length} Notes • {tasks.length} Tasks
                </span>
                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setIsSidebarOpen(false);
                  }}
                  className="px-2 py-0.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[9px] font-mono text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Database className="w-3 h-3" />
                  <span>Backup/Restore</span>
                </button>
              </div>
            </section>

            <section className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-[9px] md:text-[10px] text-cyan-500/60 uppercase tracking-widest font-bold font-mono">
                  LOGS ({transcriptions.length})
                </h3>
                <span className="text-[9px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Offline Saved
                </span>
              </div>
              {transcriptions.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs font-mono">
                  Abhi tak koi baatcheet record nahi hui.
                </div>
              ) : (
                transcriptions.map((msg) => {
                  const isMsgUrdu = isUrdu(msg.text) || msg.script === 'nastaliq';
                  return (
                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-center gap-1.5 mb-1 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className={`text-[8px] md:text-[9px] uppercase font-bold font-mono ${msg.role === 'user' ? 'text-slate-500' : 'text-cyan-400'}`}>
                          {msg.role === 'user' ? (userName || 'USER') : 'URFI (Ilyas)'}
                        </span>
                        {msg.role !== 'user' && (
                          <>
                            <span 
                              className={`text-[8px] px-1.5 py-0.5 rounded border transition-all ${
                                isMsgUrdu 
                                  ? 'bg-violet-500/15 text-violet-300 border-violet-500/30 font-nastaliq leading-none' 
                                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20 font-mono'
                              }`}
                            >
                              {isMsgUrdu ? 'نستعلیق' : 'Roman'}
                            </span>
                            {msg.refinerMode && (
                              <span 
                                className={`text-[8px] px-1.5 py-0.5 rounded border transition-all font-mono ${
                                  msg.refinerMode === 'concise'
                                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                                    : 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                                }`}
                              >
                                {msg.refinerMode === 'concise' ? '⚡ Concise' : '📖 Detailed'}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <div 
                        dir={isMsgUrdu ? 'rtl' : 'ltr'}
                        className={`p-3 md:p-4 rounded-2xl leading-relaxed max-w-[90%] md:max-w-[95%] shadow-md transition-all ${
                          isMsgUrdu 
                            ? 'urdu-bubble-nastaliq text-sm sm:text-base' 
                            : 'roman-bubble-script text-xs md:text-sm font-mono'
                        } ${
                          msg.role === 'user' 
                            ? 'bg-slate-900 text-slate-400 rounded-tr-none' 
                            : 'bg-cyan-950/20 text-cyan-100 border border-cyan-500/10 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={transcriptionEndRef} />
            </section>
          </div>
        </div>
      </aside>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" onClick={() => setIsSidebarOpen(false)} />}
      
      {showOnboarding && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 md:p-8 rounded-3xl shadow-2xl border border-cyan-500/30 flex flex-col gap-6 animate-in slide-in-from-bottom-8">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-2 border border-cyan-500/30">
                <SparklesIcon />
              </div>
              <h2 className="text-xl md:text-2xl text-cyan-400 font-bold tracking-widest uppercase">Welcome to Urfi</h2>
              <p className="text-xs md:text-sm text-cyan-100/60 font-mono">Your Intelligent Synthetic Responsive Assistant</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] md:text-xs text-cyan-500/60 uppercase font-bold mb-2 block">How should I address you?</label>
                <input
                  type="text"
                  value={onboardingNameInput}
                  onChange={(e) => setOnboardingNameInput(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
                  className="w-full bg-slate-950/50 border border-cyan-500/20 rounded-xl p-3 text-sm font-mono text-cyan-100/80 focus:outline-none focus:border-cyan-500/80 transition-colors shadow-inner"
                />
              </div>
              <div>
                <label className="text-[10px] md:text-xs text-cyan-500/60 uppercase font-bold mb-2 block">What do you want briefings on?</label>
                <textarea
                  value={onboardingPrefInput}
                  onChange={(e) => setOnboardingPrefInput(e.target.value)}
                  placeholder="e.g. AI research, global news, specific hobbies..."
                  className="w-full h-24 bg-slate-950/50 border border-cyan-500/20 rounded-xl p-3 text-sm font-mono text-cyan-100/80 focus:outline-none focus:border-cyan-500/80 transition-colors resize-none shadow-inner"
                />
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.setItem('urfi_userName', onboardingNameInput);
                localStorage.setItem('urfi_preference', onboardingPrefInput);
                setUserName(onboardingNameInput);
                setUserPreference(onboardingPrefInput);
                setShowOnboarding(false);
              }}
              className="w-full py-4 rounded-xl bg-cyan-500 text-slate-950 font-bold uppercase tracking-widest text-sm hover:bg-cyan-400 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-cyan-500/20"
            >
              Initialize Neural Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
