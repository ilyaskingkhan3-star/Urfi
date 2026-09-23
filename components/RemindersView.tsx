import React, { useState, useEffect } from 'react';
import { Bell, Clock, Calendar, Plus, Trash2, CheckCircle, AlertCircle, Volume2, ShieldAlert } from 'lucide-react';
import { Reminder, UserProfile } from '../types';

interface RemindersViewProps {
  profile: UserProfile;
  reminders: Reminder[];
  onRemindersChange: (reminders: Reminder[]) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  profile,
  reminders,
  onRemindersChange,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('18:00');
  const [notifPermission, setNotifPermission] = useState<string>('default');

  const isUrdu = profile.language === 'ur';
  const isRoman = profile.language === 'roman-ur';

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotifPermission(perm);
      } catch (e) {
        console.error('Notification permission error:', e);
      }
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newReminder: Reminder = {
      id: `rem-${Date.now()}`,
      title: title.trim(),
      date,
      time,
      completed: false,
      createdAt: Date.now(),
    };

    onRemindersChange([newReminder, ...reminders]);
    setTitle('');
  };

  const handleDelete = (id: string) => {
    onRemindersChange(reminders.filter((r) => r.id !== id));
  };

  const handleToggle = (id: string) => {
    onRemindersChange(
      reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  // Play gentle alert tone
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {}
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 space-y-6">
      {/* Platform Notification Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">
            {isUrdu ? 'اطلاع برائے نوٹیفکیشن:' : isRoman ? 'Notification Notice:' : 'Platform Notice:'}
          </p>
          <p className="text-amber-200/90 leading-relaxed font-sans">
            {isUrdu 
              ? 'ویب براؤزر یا سیکیورٹی سینڈ باکس میں بیک گراؤنڈ سسٹم نوٹیفکیشن محدود ہو سکتے ہیں۔ جب تک ایپلیکیشن کھلی رہے گی، الرٹس اور چائمز وقت پر بجیں گے۔'
              : isRoman
              ? 'Web preview sandbox mein background system notifications limited ho sakti hain. App khuli rehne par in-app reminders barwaqt chalte hain.'
              : 'Background notifications may be restricted in sandboxed browser iframes. In-app alerts and sounds will function when the application is active.'}
          </p>
          {notifPermission !== 'granted' && (
            <button
              onClick={requestPermission}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold cursor-pointer border border-amber-500/30"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'براؤزر پرمیشن فعال کریں' : 'Enable Browser Permission'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Reminder Form */}
      <div className="p-6 rounded-3xl glass-panel border border-[var(--theme-border)] shadow-xl space-y-4">
        <h3 className="text-sm font-mono uppercase tracking-widest text-[var(--theme-primary)] font-bold flex items-center gap-2">
          <Bell className="w-4 h-4" />
          <span>{isUrdu ? 'نئی یاد دہانی (Reminder) مقرر کریں' : isRoman ? 'Naya Reminder Set Karein' : 'Schedule Reminder'}</span>
        </h3>

        <form onSubmit={handleAdd} className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isUrdu ? 'یاد دہانی کا عنوان (مثلاً ڈاکٹر کی اپائنٹمنٹ، دوا، میٹنگ)...' : 'Reminder Title...'}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[var(--theme-primary)]"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-xs text-white outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-transparent text-xs text-white outline-none w-full"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-slate-950 transition-all active:scale-95 shadow-lg cursor-pointer"
              style={{
                backgroundColor: 'var(--theme-primary)',
              }}
            >
              <Plus className="w-4 h-4" />
              <span>{isUrdu ? 'محفوظ کریں' : 'Set Reminder'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            {isUrdu ? 'مقررہ یاد دہانیاں' : 'Scheduled Reminders'} ({reminders.length})
          </h4>
          <button
            onClick={playChime}
            className="text-[11px] text-[var(--theme-primary)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Volume2 className="w-3 h-3" />
            <span>{isUrdu ? 'چائم ٹیسٹ کریں' : 'Test Sound'}</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-4 rounded-2xl glass-panel border transition-all flex items-center justify-between gap-3 group ${
                rem.completed ? 'opacity-50 border-white/5' : 'border-[var(--theme-border-subtle)] hover:border-[var(--theme-border)]'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => handleToggle(rem.id)}
                  className="text-[var(--theme-primary)] hover:scale-110 transition-transform cursor-pointer shrink-0"
                >
                  <CheckCircle className={`w-5 h-5 ${rem.completed ? 'text-emerald-400' : 'text-slate-500'}`} />
                </button>

                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${rem.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                    {rem.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{rem.date}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[var(--theme-text-mid)] font-semibold">
                      <Clock className="w-3 h-3" />
                      <span>{rem.time}</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(rem.id)}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {reminders.length === 0 && (
            <div className="p-12 text-center text-slate-400 glass-panel rounded-3xl border border-[var(--theme-border-subtle)] space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-500" />
              <p>{isUrdu ? 'کوئی یاد دہانی شیڈول نہیں ہے۔' : 'No active reminders.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemindersView;
