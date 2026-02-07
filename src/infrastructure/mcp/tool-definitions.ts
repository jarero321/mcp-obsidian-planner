import { z } from 'zod';

// Daily tools
export const createDailySchema = z.object({
  date: z.string().optional().describe('Date in YYYY-MM-DD format (defaults to today)'),
});

export const getDailySchema = z.object({
  date: z.string().optional().describe('Date in YYYY-MM-DD format (defaults to today)'),
});

export const setDailyFocusSchema = z.object({
  date: z.string().optional().describe('Date in YYYY-MM-DD format (defaults to today)'),
  focus: z.array(z.string()).min(1).max(3).describe('Top 3 priorities for the day'),
});

// Inbox tools
export const listInboxSchema = z.object({});

export const addInboxSchema = z.object({
  text: z.string().describe('Item text to add to inbox'),
  isTask: z.boolean().optional().describe('Whether this is a task (default: true)'),
  priority: z
    .enum(['Urgente', 'Puede esperar', 'Algún día', 'Captura Rápida', 'Notas Rápidas'])
    .optional()
    .describe('Priority section (default: Captura Rápida)'),
});

export const processInboxSchema = z.object({
  lineNumber: z.number().describe('Line number of the inbox item'),
  destination: z
    .enum(['project', 'daily', 'area', 'archive', 'delete'])
    .describe('Where to move the item'),
  targetPath: z
    .string()
    .optional()
    .describe('Target note path (required for project/daily/area)'),
});

export const prioritizeInboxSchema = z.object({
  lineNumber: z.number().describe('Line number of the inbox item'),
  newPriority: z
    .enum(['Urgente', 'Puede esperar', 'Algún día', 'Captura Rápida', 'Notas Rápidas'])
    .describe('New priority section'),
});

// Task tools
export const listTasksSchema = z.object({
  path: z.string().optional().describe('Specific note path to list tasks from'),
  folder: z.string().optional().describe('Folder to scan for tasks'),
  status: z.enum(['pending', 'completed']).optional().describe('Filter by task status'),
});

export const toggleTaskSchema = z.object({
  sourcePath: z.string().describe('Path of the note containing the task'),
  lineNumber: z.number().describe('Line number of the task to toggle'),
});

export const addTaskSchema = z.object({
  path: z.string().describe('Path of the note to add the task to'),
  text: z.string().describe('Task text'),
  section: z.string().optional().describe('Section header to add under (default: Tareas)'),
});

// Weekly tools
export const weeklySummarySchema = z.object({
  date: z.string().optional().describe('End date of the week in YYYY-MM-DD (defaults to today)'),
});

export const createWeeklySchema = z.object({
  date: z.string().optional().describe('Date in YYYY-MM-DD format (defaults to today)'),
});

// Search tools
export const vaultSearchSchema = z.object({
  query: z.string().describe('Search query'),
  folder: z.string().optional().describe('Folder to search in (searches entire vault if omitted)'),
  limit: z.number().optional().describe('Max results (default: 20)'),
});

export const readNoteSchema = z.object({
  path: z.string().describe('Relative path to the note in the vault'),
});

export const listNotesSchema = z.object({
  folder: z.string().describe('Folder to list notes from'),
  pattern: z.string().optional().describe('Filter by filename pattern'),
});

// Project tools
export const listProjectsSchema = z.object({
  status: z
    .enum(['Sin iniciar', 'En progreso', 'Completado', 'Pausado'])
    .optional()
    .describe('Filter by project status'),
  area: z.string().optional().describe('Filter by area'),
});

export const createProjectSchema = z.object({
  name: z.string().describe('Project name'),
  area: z
    .enum(['Salud', 'Carrera', 'Finanzas', 'Desarrollo-Personal', 'Relaciones', 'Personal'])
    .describe('Area the project belongs to'),
});

export const TOOL_DEFINITIONS = [
  // Daily
  {
    name: 'daily_create',
    description: 'Create a daily note from template. Returns existing note if already created.',
    inputSchema: createDailySchema,
  },
  {
    name: 'daily_get',
    description: 'Get a daily note with parsed sections (focus, tasks, log, gratitude, reflection)',
    inputSchema: getDailySchema,
  },
  {
    name: 'daily_set_focus',
    description: 'Set the Top 3 focus priorities for a daily note',
    inputSchema: setDailyFocusSchema,
  },
  // Inbox
  {
    name: 'inbox_list',
    description: 'List all inbox items grouped by priority (Urgente, Puede esperar, Algún día, Captura Rápida, Notas Rápidas)',
    inputSchema: listInboxSchema,
  },
  {
    name: 'inbox_add',
    description: 'Add a new item to the inbox with timestamp',
    inputSchema: addInboxSchema,
  },
  {
    name: 'inbox_process',
    description: 'Process an inbox item by moving it to a project, daily note, area, archive, or deleting it',
    inputSchema: processInboxSchema,
  },
  {
    name: 'inbox_prioritize',
    description: 'Change the priority of an inbox item by moving it to a different section',
    inputSchema: prioritizeInboxSchema,
  },
  // Tasks
  {
    name: 'tasks_list',
    description: 'List tasks from a specific note, folder, or the entire vault. Filter by status.',
    inputSchema: listTasksSchema,
  },
  {
    name: 'task_toggle',
    description: 'Toggle a task between pending [ ] and completed [x]',
    inputSchema: toggleTaskSchema,
  },
  {
    name: 'task_add',
    description: 'Add a new task to a note in the Tareas section',
    inputSchema: addTaskSchema,
  },
  // Weekly
  {
    name: 'weekly_summary',
    description: 'Generate weekly summary: completed/pending tasks, dailies filled, project progress',
    inputSchema: weeklySummarySchema,
  },
  {
    name: 'weekly_create',
    description: 'Create a weekly review note from template',
    inputSchema: createWeeklySchema,
  },
  // Search
  {
    name: 'vault_search',
    description: 'Full-text search across the vault with context lines',
    inputSchema: vaultSearchSchema,
  },
  {
    name: 'note_read',
    description: 'Read a note from the vault by its relative path',
    inputSchema: readNoteSchema,
  },
  {
    name: 'notes_list',
    description: 'List all notes in a folder',
    inputSchema: listNotesSchema,
  },
  // Projects
  {
    name: 'projects_list',
    description: 'List projects with status, area, deadline. Filter by status or area.',
    inputSchema: listProjectsSchema,
  },
  {
    name: 'project_create',
    description: 'Create a new project from template with area assignment',
    inputSchema: createProjectSchema,
  },
] as const;
