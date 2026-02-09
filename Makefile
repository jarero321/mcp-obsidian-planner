.PHONY: build install run run-sse inspect clean test

INSTALL_DIR=$(HOME)/.claude/mcp-servers/obsidian-planner
SSE_PORT=3000

build:
	@echo "Building..."
	npx nest build

install: build
	@echo "Installing to $(INSTALL_DIR)..."
	@mkdir -p $(INSTALL_DIR)/bin
	@rsync -a --delete dist/ $(INSTALL_DIR)/dist/
	@rsync -a --delete node_modules/ $(INSTALL_DIR)/node_modules/
	@cp package.json package-lock.json $(INSTALL_DIR)/
	@cp bin/mcp-obsidian-planner $(INSTALL_DIR)/bin/
	@chmod +x $(INSTALL_DIR)/bin/mcp-obsidian-planner
	@echo "Installed to $(INSTALL_DIR)"

run: build
	VAULT_PATH="$(VAULT_PATH)" node dist/main.js

run-sse: build
	VAULT_PATH="$(VAULT_PATH)" node dist/main.js --sse

inspect: build
	npx @modelcontextprotocol/inspector node dist/main.js

clean:
	rm -rf dist

test:
	npx jest

.DEFAULT_GOAL := build
