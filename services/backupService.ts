import { Note, Task, TaskCategory } from '../types';

export interface UrfiBackupData {
  version: string;
  exportedAt: string;
  timestamp: number;
  appName: string;
  notesCount: number;
  tasksCount: number;
  notes: Note[];
  tasks: Task[];
}

export interface ParseBackupResult {
  success: boolean;
  notes: Note[];
  tasks: Task[];
  error?: string;
  format: 'json' | 'text';
}

/**
 * Generates formatted JSON backup string for Notes and Tasks
 */
export function generateBackupJson(notes: Note[], tasks: Task[]): string {
  const backup: UrfiBackupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    timestamp: Date.now(),
    appName: 'URFI AI Voice Assistant',
    notesCount: notes.length,
    tasksCount: tasks.length,
    notes,
    tasks,
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Generates clean, human-readable plain text backup for Notes and To-Do list
 */
export function generateBackupPlainText(
  notes: Note[],
  tasks: Task[],
  options: { includeNotes?: boolean; includeTasks?: boolean } = { includeNotes: true, includeTasks: true }
): string {
  const lines: string[] = [];
  const exportDate = new Date().toLocaleString();

  lines.push('================================================================');
  lines.push('               URFI AI ASSISTANT - BACKUP ARCHIVE               ');
  lines.push(`Generated: ${exportDate}`);
  lines.push(`Summary: ${notes.length} Notes | ${tasks.length} Tasks`);
  lines.push('================================================================');
  lines.push('');

  // --- SECTION: TO-DO TASKS ---
  if (options.includeTasks !== false) {
    lines.push('----------------------------------------------------------------');
    lines.push(`                   TO-DO TASKS (${tasks.length} items)          `);
    lines.push('----------------------------------------------------------------');

    if (tasks.length === 0) {
      lines.push('(No tasks saved)');
    } else {
      // Group tasks by category
      const categories: { name: string; tag: TaskCategory | string }[] = [
        { name: 'URGENT TASKS', tag: 'Urgent' },
        { name: 'WORK TASKS', tag: 'Work' },
        { name: 'PERSONAL TASKS', tag: 'Personal' },
      ];

      categories.forEach(({ name, tag }) => {
        const groupTasks = tasks.filter((t) => {
          const cat = (t.category || '').toLowerCase();
          if (tag === 'Urgent') return cat.includes('urgent') || cat.includes('فوری');
          if (tag === 'Personal') return cat.includes('personal') || cat.includes('ذاتی') || cat.includes('صحت');
          // Default to Work
          return cat === 'work' || (!cat.includes('urgent') && !cat.includes('personal') && !cat.includes('ذاتی') && !cat.includes('فوری'));
        });

        if (groupTasks.length > 0) {
          lines.push(`\n[=== ${name} (${groupTasks.length}) ===]`);
          groupTasks.forEach((task, idx) => {
            const check = task.completed ? '[✓ DONE]' : '[  TODO]';
            const priorityTag = `Priority: ${task.priority.toUpperCase()}`;
            const dateStr = task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '';
            lines.push(`${check} ${idx + 1}. ${task.title}`);
            lines.push(`        Tag: ${task.category || tag} | ${priorityTag}${dateStr ? ` | Date: ${dateStr}` : ''}`);
          });
        }
      });

      // Any remaining tasks that didn't fit above
      const categorizedIds = new Set(
        tasks
          .filter((t) => {
            const c = (t.category || '').toLowerCase();
            return c.includes('urgent') || c.includes('work') || c.includes('personal') || c.includes('ذاتی') || c.includes('فوری');
          })
          .map((t) => t.id)
      );
      const otherTasks = tasks.filter((t) => !categorizedIds.has(t.id));
      if (otherTasks.length > 0) {
        lines.push(`\n[=== OTHER TASKS (${otherTasks.length}) ===]`);
        otherTasks.forEach((task, idx) => {
          const check = task.completed ? '[✓ DONE]' : '[  TODO]';
          lines.push(`${check} ${idx + 1}. ${task.title} (Category: ${task.category || 'General'})`);
        });
      }
    }
    lines.push('');
  }

  // --- SECTION: SAVED NOTES ---
  if (options.includeNotes !== false) {
    lines.push('----------------------------------------------------------------');
    lines.push(`                    SAVED NOTES (${notes.length} items)        `);
    lines.push('----------------------------------------------------------------');

    if (notes.length === 0) {
      lines.push('(No notes saved)');
    } else {
      notes.forEach((note, idx) => {
        lines.push('');
        lines.push(`### Note ${idx + 1}: ${note.title || 'Untitled Note'}`);
        lines.push(`Category: ${note.category || 'General'} ${note.pinned ? '| Pinned: Yes' : ''}`);
        lines.push(`Last Updated: ${new Date(note.updatedAt || note.createdAt || Date.now()).toLocaleString()}`);
        lines.push('--- Content ---');
        lines.push(note.content || '(Empty)');
        lines.push('----------------------------------------------------------------');
      });
    }
  }

  lines.push('');
  lines.push('================================================================');
  lines.push('End of Backup. URFI AI Voice Assistant.');
  lines.push('================================================================');

  return lines.join('\n');
}

/**
 * Triggers browser download of file
 */
export function downloadFile(content: string, fileName: string, contentType: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse a JSON or Plain Text backup string
 */
export function parseBackupContent(content: string): ParseBackupResult {
  const trimmed = content.trim();

  // Try JSON first
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      let notes: Note[] = [];
      let tasks: Task[] = [];

      if (Array.isArray(parsed)) {
        // Could be an array of notes or tasks
        parsed.forEach((item: any, idx: number) => {
          if ('completed' in item || 'priority' in item) {
            tasks.push(sanitizeTask(item, idx));
          } else if ('content' in item) {
            notes.push(sanitizeNote(item, idx));
          }
        });
      } else if (typeof parsed === 'object' && parsed !== null) {
        if (Array.isArray(parsed.notes)) {
          notes = parsed.notes.map((n: any, i: number) => sanitizeNote(n, i));
        }
        if (Array.isArray(parsed.tasks)) {
          tasks = parsed.tasks.map((t: any, i: number) => sanitizeTask(t, i));
        }
      }

      if (notes.length === 0 && tasks.length === 0) {
        return {
          success: false,
          notes: [],
          tasks: [],
          error: 'JSON file does not contain valid notes or tasks arrays.',
          format: 'json',
        };
      }

      return {
        success: true,
        notes,
        tasks,
        format: 'json',
      };
    } catch (err: any) {
      // Fall through to plain text parsing if JSON fails
    }
  }

  // Parse Plain Text
  return parsePlainTextBackup(trimmed);
}

