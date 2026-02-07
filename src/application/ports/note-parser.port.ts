import { Note } from '@domain/entities/note.entity';
import { Task } from '@domain/entities/task.entity';
import { InboxItem } from '@domain/entities/inbox-item.entity';

export const NOTE_PARSER = Symbol('NOTE_PARSER');

export interface NoteParser {
  parse(content: string, path: string): Note;
  parseTasks(content: string, sourcePath: string): Task[];
  parseInboxItems(content: string): InboxItem[];
  parseFrontmatter(content: string): Record<string, unknown>;
  parseSections(content: string): Map<string, string>;
  extractFocusItems(content: string): string[];
}
