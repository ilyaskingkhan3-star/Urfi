import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileText, 
  FileCode, 
  Copy, 
  Check, 
  Database, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  FileDown, 
  Eye, 
  EyeOff, 
  HelpCircle,
  Flame,
  Briefcase,
  User,
  Layers
} from 'lucide-react';
import { Note, Task } from '../types';
import { 
  generateBackupJson, 
  generateBackupPlainText, 
  downloadFile, 
  parseBackupContent, 
  ParseBackupResult 
} from '../services/backupService';

interface BackupRestoreSectionProps {
  notes: Note[];
  tasks: Task[];
  onRestoreData: (notes: Note[], tasks: Task[], mode: 'merge' | 'replace') => void;
  language?: 'en' | 'ur' | 'roman-ur';
}

export const BackupRestoreSection: React.FC<BackupRestoreSectionProps> = ({
  notes,
  tasks,
  onRestoreData,
  language = 'en',
}) => {
  const isUrdu = language === 'ur';
  const isRoman = language === 'roman-ur';

  // Export scope
  const [exportScope, setExportScope] = useState<'all' | 'notes' | 'tasks'>('all');
  const [isCopied, setIsCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFormat, setPreviewFormat] = useState<'json' | 'text'>('text');

  // Import / Restore state
  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  const [parsedImport, setParsedImport] = useState<ParseBackupResult | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [pastedText, setPastedText] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter items for export
  const exportNotes = exportScope === 'tasks' ? [] : notes;
  const exportTasks = exportScope === 'notes' ? [] : tasks;

  // Counts
  const urgentTasksCount = tasks.filter(
    (t) => (t.category || '').toLowerCase().includes('urgent') || (t.category || '').toLowerCase().includes('فوری')
  ).length;
  const workTasksCount = tasks.filter((t) => {
    const c = (t.category || '').toLowerCase();
    return c === 'work' || (!c.includes('urgent') && !c.includes('personal') && !c.includes('ذاتی') && !c.includes('فوری'));
  }).length;
  const personalTasksCount = tasks.filter(
    (t) => (t.category || '').toLowerCase().includes('personal') || (t.category || '').toLowerCase().includes('ذاتی')
  ).length;

  const getExportTimestamp = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Handle Export as JSON
  const handleExportJson = () => {
    const jsonStr = generateBackupJson(exportNotes, exportTasks);
    const fileName = `urfi_backup_${exportScope}_${getExportTimestamp()}.json`;
    downloadFile(jsonStr, fileName, 'application/json');
    setImportStatus({
      type: 'success',
      message: isUrdu
        ? 'JSON فائل کامیابی کے ساتھ ڈاؤنلوڈ ہو گئی ہے۔'
        : isRoman
        ? 'JSON backup file successfully download ho gayi hai.'
        : 'JSON backup file successfully exported and downloaded.',
    });
  };

  // Handle Export as Plain Text
  const handleExportPlainText = () => {
    const textStr = generateBackupPlainText(exportNotes, exportTasks, {
      includeNotes: exportScope !== 'tasks',
      includeTasks: exportScope !== 'notes',
    });
    const fileName = `urfi_backup_${exportScope}_${getExportTimestamp()}.txt`;
    downloadFile(textStr, fileName, 'text/plain');
    setImportStatus({
      type: 'success',
      message: isUrdu
        ? 'Plain Text فائل کامیابی کے ساتھ ڈاؤنلوڈ ہو گئی ہے۔'
        : isRoman
        ? 'Plain text backup file successfully download ho gayi hai.'
        : 'Plain text backup file successfully exported and downloaded.',
    });
  };

  // Handle Copy to Clipboard
  const handleCopyToClipboard = async () => {
    const textStr = generateBackupPlainText(exportNotes, exportTasks, {
      includeNotes: exportScope !== 'tasks',
      includeTasks: exportScope !== 'notes',
    });
    try {
      await navigator.clipboard.writeText(textStr);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
      setImportStatus({
        type: 'success',
        message: isUrdu
          ? 'تمام ڈیٹا کلپ بورڈ پر کاپی کر لیا گیا ہے۔'
          : isRoman
          ? 'Backup data clipboard par copy kar liya gaya hai.'
          : 'Backup data copied to clipboard.',
      });
    } catch (_) {
      // Fallback
      setImportStatus({
        type: 'error',
        message: 'Could not access clipboard. Please use file download.',
      });
    }
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      processImportContent(content, file.name);
    };
    reader.onerror = () => {
      setImportStatus({
        type: 'error',
        message: 'Failed to read the selected file.',
      });
    };
    reader.readAsText(file);
    // Reset file input so re-uploading same file works
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Process imported text or JSON
  const processImportContent = (content: string, sourceName = 'File') => {
    const parsed = parseBackupContent(content);
    if (!parsed.success) {
      setParsedImport(null);
      setImportStatus({
        type: 'error',
        message: parsed.error || `Invalid backup content from ${sourceName}.`,
      });
      return;
    }

    setParsedImport(parsed);
    setImportStatus({
      type: 'idle',
      message: '',
    });
  };

  // Execute restore action
  const handleApplyRestore = () => {
    if (!parsedImport) return;

    onRestoreData(parsedImport.notes, parsedImport.tasks, importMode);

    const notesCount = parsedImport.notes.length;
    const tasksCount = parsedImport.tasks.length;

    setImportStatus({
      type: 'success',
      message: isUrdu
        ? `بیک اپ بحال ہو گیا! ${notesCount} نوٹس اور ${tasksCount} ٹاسکس ${importMode === 'merge' ? 'شامل' : 'اوور رائٹ'} کر دیے گئے۔`
        : isRoman
        ? `Backup restore ho gaya! ${notesCount} Notes aur ${tasksCount} Tasks ${importMode === 'merge' ? 'merge' : 'overwrite'} ho gaye.`
        : `Backup successfully restored! ${notesCount} Notes and ${tasksCount} Tasks were ${importMode === 'merge' ? 'merged' : 'restored'}.`,
    });

    setParsedImport(null);
    setPastedText('');
    setShowPasteBox(false);
  };

  return (
    <section className="pt-4 border-t border-cyan-500/15 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[11px] md:text-xs text-cyan-300 tracking-wider uppercase font-bold font-mono">
              {isUrdu ? 'بیک اپ اور بحالی (Backup & Restore)' : isRoman ? 'Data Backup & Restore' : 'Data Backup & Restore'}
            </h3>
            <p className="text-[9px] text-slate-400 font-mono">
              {isUrdu
                ? 'اپنے نوٹس اور ٹاسک لسٹ کو JSON یا Plain Text میں ایکسپورٹ اور امپورٹ کریں'
                : 'Export and restore saved Notes and To-Do lists as JSON or Text'}
            </p>
          </div>
        </div>

        {/* Current Items Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            {notes.length} Notes
          </span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            {tasks.length} Tasks
          </span>
        </div>
      </div>

      {/* Status Alert Banner */}
      {importStatus.message && (
        <div
          className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2 animate-in fade-in duration-200 ${
            importStatus.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          {importStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          )}
          <div className="flex-1 leading-relaxed">{importStatus.message}</div>
          <button
            onClick={() => setImportStatus({ type: 'idle', message: '' })}
            className="text-[10px] text-slate-400 hover:text-white px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Two Columns: Export & Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* --- CARD 1: EXPORT DATA --- */}
        <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-cyan-500/20 shadow-inner space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono flex items-center gap-1.5">
                <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isUrdu ? 'ڈیٹا ایکسپورٹ کریں' : 'Export Data'}</span>
              </span>

              {/* Scope Switcher */}
              <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10 text-[9px] font-mono">
                <button
                  type="button"
                  onClick={() => setExportScope('all')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    exportScope === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setExportScope('notes')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    exportScope === 'notes' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Notes
                </button>
                <button
                  type="button"
                  onClick={() => setExportScope('tasks')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    exportScope === 'tasks' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tasks
                </button>
              </div>
            </div>

            <p className="text-[9px] text-slate-400 font-mono leading-relaxed">
              {exportScope === 'all'
                ? `Export ${notes.length} Notes and ${tasks.length} To-Do tasks in structured format.`
                : exportScope === 'notes'
                ? `Export ${notes.length} saved Notes only.`
                : `Export ${tasks.length} To-Do tasks (Work, Personal, Urgent).`}
            </p>

            {/* Export Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* JSON Export */}
              <button
                type="button"
                onClick={handleExportJson}
                className="py-2 px-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-[10px] font-mono font-bold text-cyan-300 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Download as structured JSON file"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              {/* Plain Text Export */}
              <button
                type="button"
                onClick={handleExportPlainText}
                className="py-2 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/40 text-[10px] font-mono font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Download as clean human-readable Plain Text file"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Export Text (.txt)</span>
              </button>
            </div>

            {/* Quick Actions (Copy & Preview) */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="flex-1 py-1.5 px-2 rounded-lg bg-black/30 hover:bg-black/50 border border-white/10 text-[9px] font-mono text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Plain Text'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="py-1.5 px-2 rounded-lg bg-black/30 hover:bg-black/50 border border-white/10 text-[9px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-all"
                title="Preview backup format"
              >
                {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPreview ? 'Hide' : 'Preview'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* --- CARD 2: RESTORE / IMPORT DATA --- */}
        <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-cyan-500/20 shadow-inner space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isUrdu ? 'بیک اپ بحال کریں' : 'Restore Backup'}</span>
              </span>

              <button
                type="button"
                onClick={() => setShowPasteBox(!showPasteBox)}
                className="text-[9px] font-mono text-cyan-400 hover:underline cursor-pointer"
              >
                {showPasteBox ? 'Use File Upload' : 'Paste Text / JSON'}
              </button>
            </div>

            <p className="text-[9px] text-slate-400 font-mono leading-relaxed">
              {isUrdu
                ? 'کسی بھی سابقہ .json یا .txt بیک اپ فائل سے اپنے نوٹس اور ٹاسک واپس لائیں'
                : 'Select or paste a previously exported JSON or TXT backup file to restore.'}
            </p>

            {/* File Upload Box */}
            {!showPasteBox ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json,.txt,text/plain,application/json"
                  className="hidden"
                  id="backup-file-input"
                />
                <label
                  htmlFor="backup-file-input"
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 text-[10px] font-mono text-emerald-300 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 group text-center"
                >
                  <Upload className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span>Choose Backup File (.json / .txt)</span>
                </label>
              </div>
            ) : (
              /* Paste Raw JSON/Text Box */
              <div className="space-y-2">
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste JSON or plain text backup content here..."
                  className="w-full h-20 bg-slate-900 border border-white/10 rounded-xl p-2 text-[9px] font-mono text-slate-200 outline-none focus:border-emerald-500 transition-colors resize-none placeholder:text-slate-600"
                />
                <button
                  type="button"
                  disabled={!pastedText.trim()}
                  onClick={() => processImportContent(pastedText, 'Pasted Text')}
                  className="w-full py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Parse Pasted Backup
                </button>
              </div>
            )}
          </div>

          {/* Parsed File Confirmation & Restore Mode Selection */}
          {parsedImport && (
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 mt-2 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between text-[10px] font-mono text-emerald-300">
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Detected: {parsedImport.notes.length} Notes, {parsedImport.tasks.length} Tasks
                </span>
                <span className="text-[8px] uppercase px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
                  {parsedImport.format.toUpperCase()}
                </span>
              </div>

              {/* Mode: Merge vs Replace */}
              <div className="flex items-center gap-1.5 text-[9px] font-mono">
                <span className="text-slate-400">Mode:</span>
                <label className="flex items-center gap-1 cursor-pointer text-slate-200">
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="accent-emerald-500"
                  />
                  <span>Merge (Safe)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer text-slate-200 ml-2">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="accent-rose-500"
                  />
                  <span>Overwrite All</span>
                </label>
              </div>

              {/* Apply / Cancel Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleApplyRestore}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  Confirm & Restore
                </button>
                <button
                  type="button"
                  onClick={() => setParsedImport(null)}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Backup Data Live Preview */}
      {showPreview && (
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/20 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Backup Preview ({previewFormat.toUpperCase()})</span>
            </span>

            <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded-md border border-white/10 text-[9px] font-mono">
              <button
                type="button"
                onClick={() => setPreviewFormat('text')}
                className={`px-2 py-0.5 rounded ${previewFormat === 'text' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => setPreviewFormat('json')}
                className={`px-2 py-0.5 rounded ${previewFormat === 'json' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                JSON
              </button>
            </div>
          </div>

          <pre className="max-h-40 overflow-y-auto text-[9px] font-mono text-cyan-100/70 p-2.5 rounded-xl bg-slate-900/60 border border-white/5 whitespace-pre-wrap no-scrollbar">
            {previewFormat === 'json'
              ? generateBackupJson(exportNotes, exportTasks)
              : generateBackupPlainText(exportNotes, exportTasks, {
                  includeNotes: exportScope !== 'tasks',
                  includeTasks: exportScope !== 'notes',
                })}
          </pre>
        </div>
      )}
    </section>
  );
};

export default BackupRestoreSection;
