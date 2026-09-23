import { GeminiVoice } from '../types';
import { speakText, stopSpeaking } from './speechService';

/**
 * The 30 official prebuilt voices for the Gemini Live API with rich metadata,
 * personality tones, gender classification, and Urdu phonetics compatibility.
 */
export const GEMINI_LIVE_VOICES_CATALOG: GeminiVoice[] = [
  {
    name: 'Aoede',
    gender: 'female',
    tone: 'Breezy & Natural',
    toneRomanUrdu: 'Halki-phulki aur qudrati',
    description: 'Light, friendly, and highly expressive. Excellent for everyday conversation and natural Urdu storytelling.',
    isUrduOptimized: true,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Yeh meri halki-phulki aur qudrati awaaz hai.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ یہ میری قدرتی آواز ہے۔',
    source: 'live-catalog'
  },
  {
    name: 'Kore',
    gender: 'female',
    tone: 'Firm & Articulate',
    toneRomanUrdu: 'Pukhta aur saaf talaffuz',
    description: 'Crisp, confident, and very clear enunciation. Outstanding clarity for Pakistani Urdu vocabulary.',
    isUrduOptimized: true,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Har lafz ka saaf aur wazeh talaffuz ada hoga.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ ہر لفظ کا صاف اور واضح تلفظ ادا ہوگا۔',
    source: 'live-catalog'
  },
  {
    name: 'Zephyr',
    gender: 'female',
    tone: 'Bright & Energetic',
    toneRomanUrdu: 'Roshan aur purjosh',
    description: 'Vibrant, cheerful, and quick-witted. Delivers information with enthusiasm and warmth.',
    isUrduOptimized: true,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Main aap ki madad ke liye har waqt tayyar hoon!',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ میں آپ کی مدد کے لیے تیار ہوں!',
    source: 'live-catalog'
  },
  {
    name: 'Puck',
    gender: 'male',
    tone: 'Upbeat & Playful',
    toneRomanUrdu: 'Khush-mizaj aur active',
    description: 'Default Gemini Live voice. Dynamic, warm, and easy to engage with across wide topics.',
    isUrduOptimized: true,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Chalein mil kar kuch naya seekhein!',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ چلیں مل کر کچھ نیا سیکھیں!',
    source: 'live-catalog'
  },
  {
    name: 'Charon',
    gender: 'male',
    tone: 'Informative & Deep',
    toneRomanUrdu: 'Sanjeeda aur gehri awaaz',
    description: 'Calm, authoritative, and steady. Best for technical analysis, news briefings, and deep reasoning.',
    isUrduOptimized: false,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Tajziyaat aur maloomat aap ke samne pesh hain.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ تجزیات اور معلومات آپ کے سامنے ہیں۔',
    source: 'live-catalog'
  },
  {
    name: 'Fenrir',
    gender: 'male',
    tone: 'Excitable & Bold',
    toneRomanUrdu: 'Joshila aur jandaar',
    description: 'Passionate and bold delivery. Engaging for brainstorming sessions and rapid Q&A.',
    isUrduOptimized: false,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Shandar aur pur-asar andaaz!',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ شاندار اور پُر اثر انداز!',
    source: 'live-catalog'
  },
  {
    name: 'Leda',
    gender: 'female',
    tone: 'Youthful & Kind',
    toneRomanUrdu: 'Naujawan aur narm-kho',
    description: 'Soft-spoken, gentle, and polite. Ideal for reminders, mindfulness, and calm companionship.',
    isUrduOptimized: true,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Narm aur shafqat bhara andaaz-e-guftagu.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ نرم اور محبت بھرا انداز۔',
    source: 'live-catalog'
  },
  {
    name: 'Sulafat',
    gender: 'female',
    tone: 'Warm & Melodic',
    toneRomanUrdu: 'Garamjosh aur sureeli',
    description: 'Rich resonance with a compassionate, comforting cadence. Very pleasant for long conversations.',
    isUrduOptimized: true,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Bohat sakoon-bakhsh aur meethi guftagu.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ بہت سکون بخش گفتگو۔',
    source: 'live-catalog'
  },
  {
    name: 'Orus',
    gender: 'male',
    tone: 'Firm & Steady',
    toneRomanUrdu: 'Mazboot aur mustehkam',
    description: 'Direct and grounded presentation with balanced pauses.',
    isUrduOptimized: false,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Wazeh aur seedhi hidayat.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ واضح اور سیدھی ہدایت۔',
    source: 'live-catalog'
  },
  {
    name: 'Autonoe',
    gender: 'female',
    tone: 'Bright & Professional',
    toneRomanUrdu: 'Roshan aur professional',
    description: 'Polished corporate articulation, crisp consonants and neutral warmth.',
    isUrduOptimized: true,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Professional aur qaabil-e-aitimad mashwara.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ قابلِ اعتماد اور پروفیشنل مشورہ۔',
    source: 'live-catalog'
  },
  {
    name: 'Umbriel',
    gender: 'male',
    tone: 'Easy-going & Relaxed',
    toneRomanUrdu: 'Pur-sukoon aur aahista',
    description: 'Casual, relaxed pace with smooth transitions between thoughts.',
    isUrduOptimized: false,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Aaram aur tassalli se baat karein.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ آرام اور تسلی سے بات کریں۔',
    source: 'live-catalog'
  },
  {
    name: 'Erinome',
    gender: 'female',
    tone: 'Clear & Elegant',
    toneRomanUrdu: 'Saaf aur shaista',
    description: 'Sophisticated pronunciation, balanced acoustic clarity.',
    isUrduOptimized: true,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Shaista aur khubsurat guftagu.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ شائستہ اور خوبصورت گفتگو۔',
    source: 'live-catalog'
  },
  {
    name: 'Laomedeia',
    gender: 'female',
    tone: 'Upbeat & Animated',
    toneRomanUrdu: 'Pur-josh aur muskurati',
    description: 'Expressive intonation curves with smiling audio resonance.',
    isUrduOptimized: true,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Muskurahat ke sath har sawal ka jawab!',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ مسکراہٹ کے ساتھ ہر سوال کا جواب!',
    source: 'live-catalog'
  },
  {
    name: 'Schedar',
    gender: 'male',
    tone: 'Even & Measured',
    toneRomanUrdu: 'Mutawazan aur sanjeeda',
    description: 'Even-tempered cadence without drastic pitch swings.',
    isUrduOptimized: false,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Har baat sanjeedgi aur ehtiyaat se.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ ہر بات سنجیدگی کے ساتھ۔',
    source: 'live-catalog'
  },
  {
    name: 'Achird',
    gender: 'male',
    tone: 'Friendly & Welcoming',
    toneRomanUrdu: 'Dostana aur khula mizaj',
    description: 'Warm, personable tone that invites open discussion.',
    isUrduOptimized: false,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Dost ki tarah har mod par madadgaar.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ ایک اچھے دوست کی طرح مددگار۔',
    source: 'live-catalog'
  },
  {
    name: 'Sadachbia',
    gender: 'female',
    tone: 'Lively & Quick',
    toneRomanUrdu: 'Chust aur taaza-dam',
    description: 'Agile voice dynamics, optimal for quick daily updates.',
    isUrduOptimized: true,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Taaza tareen khabrein aur fori jowabat.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ تازہ ترین خبریں اور فوری جوابات۔',
    source: 'live-catalog'
  },
  {
    name: 'Enceladus',
    gender: 'male',
    tone: 'Breathy & Intimate',
    toneRomanUrdu: 'Aahista aur gehri dhiemi',
    description: 'Lower sound velocity, peaceful and contemplative.',
    isUrduOptimized: false,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Dheemi aur sochi-samjhi aawaz.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ دھیمی اور سوچی سمجھی آواز۔',
    source: 'live-catalog'
  },
  {
    name: 'Algieba',
    gender: 'male',
    tone: 'Smooth & Polished',
    toneRomanUrdu: 'Mulayim aur rawani',
    description: 'Velvety acoustic texture with fluid rhythm.',
    isUrduOptimized: false,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Rawani aur khoobsurat talaffuz.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ روانی اور خوبصورت تلفظ۔',
    source: 'live-catalog'
  },
  {
    name: 'Algenib',
    gender: 'male',
    tone: 'Gravelly & Earthy',
    toneRomanUrdu: 'Bhari aur mardana',
    description: 'Textured lower register, mature and distinct presence.',
    isUrduOptimized: false,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Bhari aur mukammal aawaz.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ بھاری اور مکمل آواز۔',
    source: 'live-catalog'
  },
  {
    name: 'Achernar',
    gender: 'female',
    tone: 'Soft & Empathetic',
    toneRomanUrdu: 'Narm aur hamdardana',
    description: 'Gentle pitch with high emotional range and attentive pacing.',
    isUrduOptimized: true,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Aap ki baat poore dhiyan se sun rahi hoon.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ آپ کی بات پورے دھیان سے سن رہی ہوں۔',
    source: 'live-catalog'
  },
  {
    name: 'Gacrux',
    gender: 'male',
    tone: 'Mature & Thoughtful',
    toneRomanUrdu: 'Tajurbakar aur samajhdaar',
    description: 'Wise, thoughtful cadence suitable for reflective discussions.',
    isUrduOptimized: false,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Gehri samajh aur roshan khayalat.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ گہری سمجھ اور روشن خیالات۔',
    source: 'live-catalog'
  },
  {
    name: 'Zubenelgenubi',
    gender: 'male',
    tone: 'Casual & Modern',
    toneRomanUrdu: 'Casual aur jadeed',
    description: 'Contemporary conversational cadence with conversational ease.',
    isUrduOptimized: false,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Jadeed aur aasan baatcheet.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ جدید اور آسان بات چیت۔',
    source: 'live-catalog'
  },
  {
    name: 'Sadaltager',
    gender: 'female',
    tone: 'Knowledgeable & Articulate',
    toneRomanUrdu: 'Ilmi aur danishwarana',
    description: 'Scholarly articulation, exact syllable emphasis.',
    isUrduOptimized: true,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Ilm aur tehqeeq par mabni jowabat.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ علم اور تحقیق پر مبنی جوابات۔',
    source: 'live-catalog'
  },
  {
    name: 'Callirrhoe',
    gender: 'female',
    tone: 'Easy-going & Soothing',
    toneRomanUrdu: 'Sukoon-bakhsh aur aasan',
    description: 'Soothing rhythm without tension, great for evening interactions.',
    isUrduOptimized: true,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Shaam ki pursukoon guftagu ke liye.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ شام کی پرسکون گفتگو کے لیے۔',
    source: 'live-catalog'
  },
  {
    name: 'Iapetus',
    gender: 'male',
    tone: 'Clear & Decisive',
    toneRomanUrdu: 'Saaf aur faisla-kun',
    description: 'Clean acoustic edges and concise delivery.',
    isUrduOptimized: false,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Faisla-kun aur wazeh faisle.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ فیصلہ کن اور واضح فیصلے!',
    source: 'live-catalog'
  },
  {
    name: 'Despina',
    gender: 'female',
    tone: 'Smooth & Velvet',
    toneRomanUrdu: 'Resham jaisi rawani',
    description: 'Polished female timbre with silky micro-inflections.',
    isUrduOptimized: true,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Bohat hi mithi aur purkashish aawaz.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ بہت ہی میٹھی اور پُرکشش آواز۔',
    source: 'live-catalog'
  },
  {
    name: 'Rasalgethi',
    gender: 'male',
    tone: 'Informative & Crisp',
    toneRomanUrdu: 'Maloomati aur saaf',
    description: 'Structured report-style voicing with high intelligibility.',
    isUrduOptimized: false,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Maloomat ki drust tareen peshkash.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ معلومات کی درست ترین پیشکش۔',
    source: 'live-catalog'
  },
  {
    name: 'Alnilam',
    gender: 'male',
    tone: 'Firm & Command',
    toneRomanUrdu: 'Pukhta aur qiyadat-numa',
    description: 'Strong, leadership vocal timber with unwavering pace.',
    isUrduOptimized: false,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Qiyadati aur roshan andaz.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ قیادت اور بصیرت سے بھرپور آواز۔',
    source: 'live-catalog'
  },
  {
    name: 'Pulcherrima',
    gender: 'female',
    tone: 'Forward & Direct',
    toneRomanUrdu: 'Wazeh aur fori',
    description: 'High vocal projection, directly engages the listener.',
    isUrduOptimized: true,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Seedha mudda aur wazeh baat.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ سیدھا مدعا اور واضح بات۔',
    source: 'live-catalog'
  },
  {
    name: 'Vindemiatrix',
    gender: 'female',
    tone: 'Gentle & Delicate',
    toneRomanUrdu: 'Nazaakat aur narmi',
    description: 'Delicate, whisper-soft tone with serene frequency balance.',
    isUrduOptimized: true,
    samplePhraseRoman: 'Main URFI hoon, Ilyas. Nihayat narm aur khamosh sakoon.',
    samplePhraseUrdu: 'میں عُرفی ہوں، الیاس۔ نہایت نرم اور پُرسکون آواز۔',
    source: 'live-catalog'
  }
];

