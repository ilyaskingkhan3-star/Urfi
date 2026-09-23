import { UserProfile, UserLanguage, ThemeMode, Note, Task, Reminder, Conversation, Message } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'urfi_user_profile',
  NOTES: 'urfi_notes',
  TASKS: 'urfi_tasks',
  REMINDERS: 'urfi_reminders',
  CONVERSATIONS: 'urfi_conversations',
  ACTIVE_CONV_ID: 'urfi_active_conv_id',
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Ilyas',
  language: 'ur',
  voice: 'Kore',
  theme: 'urfi-futuristic',
  favoriteTopics: ['Technology', 'Pakistan', 'Daily Planning', 'General Knowledge'],
  speechRate: 1.0,
  autoSpeak: true,
};

export function getStoredProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch (e) {
    console.error('Error reading profile:', e);
    return DEFAULT_PROFILE;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}

export function clearStoredProfile(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
}

// --- Notes ---
export function getStoredNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) {
      const initialNotes: Note[] = [
        {
          id: 'note-1',
          title: 'خوش آمدید - URFI AI',
          content: 'السلام علیکم الیاس صاحب! میں آپ کی ذاتی اسسٹنٹ عرفی ہوں۔ آپ مجھ سے اردو، رومن اردو اور انگلش میں بات کر سکتے ہیں۔ کوئی بھی کام ہو، میں حاضر ہوں۔',
          category: 'ذاتی',
          createdAt: Date.now() - 3600000,
          updatedAt: Date.now() - 3600000,
          pinned: true,
        },
        {
          id: 'note-2',
          title: 'Project Ideas 2026',
          content: '1. AI Voice Integration for mobile\n2. Real-time Urdu translation module\n3. Daily productivity dashboard with automated reminders',
          category: 'کام',
          createdAt: Date.now() - 7200000,
          updatedAt: Date.now() - 7200000,
        }
      ];
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(initialNotes));
      return initialNotes;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredNotes(notes: Note[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
}

// --- Tasks ---
export function getStoredTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      const initialTasks: Task[] = [
        {
          id: 'task-1',
          title: 'صبح کی چہل قدمی اور ورزش (Morning Walk & Fitness)',
          completed: true,
          priority: 'medium',
          category: 'Personal',
          createdAt: Date.now() - 86400000,
        },
        {
          id: 'task-2',
          title: 'ضروری کلائنٹ ای میلز اور پروجیکٹ رپورٹ فائنل کرنا',
          completed: false,
          priority: 'medium',
          category: 'Work',
          createdAt: Date.now() - 3600000,
        },
        {
          id: 'task-3',
          title: 'سرور بیک اپ اور سیکیورٹی تصدیق (Urgent Attention)',
          completed: false,
          priority: 'high',
          category: 'Urgent',
          createdAt: Date.now() - 1800000,
        }
      ];
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(initialTasks));
      return initialTasks;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

// --- Reminders ---
export function getStoredReminders(): Reminder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!raw) {
      const today = new Date().toISOString().split('T')[0];
      const initialReminders: Reminder[] = [
        {
          id: 'rem-1',
          title: 'پانی پینے کا وقت (Stay Hydrated)',
          date: today,
          time: '16:00',
          completed: false,
          createdAt: Date.now(),
        },
        {
          id: 'rem-2',
          title: 'اہم دستاویزات کا جائزہ لینا',
          date: today,
          time: '18:30',
          completed: false,
          createdAt: Date.now(),
        }
      ];
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(initialReminders));
      return initialReminders;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredReminders(reminders: Reminder[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
}

// --- Conversations & Chat History ---
export function getStoredConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredConversations(conversations: Conversation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
}

export function clearStoredConversations(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONV_ID);
}

export function clearAllUserData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.NOTES);
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.REMINDERS);
  localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONV_ID);
  localStorage.removeItem('urfi_theme');
}
