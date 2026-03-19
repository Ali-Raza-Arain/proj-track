#!/usr/bin/env node

/**
 * proj-track-logger: 100% SILENT command logger.
 * Called by PROMPT_COMMAND (bash) / preexec (zsh) in background.
 * Must NEVER produce any stdout/stderr output.
 */

// SUPPRESS ALL OUTPUT (critical for clean terminal UX)
process.stdout.write = () => true;
process.stderr.write = () => true;

import { isSensitive } from './utils/security-filter.js';
import { appendCommand } from './utils/file-handler.js';
import { isProjectDirectory, isTrackingPaused } from './utils/project-detector.js';

const command = process.argv.slice(2).join(' ').trim();

// No command provided
if (!command) {
  process.exit(0);
}

// Not a project directory — silent exit
if (!isProjectDirectory()) {
  process.exit(0);
}

// Tracking is paused — silent exit
if (isTrackingPaused()) {
  process.exit(0);
}

// Sensitive command — silent exit
if (isSensitive(command)) {
  process.exit(0);
}

// Save command silently
try {
  appendCommand(command);
} catch {
  // Silently ignore any errors
}

process.exit(0);
