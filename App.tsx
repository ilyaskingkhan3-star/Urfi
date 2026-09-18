
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, GenerateContentResponse } from '@google/genai';
import { ConnectionStatus, Message } from './types';
import { createBlob, decode, decodeAudioData, encode } from './services/audioUtils';
import NeuralCore from './components/NeuralCore';
import Logo from './components/Logo';
import { ThemeId, THEMES, getStoredTheme, saveStoredTheme, applyThemeToDocument } from './services/theme';
import { ThemeQuickSwitcher, ThemeSettingsSection } from './components/ThemeSwitcher';

// --- Icons ---
const ScreenShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3"/><path d="M12 21v-4"/><path d="m17 2 5 5-5 5"/><path d="M22 7h-9"/></svg>;
const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;
const ImagePlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><path d="M16 5h6"/><path d="M19 2v6"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const MapsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>;
const AlertCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>;

const INITIAL_PROMPT = `You are Urfi, the personal AI assistant of the user. You are a warm, polite, respectful, and intelligent female assistant. You can search the web, access maps, and analyze media.

MANDATORY ROMAN URDU CONVERSATION RULES:
1. Mere har sawal ka jawab Roman Urdu mein dein.
2. Urdu ke alfaaz English letters/alphabets mein likhein (Roman Urdu).
3. Simple aur easy Roman Urdu use karein jo asani se samajh aye.
4. Agar user Urdu script (اردو) mein likhein ya bolein, tab bhi jawab Roman Urdu mein dein.
5. English words sirf tab use karein jab bohot zaroori hon (jaise technical terms ya names).
6. Tone friendly, polite, respectful aur natural rakhein.
7. Jawab clear aur samajhne mein easy hon.
8. Agar kisi cheez ko samjhane ki zaroorat ho to simple examples dein.
9. Jab tak user khud English mein jawab na maangein, full English mein jawab na dein.
10. Conversation ko hamesha natural aur friendly rakhein.`;

const LIVE_VOICES = ['Charon', 'Fenrir', 'Kore', 'Puck', 'Zephyr'];

const isUrdu = (text: string) => /[\u0600-\u06FF]/.test(text);

