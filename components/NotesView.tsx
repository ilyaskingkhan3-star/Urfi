import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Pin, 
  Sparkles, 
  Save, 
  X, 
  Copy, 
  Check,
  Download,
  FileCode
} from 'lucide-react';
import { Note, UserProfile } from '../types';
import { askGemini } from '../services/geminiService';
import { downloadFile, generateBackupJson, generateBackupPlainText } from '../services/backupService';

interface NotesViewProps {
  profile?: UserProfile;
  notes: Note[];
  onNotesChange: (notes: Note[]) => void;
  onClose?: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Ilyas',
  language: 'ur',
  voice: 'Kore',
  theme: 'urfi-futuristic',
  favoriteTopics: [],
};

export const NotesView: React.FC<NotesViewProps> = ({
  profile = DEFAULT_PROFILE,
  notes,
  onNotesChange,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('عمومی');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const isUrdu = profile.language === 'ur';
  const isRoman = profile.language === 'roman-ur';

  const handleStartCreate = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setCategory(isUrdu ? 'ذاتی' : 'General');
    setIsCreating(true);
  };

  const handleStartEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    if (editingNote) {
      const updated = notes.map((n) =>
        n.id === editingNote.id
          ? {
              ...n,
              title: title.trim() || 'Untitled Note',
              content: content.trim(),
              category,
              updatedAt: Date.now(),
            }
          : n
      );
      onNotesChange(updated);
    } else {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: title.trim() || (isUrdu ? 'نیا نوٹ' : 'New Note'),
        content: content.trim(),
        category,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      onNotesChange([newNote, ...notes]);
    }

    setIsCreating(false);
    setEditingNote(null);
  };

  const handleDelete = (id: string) => {
    onNotesChange(notes.filter((n) => n.id !== id));
  };

  const handleTogglePin = (id: string) => {
    onNotesChange(
      notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleAiPolish = async () => {
    if (!content.trim() || isAiProcessing) return;
    setIsAiProcessing(true);
    try {
      const prompt = `Please organize, format, and enhance this note clearly while preserving its core meaning:\n\nTitle: ${title}\n\nContent:\n${content}`;
      const res = await askGemini({
        prompt,
        profile,
      });
      setContent(res.text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleCopy = (n: Note) => {
    navigator.clipboard.writeText(`${n.title}\n\n${n.content}`);
    setCopiedId(n.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredNotes = notes.filter((n) => {
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.category.toLowerCase().includes(q);
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'نوٹس تلاش کریں...' : 'Search notes...'}
            className="w-full glass-panel px-3 py-2 pl-9 text-xs rounded-full border border-[var(--theme-border-subtle)] text-white placeholder:text-slate-500 outline-none focus:border-[var(--theme-primary)]"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Export Notes Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full font-mono text-xs text-slate-300 hover:text-white bg-slate-900/60 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              title="Export Notes as JSON or Text"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-10 z-30 bg-slate-900 border border-cyan-500/30 rounded-2xl p-2 shadow-2xl space-y-1 min-w-[170px] animate-in fade-in zoom-in-95 font-mono text-xs">
                <div className="text-[9px] text-cyan-400 uppercase px-2 py-0.5 font-bold">
                  Export {notes.length} Notes:
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const json = generateBackupJson(notes, []);
                    const d = new Date().toISOString().split('T')[0];
                    downloadFile(json, `urfi_notes_${d}.json`, 'application/json');
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-slate-200 hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>JSON File (.json)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const txt = generateBackupPlainText(notes, [], { includeNotes: true, includeTasks: false });
                    const d = new Date().toISOString().split('T')[0];
                    downloadFile(txt, `urfi_notes_${d}.txt`, 'text/plain');
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-slate-200 hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Plain Text (.txt)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const txt = generateBackupPlainText(notes, [], { includeNotes: true, includeTasks: false });
                    navigator.clipboard.writeText(txt);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-slate-200 hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy to Clipboard</span>
                </button>
              </div>
            )}
          </div>

          <button
            id="notes-create-btn"
            onClick={handleStartCreate}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold text-xs text-slate-950 transition-all active:scale-95 shadow-lg cursor-pointer"
            style={{
              backgroundColor: 'var(--theme-primary)',
              boxShadow: '0 0 15px var(--theme-glow)',
            }}
          >
            <Plus className="w-4 h-4" />
            <span>{isUrdu ? 'نیا نوٹ بنائیں' : 'Create Note'}</span>
          </button>
        </div>
      </div>

      {/* Editor Modal / Panel */}
      {isCreating && (
        <div className="p-6 rounded-3xl glass-panel border border-[var(--theme-primary)] shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono uppercase tracking-widest text-[var(--theme-primary)] font-bold">
              {editingNote ? (isUrdu ? 'نوٹ میں ترمیم' : 'Edit Note') : (isUrdu ? 'نیا نوٹ' : 'New Note')}
            </h3>
            <button
              onClick={() => setIsCreating(false)}
              className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isUrdu ? 'عنوان (Title)...' : 'Note Title...'}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-semibold text-white placeholder:text-slate-500 outline-none focus:border-[var(--theme-primary)]"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isUrdu ? 'نوٹ کی تفصیل لکھیں...' : 'Write your note here...'}
              rows={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-[var(--theme-primary)] resize-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{isUrdu ? 'زمرہ:' : 'Category:'}</span>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-300 outline-none w-28"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAiPolish}
                  disabled={!content.trim() || isAiProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 hover:bg-purple-500/30 text-xs font-medium transition-all disabled:opacity-50 cursor-pointer"
                  title="Enhance with AI"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAiProcessing ? 'animate-spin' : ''}`} />
                  <span>{isUrdu ? 'AI بہتر کرے' : 'AI Polish'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-xs text-slate-950 transition-all cursor-pointer"
                  style={{
                    backgroundColor: 'var(--theme-primary)',
                  }}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'محفوظ کریں' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`p-5 rounded-3xl glass-panel border transition-all flex flex-col justify-between space-y-3 relative group ${
              note.pinned ? 'border-[var(--theme-primary)]/50 shadow-lg' : 'border-[var(--theme-border-subtle)] hover:border-[var(--theme-border)]'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[var(--theme-badge-bg)] text-[var(--theme-primary)] font-semibold">
                  {note.category}
                </span>
                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={() => handleTogglePin(note.id)}
                    className={`p-1 hover:text-[var(--theme-primary)] transition-colors cursor-pointer ${
                      note.pinned ? 'text-[var(--theme-primary)]' : ''
                    }`}
                    title={note.pinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStartEdit(note)}
                    className="p-1 hover:text-white transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1 hover:text-red-400 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="text-base font-bold text-white leading-snug">{note.title}</h4>
              <p className="text-xs text-slate-300/90 whitespace-pre-wrap line-clamp-4 font-sans leading-relaxed">
                {note.content}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
              <span>{new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              <button
                onClick={() => handleCopy(note)}
                className="hover:text-[var(--theme-primary)] transition-colors cursor-pointer flex items-center gap-1"
              >
                {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="p-12 text-center text-slate-400 glass-panel rounded-3xl border border-[var(--theme-border-subtle)] space-y-2">
          <FileText className="w-8 h-8 mx-auto text-slate-500" />
          <p>{isUrdu ? 'کوئی نوٹ موجود نہیں ہے۔ اوپر والے بٹن سے نیا نوٹ شامل کریں۔' : 'No notes found. Create your first note above!'}</p>
        </div>
      )}
    </div>
  );
};

export default NotesView;
