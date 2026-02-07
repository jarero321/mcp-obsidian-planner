export const TEMPLATE_ENGINE = Symbol('TEMPLATE_ENGINE');

export interface TemplateEngine {
  renderDailyNote(template: string, date: string): string;
  renderWeeklyReview(template: string, date: string): string;
  renderProject(template: string, name: string, area: string): string;
}
