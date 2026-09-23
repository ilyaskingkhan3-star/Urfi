export type UserLanguage = 'ur' | 'roman-ur' | 'en';

export type ChatScriptMode = 'roman' | 'nastaliq';

export type PromptRefinerMode = 'concise' | 'detailed';

export type ThemeMode = 'urfi-futuristic' | 'dark' | 'light' | 'sunset-gold' | 'cyber-violet';

export interface UserProfile {
  name: string;
  language: UserLanguage;
  voice: string;
  theme: ThemeMode;
  favoriteTopics: string[];
  speechRate?: number;
  autoSpeak?: boolean;
  chatScriptMode?: ChatScriptMode;
  promptRefinerMode?: PromptRefinerMode;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface MessageMedia {
  url: string;
  type: 'image' | 'video' | 'file';
  name?: string;
  mimeType?: string;
}

export type UrfiMoodType = 
  | 'happy' 
  | 'neutral' 
  | 'concerned' 
  | 'cheerful' 
  | 'analytical' 
  | 'empathetic' 
  | 'creative' 
  | 'focused' 
  | 'serene';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'jarvis';
  text: string;
  timestamp: number;
  sources?: GroundingSource[];
  media?: MessageMedia;
  script?: ChatScriptMode;
  refinerMode?: PromptRefinerMode;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}

export type TaskCategory = 'Work' | 'Personal' | 'Urgent';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: TaskCategory | string;
  dueDate?: string;
  createdAt: number;
}

export interface Reminder {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  completed: boolean;
  notified?: boolean;
  createdAt: number;
}

export interface WeatherDayForecast {
  day: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  icon?: string;
}

export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  uvIndex: number;
  summaryUrdu?: string;
  summaryRoman?: string;
  summaryEnglish?: string;
  forecast: WeatherDayForecast[];
}

export type NewsCategory = 'Pakistan' | 'Technology' | 'World' | 'Sports';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  source: string;
  time: string;
  url?: string;
  badge?: string;
}

export interface GeminiVoice {
  name: string;
  gender: 'female' | 'male' | 'neutral';
  tone: string;
  toneRomanUrdu?: string;
  description: string;
  isUrduOptimized?: boolean;
  samplePhraseUrdu?: string;
  samplePhraseRoman?: string;
  source?: 'api' | 'live-catalog';
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export interface LiveState {
  status: ConnectionStatus;
  isListening: boolean;
  error?: string;
}

export type ActiveView = 
  | 'dashboard' 
  | 'chat' 
  | 'voice' 
  | 'search' 
  | 'weather' 
  | 'news' 
  | 'notes' 
  | 'tasks' 
  | 'reminders' 
  | 'image' 
  | 'files' 
  | 'settings' 
  | 'profile';

export interface WakeWordConfig {
  enabled: boolean;
  phrase: string;
  autoConnectLive: boolean;
  playChime: boolean;
  sensitivity: 'loose' | 'standard' | 'strict';
}

