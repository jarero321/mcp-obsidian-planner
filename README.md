<div align="center">

```
                                  _         _     _ _
 _ __ ___   ___ _ __         ___ | |__  ___(_) __| (_) __ _ _ __
| '_ ` _ \ / __| '_ \ _____ / _ \| '_ \/ __| |/ _` | |/ _` | '_ \
| | | | | | (__| |_) |_____| (_) | |_) \__ \ | (_| | | (_| | | | |
|_| |_| |_|\___| .__/       \___/|_.__/|___/_|\__,_|_|\__,_|_| |_|
               |_|
```

### I wanted to plan my life in Obsidian with AI. So I built an MCP server for it.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![MCP](https://img.shields.io/badge/MCP-Protocol-00d4ff)

[![Version](https://img.shields.io/badge/version-1.0.0-00d4ff?style=flat-square)](package.json)
[![License](https://img.shields.io/badge/license-MIT-brightgreen?style=flat-square)](LICENSE)

**17 MCP tools for daily notes, inbox, tasks, projects, weekly reviews and full-text search**

[Getting Started](#getting-started) · [Tools](#tools) · [Architecture](#architecture) · [Configuration](#configuration)

</div>

---

## What It Does

Connects Claude Code (or any MCP client) directly to your Obsidian vault for structured planning:

- **Daily notes** — Create from templates, set Top 3 focus, track tasks
- **Inbox** — Capture ideas, prioritize, process items into projects/areas
- **Tasks** — List, add, toggle across any note or folder
- **Projects** — Create with PARA areas, track status and deadlines
- **Weekly reviews** — Auto-generate summaries with completion rates
- **Search** — Full-text search across the vault with context

Works with the [LifeOS](https://github.com/jarero321) vault structure using Templater templates and Dataview-compatible frontmatter.

---

## Getting Started

### Prerequisites

- Node.js >= 18
- An Obsidian vault with folder structure (see [Vault Structure](#vault-structure))

### Installation

```bash
git clone https://github.com/jarero321/mcp-obsidian-planner.git
cd mcp-obsidian-planner
npm install
npm run build
```

### Configure Claude Code

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "obsidian-planner": {
      "command": "node",
      "args": ["/path/to/mcp-obsidian-planner/dist/main.js"],
      "env": {
        "VAULT_PATH": "/path/to/your/obsidian/vault"
      }
    }
  }
}
```

### Configure Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "obsidian-planner": {
      "command": "node",
      "args": ["/path/to/mcp-obsidian-planner/dist/main.js"],
      "env": {
        "VAULT_PATH": "/path/to/your/obsidian/vault"
      }
    }
  }
}
```

### Verify

```bash
# Test with MCP Inspector
npm run inspect

