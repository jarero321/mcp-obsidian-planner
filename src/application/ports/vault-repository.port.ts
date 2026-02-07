export const VAULT_REPOSITORY = Symbol('VAULT_REPOSITORY');

export interface SearchResult {
  path: string;
  line: number;
  content: string;
  context: string[];
}

export interface VaultRepository {
  readFile(relativePath: string): Promise<string>;
  writeFile(relativePath: string, content: string): Promise<void>;
  fileExists(relativePath: string): Promise<boolean>;
  listFiles(folder: string, pattern?: string): Promise<string[]>;
  searchContent(query: string, folder?: string): Promise<SearchResult[]>;
  replaceLine(relativePath: string, lineNumber: number, newContent: string): Promise<void>;
  appendToSection(relativePath: string, sectionHeader: string, content: string): Promise<void>;
}
