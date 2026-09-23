import { UrfiMoodType } from '../types';

export interface SentimentAnalysisResult {
  mood: UrfiMoodType;
  sentiment: 'happy' | 'neutral' | 'concerned';
  score: number; // -1.0 (concerned/negative) to +1.0 (happy/positive), 0 is neutral
  confidence: number;
  label: string;
  romanUrduLabel: string;
  urduScript: string;
  detectedKeywords: string[];
}

// Urdu and Roman Urdu emotional dictionary for Happy / Positive
const HAPPY_PATTERNS = [
  // Roman Urdu keywords
  'khush', 'khushi', 'khushgawaar', 'khushgawar', 'khushhaal', 'muskurahat', 'hansi', 'hansna',
  'zabardast', 'shandar', 'shandaar', 'kamaal', 'kamal', 'behtareen', 'bohot khoob', 'lajawab', 'aala',
  'maza agaya', 'maza aya', 'bohot maza', 'enjoy', 'mast', 'chha gaye', 'fit hai', 'fit',
  'mubarak', 'mubarakbaad', 'congrats', 'congratulations', 'shukriya', 'jazakallah',
  'alhamdulillah', 'subhanallah', 'mashaallah', 'mashallah', 'bohot shukriya',
  'pyara', 'haseen', 'acha laga', 'bohot acha', 'accha laga', 'khoobsurat', 'sundar',
  'awesome', 'great', 'happy', 'delight', 'glad', 'wonderful', 'blessed', 'excited', 'love it',
  
  // Urdu Script
  'خوش', 'خوشی', 'خوشگوار', 'مسرت', 'مسکراہٹ', 'ہنسنا', 'خوشحال',
  'زبردست', 'شاندار', 'کمال', 'بہترین', 'بہت خوب', 'لاجواب', 'اعلی', 'اعلیٰ',
  'مزہ آگیا', 'مزہ آیا', 'لطف', 'واہ', 'مبارک', 'مبارکباد',
  'شکریہ', 'جزاک اللہ', 'الحمدللہ', 'ماشاءاللہ', 'سبحان اللہ',
  'پیارا', 'حسین', 'خوبصورت', 'بہت اچھا'
];

// Urdu and Roman Urdu emotional dictionary for Concerned / Distressed / Worried
const CONCERNED_PATTERNS = [
  // Roman Urdu keywords
  'pareshan', 'pareshani', 'fikr', 'fikar', 'fiker', 'fikarmand', 'tension', 'stress', 'depression',
  'udaas', 'udas', 'udasi', 'gham', 'ghamgeen', 'dukh', 'dard', 'takleef', 'taklif', 'chot',
  'bemaar', 'bimar', 'bimari', 'beemari', 'tabiyat kharab', 'tabiyat theek nahi', 'sardard', 'bukhar', 'mariz',
  'rona', 'ro raha', 'ro rahi', 'aansoo', 'mayoos', 'mayoosi', 'na-umeed', 'dil dukha', 'dil toot',
  'dar lag raha', 'khauf', 'khofzada', 'ghabrahat', 'bechain', 'bechaini', 'khatra',
  'masla hai', 'masla', 'maslay', 'mushkil', 'mushkilaat', 'tang agaya', 'tang aagaya', 'phansa hua',
  'nuqsan', 'nuqsaan', 'afsos', 'tabahi', 'kharab', 'bura hua', 'buri khabar', 'barbaad',
  'gussa', 'naraz', 'narazgi', 'naraaz', 'nafrat', 'jalte', 'chidh',
  'sad', 'unhappy', 'depressed', 'anxious', 'anxiety', 'worried', 'concerned', 'troubled', 
  'problem', 'issue', 'sick', 'hurting', 'pain', 'crying', 'tears', 'fear', 'afraid',

  // Urdu Script
  'پریشان', 'پریشانی', 'فکر', 'فکرمند', 'غم', 'اداس', 'اداسی', 'دکھ', 'درد', 'تکلیف',
  'بیمار', 'بیماری', 'طبیعت خراب', 'طبیعت ناساز', 'بخار', 'سردرد',
  'رو رہا', 'رو رہی', 'رونا', 'آنسو', 'مایوس', 'مایوسی', 'ناامید', 'دل ٹوٹ',
  'ڈر', 'خوف', 'گھبراہٹ', 'بے چینی', 'خطرہ', 'مسئلہ', 'مسائل', 'مشکل', 'مشکلات',
  'نقصان', 'افسوس', 'تباہی', 'خراب', 'برا', 'غصہ', 'ناراض', 'ناراضگی'
];

// Negation triggers in Urdu and Roman Urdu (e.g. "khush nahi", "pareshani nahi")
const NEGATION_PATTERNS = [
  'nahi', 'nahe', 'nahee', 'mat', 'nhi', 'bina', 'baghair', 'no', 'not',
  'نہیں', 'نہ', 'مت', 'بغیر'
];

