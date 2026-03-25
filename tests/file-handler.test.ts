import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  readHistory,
  writeHistory,
  appendCommand,
  clearHistory,
  convertToTxt,
  findCommandById,
} from '../src/utils/file-handler.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'proj-track-fh-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('readHistory', () => {
  it('returns empty history when file does not exist', () => {
    const history = readHistory(tmpDir);
    expect(history.commands).toEqual([]);
    expect(history.projectName).toBe(path.basename(tmpDir));
  });

  it('reads existing history file', () => {
    const data = {
      projectName: 'test-project',
      commands: [{ id: 1, command: 'npm test', timestamp: '1/1/2026' }],
    };
    fs.writeFileSync(path.join(tmpDir, '.proj-track.json'), JSON.stringify(data));

    const history = readHistory(tmpDir);
    expect(history.projectName).toBe('test-project');
    expect(history.commands).toHaveLength(1);
    expect(history.commands[0].command).toBe('npm test');
  });

  it('handles malformed JSON gracefully', () => {
    fs.writeFileSync(path.join(tmpDir, '.proj-track.json'), 'not json');
    const history = readHistory(tmpDir);
    expect(history.commands).toEqual([]);
  });
});

describe('writeHistory', () => {
  it('writes history to .proj-track.json', () => {
    const history = {
      projectName: 'my-project',
      commands: [{ id: 123, command: 'git push', timestamp: '1/1/2026' }],
    };
    writeHistory(history, tmpDir);

    const raw = fs.readFileSync(path.join(tmpDir, '.proj-track.json'), 'utf-8');
    const parsed = JSON.parse(raw);
    expect(parsed.projectName).toBe('my-project');
    expect(parsed.commands[0].command).toBe('git push');
  });
});

describe('appendCommand', () => {
  it('appends a new command', () => {
    // Create initial file
    writeHistory({ projectName: 'test', commands: [] }, tmpDir);

    appendCommand('npm install', tmpDir);
    const history = readHistory(tmpDir);
    expect(history.commands).toHaveLength(1);
    expect(history.commands[0].command).toBe('npm install');
  });

  it('deduplicates consecutive identical commands', () => {
    writeHistory({ projectName: 'test', commands: [] }, tmpDir);

    appendCommand('npm test', tmpDir);
    appendCommand('npm test', tmpDir);
    appendCommand('npm test', tmpDir);

    const history = readHistory(tmpDir);
    expect(history.commands).toHaveLength(1);
  });

  it('allows same command if not consecutive', () => {
    writeHistory({ projectName: 'test', commands: [] }, tmpDir);

    appendCommand('npm test', tmpDir);
    appendCommand('npm build', tmpDir);
    appendCommand('npm test', tmpDir);

    const history = readHistory(tmpDir);
    expect(history.commands).toHaveLength(3);
  });

  it('keeps only last 50 commands', () => {
    writeHistory({ projectName: 'test', commands: [] }, tmpDir);

    for (let i = 0; i < 60; i++) {
      appendCommand(`command-${i}`, tmpDir);
    }

    const history = readHistory(tmpDir);
    expect(history.commands).toHaveLength(50);
    expect(history.commands[0].command).toBe('command-10');
    expect(history.commands[49].command).toBe('command-59');
  });

  it('assigns timestamp to each command', () => {
    writeHistory({ projectName: 'test', commands: [] }, tmpDir);
    appendCommand('echo hello', tmpDir);

    const history = readHistory(tmpDir);
    expect(history.commands[0].timestamp).toBeTruthy();
  });
});

describe('clearHistory', () => {
  it('clears all commands', () => {
    writeHistory({
      projectName: 'test',
      commands: [
        { id: 1, command: 'npm test', timestamp: '1/1/2026' },
        { id: 2, command: 'npm build', timestamp: '1/1/2026' },
      ],
    }, tmpDir);

    clearHistory(tmpDir);
    const history = readHistory(tmpDir);
    expect(history.commands).toHaveLength(0);
    expect(history.projectName).toBe('test');
  });
});

describe('convertToTxt', () => {
  it('converts JSON to plain text and removes JSON file', () => {
    writeHistory({
      projectName: 'test',
      commands: [
        { id: 1, command: 'npm test', timestamp: '1/1/2026' },
        { id: 2, command: 'npm build', timestamp: '2/1/2026' },
      ],
    }, tmpDir);

    convertToTxt(tmpDir);

    // JSON file should be removed
    expect(fs.existsSync(path.join(tmpDir, '.proj-track.json'))).toBe(false);

    // TXT file should exist
    const txtPath = path.join(tmpDir, '.proj-track.txt');
    expect(fs.existsSync(txtPath)).toBe(true);

    const content = fs.readFileSync(txtPath, 'utf-8');
    expect(content).toContain('npm test');
    expect(content).toContain('npm build');
    expect(content).toContain('1/1/2026');
  });

  it('creates txt with placeholder when no commands exist', () => {
    writeHistory({ projectName: 'test', commands: [] }, tmpDir);
    convertToTxt(tmpDir);

    const txtPath = path.join(tmpDir, '.proj-track.txt');
    const content = fs.readFileSync(txtPath, 'utf-8');
    expect(content).toBe('# No commands were tracked');
  });
});

describe('findCommandById', () => {
  it('finds a command by its ID', () => {
    writeHistory({
      projectName: 'test',
      commands: [
        { id: 100, command: 'npm test', timestamp: '1/1/2026' },
        { id: 200, command: 'npm build', timestamp: '2/1/2026' },
      ],
    }, tmpDir);

    const found = findCommandById(200, tmpDir);
    expect(found).toBeDefined();
    expect(found!.command).toBe('npm build');
  });

  it('returns undefined for non-existent ID', () => {
    writeHistory({ projectName: 'test', commands: [] }, tmpDir);
    const found = findCommandById(999, tmpDir);
    expect(found).toBeUndefined();
  });
});
