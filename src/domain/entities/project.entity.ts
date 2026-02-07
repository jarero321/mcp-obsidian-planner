import { ProjectStatus } from '@domain/enums';
import { Task } from './task.entity';

export interface ProjectProps {
  name: string;
  path: string;
  status: ProjectStatus;
  startDate: string;
  deadline: string;
  area: string;
  objective: string;
  tasks: Task[];
}

export class Project {
  readonly name: string;
  readonly path: string;
  readonly status: ProjectStatus;
  readonly startDate: string;
  readonly deadline: string;
  readonly area: string;
  readonly objective: string;
  readonly tasks: Task[];

  constructor(props: ProjectProps) {
    this.name = props.name;
    this.path = props.path;
    this.status = props.status;
    this.startDate = props.startDate;
    this.deadline = props.deadline;
    this.area = props.area;
    this.objective = props.objective;
    this.tasks = props.tasks;
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
