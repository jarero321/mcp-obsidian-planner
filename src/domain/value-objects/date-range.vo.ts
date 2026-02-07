import dayjs, { Dayjs } from 'dayjs';

export class DateRange {
  public readonly start: Dayjs;
  public readonly end: Dayjs;

  constructor(start: string | Date, end: string | Date) {
    this.start = dayjs(start).startOf('day');
    this.end = dayjs(end).endOf('day');

    if (this.end.isBefore(this.start)) {
      throw new Error('End date must be after start date');
    }
  }

  contains(date: string | Date): boolean {
    const d = dayjs(date);
    return (
      (d.isAfter(this.start) || d.isSame(this.start, 'day')) &&
      (d.isBefore(this.end) || d.isSame(this.end, 'day'))
    );
  }

  get days(): number {
    return this.end.diff(this.start, 'day') + 1;
  }
}
