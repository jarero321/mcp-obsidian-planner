import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { TemplateEngine } from '@application/ports';

dayjs.extend(weekOfYear);

@Injectable()
export class SimpleTemplateEngineService implements TemplateEngine {
  renderDailyNote(template: string, date: string): string {
    const d = dayjs(date);
    let result = template;

    result = this.replaceDateExpressions(result, d);
    result = this.replaceFileTitle(result, date);
    result = this.stripCursors(result);

    return result;
  }

  renderWeeklyReview(template: string, date: string): string {
    const d = dayjs(date);
    let result = template;

    result = this.replaceDateExpressions(result, d);
    result = this.replaceFileTitle(result, `Weekly Review - ${d.format('YYYY-[W]ww')}`);
    result = this.stripCursors(result);
    // Strip dataview blocks since we handle queries programmatically
    result = this.stripDataviewBlocks(result);

    return result;
  }

  renderProject(template: string, name: string, area: string): string {
    const d = dayjs();
    let result = template;

    result = this.replaceDateExpressions(result, d);
    result = this.replaceFileTitle(result, name);
    result = this.stripCursors(result);
    // Replace the suggester call with the provided area
    result = result.replace(
      /<%\s*await\s+tp\.system\.suggester\([^)]+\)\s*%>/g,
      area,
    );
    // Replace frontmatter area reference
    result = result.replace(/<%\s*tp\.frontmatter\.area\s*%>/g, area);

    return result;
  }

  private replaceDateExpressions(content: string, baseDate: dayjs.Dayjs): string {
    // Match: <% tp.date.now("FORMAT") %> or <% tp.date.now("FORMAT", offset) %>
    return content.replace(
      /<%\s*tp\.date\.now\("([^"]+)"(?:\s*,\s*(-?\d+))?\)\s*%>/g,
      (_match, format: string, offset?: string) => {
        let d = baseDate;
        if (offset) {
          d = d.add(parseInt(offset, 10), 'day');
        }
        return d.format(format);
      },
    );
  }

  private replaceFileTitle(content: string, title: string): string {
    return content.replace(/<%\s*tp\.file\.title\s*%>/g, title);
  }

  private stripCursors(content: string): string {
    return content.replace(/<%\s*tp\.file\.cursor\(\d*\)\s*%>/g, '');
  }

  private stripDataviewBlocks(content: string): string {
    return content.replace(/```dataview[\s\S]*?```/g, '');
  }
}
