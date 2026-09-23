import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Briefcase, 
  User, 
  Flame, 
  Tag, 
  Filter,
  Check,
  Calendar,
  Download,
  FileCode,
  FileText,
  Copy
} from 'lucide-react';
import { Task, TaskCategory, UserProfile } from '../types';
import { generateBackupJson, generateBackupPlainText, downloadFile } from '../services/backupService';

interface TasksViewProps {
  profile?: UserProfile;
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onClose?: () => void;
}

export const TASK_CATEGORIES: {
  id: TaskCategory;
  label: string;
  labelUrdu: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeClass: string;
  activeBtnClass: string;
  dotClass: string;
}[] = [
  {
    id: 'Work',
    label: 'Work',
    labelUrdu: 'کام (Work)',
    icon: Briefcase,
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/35 shadow-[0_0_10px_rgba(59,130,246,0.15)]',
    activeBtnClass: 'bg-blue-500/25 text-blue-200 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)] font-bold',
    dotClass: 'bg-blue-400'
  },
  {
    id: 'Personal',
    label: 'Personal',
    labelUrdu: 'ذاتی (Personal)',
    icon: User,
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    activeBtnClass: 'bg-emerald-500/25 text-emerald-200 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] font-bold',
    dotClass: 'bg-emerald-400'
  },
  {
    id: 'Urgent',
    label: 'Urgent',
    labelUrdu: 'فوری (Urgent)',
    icon: Flame,
    badgeClass: 'bg-rose-500/20 text-rose-200 border-rose-500/45 shadow-[0_0_12px_rgba(244,63,94,0.25)] ring-1 ring-rose-500/20',
    activeBtnClass: 'bg-rose-500/30 text-rose-100 border-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.4)] font-bold',
    dotClass: 'bg-rose-400 animate-pulse'
  }
];

export const normalizeCategory = (cat?: string): TaskCategory => {
  if (!cat) return 'Work';
  const lower = cat.toLowerCase();
  if (lower.includes('urgent') || lower.includes('فوری')) return 'Urgent';
  if (lower.includes('personal') || lower.includes('ذاتی') || lower.includes('صحت')) return 'Personal';
  return 'Work';
};

