import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Search, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Plus, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles,
  User,
  Bot,
  Type
} from 'lucide-react';
import { Message, UserProfile, GroundingSource, ChatScriptMode } from '../types';
import { askGemini } from '../services/geminiService';
import { speakText, stopSpeaking, isSpeaking } from '../services/speechService';

const isUrduScript = (text: string) => /[\u0600-\u06FF]/.test(text);

interface ChatViewProps {
  profile: UserProfile;
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  onNewChat: () => void;
  chatScriptMode?: ChatScriptMode;
  onScriptModeChange?: (mode: ChatScriptMode) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  profile,
  messages,
  onMessagesChange,
  onNewChat,
  chatScriptMode,
  onScriptModeChange,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [localScriptMode, setLocalScriptMode] = useState<ChatScriptMode>(() => {
    if (chatScriptMode) return chatScriptMode;
    if (profile.chatScriptMode) return profile.chatScriptMode;
    try {
      const saved = localStorage.getItem('urfi_chat_script_mode');
      if (saved === 'nastaliq' || saved === 'roman') return saved;
    } catch (_) {}
    return 'roman';
  });

  const activeScript = chatScriptMode || profile.chatScriptMode || localScriptMode;

  const handleToggleScriptMode = () => {
    const next: ChatScriptMode = activeScript === 'roman' ? 'nastaliq' : 'roman';
    setLocalScriptMode(next);
    try {
      localStorage.setItem('urfi_chat_script_mode', next);
    } catch (_) {}
    onScriptModeChange?.(next);
  };