/**
 * Parser for plain text backup files
 */
function parsePlainTextBackup(text: string): ParseBackupResult {
  const lines = text.split('\n');
  const tasks: Task[] = [];
  const notes: Note[] = [];

  let inNotesSection = false;
  let currentNote: Partial<Note> | null = null;
  let currentNoteContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.includes('SAVED NOTES')) {
      inNotesSection = true;
      continue;
    }

    if (!inNotesSection) {
      // Look for task items: [✓ DONE], [  TODO], [x], [ ]
      const taskMatch = trimmed.match(/^\[([✓xX\s]|DONE|TODO|\s+)\]\s*(?:\d+\.)?\s*(.+)$/i);
      if (taskMatch) {
        const isDone = /✓|x|DONE/i.test(taskMatch[1]);
        let taskTitle = taskMatch[2].trim();

        // Check if next line contains tag & priority
        let category: TaskCategory = 'Work';
        let priority: 'low' | 'medium' | 'high' = 'medium';

        if (i + 1 < lines.length && lines[i + 1].includes('Tag:')) {
          const metaLine = lines[i + 1];
          if (/urgent|فوری/i.test(metaLine)) category = 'Urgent';
          else if (/personal|ذاتی/i.test(metaLine)) category = 'Personal';
          else if (/work|کام/i.test(metaLine)) category = 'Work';

          if (/priority:\s*high/i.test(metaLine)) priority = 'high';
          else if (/priority:\s*low/i.test(metaLine)) priority = 'low';
          else if (/priority:\s*medium/i.test(metaLine)) priority = 'medium';
        }

        // Infer category from title if present
        if (/urgent|فوری/i.test(taskTitle)) category = 'Urgent';
        else if (/personal|ذاتی|fitness|walk/i.test(taskTitle)) category = 'Personal';

        tasks.push({
          id: `task-imported-${Date.now()}-${tasks.length}`,
          title: taskTitle,
          completed: isDone,
          priority: category === 'Urgent' ? 'high' : priority,
          category,
          createdAt: Date.now(),
        });
      }
    } else {
      // In Notes Section
      const noteTitleMatch = trimmed.match(/^### Note \d+:\s*(.+)$/);
      if (noteTitleMatch) {
        if (currentNote && currentNote.title) {
          notes.push({
            id: currentNote.id || `note-imported-${Date.now()}-${notes.length}`,
            title: currentNote.title,
            content: currentNoteContent.join('\n').trim(),
            category: currentNote.category || 'General',
            createdAt: currentNote.createdAt || Date.now(),
            updatedAt: currentNote.updatedAt || Date.now(),
            pinned: currentNote.pinned || false,
          });
        }
        currentNote = {
          id: `note-imported-${Date.now()}-${notes.length}`,
          title: noteTitleMatch[1].trim(),
          category: 'General',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        currentNoteContent = [];
        continue;
      }

      if (currentNote) {
        if (trimmed.startsWith('Category:')) {
          const cat = trimmed.replace('Category:', '').split('|')[0].trim();
          currentNote.category = cat || 'General';
          if (trimmed.includes('Pinned: Yes')) currentNote.pinned = true;
        } else if (trimmed === '--- Content ---') {
          // Content follows
        } else if (trimmed === '----------------------------------------------------------------') {
          // Separator
        } else if (!trimmed.startsWith('Last Updated:')) {
          currentNoteContent.push(line);
        }
      }
    }
  }

  // Push final note
  if (currentNote && currentNote.title) {
    notes.push({
      id: currentNote.id || `note-imported-${Date.now()}-${notes.length}`,
      title: currentNote.title,
      content: currentNoteContent.join('\n').trim(),
      category: currentNote.category || 'General',
      createdAt: currentNote.createdAt || Date.now(),
      updatedAt: currentNote.updatedAt || Date.now(),
      pinned: currentNote.pinned || false,
    });
  }

  if (tasks.length === 0 && notes.length === 0) {
    return {
      success: false,
      notes: [],
      tasks: [],
      error: 'Could not detect any valid notes or tasks in plain text format.',
      format: 'text',
    };
  }

  return {
    success: true,
    notes,
    tasks,
    format: 'text',
  };
}

