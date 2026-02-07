import { Global, Module } from '@nestjs/common';
import { VAULT_CONFIG, VaultConfig } from './vault.config';

const vaultConfigFactory = {
  provide: VAULT_CONFIG,
  useFactory: (): VaultConfig => ({
    vaultPath: process.env.VAULT_PATH || '/mnt/c/Users/carlos/Obsidian/LifeOS',
    dailyFolder: process.env.DAILY_FOLDER || '07-Daily',
    inboxFile: process.env.INBOX_FILE || '01-Inbox/Inbox.md',
    projectsFolder: process.env.PROJECTS_FOLDER || '02-Proyectos',
    areasFolder: process.env.AREAS_FOLDER || '04-Areas',
    templatesFolder: process.env.TEMPLATES_FOLDER || 'Templates',
    archiveFolder: process.env.ARCHIVE_FOLDER || '06-Archive',
  }),
};

@Global()
@Module({
  providers: [vaultConfigFactory],
  exports: [VAULT_CONFIG],
})
export class ConfigModule {}
