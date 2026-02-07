import { InboxPriority } from '@domain/enums';

export interface InboxItemProps {
  text: string;
  isTask: boolean;
  priority: InboxPriority;
  lineNumber: number;
  timestamp?: string;
  completed: boolean;
}

export class InboxItem {
  readonly text: string;
  readonly isTask: boolean;
  readonly priority: InboxPriority;
  readonly lineNumber: number;
  readonly timestamp?: string;
  readonly completed: boolean;

  constructor(props: InboxItemProps) {
    this.text = props.text;
    this.isTask = props.isTask;
    this.priority = props.priority;
    this.lineNumber = props.lineNumber;
    this.timestamp = props.timestamp;
    this.completed = props.completed;
  }

  toMarkdown(): string {
    const ts = this.timestamp ? ` _${this.timestamp}_` : '';
    if (this.isTask) {
      const checkbox = this.completed ? '[x]' : '[ ]';
      return `- ${checkbox} ${this.text}${ts}`;
    }
    return `- ${this.text}${ts}`;
  }
}
