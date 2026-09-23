import { GoogleGenAI } from '@google/genai';
import { UserProfile, GroundingSource, Message } from '../types';
import { getRefinerDirective } from './promptRefiner';

export function getApiKey(): string {
  return (
    process.env.API_KEY ||
    process.env.GEMINI_API_KEY ||
    (typeof window !== 'undefined' && ((window as any).GEMINI_API_KEY || (window as any).API_KEY)) ||
    ''
  );
}

export function buildSystemInstruction(profile: UserProfile): string {
  const { name, language, favoriteTopics } = profile;

  let langDirective = '';
  if (language === 'ur') {
    langDirective = `
MANDATORY LANGUAGE DIRECTIVE:
- Your default response language is pure, simple, and elegant Pakistani Urdu (اردو).
- Always address the user as "${name}" or "${name} صاحب" respectfully.
- Explain difficult things in simple words.
- Provide clear, short, and useful answers.
- If the user explicitly writes in Roman Urdu, reply naturally in Roman Urdu.
- If the user explicitly asks for English, only then switch to English.
`;
  } else if (language === 'roman-ur') {
    langDirective = `
MANDATORY LANGUAGE DIRECTIVE:
- Your default response language is natural, friendly, and easy Roman Urdu (Urdu words written in English letters).
- Follow standard Pakistani Roman Urdu style.
- Always address the user as "${name}".
- Explain difficult things in simple words.
- Provide clear, short, and useful answers.
- Only switch to full English if the user explicitly asks.
`;
  } else {
    langDirective = `
MANDATORY LANGUAGE DIRECTIVE:
- The user has chosen English as the primary language.
- Respond in clear, helpful, and concise English.
- Always be polite, respectful, and address the user as "${name}".
`;
  }

  if (profile.chatScriptMode === 'nastaliq') {
    langDirective += `
CHAT SCRIPT PREFERENCE:
- The user has explicitly enabled "Native Urdu Script (خالص اردو رسم الخط - نستعلیق)" for chat responses.
- Always write your text responses in authentic Urdu script using Noto Nastaliq characters (جیسے "آپ کیسے ہیں؟ میں آپ کی مدد کے لیے تیار ہوں۔").
- Do NOT write Urdu in English letters (Roman Urdu) when this script preference is set.
- Retain the soft, natural feminine grammar ("کرتی ہوں", "سمجھتی ہوں", "بتاؤں گی", "چاہتی ہوں") in Urdu.
`;
  } else if (profile.chatScriptMode === 'roman') {
    langDirective += `
CHAT SCRIPT PREFERENCE:
- The user has explicitly enabled "Roman Urdu" (Urdu written in English/Latin letters).
- Always write responses in clear, friendly Roman Urdu (e.g. "Main aap ki baat samajh gayi hoon.").
`;
  }

  const refinerMode = profile.promptRefinerMode || 'concise';
  const refinerDirective = getRefinerDirective(refinerMode);

  return `You are URFI AI — a smart, friendly, multilingual personal AI assistant for ${name}.
${langDirective}

${refinerDirective}

CORE BEHAVIOR:
- You are knowledgeable, warm, helpful, and empathetic.
- Help with study, writing, ideas, planning, everyday tasks, problem-solving, and general advice.
- Maintain conversation context faithfully.
- Never pretend to have performed an action that you cannot actually perform (e.g., booking real flights or changing physical device settings without access).
- When giving information, be accurate and structured.
- User favorite topics: ${favoriteTopics.join(', ')}.
`;
}

export async function askGemini({
  prompt,
  conversationHistory = [],
  profile,
  useSearch = false,
  mediaBase64,
  mediaMimeType,
}: {
  prompt: string;
  conversationHistory?: Message[];
  profile: UserProfile;
  useSearch?: boolean;
  mediaBase64?: string;
  mediaMimeType?: string;
}): Promise<{ text: string; sources?: GroundingSource[] }> {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = buildSystemInstruction(profile);

  // Build contents with recent history for context
  const contents: any[] = [];

  // Add up to last 8 messages for context
  const recentHistory = conversationHistory.slice(-8);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  }

  // Current message parts
  const currentParts: any[] = [];
  if (mediaBase64 && mediaMimeType) {
    currentParts.push({
      inlineData: {
        data: mediaBase64,
        mimeType: mediaMimeType,
      },
    });
  }
  currentParts.push({ text: prompt });
  contents.push({ role: 'user', parts: currentParts });

  const config: any = {
    systemInstruction,
    temperature: 0.7,
  };

  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config,
    });

    const text = response.text || 'معذرت، میں فی الوقت جواب تیار نہیں کر سکی۔ براہ کرم دوبارہ کوشش کیجیے۔';

    // Extract search sources if present
    const sources: GroundingSource[] = [];
    const candidate = response.candidates?.[0];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks;
    if (groundingChunks && Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || chunk.web.uri,
            uri: chunk.web.uri,
          });
        }
      }
    }

    return { text, sources: sources.length > 0 ? sources : undefined };
  } catch (error: any) {
    console.error('Gemini API call failed:', error);
    throw new Error(error.message || 'Gemini connection failed');
  }
}

export async function analyzeImage({
  base64,
  mimeType,
  query,
  profile,
}: {
  base64: string;
  mimeType: string;
  query: string;
  profile: UserProfile;
}): Promise<string> {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `${buildSystemInstruction(profile)}
IMAGE UNDERSTANDING TASK:
- Analyze the user-provided image carefully.
- Describe visible content accurately.
- Read and transcribe any visible text (OCR).
- Explain screenshots, charts, diagrams, or objects in clear detail.
- CRITICAL: Never claim to see details that are not actually visible in the image. If something is blurry or uncertain, state so honestly.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { data: base64, mimeType } },
          { text: query || 'Describe this image in detail and extract all key information or text.' },
        ],
      },
    ],
    config: { systemInstruction },
  });

  return response.text || 'تصویر کا تجزیہ مکمل نہیں ہو سکا۔';
}

export async function analyzeDocument({
  content,
  filename,
  query,
  profile,
}: {
  content: string;
  filename: string;
  query?: string;
  profile: UserProfile;
}): Promise<string> {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `${buildSystemInstruction(profile)}
DOCUMENT & FILE ASSISTANT TASK:
- You are analyzing the document titled "${filename}".
- Summarize key points, answer questions, and extract critical facts, figures, and takeaways.
- Provide structured headings and bullet points where helpful.`;

  const promptText = query
    ? `Document Name: ${filename}\n\nDocument Text:\n${content.slice(0, 40000)}\n\nUser Question:\n${query}`
    : `Please summarize the key takeaways, main findings, and structure of this document:\n\nDocument Name: ${filename}\n\nDocument Text:\n${content.slice(0, 40000)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: promptText,
    config: { systemInstruction },
  });

  return response.text || 'فائل کا تجزیہ مکمل نہیں ہو سکا۔';
}