# Or run directly
npm run start:stdio
```

---

## Tools

### Daily Notes (3)

| Tool | Description |
|------|-------------|
| `daily_create` | Create a daily note from template. Returns existing note if already created. |
| `daily_get` | Get a daily note with parsed sections (focus, tasks, log, gratitude, reflection). |
| `daily_set_focus` | Set the Top 3 focus priorities for a daily note. |

### Inbox (4)

| Tool | Description |
|------|-------------|
| `inbox_list` | List all inbox items grouped by priority (Urgente, Puede esperar, Algún día, Captura Rápida, Notas Rápidas). |
| `inbox_add` | Add a new item to the inbox with timestamp. |
| `inbox_process` | Move an inbox item to a project, daily note, area, archive, or delete it. |
| `inbox_prioritize` | Change the priority of an inbox item between sections. |

### Tasks (3)

| Tool | Description |
|------|-------------|
| `tasks_list` | List tasks from a specific note, folder, or the entire vault. Filter by status. |
| `task_toggle` | Toggle a task between pending `[ ]` and completed `[x]`. |
| `task_add` | Add a new task to a note in a specific section. |

### Weekly Reviews (2)

| Tool | Description |
|------|-------------|
| `weekly_summary` | Generate weekly summary: completed/pending tasks, dailies filled, project progress. |
| `weekly_create` | Create a weekly review note from template. |

### Search & Notes (3)

| Tool | Description |
|------|-------------|
| `vault_search` | Full-text search across the vault with context lines. |
| `note_read` | Read a note from the vault by its relative path. |
| `notes_list` | List all notes in a folder with optional pattern filter. |

### Projects (2)

| Tool | Description |
|------|-------------|
| `projects_list` | List projects with status, area, deadline. Filter by status or area. |
| `project_create` | Create a new project from template with area assignment. |

---

## Architecture

Clean Architecture with NestJS dependency injection:

```
src/
├── domain/                  # Entities, enums, value objects
│   ├── entities/            # Task, Note, DailyNote, Project, InboxItem, WeeklyReview
│   ├── enums/               # TaskStatus, ProjectStatus, InboxPriority, Area
│   └── value-objects/       # VaultPath (path traversal protection), DateRange
│
├── application/             # Business logic
│   ├── ports/               # Abstractions (VaultRepository, NoteParser, TemplateEngine, Logger)
│   └── use-cases/           # 17 use cases organized by domain
│       ├── daily/           # CreateDaily, GetDaily, SetDailyFocus
│       ├── inbox/           # ListInbox, AddInbox, ProcessInbox, PrioritizeInbox
│       ├── tasks/           # ListTasks, ToggleTask, AddTask
│       ├── weekly/          # WeeklySummary, CreateWeekly
│       ├── search/          # VaultSearch, ReadNote, ListNotes
│       └── projects/        # ListProjects, CreateProject
│
├── infrastructure/          # Concrete implementations
│   ├── vault/               # File system operations (fs/promises)
│   ├── parser/              # Markdown + frontmatter parsing (gray-matter)
│   ├── template/            # Templater syntax replacement (dayjs)
│   ├── logging/             # stderr JSON logger (stdout reserved for MCP)
│   └── mcp/                 # MCP server, handlers, presenter, tool definitions
│
└── config/                  # Vault configuration module
```

### Ports & Adapters

| Port | Symbol | Implementation |
|------|--------|----------------|
| `VaultRepository` | `VAULT_REPOSITORY` | `FsVaultRepository` — File system operations with path traversal protection |
| `NoteParser` | `NOTE_PARSER` | `MarkdownNoteParserService` — gray-matter + regex parsing |
| `TemplateEngine` | `TEMPLATE_ENGINE` | `SimpleTemplateEngineService` — Templater syntax with dayjs |
| `LoggerPort` | `LOGGER_PORT` | `StderrLoggerService` — JSON logs to stderr |

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VAULT_PATH` | Absolute path to Obsidian vault | (required) |
| `DAILY_FOLDER` | Daily notes folder | `07-Daily` |
| `INBOX_FILE` | Inbox markdown file | `01-Inbox/Inbox.md` |
| `PROJECTS_FOLDER` | Projects folder | `02-Proyectos` |
| `AREAS_FOLDER` | Areas (PARA) folder | `04-Areas` |
| `TEMPLATES_FOLDER` | Templates folder | `Templates` |
| `ARCHIVE_FOLDER` | Archive folder | `06-Archive` |

Copy `.env.example` to `.env` and adjust paths:

```bash
cp .env.example .env
```

### Transport Modes

```bash
# stdio (default) — for Claude Code / Claude Desktop
node dist/main.js

# SSE — for web clients
node dist/main.js --sse
# Runs on PORT (default: 3000)
```

---

## Vault Structure

Expected Obsidian vault layout:

```
Vault/
├── 00-Dashboard/          # Central hub with Dataview queries
├── 01-Inbox/
│   └── Inbox.md           # GTD inbox with priority sections
├── 02-Proyectos/          # Active projects with frontmatter
├── 04-Areas/              # PARA areas (Salud, Carrera, Finanzas, etc.)
├── 06-Archive/            # Archived items
├── 07-Daily/              # Daily notes (YYYY-MM-DD.md)
└── Templates/             # Templater templates
    ├── Daily Template.md
    ├── Weekly Review.md
    └── Proyecto Template.md
```

### Inbox Format

```markdown
## Captura Rápida
- [ ] Some task _2025-01-15 10:30_
- Some note _2025-01-15 11:00_

## Urgente (hacer esta semana)
- [ ] Important task _2025-01-15 09:00_

## Puede esperar
## Algún día / Quizás
## Notas Rápidas
```

### Project Frontmatter

```yaml
---
estado: En progreso
area: Carrera
inicio: 2025-01-01
deadline: 2025-03-01
objetivo: Build the thing
---
```

---

## Tech Stack

```
Runtime          Node.js 18+
Framework        NestJS 11 (application context, no HTTP)
MCP SDK          @modelcontextprotocol/sdk 1.12
Parsing          gray-matter (YAML), regex (tasks, sections)
Dates            dayjs (Templater replacement)
Validation       Zod (tool input schemas)
Architecture     Clean Architecture, Ports & Adapters
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run start:stdio` | Run MCP server (stdio) |
| `npm run start:sse` | Run MCP server (SSE) |
| `npm run inspect` | Open MCP Inspector |
| `npm test` | Run tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run lint` | Lint and fix |

---

## License

MIT
