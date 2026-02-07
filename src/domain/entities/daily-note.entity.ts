import { Task } from './task.entity';

export interface DailyNoteProps {
  date: string;
  dayOfWeek: string;
  focus: string[];
  tasks: Task[];
  log: string;
  gratitude: string[];
  reflection: string;
}

export class DailyNote {
  readonly date: string;
  readonly dayOfWeek: string;
  readonly focus: string[];
  readonly tasks: Task[];
  readonly log: string;
  readonly gratitude: string[];
  readonly reflection: string;

  constructor(props: DailyNoteProps) {
    this.date = props.date;
    this.dayOfWeek = props.dayOfWeek;
    this.focus = props.focus;
    this.tasks = props.tasks;
    this.log = props.log;
    this.gratitude = props.gratitude;
    this.reflection = props.reflection;
  }

  get completedTasks(): Task[] {
    return this.tasks.filter((t) => t.isCompleted);
  }

  get pendingTasks(): Task[] {
    return this.tasks.filter((t) => !t.isCompleted);
  }

  get completionRate(): number {
    if (this.tasks.length === 0) return 0;
    return Math.round((this.completedTasks.length / this.tasks.length) * 100);
  }
}