// --- Components ---
const HighlightingText: React.FC<{ text: string }> = ({ text }) => {
  const words = useMemo(() => text.split(/\s+/), [text]);
  return (
    <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 max-w-lg">
      {words.map((word, i) => (
        <span 
          key={i} 
          className={`word-highlight text-lg md:text-2xl font-medium ${i === words.length - 1 ? 'active' : 'opacity-80'}`}
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
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(getStoredTheme);

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
  const [systemPrompt, setSystemPrompt] = useState(INITIAL_PROMPT);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
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
    return `${systemPrompt}${userName ? ` The user's name is ${userName}. Greet them by name.` : ''}${userPreference ? ` The user likes/prefers: ${userPreference}. Incorporate this into your responses when appropriate.` : ''}`;
  }, [systemPrompt, userName, userPreference]);

  // Audio, API, & Video Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const micStreamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
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

  const startVideoLoop = useCallback(() => {
    if (videoLoopRef.current) return;
    
    const captureFrame = () => {
      if (!sessionRef.current || !videoRef.current || (!isCameraActive && !isScreenSharing)) {
        stopVideoLoop();
        return;
      }

      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      // Scale down for performance
      const scale = 0.5;
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        sessionRef.current.sendRealtimeInput({
          video: { data: base64, mimeType: 'image/jpeg' }
        });
      }
      
      videoLoopRef.current = requestAnimationFrame(captureFrame);
    };

    videoLoopRef.current = requestAnimationFrame(captureFrame);
  }, [isCameraActive, isScreenSharing]);

  const stopVideoLoop = useCallback(() => {
    if (videoLoopRef.current) {
      cancelAnimationFrame(videoLoopRef.current);
      videoLoopRef.current = null;
    }
  }, []);

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
        source.connect(ctx.destination);
        source.addEventListener('ended', () => sourcesRef.current.delete(source));
        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
        sourcesRef.current.add(source);
      }
    } catch (e) {
      console.error("TTS error", e);
    }
  };

  const disconnect = useCallback(() => {
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(track => track.stop()); micStreamRef.current = null; }
    stopAllAudio();
    setStatus(ConnectionStatus.DISCONNECTED);
  }, []);

  const connect = async () => {
    try {
      setApiError(null);
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

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        callbacks: {
          onopen: () => {
            setStatus(ConnectionStatus.CONNECTED);
            setApiError(null);
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Calculate RMS for audio level
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setAudioLevel(Math.min(rms * 10, 1)); // Scale for visual effect

              const pcmBlob = createBlob(inputData);
              sessionPromise.then(s => s.sendRealtimeInput({ audio: pcmBlob })).catch(() => {});
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
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
              setCurrentOutput(prev => prev + (message.serverContent?.outputTranscription?.text || ''));
            }
            if (message.serverContent?.turnComplete) {
              setTranscriptions(prev => [
                ...prev,
                { id: Date.now() + '-u', role: 'user', text: currentInput, timestamp: Date.now() },
                { id: Date.now() + '-j', role: 'jarvis', text: currentOutput, timestamp: Date.now() }
              ]);
              setCurrentInput('');
              setCurrentOutput('');
            }
            if (message.serverContent?.interrupted) stopAllAudio();
          },
          onerror: (err: any) => {
            console.error("Gemini Live session error", err);
            const errStr = String(err?.message || err || '');
            if (errStr.includes('403') || errStr.includes('PERMISSION_DENIED') || errStr.includes('API_KEY_INVALID')) {
              setApiError("Gemini API permission denied or invalid API key. Please check your credentials in Settings.");
            } else {
              setApiError("Gemini Live connection issue. Please retry.");
            }
            setStatus(ConnectionStatus.ERROR);
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
      console.error("Live connection error", err);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setApiError("Microphone permission denied. Please allow microphone access in your browser.");
      } else if (err?.message?.includes('403') || err?.message?.includes('PERMISSION_DENIED') || err?.message?.includes('API_KEY_INVALID')) {
        setApiError("Gemini API permission denied. Please verify your GEMINI_API_KEY in Settings.");
      } else {
        setApiError(err?.message || "Failed to initialize Gemini session.");
      }
      setStatus(ConnectionStatus.ERROR);
    }
  };

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
    
    // Roman Urdu is the primary language rule unless explicitly requested otherwise
    const wantsEnglishExplicitly = /\b(speak in english|reply in english|answer in english|in english please|respond in english)\b/i.test(userMsg);
    const langInstruction = wantsEnglishExplicitly
      ? ' Provide the response in clear English as explicitly requested.'
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
          model: 'gemini-3.1-pro-preview',
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
            thinkingConfig: isThinkingMode ? { thinkingBudget: 32768 } : undefined,
          }
        });

        const jarvisMsg = response.text || "Analysis complete.";
        setCurrentOutput(jarvisMsg);
        setTranscriptions(prev => [
          ...prev,
          { id: Date.now() + '-u', role: 'user', text: `[Media Analysis] ${userMsg}`, timestamp: Date.now() },
          { id: Date.now() + '-j', role: 'jarvis', text: jarvisMsg, timestamp: Date.now() }
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
        const response = await ai.models.generateContent({
          model: isThinkingMode ? 'gemini-3.1-pro-preview' : 'gemini-3.8-flash',
          contents: userMsg,
          config: {
            systemInstruction: fullSystemInstruction + langInstruction,
            thinkingConfig: isThinkingMode ? { thinkingBudget: 32768 } : undefined,
            tools: useSearch ? [{ googleSearch: {} }] : undefined
          }
        });
        
        const jarvisMsg = response.text || "Interface complete.";
        setCurrentOutput(jarvisMsg);
        setTranscriptions(prev => [
          ...prev,
          { id: Date.now() + '-u', role: 'user', text: userMsg, timestamp: Date.now() },
          { id: Date.now() + '-j', role: 'jarvis', text: jarvisMsg, timestamp: Date.now() }
        ]);
        
        speakText(jarvisMsg);
      }

      setCurrentInput('');
      setCurrentOutput('');
    } catch (e: any) {
      console.error("Submission Error", e);
      const errStr = String(e?.message || e || '');
      if (errStr.includes('403') || errStr.includes('PERMISSION_DENIED') || errStr.includes('API_KEY_INVALID')) {
        setApiError("Gemini API permission denied. Please verify your GEMINI_API_KEY in Settings.");
      } else {
        setApiError(e?.message || "Error communicating with Gemini API.");
      }
      setStatus(ConnectionStatus.ERROR);
    } finally {
      setIsGenerating(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access denied", err);
      alert("System error: Camera access denied.");
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
      console.error("getDisplayMedia is not supported in this browser.");
      alert("Neural Link Error: Screen sharing is not supported by your current browser or device. This feature typically requires a desktop browser (Chrome, Firefox, Edge, or Safari 13+).");
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
      console.error("Screen share denied or failed", err);
      if (err.name === 'NotAllowedError') {
        // User cancelled or browser blocked
        return;
      }
      alert(`Neural Link Failed: ${err.message || "Could not initiate screen capture."}`);
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
        
        // If connected, we can just ask Urfi to look at the current frame
        if (status === ConnectionStatus.CONNECTED && sessionRef.current) {
          const base64 = dataUrl.split(',')[1];
          sessionRef.current.sendRealtimeInput({
            video: { data: base64, mimeType: 'image/jpeg' }
          });
          // We don't stop the camera here if we're in a live session
          // Just trigger a verbal analysis request
          setCurrentInput("[High-Res Snapshot Analysis]");
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
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: { parts: [{ text: p }] },
        config: { 
          imageConfig: { 
            aspectRatio: imageSettings.aspectRatio as any, 
            imageSize: imageSettings.size as any 
          } 
        },
      });
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

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-futuristic transition-colors duration-500">
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none transition-all duration-500" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, var(--theme-grid-dot, #06b6d4) 1px, transparent 0)`, 
          backgroundSize: '60px 60px' 
        }} 
      />
      
      <header className="p-3 md:p-4 flex justify-between items-center z-20 bg-slate-950/50 backdrop-blur-xl border-b border-[var(--theme-border-subtle)] transition-colors duration-500">
        <div className="flex items-center gap-3 md:gap-5">
          <div className="relative flex items-center justify-center">
            <div 
              className="absolute inset-0 rounded-full blur-md animate-pulse-slow transition-colors duration-500"
              style={{ backgroundColor: THEMES[currentTheme].glowColor }}
            />
            <Logo size={32} theme={currentTheme} className="md:w-[36px] md:h-[36px] relative z-10" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-xl md:text-2xl tracking-[0.3em] md:tracking-[0.5em] font-bold text-white text-glow-theme select-none leading-none flex items-center">
              U<span className="opacity-80 mx-0.5" style={{ color: THEMES[currentTheme].primaryColor }}>.</span>R<span className="opacity-80 mx-0.5" style={{ color: THEMES[currentTheme].primaryColor }}>.</span>F<span className="opacity-80 mx-0.5" style={{ color: THEMES[currentTheme].primaryColor }}>.</span>I
            </h1>
            <span 
              className="text-[7px] md:text-[8px] tracking-[0.2em] md:tracking-[0.3em] font-mono mt-1 uppercase transition-colors duration-300"
              style={{ color: THEMES[currentTheme].primaryColor, opacity: 0.7 }}
            >
              {THEMES[currentTheme].name} • Neural Interface
            </span>
          </div>
          <div 
            className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ml-2 md:ml-4 transition-all duration-500 ${status === ConnectionStatus.CONNECTED ? 'animate-pulse' : 'bg-slate-700 shadow-inner'}`} 
            style={status === ConnectionStatus.CONNECTED ? { 
              backgroundColor: THEMES[currentTheme].primaryColor, 
              boxShadow: `0 0 12px ${THEMES[currentTheme].glowStrong}` 
            } : undefined}
          />
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Quick Visual Personality Theme Switcher */}
          <ThemeQuickSwitcher currentTheme={currentTheme} onThemeChange={handleThemeChange} />
          
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
            className="p-2 transition-all rounded-full hover:bg-white/5 active:scale-95 text-slate-300 hover:text-[var(--theme-primary)]"
            title="Archives & History"
          >
            <HistoryIcon />
          </button>
        </div>
      </header>

      {/* Mode / Grounding Controls */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:gap-4 p-1.5 md:p-2 rounded-full glass-panel scale-90 md:scale-100 transition-all border border-[var(--theme-border)] max-w-[95vw] overflow-x-auto no-scrollbar">
        <button onClick={() => { setUseSearch(!useSearch); disconnect(); }} className={`p-2 rounded-full transition-all shrink-0 ${useSearch ? 'text-slate-950 shadow-lg' : 'text-slate-400 hover:text-[var(--theme-primary)]'}`} style={useSearch ? { backgroundColor: THEMES[currentTheme].primaryColor, boxShadow: `0 0 12px ${THEMES[currentTheme].glowColor}` } : undefined} title="Web Search"><SearchIcon /></button>
        <button onClick={() => { setUseMaps(!useMaps); disconnect(); }} className={`p-2 rounded-full transition-all shrink-0 ${useMaps ? 'text-slate-950 shadow-lg' : 'text-slate-400 hover:text-[var(--theme-primary)]'}`} style={useMaps ? { backgroundColor: THEMES[currentTheme].primaryColor, boxShadow: `0 0 12px ${THEMES[currentTheme].glowColor}` } : undefined} title="Maps Grounding"><MapsIcon /></button>
        <div className="w-px bg-white/10 mx-0.5 md:mx-1 shrink-0" />
        <button onClick={() => setIsThinkingMode(!isThinkingMode)} className={`p-2 rounded-full transition-all shrink-0 ${isThinkingMode ? 'bg-purple-500 text-slate-950 shadow-lg shadow-purple-500/50' : 'text-purple-400/40 hover:text-purple-400'}`} title="Deep Thinking Mode"><SparklesIcon /></button>
        <div className="w-px bg-white/10 mx-0.5 md:mx-1 shrink-0" />
        <button onClick={startCamera} className="p-2 text-slate-400 hover:text-[var(--theme-primary)] transition-all active:scale-90 shrink-0" title="Analyze with Camera"><CameraIcon /></button>
        <button onClick={startScreenShare} className="p-2 text-slate-400 hover:text-[var(--theme-primary)] transition-all active:scale-90 shrink-0" title="Share Screen"><ScreenShareIcon /></button>
        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-[var(--theme-primary)] transition-all active:scale-90 shrink-0" title="Analyze File"><ImagePlusIcon /></button>
        <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={handleFileUpload} />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 space-y-8 md:space-y-12 relative z-10">
        {apiError && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-30 flex items-center justify-between gap-3 p-3 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs backdrop-blur-md shadow-xl animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircleIcon />
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
                <XIcon />
              </button>
            </div>
          </div>
        )}
        <div className="relative group cursor-pointer" onClick={() => status === ConnectionStatus.DISCONNECTED && connect()}>
          <NeuralCore isActive={status === ConnectionStatus.CONNECTED} status={status} audioLevel={audioLevel} theme={currentTheme} />
          {status === ConnectionStatus.CONNECTED && (
            <div 
              className="absolute inset-[-20px] md:inset-[-40px] rounded-full border animate-pulse-slow opacity-50 transition-colors duration-500" 
              style={{ borderColor: THEMES[currentTheme].glowColor }}
            />
          )}
          {(isCameraActive || isScreenSharing) && status === ConnectionStatus.CONNECTED && (
            <div 
              className="absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full animate-pulse transition-colors duration-500"
              style={{ 
                backgroundColor: `${THEMES[currentTheme].primaryColor}20`,
                borderColor: `${THEMES[currentTheme].primaryColor}40`
              }}
            >
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{ backgroundColor: THEMES[currentTheme].primaryColor }} />
              <span className="text-[8px] md:text-[10px] font-bold tracking-widest uppercase" style={{ color: THEMES[currentTheme].primaryColor }}>Vision Active</span>
            </div>
          )}
          {(isGenerating || status === ConnectionStatus.CONNECTING) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-64 h-64 border-[1px] border-t-transparent rounded-full animate-spin opacity-30" 
                style={{ borderColor: THEMES[currentTheme].primaryColor, borderTopColor: 'transparent' }}
              />
            </div>
          )}
        </div>
        <div className="w-full h-32 md:h-40 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          {currentOutput ? <HighlightingText text={currentOutput} /> : currentInput ? <p className="text-slate-400 text-base md:text-xl italic font-mono opacity-60">"{currentInput}"</p> : (
            <div className="flex flex-col items-center gap-2">
              <p 
                className="text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.4em] uppercase font-bold transition-colors duration-300"
                style={{ color: THEMES[currentTheme].primaryColor, opacity: 0.7 }}
              >
                {status === ConnectionStatus.CONNECTED ? 'Listening for command' : 'Initialize Urfi'}
              </p>
              <div className="flex gap-1">
                {[1,2,3].map(i => (
                  <div 
                    key={i} 
                    className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full animate-bounce transition-colors duration-300" 
                    style={{ 
                      backgroundColor: THEMES[currentTheme].primaryColor, 
                      opacity: 0.4, 
                      animationDelay: `${i*0.2}s` 
                    }} 
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

            {/* System Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                  <h3 className="text-[10px] md:text-xs text-cyan-400 tracking-widest uppercase font-bold">Core Personality</h3>
                </div>
                <button 
                  onClick={() => setSystemPrompt(INITIAL_PROMPT)}
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

            {/* Voice Interface Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                <h3 className="text-[10px] md:text-xs text-cyan-400 tracking-widest uppercase font-bold">Voice Interface</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {LIVE_VOICES.map(voice => (
                  <button 
                    key={voice} 
                    onClick={() => { setSelectedVoice(voice); disconnect(); }} 
                    className={`text-[9px] md:text-[10px] p-2.5 rounded-xl border border-cyan-500/20 transition-all active:scale-95 flex flex-col items-center gap-1 ${selectedVoice === voice ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 border-cyan-400' : 'hover:bg-cyan-500/10 text-cyan-100/60'}`}
                  >
                    <span className="uppercase tracking-tighter">{voice}</span>
                    <div className={`w-1 h-1 rounded-full ${selectedVoice === voice ? 'bg-slate-950' : 'bg-cyan-500/40'}`} />
                  </button>
                ))}
              </div>
            </section>

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
          </div>
          
          <div className="p-4 bg-cyan-500/5 border-t border-cyan-500/10 flex justify-center">
            <p className="text-[8px] text-cyan-500/30 font-mono tracking-widest uppercase">Urfi Neural Core v2.4.0</p>
          </div>
        </div>
      )}

      <footer className="p-4 md:p-10 flex flex-col items-center gap-4 md:gap-6 z-20 w-full bg-slate-950/60 backdrop-blur-lg border-t border-cyan-500/5">
        {/* Analysis Context UI */}
        {analysisMedia && (
          <div className="w-full max-w-3xl mb-[-16px] md:mb-[-24px] animate-in fade-in slide-in-from-bottom-2">
            <div className="glass-panel p-2 pl-3 rounded-t-2xl border-b-0 border-cyan-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg overflow-hidden border border-cyan-500/20 bg-black">
                  {analysisMedia.type.startsWith('video') ? (
                    <video src={analysisMedia.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={analysisMedia.url} className="w-full h-full object-cover" />
                  )}
                </div>
                <span className="text-[8px] md:text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
                  {analysisMedia.label || 'Advanced Media Analysis Mode'}
                </span>
              </div>
              <button onClick={() => setAnalysisMedia(null)} className="p-1 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                <XIcon />
              </button>
            </div>
          </div>
        )}

        {/* Editing Context UI */}
        {editingImage && (
          <div className="w-full max-w-3xl mb-[-16px] md:mb-[-24px] animate-in fade-in slide-in-from-bottom-2">
            <div className="glass-panel p-2 pl-3 rounded-t-2xl border-b-0 border-cyan-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg overflow-hidden border border-cyan-500/20">
                  <img src={editingImage} className="w-full h-full object-cover" />
                </div>
                <span className="text-[8px] md:text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Image Reconstruction Mode</span>
              </div>
              <button onClick={() => setEditingImage(null)} className="p-1 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                <XIcon />
              </button>
            </div>
          </div>
        )}

        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-3 md:gap-6">
          <div className="flex gap-3 md:gap-4 items-center order-2 md:order-1">
            <button onClick={generateImage} disabled={isGenerating} className="w-10 h-10 md:w-12 md:h-12 rounded-full glass-panel flex items-center justify-center text-cyan-400 hover:scale-110 active:scale-95 transition-all shadow-lg border-cyan-500/20" title="Construct Image"><SparklesIcon /></button>
            <button onClick={generateVideo} disabled={isGenerating} className="w-10 h-10 md:w-12 md:h-12 rounded-full glass-panel flex items-center justify-center text-cyan-400 hover:scale-110 active:scale-95 transition-all shadow-lg border-cyan-500/20" title="Synthesize Video"><VideoIcon /></button>
            <button 
              onClick={isScreenSharing ? stopScreenShare : startScreenShare} 
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full glass-panel flex items-center justify-center transition-all shadow-lg border-cyan-500/20 ${isScreenSharing ? 'text-red-400 bg-red-500/10 border-red-500/40' : 'text-cyan-400 hover:scale-110 active:scale-95'}`} 
              title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
            >
              <ScreenShareIcon />
            </button>
          </div>

          <div className={`flex-1 w-full flex items-center gap-2 md:gap-3 glass-panel p-1.5 md:p-2 pl-3 md:pl-4 rounded-full border-cyan-500/20 focus-within:border-cyan-500/50 transition-all shadow-xl order-1 md:order-2 ${editingImage || analysisMedia ? 'rounded-t-none border-t-0' : ''}`}>
            <input 
              type="text" 
              value={textInput} 
              onChange={(e) => setTextInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()} 
              placeholder={editingImage ? "Transformation parameters..." : analysisMedia ? "Ask about this media..." : "Query Urfi..."} 
              className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm text-slate-100 placeholder:text-slate-500 font-mono" 
            />
            <button 
              onClick={handleTextSubmit} 
              disabled={(!textInput.trim() && !analysisMedia) || isGenerating} 
              className="p-2 md:p-3 rounded-full transition-all disabled:opacity-20 active:scale-90"
              style={{
                backgroundColor: `${THEMES[currentTheme].primaryColor}20`,
                color: THEMES[currentTheme].primaryColor
              }}
            >
              <SendIcon />
            </button>
          </div>

          <button 
            id="main-mic-connect-button"
            onClick={status === ConnectionStatus.CONNECTED ? disconnect : connect} 
            className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl order-3 ${status === ConnectionStatus.CONNECTED ? 'bg-red-500 hover:bg-red-600 shadow-red-500/40 text-white' : 'text-slate-950'} active:scale-90 relative`}
            style={status !== ConnectionStatus.CONNECTED ? {
              backgroundColor: THEMES[currentTheme].primaryColor,
              boxShadow: `0 0 25px ${THEMES[currentTheme].glowColor}`
            } : undefined}
          >
            {status === ConnectionStatus.CONNECTED ? <StopIcon /> : <MicIcon />}
            {status === ConnectionStatus.CONNECTED && <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" />}
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
            <section className="space-y-4 md:space-y-6">
              <h3 className="text-[9px] md:text-[10px] text-cyan-500/60 uppercase tracking-widest mb-3 md:mb-4 font-bold font-mono">LOGS</h3>
              {transcriptions.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className={`text-[8px] md:text-[9px] uppercase mb-1 font-bold font-mono ${msg.role === 'user' ? 'text-slate-500' : 'text-cyan-600'}`}>{msg.role === 'user' ? 'USER' : 'URFI'}</span>
                  <div className={`p-3 md:p-4 rounded-2xl text-xs md:text-sm font-mono leading-relaxed max-w-[90%] md:max-w-[95%] shadow-md ${msg.role === 'user' ? 'bg-slate-900 text-slate-400 rounded-tr-none' : 'bg-cyan-950/20 text-cyan-100 border border-cyan-500/10 rounded-tl-none'}`}>{msg.text}</div>
                </div>
              ))}
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