/**
 * Sanitize Task object from import
 */
function sanitizeTask(item: any, idx: number): Task {
  const cat = String(item.category || '').toLowerCase();
  let category: TaskCategory = 'Work';
  if (cat.includes('urgent') || cat.includes('فوری')) category = 'Urgent';
  else if (cat.includes('personal') || cat.includes('ذاتی')) category = 'Personal';

  return {
    id: item.id ? String(item.id) : `task-import-${Date.now()}-${idx}`,
    title: String(item.title || item.name || 'Untitled Task'),
    completed: Boolean(item.completed || item.done),
    priority: ['low', 'medium', 'high'].includes(item.priority) ? item.priority : (category === 'Urgent' ? 'high' : 'medium'),
    category,
    dueDate: item.dueDate ? String(item.dueDate) : undefined,
    createdAt: Number(item.createdAt) || Date.now(),
  };
}

/**
 * Sanitize Note object from import
 */
function sanitizeNote(item: any, idx: number): Note {
  return {
    id: item.id ? String(item.id) : `note-import-${Date.now()}-${idx}`,
    title: String(item.title || 'Untitled Note'),
    content: String(item.content || item.body || item.text || ''),
    category: String(item.category || 'General'),
    createdAt: Number(item.createdAt) || Date.now(),
    updatedAt: Number(item.updatedAt) || Date.now(),
    pinned: Boolean(item.pinned),
  };
}

/**
 * Merge new notes with existing notes without duplicates
 */
export function mergeNotes(existing: Note[], incoming: Note[]): Note[] {
  const existingMap = new Map<string, Note>();
  existing.forEach((n) => existingMap.set(n.id, n));

  const result = [...existing];
  incoming.forEach((inNote) => {
    // Check if duplicate by ID or exact title
    const existingById = existingMap.get(inNote.id);
    const existingByTitle = existing.find((n) => n.title.trim().toLowerCase() === inNote.title.trim().toLowerCase());

    if (existingById) {
      // Update existing
      const idx = result.findIndex((n) => n.id === inNote.id);
      if (idx !== -1) result[idx] = inNote;
    } else if (existingByTitle) {
      // Title exists, update content or skip
      const idx = result.findIndex((n) => n.id === existingByTitle.id);
      if (idx !== -1) result[idx] = { ...existingByTitle, ...inNote, id: existingByTitle.id };
    } else {
      // New note
      result.unshift(inNote);
    }
  });

  return result;
}

/**
 * Merge new tasks with existing tasks without duplicates
 */
export function mergeTasks(existing: Task[], incoming: Task[]): Task[] {
  const existingMap = new Map<string, Task>();
  existing.forEach((t) => existingMap.set(t.id, t));

  const result = [...existing];
  incoming.forEach((inTask) => {
    const existingById = existingMap.get(inTask.id);
    const existingByTitle = existing.find((t) => t.title.trim().toLowerCase() === inTask.title.trim().toLowerCase());

    if (existingById) {
      const idx = result.findIndex((t) => t.id === inTask.id);
      if (idx !== -1) result[idx] = inTask;
    } else if (existingByTitle) {
      const idx = result.findIndex((t) => t.id === existingByTitle.id);
      if (idx !== -1) result[idx] = { ...existingByTitle, ...inTask, id: existingByTitle.id };
    } else {
      result.unshift(inTask);
    }
  });

  return result;
}