/**
 * Analyzes the emotional sentiment of Urdu input text (Roman Urdu & Urdu Script)
 * and returns the mapped sentiment and corresponding UrfiMoodType.
 */
export function analyzeUrduSentiment(text: string): SentimentAnalysisResult {
  if (!text || text.trim().length === 0) {
    return {
      mood: 'neutral',
      sentiment: 'neutral',
      score: 0,
      confidence: 0.5,
      label: 'Neutral',
      romanUrduLabel: 'Mutawazan',
      urduScript: 'متوازن',
      detectedKeywords: []
    };
  }

  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();
  const detectedKeywords: string[] = [];

  let happyScore = 0;
  let concernedScore = 0;

  // Check for negation context within proximity
  const hasNegation = NEGATION_PATTERNS.some(neg => {
    return lowerText.includes(` ${neg} `) || lowerText.startsWith(`${neg} `) || lowerText.endsWith(` ${neg}`) || lowerText.includes(neg);
  });

  // Check Happy keywords
  HAPPY_PATTERNS.forEach(pattern => {
    if (lowerText.includes(pattern)) {
      detectedKeywords.push(pattern);
      happyScore += pattern.length > 5 ? 1.5 : 1.0;
    }
  });

  // Check Concerned keywords
  CONCERNED_PATTERNS.forEach(pattern => {
    if (lowerText.includes(pattern)) {
      detectedKeywords.push(pattern);
      concernedScore += pattern.length > 5 ? 1.5 : 1.0;
    }
  });

  // Handle negation cases:
  // If user says "khush nahi hoon" -> flips happy into concerned
  // If user says "koi masla nahi" or "tension nahi" -> neutral / positive
  if (hasNegation) {
    if (happyScore > 0 && concernedScore === 0) {
      // Negated happiness => concerned
      concernedScore = happyScore * 0.9;
      happyScore = 0;
    } else if (concernedScore > 0 && happyScore === 0) {
      // Negated concern => relaxed / neutral
      concernedScore = 0;
      happyScore = 0.5;
    }
  }

  // Calculate composite sentiment score between -1.0 and +1.0
  const netScore = happyScore - concernedScore;
  const totalWeight = happyScore + concernedScore;
  const normalizedScore = totalWeight > 0 
    ? Math.max(-1, Math.min(1, netScore / Math.max(1, totalWeight))) 
    : 0;

  // Decide sentiment category & corresponding UrfiMood
  if (netScore <= -0.8 || concernedScore >= 1.0) {
    return {
      mood: 'concerned',
      sentiment: 'concerned',
      score: Math.round(normalizedScore * 100) / 100,
      confidence: Math.min(0.95, 0.6 + (concernedScore * 0.1)),
      label: 'Concerned',
      romanUrduLabel: 'Fikarmand',
      urduScript: 'فکرمند',
      detectedKeywords: Array.from(new Set(detectedKeywords))
    };
  } else if (netScore >= 0.8 || happyScore >= 1.0) {
    return {
      mood: 'happy',
      sentiment: 'happy',
      score: Math.round(normalizedScore * 100) / 100,
      confidence: Math.min(0.95, 0.6 + (happyScore * 0.1)),
      label: 'Happy',
      romanUrduLabel: 'Khush-Gawaar',
      urduScript: 'خوش گوار',
      detectedKeywords: Array.from(new Set(detectedKeywords))
    };
  }

  // Check if text is an analytical question or creative request
  const analyticalKeywords = ['tajzia', 'calculate', 'hisab', 'formula', 'logic', 'data', 'science', 'math', 'reason', 'wajah', 'dalil', 'تجزیہ', 'حساب'];
  if (analyticalKeywords.some(kw => lowerText.includes(kw))) {
    return {
      mood: 'analytical',
      sentiment: 'neutral',
      score: 0.1,
      confidence: 0.8,
      label: 'Analytical',
      romanUrduLabel: 'Tajziyati',
      urduScript: 'تجزیاتی',
      detectedKeywords: analyticalKeywords.filter(kw => lowerText.includes(kw))
    };
  }

  const creativeKeywords = ['shair', 'shayari', 'poetry', 'kahani', 'art', 'takhleeq', 'tasweer', 'imagine', 'شعر', 'شاعری', 'کہانی', 'تصویر'];
  if (creativeKeywords.some(kw => lowerText.includes(kw))) {
    return {
      mood: 'creative',
      sentiment: 'happy',
      score: 0.4,
      confidence: 0.8,
      label: 'Creative',
      romanUrduLabel: 'Takhleeqi',
      urduScript: 'تخلیقی',
      detectedKeywords: creativeKeywords.filter(kw => lowerText.includes(kw))
    };
  }

  // Balanced default: Neutral
  return {
    mood: 'neutral',
    sentiment: 'neutral',
    score: 0,
    confidence: 0.7,
    label: 'Neutral',
    romanUrduLabel: 'Mutawazan',
    urduScript: 'متوازن',
    detectedKeywords: []
  };
}
