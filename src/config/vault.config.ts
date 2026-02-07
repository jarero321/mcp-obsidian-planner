export const VAULT_CONFIG = Symbol('VAULT_CONFIG');

export interface VaultConfig {
  vaultPath: string;
  dailyFolder: string;
  inboxFile: string;
  projectsFolder: string;
  areasFolder: string;
  templatesFolder: string;
  archiveFolder: string;
}
