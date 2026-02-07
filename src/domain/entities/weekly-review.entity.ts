import { Task } from './task.entity';

export interface WeeklyReviewProps {
  weekNumber: number;
  dateRange: { start: string; end: string };
  completedTasks: Task[];
  pendingTasks: Task[];
  dailiesCount: number;
  projectsSummary: { name: string; status: string; tasksDone: number; tasksTotal: number }[];
}

export class WeeklyReview {
  readonly weekNumber: number;
  readonly dateRange: { start: string; end: string };
  readonly completedTasks: Task[];
  readonly pendingTasks: Task[];
  readonly dailiesCount: number;
  readonly projectsSummary: { name: string; status: string; tasksDone: number; tasksTotal: number }[];

  constructor(props: WeeklyReviewProps) {
    this.weekNumber = props.weekNumber;
    this.dateRange = props.dateRange;
    this.completedTasks = props.completedTasks;
    this.pendingTasks = props.pendingTasks;
    this.dailiesCount = props.dailiesCount;
    this.projectsSummary = props.projectsSummary;
  }

  get completionRate(): number {
    const total = this.completedTasks.length + this.pendingTasks.length;
    if (total === 0) return 0;
    return Math.round((this.completedTasks.length / total) * 100);
  }

  get totalTasks(): number {
    return this.completedTasks.length + this.pendingTasks.length;
  }
}
