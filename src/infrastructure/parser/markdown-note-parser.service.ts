import { Injectable } from '@nestjs/common';
import matter from 'gray-matter';
import { basename } from 'path';
import { NoteParser } from '@application/ports';
import { Note } from '@domain/entities/note.entity';
import { Task } from '@domain/entities/task.entity';
import { InboxItem } from '@domain/entities/inbox-item.entity';
import { TaskStatus } from '@domain/enums/task-status.enum';
import { InboxPriority } from '@domain/enums/inbox-priority.enum';

const TASK_REGEX = /^(\s*)- \[([ x])\] (.+)$/;
const TIMESTAMP_REGEX = /_(\d{4}-\d{2}-\d{2} \d{2}:\d{2})_/;
const SECTION_REGEX = /^## (.+)$/;
const SUBSECTION_REGEX = /^### (.+)$/;

const INBOX_SECTION_MAP: Record<string, InboxPriority> = {
  'Captura Rápida': InboxPriority.QUICK_CAPTURE,
  'Urgente (hacer esta semana)': InboxPriority.URGENT,
  'Puede esperar': InboxPriority.CAN_WAIT,
  'Algún día / Quizás': InboxPriority.SOMEDAY,
  'Notas Rápidas': InboxPriority.QUICK_NOTES,
};

@Injectable()
export class MarkdownNoteParserService implements NoteParser {
  parse(content: string, path: string): Note {
    const title = basename(path, '.md');
    const frontmatter = this.parseFrontmatter(content);
    const sections = this.parseSections(content);

    return new Note({
      path,
      title,
      content,
      frontmatter,
      sections,
    });
  }

  parseTasks(content: string, sourcePath: string): Task[] {
    const tasks: Task[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(TASK_REGEX);
      if (match) {
        const status =
          match[2] === 'x' ? TaskStatus.COMPLETED : TaskStatus.PENDING;
        let text = match[3];
        const tsMatch = text.match(TIMESTAMP_REGEX);
        const timestamp = tsMatch ? tsMatch[1] : undefined;
        if (tsMatch) {
          text = text.replace(TIMESTAMP_REGEX, '').trim();
        }

        tasks.push(
          new Task({
            text,
            status,
            sourcePath,
            lineNumber: i + 1,
            timestamp,
          }),
        );
      }
    }

    return tasks;
  }

  parseInboxItems(content: string): InboxItem[] {
    const items: InboxItem[] = [];
    const lines = content.split('\n');
    let currentPriority: InboxPriority = InboxPriority.QUICK_CAPTURE;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for section headers
      const sectionMatch = line.match(SECTION_REGEX);
      const subsectionMatch = line.match(SUBSECTION_REGEX);

      if (sectionMatch) {
        const sectionName = sectionMatch[1].trim();
        if (INBOX_SECTION_MAP[sectionName]) {
          currentPriority = INBOX_SECTION_MAP[sectionName];
        }
      }

      if (subsectionMatch) {
        const sectionName = subsectionMatch[1].trim();
        if (INBOX_SECTION_MAP[sectionName]) {
          currentPriority = INBOX_SECTION_MAP[sectionName];
        }
      }

      // Check for task items
      const taskMatch = line.match(TASK_REGEX);
      if (taskMatch) {
        let text = taskMatch[3];
        const tsMatch = text.match(TIMESTAMP_REGEX);
        const timestamp = tsMatch ? tsMatch[1] : undefined;
        if (tsMatch) {
          text = text.replace(TIMESTAMP_REGEX, '').trim();
        }

        items.push(
          new InboxItem({
            text,
            isTask: true,
            priority: currentPriority,
            lineNumber: i + 1,
            timestamp,
            completed: taskMatch[2] === 'x',
          }),
        );
        continue;
      }

      // Check for plain list items
      const listMatch = line.match(/^- (.+)$/);
      if (listMatch && !line.startsWith('- [')) {
        let text = listMatch[1];
        // Skip blockquote instructions
        if (text.startsWith('>') || text.startsWith('**')) continue;

        const tsMatch = text.match(TIMESTAMP_REGEX);
        const timestamp = tsMatch ? tsMatch[1] : undefined;
        if (tsMatch) {
          text = text.replace(TIMESTAMP_REGEX, '').trim();
        }

        items.push(
          new InboxItem({
            text,
            isTask: false,
            priority: currentPriority,
            lineNumber: i + 1,
            timestamp,
            completed: false,
          }),
        );
      }
    }

    return items;
  }

  parseFrontmatter(content: string): Record<string, unknown> {
    try {
      const { data } = matter(content);
      return data;
    } catch {
      return {};
    }
  }

  parseSections(content: string): Map<string, string> {
    const sections = new Map<string, string>();
    const { content: body } = matter(content);
    const lines = body.split('\n');

    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      const match = line.match(SECTION_REGEX);
      if (match) {
        if (currentSection) {
          sections.set(currentSection, currentContent.join('\n').trim());
        }
        currentSection = match[1].trim();
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    if (currentSection) {
      sections.set(currentSection, currentContent.join('\n').trim());
    }

    return sections;
  }

  extractFocusItems(content: string): string[] {
    const sections = this.parseSections(content);
    const focusSection = sections.get('Enfoque del Dia (Top 3)');
    if (!focusSection) return [];

    const items: string[] = [];
    const lines = focusSection.split('\n');
    for (const line of lines) {
      const match = line.match(/^\d+\.\s*(.+)$/);
      if (match && match[1].trim()) {
        items.push(match[1].trim());
      }
    }

    return items;
  }
}
