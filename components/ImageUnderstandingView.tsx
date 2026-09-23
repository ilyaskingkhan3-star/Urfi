import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, FileText, HelpCircle, Eye, Volume2, Copy, Check, X } from 'lucide-react';
import { UserProfile } from '../types';
import { analyzeImage } from '../services/geminiService';
import { speakText } from '../services/speechService';

interface ImageUnderstandingViewProps {
  profile: UserProfile;
}

export const ImageUnderstandingView: React.FC<ImageUnderstandingViewProps> = ({ profile }) => {
  const [imageFile, setImageFile] = useState<{ url: string; base64: string; mimeType: string } | null>(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUrdu = profile.language === 'ur';
  const isRoman = profile.language === 'roman-ur';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const fullUrl = reader.result as string;
      const base64 = fullUrl.split(',')[1];
      setImageFile({
        url: fullUrl,
        base64,
        mimeType: file.type || 'image/jpeg',
      });
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (customPrompt?: string) => {
    if (!imageFile || isLoading) return;
    const promptToUse = customPrompt || query;

    setIsLoading(true);
    setResult(null);
    try {
      const answer = await analyzeImage({
        base64: imageFile.base64,
        mimeType: imageFile.mimeType,
        query: promptToUse,
        profile,
      });
      setResult(answer);

      if (profile.autoSpeak) {
        speakText(answer, profile.language, profile.voice, profile.speechRate || 1.0);
      }
    } catch (e: any) {
      setResult(
        isUrdu
          ? 'معذرت، تصویر کا تجزیہ کرنے میں دشواری ہوئی ہے۔'
          : isRoman
          ? 'Image analysis mein masla hua hai. Dobara try karein.'
          : 'Failed to analyze the image. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickActions = [
    {
      title: isUrdu ? 'مکمل تفصیل بیان کریں' : isRoman ? 'Describe image in detail' : 'Describe in detail',
      prompt: isUrdu ? 'اس تصویر میں کیا کیا دکھائی دے رہا ہے؟ مکمل تفصیل سے بیان کیجیے۔' : 'Describe everything visible in this image in detail.',
      icon: Eye,
    },
    {
      title: isUrdu ? 'تحریر پڑھیں (OCR)' : isRoman ? 'Read visible text' : 'Extract visible text',
      prompt: isUrdu ? 'اس تصویر میں لکھی ہوئی تمام تحریر (Text) نکال کر پڑھیں۔' : 'Read and transcribe all visible text in this image accurately.',
      icon: FileText,
    },
    {
      title: isUrdu ? 'اسکرین شاٹ کی وضاحت' : isRoman ? 'Explain screenshot' : 'Explain screenshot/chart',
      prompt: isUrdu ? 'اس اسکرین شاٹ، چارٹ یا دستاویز کو سمجھائیں اور اہم نکات بتائیں۔' : 'Explain what this screenshot or diagram represents and highlight key takeaways.',
      icon: HelpCircle,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 space-y-6">
      {/* Upload Box */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {!imageFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--theme-border)] hover:border-[var(--theme-primary)] rounded-3xl p-10 text-center cursor-pointer glass-panel transition-all space-y-4 group"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--theme-badge-bg)] text-[var(--theme-primary)] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isUrdu ? 'تصویر منتخب کریں یا یہاں ڈراپ کریں' : isRoman ? 'Image select karein ya drop karein' : 'Select or drop an image'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              JPG, PNG, WebP • Screenshots, documents, objects, nature
            </p>
          </div>
          <button
            type="button"
            className="px-5 py-2 rounded-full font-bold text-xs text-slate-950 transition-all inline-flex items-center gap-2 shadow-lg"
            style={{
              backgroundColor: 'var(--theme-primary)',
            }}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'فائل منتخب کریں' : 'Choose Image'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Image Preview & Query */}
          <div className="p-6 rounded-3xl glass-panel border border-[var(--theme-border)] shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="relative rounded-2xl overflow-hidden max-h-[300px] border border-white/10 flex items-center justify-center bg-black/40">
              <img
                src={imageFile.url}
                alt="Uploaded"
                className="max-h-[300px] w-auto object-contain"
              />
              <button
                onClick={() => {
                  setImageFile(null);
                  setResult(null);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-950 text-white cursor-pointer"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-mono uppercase tracking-widest text-[var(--theme-primary)] font-bold">
                {isUrdu ? 'تصویر کے متعلق کیا جاننا چاہتے ہیں؟' : 'What would you like to ask?'}
              </h3>

              <div className="space-y-2">
                {quickActions.map((qa, i) => {
                  const Icon = qa.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnalyze(qa.prompt)}
                      disabled={isLoading}
                      className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
                    >
                      <Icon className="w-4 h-4 text-[var(--theme-primary)] shrink-0" />
                      <span className="font-medium">{qa.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom question input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isUrdu ? 'اپنا مخصوص سوال پوچھیں...' : 'Ask your custom question...'}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[var(--theme-primary)]"
                />
                <button
                  onClick={() => handleAnalyze()}
                  disabled={isLoading || !query.trim()}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-slate-950 transition-all cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--theme-primary)',
                  }}
                >
                  {isLoading ? '...' : (isUrdu ? 'تجزیہ' : 'Ask')}
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Result */}
          {isLoading && (
            <div className="p-8 rounded-3xl glass-panel border border-[var(--theme-border-subtle)] text-center space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-[var(--theme-primary)] animate-spin" />
              <p className="text-xs text-slate-300">
                {isUrdu ? 'عرفی تصویر کا بغور جائزہ لے رہی ہے...' : isRoman ? 'Urfi tasveer ka tajziya kar rahi hai...' : 'Analyzing visible image details...'}
              </p>
            </div>
          )}

          {result && (
            <div className="p-6 rounded-3xl glass-panel border border-[var(--theme-border)] shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--theme-primary)] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'عرفی کا بصری تجزیہ' : 'URFI Visual Analysis'}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakText(result, profile.language, profile.voice, profile.speechRate || 1.0)}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Speak"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                {result}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUnderstandingView;