export const TasksView: React.FC<TasksViewProps> = ({
  profile,
  tasks,
  onTasksChange,
  onClose
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('Work');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TaskCategory>('all');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const isUrdu = profile?.language === 'ur';
  const isRoman = profile?.language === 'roman-ur';

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // If marked urgent, default priority to high
    const effectivePriority = selectedCategory === 'Urgent' ? 'high' : priority;

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      completed: false,
      priority: effectivePriority,
      category: selectedCategory,
      createdAt: Date.now(),
    };

    onTasksChange([task, ...tasks]);
    setNewTitle('');
  };

  const handleToggleTask = (id: string) => {
    onTasksChange(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    onTasksChange(tasks.filter((t) => t.id !== id));
  };

  const handleUpdateCategory = (taskId: string, newCat: TaskCategory) => {
    onTasksChange(
      tasks.map((t) => (t.id === taskId ? { ...t, category: newCat } : t))
    );
    setEditingTaskId(null);
  };

  // Cycle category on badge click: Work -> Personal -> Urgent -> Work
  const handleCycleCategory = (taskId: string, currentCat?: string) => {
    const norm = normalizeCategory(currentCat);
    const order: TaskCategory[] = ['Work', 'Personal', 'Urgent'];
    const nextIndex = (order.indexOf(norm) + 1) % order.length;
    handleUpdateCategory(taskId, order[nextIndex]);
  };

  // Filtered tasks computation
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Status filter
      if (statusFilter === 'active' && t.completed) return false;
      if (statusFilter === 'completed' && !t.completed) return false;

      // Category filter
      if (categoryFilter !== 'all') {
        const cat = normalizeCategory(t.category);
        if (cat !== categoryFilter) return false;
      }

      return true;
    });
  }, [tasks, statusFilter, categoryFilter]);

  // Counts for summary metrics
  const completedCount = tasks.filter((t) => t.completed).length;
  const urgentCount = tasks.filter((t) => !t.completed && normalizeCategory(t.category) === 'Urgent').length;
  const workCount = tasks.filter((t) => !t.completed && normalizeCategory(t.category) === 'Work').length;
  const personalCount = tasks.filter((t) => !t.completed && normalizeCategory(t.category) === 'Personal').length;

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-3 space-y-5">
      {/* Header & Stats Overview */}
      <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-[var(--theme-border)] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--theme-primary)]/15 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)]">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{isUrdu ? 'روزمرہ ٹاسک مینیجر' : isRoman ? 'To-Do Task Manager' : 'To-Do Task Manager'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono font-normal">
                  {completedCount}/{tasks.length} {isUrdu ? 'مکمل' : 'Done'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {urgentCount > 0 ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                    {urgentCount} {isUrdu ? 'فوری کام باقی ہیں' : 'Urgent tasks pending'}
                  </span>
                ) : (
                  <span>{isUrdu ? 'تمام اہم کام درجہ بندی کے ساتھ منظم کریں' : 'Organized with Work, Personal, and Urgent tags'}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Category Summary Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {TASK_CATEGORIES.map((cat) => {
            const count = tasks.filter(t => normalizeCategory(t.category) === cat.id && !t.completed).length;
            const Icon = cat.icon;
            const isFilterActive = categoryFilter === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(categoryFilter === cat.id ? 'all' : cat.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isFilterActive
                    ? cat.activeBtnClass
                    : `${cat.badgeClass} opacity-85 hover:opacity-100 hover:scale-105`
                }`}
                title={`Filter by ${cat.label} tasks`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span>{cat.label}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-bold">
                  {count}
                </span>
              </button>
            );
          })}

          {/* Export Tasks Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-2.5 py-1 rounded-xl text-xs font-mono border border-white/10 hover:border-cyan-500/40 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Export To-Do Tasks (JSON or Plain Text)"
            >
              <Download className="w-3 h-3 text-cyan-400" />
              <span>Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-9 z-30 bg-slate-900 border border-cyan-500/30 rounded-2xl p-2 shadow-2xl space-y-1 min-w-[180px] animate-in fade-in zoom-in-95 font-mono text-xs">
                <div className="text-[9px] text-cyan-400 uppercase px-2 py-0.5 font-bold">
                  Export {tasks.length} Tasks:
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const json = generateBackupJson([], tasks);
                    const d = new Date().toISOString().split('T')[0];
                    downloadFile(json, `urfi_tasks_${d}.json`, 'application/json');
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
                    const txt = generateBackupPlainText([], tasks, { includeNotes: false, includeTasks: true });
                    const d = new Date().toISOString().split('T')[0];
                    downloadFile(txt, `urfi_tasks_${d}.txt`, 'text/plain');
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
                    const txt = generateBackupPlainText([], tasks, { includeNotes: false, includeTasks: true });
                    navigator.clipboard.writeText(txt);
                    setCopiedSuccess(true);
                    setTimeout(() => setCopiedSuccess(false), 2000);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-slate-200 hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                >
                  {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedSuccess ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Form with Category Selector */}
      <form onSubmit={handleAddTask} className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-[var(--theme-border-subtle)] shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={
              selectedCategory === 'Urgent'
                ? (isUrdu ? 'فوری کام کا عنوان لکھیں...' : isRoman ? 'Urgent kaam ka title likhein...' : 'What urgent task needs attention?')
                : selectedCategory === 'Work'
                ? (isUrdu ? 'کام یا دفتری ٹاسک درج کریں...' : isRoman ? 'Work ya project task likhein...' : 'Add a work/project task...')
                : (isUrdu ? 'ذاتی ٹاسک درج کریں...' : isRoman ? 'Zaati/Personal task likhein...' : 'Add a personal task...')
            }
            className="w-full sm:flex-1 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)]/40 transition-all font-mono"
          />

          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 transition-all active:scale-95 shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            style={{
              backgroundColor: 'var(--theme-primary)',
              boxShadow: '0 0 15px var(--theme-glow)',
            }}
          >
            <Plus className="w-4 h-4" />
            <span>{isUrdu ? 'ٹاسک شامل کریں' : 'Add Task'}</span>
          </button>
        </div>

        {/* Category & Priority Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          {/* Category Tag Selection */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
              <Tag className="w-3 h-3 text-cyan-400" />
              <span>Category:</span>
            </span>

            <div className="flex items-center gap-1.5">
              {TASK_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      if (cat.id === 'Urgent') setPriority('high');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? cat.activeBtnClass
                        : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cat.dotClass}`} />
                    <Icon className="w-3 h-3" />
                    <span>{cat.label}</span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Selection */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-[10px] uppercase font-bold text-slate-400">Priority:</span>
            <select
              value={priority}
              onChange={(e: any) => setPriority(e.target.value)}
              className="bg-slate-900 px-2.5 py-1 rounded-lg border border-white/10 text-xs text-slate-200 outline-none cursor-pointer hover:border-white/20"
            >
              <option value="low" className="bg-slate-950 text-slate-300">Low (کم)</option>
              <option value="medium" className="bg-slate-950 text-amber-300">Medium (معتدل)</option>
              <option value="high" className="bg-slate-950 text-rose-300">High (اعلیٰ)</option>
            </select>
          </div>
        </div>
      </form>

      {/* Filter and View Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        {/* Status Filters (All / Active / Completed) */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-mono ${
              statusFilter === 'all' 
                ? 'bg-[var(--theme-primary)] text-slate-950 font-bold shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isUrdu ? 'تمام' : 'All'} ({tasks.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-mono ${
              statusFilter === 'active' 
                ? 'bg-[var(--theme-primary)] text-slate-950 font-bold shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isUrdu ? 'باقی' : 'Pending'} ({tasks.filter(t => !t.completed).length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-mono ${
              statusFilter === 'completed' 
                ? 'bg-[var(--theme-primary)] text-slate-950 font-bold shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isUrdu ? 'مکمل' : 'Done'} ({completedCount})
          </button>
        </div>

        {/* Category Tag Filters */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">Tag Filter:</span>
          </span>

          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-slate-700 text-white border-slate-500 font-bold'
                : 'bg-slate-900/40 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Tags
          </button>

          {TASK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer flex items-center gap-1 ${
                categoryFilter === cat.id
                  ? cat.activeBtnClass
                  : `${cat.badgeClass} opacity-75 hover:opacity-100`
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cat.dotClass}`} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Task List Items */}
      <div className="space-y-2.5">
        {filteredTasks.map((task) => {
          const catMeta = TASK_CATEGORIES.find(c => c.id === normalizeCategory(task.category)) || TASK_CATEGORIES[0];
          const CategoryIcon = catMeta.icon;
          const isUrgent = catMeta.id === 'Urgent';

          return (
            <div
              key={task.id}
              className={`p-3.5 sm:p-4 rounded-2xl glass-panel border transition-all flex items-start sm:items-center justify-between gap-3 group relative ${
                task.completed 
                  ? 'opacity-60 border-white/5 bg-slate-950/30' 
                  : isUrgent
                  ? 'border-rose-500/30 bg-rose-950/10 hover:border-rose-500/50 shadow-sm'
                  : 'border-[var(--theme-border-subtle)] hover:border-[var(--theme-border)] bg-slate-950/40'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                {/* Complete Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className="text-[var(--theme-primary)] hover:scale-110 transition-transform cursor-pointer shrink-0 mt-0.5 sm:mt-0 p-0.5"
                  title={task.completed ? 'Mark as Pending' : 'Mark as Completed'}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 hover:text-[var(--theme-primary)]" />
                  )}
                </button>

                {/* Task Details */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p
                    className={`text-sm font-medium leading-snug break-words ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-100'
                    }`}
                  >
                    {task.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Color-Coded Category Badge (Click to Cycle or Change) */}
                    <button
                      type="button"
                      onClick={() => handleCycleCategory(task.id, task.category)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase border transition-all cursor-pointer hover:scale-105 active:scale-95 ${catMeta.badgeClass}`}
                      title={`Category: ${catMeta.label} (Click to switch category)`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${catMeta.dotClass}`} />
                      <CategoryIcon className="w-3 h-3" />
                      <span>{catMeta.label}</span>
                    </button>

                    {/* Priority Indicator */}
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-md uppercase font-semibold ${
                        task.priority === 'high'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : task.priority === 'medium'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-700/30 text-slate-300 border border-slate-600/30'
                      }`}
                    >
                      {task.priority}
                    </span>

                    {/* Created Time / Date */}
                    {task.createdAt && (
                      <span className="text-[9px] text-slate-500 font-mono">
                        {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Quick Category Menu Dropdown Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setEditingTaskId(editingTaskId === task.id ? null : task.id)}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
                    title="Change Tag"
                  >
                    <Tag className="w-3.5 h-3.5" />
                  </button>

                  {editingTaskId === task.id && (
                    <div className="absolute right-0 top-8 z-30 bg-slate-900 border border-cyan-500/30 rounded-xl p-1.5 shadow-2xl space-y-1 min-w-[120px] animate-in fade-in zoom-in-95">
                      <div className="text-[8px] text-cyan-400 uppercase font-mono px-2 py-0.5 font-bold">
                        Select Tag:
                      </div>
                      {TASK_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isCurrent = normalizeCategory(task.category) === cat.id;

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleUpdateCategory(task.id, cat.id)}
                            className={`w-full text-left px-2 py-1 rounded-lg text-xs font-mono flex items-center justify-between gap-2 transition-all cursor-pointer ${
                              isCurrent ? cat.badgeClass : 'text-slate-300 hover:bg-white/5'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${cat.dotClass}`} />
                              <Icon className="w-3 h-3" />
                              <span>{cat.label}</span>
                            </span>
                            {isCurrent && <Check className="w-3 h-3" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10 cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="p-12 text-center text-slate-400 glass-panel rounded-3xl border border-[var(--theme-border-subtle)] space-y-3">
            <CheckSquare className="w-10 h-10 mx-auto text-slate-500 opacity-60" />
            <div className="space-y-1">
              <p className="text-sm text-slate-300 font-medium">
                {categoryFilter !== 'all'
                  ? `No tasks found under "${categoryFilter}" category.`
                  : statusFilter === 'completed'
                  ? 'No completed tasks yet.'
                  : 'No pending tasks in this view.'}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                {categoryFilter !== 'all' 
                  ? 'Try selecting "All Tags" or add a new task with this category above.'
                  : 'Add a new task using the input form above.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksView;