const LOCAL_STORAGE_KEY = 'urfi_fetched_gemini_voices';
const LOCAL_STORAGE_TIMESTAMP_KEY = 'urfi_voices_last_fetched';

/**
 * Retrieves cached voices from local storage, or defaults to the verified catalog.
 */
export function getStoredVoices(): GeminiVoice[] {
  if (typeof window === 'undefined') return GEMINI_LIVE_VOICES_CATALOG;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read cached voices', e);
  }
  return GEMINI_LIVE_VOICES_CATALOG;
}

/**
 * Fetches available voices from the Gemini Live / Google Voice API dynamically.
 * Attempts an API discovery call; if online and successful, extracts voices.
 * Always ensures the full verified 30 Live API voices are accessible.
 */
export async function fetchGeminiLiveVoices(apiKey?: string): Promise<{
  voices: GeminiVoice[];
  source: 'api' | 'live-catalog';
  timestamp: number;
}> {
  const timestamp = Date.now();
  let discoveredVoices: GeminiVoice[] = [];
  let source: 'api' | 'live-catalog' = 'live-catalog';

  if (apiKey) {
    try {
      // Query the official Google Text-to-Speech / Gemini Voice Registry
      const response = await fetch(`https://texttospeech.googleapis.com/v1/voices?key=${encodeURIComponent(apiKey)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.voices && Array.isArray(data.voices)) {
          source = 'api';
          // Filter or cross-correlate with Gemini Live prebuilt voices
          const apiVoiceNames = new Set<string>();
          for (const v of data.voices) {
            if (v.name) apiVoiceNames.add(v.name);
          }

          // Mark matching catalog voices as API verified
          discoveredVoices = GEMINI_LIVE_VOICES_CATALOG.map(catalogVoice => {
            const hasMatch = Array.from(apiVoiceNames).some(name => 
              name.toLowerCase().includes(catalogVoice.name.toLowerCase())
            );
            return {
              ...catalogVoice,
              source: hasMatch ? 'api' : 'live-catalog'
            };
          });
        }
      }
    } catch (e) {
      console.info('Live API voices discovery query returned, using Live catalog:', e);
    }
  }

  // Fallback / standard catalog with Live metadata
  if (discoveredVoices.length === 0) {
    discoveredVoices = [...GEMINI_LIVE_VOICES_CATALOG];
  }

  // Cache to localStorage
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(discoveredVoices));
    localStorage.setItem(LOCAL_STORAGE_TIMESTAMP_KEY, String(timestamp));
  } catch (e) {
    console.warn('Could not cache voices to localStorage', e);
  }

  return {
    voices: discoveredVoices,
    source,
    timestamp
  };
}

/**
 * Speaks an audition preview sample for a chosen voice.
 */
export function playVoiceAudition(
  voice: GeminiVoice, 
  language: 'ur' | 'roman-ur' | 'en' = 'roman-ur',
  pitch?: number
): void {
  stopSpeaking();
  const sample = language === 'ur'
    ? (voice.samplePhraseUrdu || `${voice.name}: میں عُرفی ہوں، الیاس۔`)
    : (voice.samplePhraseRoman || `Main URFI hoon, Ilyas. Yeh ${voice.name} ki awaaz ka namoona hai.`);

  speakText(sample, language, voice.name, 1.0, pitch);
}
