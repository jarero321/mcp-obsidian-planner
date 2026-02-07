import { Inject, Injectable } from '@nestjs/common';
import { VAULT_CONFIG, VaultConfig } from '@config/vault.config';
import {
  VAULT_REPOSITORY,
  VaultRepository,
  NOTE_PARSER,
  NoteParser,
} from '@application/ports';
import { InboxItem } from '@domain/entities';
import { InboxPriority } from '@domain/enums';

export interface ListInboxOutput {
  items: InboxItem[];
  grouped: Record<string, InboxItem[]>;
  totalCount: number;
}

@Injectable()
export class ListInboxUseCase {
  constructor(
    @Inject(VAULT_REPOSITORY) private readonly vault: VaultRepository,
    @Inject(NOTE_PARSER) private readonly parser: NoteParser,
    @Inject(VAULT_CONFIG) private readonly config: VaultConfig,
  ) {}

  async execute(): Promise<ListInboxOutput> {
    const content = await this.vault.readFile(this.config.inboxFile);
    const items = this.parser.parseInboxItems(content);

    const grouped: Record<string, InboxItem[]> = {};
    for (const priority of Object.values(InboxPriority)) {
      const priorityItems = items.filter((i) => i.priority === priority);
      if (priorityItems.length > 0) {
        grouped[priority] = priorityItems;
      }
    }

    return {
      items,
      grouped,
      totalCount: items.length,
    };
  }
}
