import { Injectable } from '@nestjs/common';
import { DailyNote, InboxItem, Project, Task, WeeklyReview, Note } from '@domain/entities';
import { SearchResult } from '@application/ports';

@Injectable()
export class McpPresenter {
  formatDailyNote(daily: DailyNote, path: string, created: boolean): string {
    const status = created ? '(created)' : '(already exists)';
    const lines = [
      `# ${daily.dayOfWeek} ${daily.date} ${status}`,
      '',
    ];

    if (daily.focus.length > 0) {
      lines.push('## Focus');
      daily.focus.forEach((f, i) => lines.push(`${i + 1}. ${f}`));
      lines.push('');
    }

    if (daily.tasks.length > 0) {
      lines.push(`## Tasks (${daily.completedTasks.length}/${daily.tasks.length} done)`);
      daily.tasks.forEach((t) => lines.push(t.toMarkdown()));
      lines.push('');
    }

    if (daily.log) {
      lines.push('## Log');
      lines.push(daily.log);
      lines.push('');
    }

    if (daily.gratitude.length > 0) {
      lines.push('## Gratitude');
      daily.gratitude.forEach((g, i) => lines.push(`${i + 1}. ${g}`));
      lines.push('');
    }

    lines.push(`Path: ${path}`);
    return lines.join('\n');
  }

  formatDailyCreated(path: string, created: boolean): string {
    const action = created ? 'Created' : 'Already exists';
    return `${action}: ${path}`;
  }

  formatFocusSet(path: string, focus: string[]): string {
    const lines = ['Focus updated:', ''];
    focus.forEach((f, i) => lines.push(`${i + 1}. ${f}`));
    lines.push('', `Path: ${path}`);
    return lines.join('\n');
  }

  formatInboxItems(items: InboxItem[], grouped: Record<string, InboxItem[]>, total: number): string {
    if (total === 0) return 'Inbox is empty';

    const lines = [`# Inbox (${total} items)`, ''];

    for (const [priority, pItems] of Object.entries(grouped)) {
      lines.push(`## ${priority} (${pItems.length})`);
      for (const item of pItems) {
        lines.push(`  L${item.lineNumber}: ${item.toMarkdown()}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  formatInboxAdded(text: string, priority: string, timestamp: string): string {
    return `Added to inbox [${priority}]: ${text} (${timestamp})`;
  }

  formatInboxProcessed(action: string, itemText: string): string {
    return `Inbox item ${action}: ${itemText}`;
  }

  formatInboxPrioritized(itemText: string, newPriority: string): string {
    return `Moved to [${newPriority}]: ${itemText}`;
  }

  formatTasks(tasks: Task[], total: number, completed: number, pending: number): string {
    if (total === 0) return 'No tasks found';

    const lines = [`# Tasks (${completed}/${total} done, ${pending} pending)`, ''];

    for (const task of tasks) {
      lines.push(`  ${task.sourcePath}:${task.lineNumber} ${task.toMarkdown()}`);
    }

    return lines.join('\n');
  }

  formatTaskToggled(text: string, newStatus: string): string {
    return `Task [${newStatus}]: ${text}`;
  }

  formatTaskAdded(path: string, text: string): string {
    return `Task added to ${path}: ${text}`;
  }

  formatWeeklySummary(review: WeeklyReview): string {
    const lines = [
      `# Weekly Summary - W${review.weekNumber}`,
      `Period: ${review.dateRange.start} to ${review.dateRange.end}`,
      '',
      `## Overview`,
      `- Dailies filled: ${review.dailiesCount}/7`,
      `- Tasks completed: ${review.completedTasks.length}`,
      `- Tasks pending: ${review.pendingTasks.length}`,
      `- Completion rate: ${review.completionRate}%`,
      '',
    ];

    if (review.projectsSummary.length > 0) {
      lines.push('## Projects');
      for (const p of review.projectsSummary) {
        lines.push(`- ${p.name} [${p.status}] (${p.tasksDone}/${p.tasksTotal} tasks)`);
      }
      lines.push('');
    }

    if (review.completedTasks.length > 0) {
      lines.push('## Completed Tasks');
      for (const t of review.completedTasks) {
        lines.push(`- ${t.text} (${t.sourcePath})`);
      }
      lines.push('');
    }

    if (review.pendingTasks.length > 0) {
      lines.push('## Pending Tasks');
      for (const t of review.pendingTasks) {
        lines.push(`- ${t.text} (${t.sourcePath})`);
      }
    }

    return lines.join('\n');
  }

  formatWeeklyCreated(path: string, created: boolean): string {
    const action = created ? 'Created' : 'Already exists';
    return `${action}: ${path}`;
  }

  formatSearchResults(results: SearchResult[], total: number, query: string): string {
    if (total === 0) return `No results found for: "${query}"`;

    const lines = [`# Search: "${query}" (${total} results)`, ''];

    for (const r of results) {
      lines.push(`## ${r.path}:${r.line}`);
      lines.push(r.content);
      if (r.context.length > 0) {
        lines.push('```');
        r.context.forEach((c) => lines.push(c));
        lines.push('```');
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  formatNote(note: Note): string {
    const lines = [`# ${note.title}`, `Path: ${note.path}`, ''];

    if (Object.keys(note.frontmatter).length > 0) {
      lines.push('## Frontmatter');
      for (const [key, value] of Object.entries(note.frontmatter)) {
        lines.push(`- ${key}: ${String(value)}`);
      }
      lines.push('');
    }

    lines.push(note.content);
    return lines.join('\n');
  }

  formatNotesList(files: string[], total: number): string {
    if (total === 0) return 'No notes found';

    const lines = [`# Notes (${total})`, ''];
    for (const f of files) {
      lines.push(`- ${f}`);
    }
    return lines.join('\n');
  }

  formatProjects(projects: Project[], total: number): string {
    if (total === 0) return 'No projects found';

    const lines = [`# Projects (${total})`, ''];

    for (const p of projects) {
      const deadline = p.deadline ? ` | deadline: ${p.deadline}` : '';
      const tasks = p.tasks.length > 0
        ? ` | ${p.completedTasks.length}/${p.tasks.length} tasks`
        : '';
      lines.push(`- **${p.name}** [${p.status}] area: ${p.area}${deadline}${tasks}`);
      if (p.objective) {
        lines.push(`  > ${p.objective.split('\n')[0]}`);
      }
    }

    return lines.join('\n');
  }

  formatProjectCreated(name: string, area: string, path: string, created: boolean): string {
    const action = created ? 'Created' : 'Already exists';
    return `${action}: ${name} [${area}] at ${path}`;
  }
}
