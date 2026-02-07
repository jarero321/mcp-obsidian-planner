import { Inject, Injectable } from '@nestjs/common';
import {
  VAULT_REPOSITORY,
  VaultRepository,
  NOTE_PARSER,
  NoteParser,
} from '@application/ports';
import { Note } from '@domain/entities';

export interface ReadNoteInput {
  path: string;
}

export interface ReadNoteOutput {
  note: Note;
}

@Injectable()
export class ReadNoteUseCase {
  constructor(
    @Inject(VAULT_REPOSITORY) private readonly vault: VaultRepository,
    @Inject(NOTE_PARSER) private readonly parser: NoteParser,
  ) {}

  async execute(input: ReadNoteInput): Promise<ReadNoteOutput> {
    const content = await this.vault.readFile(input.path);
    const note = this.parser.parse(content, input.path);
    return { note };
  }
}