  const isUrdu = profile.language === 'ur' || activeScript === 'nastaliq';
  const isRoman = profile.language === 'roman-ur' && activeScript !== 'nastaliq';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMessage];
    onMessagesChange(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const effectiveProfile: UserProfile = {
        ...profile,
        chatScriptMode: activeScript,
      };

      const response = await askGemini({
        prompt: userMessage.text,
        conversationHistory: messages,
        profile: effectiveProfile,
        useSearch,
      });

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: response.text,
        timestamp: Date.now(),
        script: activeScript,
        sources: response.sources,
      };

      onMessagesChange([...newHistory, assistantMessage]);

      if (profile.autoSpeak) {
        setSpeakingMsgId(assistantMessage.id);
        speakText(assistantMessage.text, profile.language, profile.voice, profile.speechRate || 1.0, () => {
          setSpeakingMsgId(null);
        });
      }
    } catch (err: any) {
      const errorMessage: Message = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        text: isUrdu
          ? 'معذرت، رابطہ قائم کرنے میں دشواری پیش آئی ہے۔ براہ کرم انٹرنیٹ یا API Key چیک کیجیے۔'
          : isRoman
          ? 'Maazrat, rabta qaaim karne mein masla hua hai. Barah-e-karam dobara koshish karein.'
          : 'Sorry, could not connect to Gemini service. Please verify your connection or try again.',
        timestamp: Date.now(),
        script: activeScript,
      };
      onMessagesChange([...newHistory, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (msg: Message) => {
    if (speakingMsgId === msg.id && isSpeaking()) {
      stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msg.id);
      speakText(msg.text, profile.language, profile.voice, profile.speechRate || 1.0, () => {
        setSpeakingMsgId(null);
      });
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestions = isUrdu ? [
    'تعلیم اور پڑھائی کے لیے ایک آسان شیڈول بنائیں',
    'آج کے لیے چند تخلیقی اور مفید خیالات دیں',
    'ایک بااثر پیشہ ورانہ ای میل کا خاکہ لکھیں',
    'روزمرہ کاموں کو وقت پر مکمل کرنے کے گر بتائیں',
  ] : isRoman ? [
    'Study aur exam ki tayyari ka aasan schedule banao',
    'Aaj ke din ke liye 3 useful ideas do',
    'Ek professional email ka draft likh dein',
    'Time management ke aasan tips dein',
  ] : [
    'Create an efficient daily study plan',
    'Help brainstorm 3 innovative startup ideas',
    'Draft a polite professional email',
    'Provide quick tips for better time management',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto w-full px-2 sm:px-4">
      {/* Top action bar */}
      <div className="flex items-center justify-between py-2 border-b border-[var(--theme-border-subtle)] text-xs mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseSearch(!useSearch)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-medium cursor-pointer ${
              useSearch 
                ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.3)]' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'گوگل سرچ' : 'Search'}</span>
            {useSearch && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />}
          </button>

          {/* Toggle Script Mode Button: Roman Urdu vs Native Urdu Script (Nastaliq) */}
          <button
            onClick={handleToggleScriptMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-medium cursor-pointer active:scale-95 ${
              activeScript === 'nastaliq'
                ? 'bg-violet-500/20 border-violet-400 text-violet-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white font-mono'
            }`}
            title={activeScript === 'nastaliq' ? 'Active: Native Urdu Script (Nastaliq). Click to switch to Roman Urdu.' : 'Active: Roman Urdu. Click to switch to Nastaliq font.'}
          >
            <span className={activeScript === 'nastaliq' ? 'font-nastaliq font-bold text-xs' : 'font-mono font-bold text-xs'}>
              {activeScript === 'nastaliq' ? 'ن' : 'Aa'}
            </span>
            <span className={activeScript === 'nastaliq' ? 'font-nastaliq text-[11px]' : 'font-mono text-[11px]'}>
              {activeScript === 'nastaliq' ? 'نستعلیق رسم الخط' : 'Roman Urdu'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="chat-new-button"
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Start New Chat"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'نئی گفتگو' : 'New Chat'}</span>
          </button>
          {messages.length > 0 && (
            <button
              onClick={() => onMessagesChange([])}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-all cursor-pointer"
              title="Clear Chat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-[var(--theme-badge-bg)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-primary)] glow-theme">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-bold text-white">
                {isUrdu ? `السلام علیکم ${profile.name} صاحب!` : `Welcome, ${profile.name}!`}
              </h3>
              <p className="text-xs md:text-sm text-slate-400">
                {isUrdu 
                  ? 'آپ پڑھائی، روزمرہ کاموں، تحریر یا معلومات کے بارے میں کچھ بھی دریافت کر سکتے ہیں۔'
                  : isRoman
                  ? 'Aap study, writing, planning ya general sawalaat pooch sakte hain.'
                  : 'Ask about studies, daily productivity, writing, or live web search.'}
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg mt-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="text-left text-xs p-3 rounded-xl glass-panel border border-[var(--theme-border-subtle)] hover:border-[var(--theme-primary)]/50 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isMsgUrdu = isUrduScript(msg.text) || msg.script === 'nastaliq' || (!isUser && activeScript === 'nastaliq');
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[var(--theme-badge-bg)] border border-[var(--theme-border-subtle)] flex items-center justify-center text-[var(--theme-primary)] shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  dir={isMsgUrdu ? 'rtl' : 'ltr'}
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-2 leading-relaxed transition-all ${
                    isMsgUrdu ? 'urdu-bubble-nastaliq text-base leading-[2.2]' : 'roman-bubble-script text-sm'
                  } ${
                    isUser
                      ? 'bg-[var(--theme-primary)] text-slate-950 rounded-tr-none font-medium'
                      : 'glass-panel border border-[var(--theme-border)] text-slate-100 rounded-tl-none'
                  }`}
                >
                  {/* Badge indicating script for assistant responses */}
                  {!isUser && (
                    <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[10px]" dir="ltr">
                      <span className="text-slate-400 font-semibold tracking-wide flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[var(--theme-primary)]" />
                        <span>URFI</span>
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] border font-bold ${
                        isMsgUrdu 
                          ? 'bg-violet-500/20 text-violet-300 border-violet-500/35 font-nastaliq leading-none' 
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20 font-mono'
                      }`}>
                        {isMsgUrdu ? 'نستعلیق رسم الخط' : 'Roman Urdu'}
                      </span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Sources if present */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-white/10 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 flex items-center gap-1 font-semibold">
                        <Search className="w-3 h-3" />
                        <span>{isUrdu ? 'ذرائع و لنکس:' : 'Grounded Sources:'}</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[11px] text-sky-300 transition-colors"
                          >
                            <span className="max-w-[150px] truncate">{src.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message actions for assistant */}
                  {!isUser && (
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-white/5">
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSpeak(msg)}
                          className="p-1 hover:text-[var(--theme-primary)] transition-colors cursor-pointer"
                          title="Read Aloud"
                        >
                          {speakingMsgId === msg.id ? <VolumeX className="w-3.5 h-3.5 text-[var(--theme-primary)]" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="p-1 hover:text-[var(--theme-primary)] transition-colors cursor-pointer"
                          title="Copy"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-slate-200 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center text-slate-400 text-xs py-2">
            <div className="w-8 h-8 rounded-full bg-[var(--theme-badge-bg)] border border-[var(--theme-border-subtle)] flex items-center justify-center text-[var(--theme-primary)] shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="glass-panel px-4 py-2.5 rounded-2xl border border-[var(--theme-border-subtle)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-ping" />
              <span>{isUrdu ? 'عرفی سوچ رہی ہے...' : isRoman ? 'Urfi soch rahi hai...' : 'Urfi is thinking...'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <div className="pt-3 pb-1">
        <div className="relative flex items-center rounded-2xl glass-panel border border-[var(--theme-border)] shadow-xl p-1.5 focus-within:border-[var(--theme-primary)] transition-all">
          <textarea
            id="chat-textarea-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              activeScript === 'nastaliq'
                ? 'اپنا سوال یا پیغام لکھیے (اردو رسم الخط یا رومن)...'
                : isUrdu
                ? 'اپنا سوال یا پیغام لکھیے (اردو، رومن یا انگلش)...'
                : isRoman
                ? 'Apna sawal ya message likhein...'
                : 'Type your message or question...'
            }
            rows={1}
            className={`flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none resize-none tracking-wide ${
              isUrduScript(input) ? 'font-nastaliq text-right text-base leading-relaxed' : 'font-sans'
            }`}
            dir={isUrduScript(input) ? 'rtl' : 'ltr'}
          />

          <button
            id="chat-send-submit-button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl text-slate-950 font-bold transition-all disabled:opacity-30 disabled:scale-95 active:scale-90 cursor-pointer"
            style={{
              backgroundColor: 'var(--theme-primary)',
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
