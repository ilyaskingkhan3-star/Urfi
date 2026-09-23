import React from 'react';
import { 
  MessageSquare, 
  Mic, 
  Search, 
  CloudSun, 
  Newspaper, 
  FileText, 
  CheckSquare, 
  Bell, 
  Camera, 
  FileUp, 
  Settings, 
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { ActiveView, UserProfile } from '../types';
import Logo from './Logo';

interface DashboardProps {
  profile: UserProfile;
  onNavigate: (view: ActiveView) => void;
  onStartVoice: () => void;
  weatherSnapshot?: { temp: number; condition: string; city: string };
  taskCount?: number;
  reminderCount?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  onNavigate,
  onStartVoice,
  weatherSnapshot,
  taskCount = 0,
  reminderCount = 0,
}) => {
  const isUrdu = profile.language === 'ur';
  const isRoman = profile.language === 'roman-ur';

  const greeting = isUrdu 
    ? `خوش آمدید، ${profile.name} صاحب!`
    : isRoman 
    ? `Khush Aamdeed, ${profile.name}!` 
    : `Welcome back, ${profile.name}!`;

  const subtitle = isUrdu
    ? 'میں عرفی ہوں، آپ کی ذاتی اور ذہین AI اسسٹنٹ۔ آج میں آپ کی کیا مدد کر سکتی ہوں؟'
    : isRoman
    ? 'Main Urfi hoon, aap ki personal smart AI assistant. Aaj kya kaam karna hai?'
    : 'I am URFI, your personal intelligent AI assistant. How may I assist you today?';

  const quickCards = [
    {
      id: 'chat',
      view: 'chat' as ActiveView,
      title: isUrdu ? 'چیٹ' : isRoman ? 'AI Chat' : 'AI Chat',
      desc: isUrdu ? 'ذہین سوال و جواب اور رہنمائی' : isRoman ? 'Sawal jawab aur daily guidance' : 'Intelligent Q&A and assistance',
      icon: MessageSquare,
      badge: isUrdu ? 'آن لائن' : 'Active',
      gradient: 'from-cyan-500/20 to-blue-600/10',
      borderGlow: 'hover:border-cyan-400/50',
    },
    {
      id: 'voice',
      view: 'voice' as ActiveView,
      title: isUrdu ? 'آواز' : isRoman ? 'Voice Assistant' : 'Voice Assistant',
      desc: isUrdu ? 'براہِ راست صوتی گفتگو اور سننا' : isRoman ? 'Direct voice conversation' : 'Hands-free voice dialogue',
      icon: Mic,
      badge: isUrdu ? 'لائیو' : 'Live',
      gradient: 'from-emerald-500/20 to-cyan-600/10',
      borderGlow: 'hover:border-emerald-400/50',
      action: onStartVoice,
    },
    {
      id: 'search',
      view: 'search' as ActiveView,
      title: isUrdu ? 'تلاش' : isRoman ? 'Web Search' : 'Web Search',
      desc: isUrdu ? 'تازہ ترین معلومات اور ذرائع' : isRoman ? 'Live web search with sources' : 'Real-time search with sources',
      icon: Search,
      badge: 'Google Grounded',
      gradient: 'from-sky-500/20 to-indigo-600/10',
      borderGlow: 'hover:border-sky-400/50',
    },
    {
      id: 'weather',
      view: 'weather' as ActiveView,
      title: isUrdu ? 'موسم' : isRoman ? 'Weather' : 'Weather',
      desc: weatherSnapshot 
        ? `${weatherSnapshot.city}: ${weatherSnapshot.temp}°C, ${weatherSnapshot.condition}`
        : isUrdu ? 'پاکستان اور دنیا کے شہروں کا موسم' : isRoman ? 'Pakistan aur world cities forecast' : 'Live city forecast & advisory',
      icon: CloudSun,
      badge: weatherSnapshot ? `${weatherSnapshot.temp}°C` : undefined,
      gradient: 'from-amber-500/20 to-orange-600/10',
      borderGlow: 'hover:border-amber-400/50',
    },
    {
      id: 'news',
      view: 'news' as ActiveView,
      title: isUrdu ? 'خبریں' : isRoman ? 'News' : 'News',
      desc: isUrdu ? 'پاکستان، ٹیکنالوجی اور دنیا کی خبریں' : isRoman ? 'Pakistan, Tech, World aur Sports' : 'Pakistan, Tech, World & Sports',
      icon: Newspaper,
      badge: isUrdu ? 'تازہ' : 'Live',
      gradient: 'from-purple-500/20 to-pink-600/10',
      borderGlow: 'hover:border-purple-400/50',
    },
    {
      id: 'notes',
      view: 'notes' as ActiveView,
      title: isUrdu ? 'نوٹس' : isRoman ? 'Notes' : 'Notes',
      desc: isUrdu ? 'خیالات اور اہم تحریریں محفوظ کریں' : isRoman ? 'Create, edit aur search notes' : 'Capture, edit & organize ideas',
      icon: FileText,
      gradient: 'from-blue-500/20 to-cyan-600/10',
      borderGlow: 'hover:border-blue-400/50',
    },
    {
      id: 'tasks',
      view: 'tasks' as ActiveView,
      title: isUrdu ? 'کام' : isRoman ? 'To-Do List' : 'To-Do Tasks',
      desc: isUrdu ? 'روزمرہ کے اہداف اور فہرست' : isRoman ? 'Add, check aur manage tasks' : 'Daily productivity and tasks',
      icon: CheckSquare,
      badge: taskCount > 0 ? `${taskCount} ${isUrdu ? 'باقی' : 'pending'}` : undefined,
      gradient: 'from-teal-500/20 to-emerald-600/10',
      borderGlow: 'hover:border-teal-400/50',
    },
    {
      id: 'reminders',
      view: 'reminders' as ActiveView,
      title: isUrdu ? 'یاد دہانی' : isRoman ? 'Reminders' : 'Reminders',
      desc: isUrdu ? 'وقت پر اہم کاموں کی آگاہی' : isRoman ? 'Set date & time alarms' : 'Time-based reminders & alerts',
      icon: Bell,
      badge: reminderCount > 0 ? `${reminderCount}` : undefined,
      gradient: 'from-rose-500/20 to-orange-600/10',
      borderGlow: 'hover:border-rose-400/50',
    },
    {
      id: 'image',
      view: 'image' as ActiveView,
      title: isUrdu ? 'تصویر' : isRoman ? 'Image Analysis' : 'Image Q&A',
      desc: isUrdu ? 'تصویر کی تفصیل اور تحریر کا مطالعہ' : isRoman ? 'Visual analysis aur OCR reader' : 'Visual understanding & OCR',
      icon: Camera,
      gradient: 'from-indigo-500/20 to-violet-600/10',
      borderGlow: 'hover:border-indigo-400/50',
    },
    {
      id: 'files',
      view: 'files' as ActiveView,
      title: isUrdu ? 'فائلیں' : isRoman ? 'File Assistant' : 'Files & Docs',
      desc: isUrdu ? 'دستاویز کا خلاصہ اور تجزیہ' : isRoman ? 'Summarize files & documents' : 'Summarize documents & PDFs',
      icon: FileUp,
      gradient: 'from-violet-500/20 to-purple-600/10',
      borderGlow: 'hover:border-violet-400/50',
    },
    {
      id: 'settings',
      view: 'settings' as ActiveView,
      title: isUrdu ? 'ترتیبات' : isRoman ? 'Settings' : 'Settings',
      desc: isUrdu ? 'زبان، آواز، تھیم اور میموری' : isRoman ? 'Language, Voice, Theme & Memory' : 'Customize URFI preferences',
      icon: Settings,
      gradient: 'from-slate-500/20 to-slate-700/10',
      borderGlow: 'hover:border-slate-400/50',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 md:py-6 space-y-6">
      {/* Hero Welcome Card */}
      <div 
        id="dashboard-hero-card"
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 glass-panel border border-[var(--theme-border)] shadow-2xl transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--theme-primary)]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-badge-bg)] border border-[var(--theme-border-subtle)] text-[11px] font-mono text-[var(--theme-primary)] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[var(--theme-primary)] animate-pulse" />
              <span>URFI AI • Multilingual Assistant</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              {greeting}
            </h1>
            <p className="text-sm md:text-base text-slate-300/90 leading-relaxed font-sans">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              id="hero-voice-button"
              onClick={onStartVoice}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl font-medium text-slate-950 transition-all duration-300 shadow-lg active:scale-95 cursor-pointer"
              style={{
                backgroundColor: 'var(--theme-primary)',
                boxShadow: '0 0 20px var(--theme-glow)',
              }}
            >
              <Mic className="w-5 h-5" />
              <span className="font-semibold text-sm">
                {isUrdu ? 'آواز سے بات کریں' : isRoman ? 'Voice Start' : 'Talk with Voice'}
              </span>
            </button>
            <button
              id="hero-chat-button"
              onClick={() => onNavigate('chat')}
              className="px-4 py-3 rounded-2xl font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
              title="Open Chat"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Main Features */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs md:text-sm font-mono uppercase tracking-widest text-[var(--theme-primary)] font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>{isUrdu ? 'اہم خصوصیات' : isRoman ? 'Core Features' : 'Main Hub'}</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            {profile.language.toUpperCase()} • {profile.theme}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {quickCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                id={`dashboard-card-${card.id}`}
                onClick={() => {
                  if (card.action) {
                    card.action();
                  } else {
                    onNavigate(card.view);
                  }
                }}
                className={`group relative text-left p-5 rounded-2xl glass-panel border border-[var(--theme-border-subtle)] ${card.borderGlow} transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer overflow-hidden flex flex-col justify-between min-h-[125px]`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-40 group-hover:opacity-70 transition-opacity`} />
                
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-[var(--theme-primary)] group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  {card.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--theme-badge-bg)] text-[var(--theme-primary)] border border-[var(--theme-border-subtle)] font-semibold">
                      {card.badge}
                    </span>
                  )}
                </div>

                <div className="relative z-10 mt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-white group-hover:text-[var(--theme-primary)] transition-colors">
                      {card.title}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-sans">
                    {card.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
