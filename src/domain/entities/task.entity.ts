import { TaskStatus } from '@domain/enums';

export interface TaskProps {
  text: string;
  status: TaskStatus;
  sourcePath: string;
  lineNumber: number;
  timestamp?: string;
}

export class Task {
  readonly text: string;
  private _status: TaskStatus;
  readonly sourcePath: string;
  readonly lineNumber: number;
  readonly timestamp?: string;

  constructor(props: TaskProps) {
    this.text = props.text;
    this._status = props.status;
    this.sourcePath = props.sourcePath;
    this.lineNumber = props.lineNumber;
    this.timestamp = props.timestamp;
  }

  get status(): TaskStatus {
    return this._status;
  }

  get isCompleted(): boolean {
    return this._status === TaskStatus.COMPLETED;
  }

  toggle(): void {
    this._status =
      this._status === TaskStatus.PENDING
        ? TaskStatus.COMPLETED
        : TaskStatus.PENDING;
  }

  toMarkdown(): string {
    const checkbox = this._status === TaskStatus.COMPLETED ? '[x]' : '[ ]';
    const ts = this.timestamp ? ` _${this.timestamp}_` : '';
    return `- ${checkbox} ${this.text}${ts}`;
  }
}
