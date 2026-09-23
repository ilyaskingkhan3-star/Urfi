import React, { useState } from 'react';
import { Newspaper, Globe, Cpu, Trophy, Flag, Search, Sparkles, Clock, Share2, Check } from 'lucide-react';
import { NewsArticle, NewsCategory, UserProfile } from '../types';
import { INITIAL_NEWS } from '../services/newsService';

interface NewsViewProps {
  profile: UserProfile;
}

export const NewsView: React.FC<NewsViewProps> = ({ profile }) => {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('Pakistan');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isUrdu = profile.language === 'ur';
  const isRoman = profile.language === 'roman-ur';

  const categories: { id: NewsCategory; labelUrdu: string; labelRoman: string; labelEn: string; icon: any }[] = [
    { id: 'Pakistan', labelUrdu: 'پاکستان', labelRoman: 'Pakistan', labelEn: 'Pakistan', icon: Flag },
    { id: 'Technology', labelUrdu: 'ٹیکنالوجی', labelRoman: 'Technology', labelEn: 'Technology', icon: Cpu },
    { id: 'World', labelUrdu: 'عالمی خبریں', labelRoman: 'World', labelEn: 'World', icon: Globe },
    { id: 'Sports', labelUrdu: 'کھیل', labelRoman: 'Sports', labelEn: 'Sports', icon: Trophy },
  ];

  const filteredNews = INITIAL_NEWS.filter((item) => {
    const matchesCategory = item.category === activeCategory;
    const matchesSearch = searchQuery
      ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (item: NewsArticle) => {
    navigator.clipboard.writeText(`${item.title}\n\n${item.summary}`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 space-y-6">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--theme-primary)] text-slate-950 font-bold shadow-md'
                    : 'glass-panel text-slate-300 hover:text-white border border-[var(--theme-border-subtle)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isUrdu ? cat.labelUrdu : isRoman ? cat.labelRoman : cat.labelEn}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-60">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'خبریں تلاش کریں...' : 'Search news...'}
            className="w-full glass-panel px-3 py-1.5 pl-8 text-xs rounded-full border border-[var(--theme-border-subtle)] text-white placeholder:text-slate-500 outline-none focus:border-[var(--theme-primary)]"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* News Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.map((article) => (
          <div
            key={article.id}
            className="relative p-5 rounded-3xl glass-panel border border-[var(--theme-border-subtle)] hover:border-[var(--theme-border)] transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[var(--theme-primary)]" />
                  <span>{article.time}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-semibold text-[var(--theme-text-mid)]">
                  {article.source}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-[var(--theme-primary)] transition-colors leading-snug">
                {article.title}
              </h3>

              <p className="text-xs text-slate-300/90 leading-relaxed font-sans">
                {article.summary}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                {article.category}
              </span>

              <button
                onClick={() => handleCopy(article)}
                className="flex items-center gap-1 text-[11px] hover:text-[var(--theme-primary)] transition-colors cursor-pointer"
                title="Copy News"
              >
                {copiedId === article.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">{isUrdu ? 'کاپی ہو گئی' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'شیئر' : 'Share'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="p-12 text-center text-slate-400 glass-panel rounded-3xl border border-[var(--theme-border-subtle)]">
          <p>{isUrdu ? 'اس زمرے میں کوئی خبر نہیں ملی۔' : 'No news found matching your query.'}</p>
        </div>
      )}
    </div>
  );
};

export default NewsView;
