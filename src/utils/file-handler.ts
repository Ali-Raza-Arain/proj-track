import fs from 'node:fs';
import path from 'node:path';

export interface CommandEntry {
  id: number;
  command: string;
  timestamp: string;
}

export interface History {
  projectName: string;
  commands: CommandEntry[];
}

const HISTORY_FILE = '.proj-track.json';
const MAX_COMMANDS = 50;

function getHistoryPath(dir?: string): string {
  return path.join(dir ?? process.cwd(), HISTORY_FILE);
}

/**
 * Read command history from .proj-track.json.
 * Returns a default empty history if the file doesn't exist or is malformed.
 */
export function readHistory(dir?: string): History {
  const filePath = getHistoryPath(dir);

  if (!fs.existsSync(filePath)) {
    return {
      projectName: path.basename(dir ?? process.cwd()),
      commands: [],
    };
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw) as History;
    return {
      projectName: data.projectName || path.basename(dir ?? process.cwd()),
      commands: Array.isArray(data.commands) ? data.commands : [],
    };
  } catch {
    return {
      projectName: path.basename(dir ?? process.cwd()),
      commands: [],
    };
  }
}

/**
 * Write command history to .proj-track.json.
 */
export function writeHistory(history: History, dir?: string): void {
  const filePath = getHistoryPath(dir);
  fs.writeFileSync(filePath, JSON.stringify(history, null, 2), 'utf-8');
}

/**
 * Append a command to history with deduplication and size limit.
 */
export function appendCommand(command: string, dir?: string): void {
  const history = readHistory(dir);

  // Deduplication: skip if same as last command
  if (history.commands.length > 0) {
    const lastCmd = history.commands[history.commands.length - 1].command;
    if (lastCmd === command) {
      return;
    }
  }

  history.commands.push({
    id: Date.now(),
    command,
    timestamp: new Date().toLocaleString(),
  });

  // Keep only the last MAX_COMMANDS entries
  if (history.commands.length > MAX_COMMANDS) {
    history.commands = history.commands.slice(-MAX_COMMANDS);
  }

  writeHistory(history, dir);
}

/**
 * Clear all commands from history.
 */
export function clearHistory(dir?: string): void {
  const history = readHistory(dir);
  history.commands = [];
  writeHistory(history, dir);
}

/**
 * Convert .proj-track.json to .proj-track.txt (plain text backup).
 * Removes the JSON file after conversion.
 */
export function convertToTxt(dir?: string): void {
  const cwd = dir ?? process.cwd();
  const history = readHistory(cwd);
  const txtPath = path.join(cwd, '.proj-track.txt');

  const content = history.commands.length > 0
    ? history.commands.map(c => `${c.timestamp} | ${c.command}`).join('\n')
    : '# No commands were tracked';

  fs.writeFileSync(txtPath, content, 'utf-8');

  const jsonPath = getHistoryPath(cwd);
  if (fs.existsSync(jsonPath)) {
    fs.unlinkSync(jsonPath);
  }
}

/**
 * Find a command entry by its ID.
 */
export function findCommandById(id: number, dir?: string): CommandEntry | undefined {
  const history = readHistory(dir);
  return history.commands.find(c => c.id === id);
}
