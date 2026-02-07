export interface NoteProps {
  path: string;
  title: string;
  content: string;
  frontmatter: Record<string, unknown>;
  sections: Map<string, string>;
}

export class Note {
  readonly path: string;
  readonly title: string;
  readonly content: string;
  readonly frontmatter: Record<string, unknown>;
  readonly sections: Map<string, string>;

  constructor(props: NoteProps) {
    this.path = props.path;
    this.title = props.title;
    this.content = props.content;
    this.frontmatter = props.frontmatter;
    this.sections = props.sections;
  }

  getSection(name: string): string | undefined {
    return this.sections.get(name);
  }
}
