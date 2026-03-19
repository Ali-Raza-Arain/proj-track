import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

let tmpDir: string;
let originalCwd: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'proj-track-cmd-'));
  originalCwd = process.cwd();
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe('init command', () => {
  it('creates .proj-track.json in current directory', async () => {
    // Mock shell installer to avoid modifying real shell configs
    vi.mock('../src/utils/shell-installer.js', () => ({
      installShellFunction: () => [],
      isShellFunctionInstalled: () => true,
    }));

    const { initCommand } = await import('../src/commands/init.js');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await initCommand();

    expect(fs.existsSync(path.join(tmpDir, '.proj-track.json'))).toBe(true);
    consoleSpy.mockRestore();
  });
});

describe('pause command', () => {
  it('renames .proj-track.json to .proj-track.json.paused', async () => {
    fs.writeFileSync(path.join(tmpDir, '.proj-track.json'), JSON.stringify({
      projectName: 'test',
      commands: [],
    }));

    const { pauseCommand } = await import('../src/commands/pause.js');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await pauseCommand();

    expect(fs.existsSync(path.join(tmpDir, '.proj-track.json'))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, '.proj-track.json.paused'))).toBe(true);
    consoleSpy.mockRestore();
  });

  it('shows message when already paused', async () => {
    fs.writeFileSync(path.join(tmpDir, '.proj-track.json.paused'), '{}');

    const { pauseCommand } = await import('../src/commands/pause.js');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await pauseCommand();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('already paused'));
    consoleSpy.mockRestore();
  });
});

describe('resume command', () => {
  it('renames .proj-track.json.paused back to .proj-track.json', async () => {
    fs.writeFileSync(path.join(tmpDir, '.proj-track.json.paused'), JSON.stringify({
      projectName: 'test',
      commands: [],
    }));

    const { resumeCommand } = await import('../src/commands/resume.js');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await resumeCommand();

    expect(fs.existsSync(path.join(tmpDir, '.proj-track.json.paused'))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, '.proj-track.json'))).toBe(true);
    consoleSpy.mockRestore();
  });
});

describe('remove command', () => {
  it('converts .proj-track.json to .proj-track.txt and creates disabled marker', async () => {
    fs.writeFileSync(path.join(tmpDir, '.proj-track.json'), JSON.stringify({
      projectName: 'test',
      commands: [
        { id: 1, command: 'npm test', timestamp: '1/1/2026' },
      ],
    }));

    const { removeCommand } = await import('../src/commands/remove.js');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await removeCommand();

    expect(fs.existsSync(path.join(tmpDir, '.proj-track.json'))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, '.proj-track.txt'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.proj-track-disabled'))).toBe(true);

    const content = fs.readFileSync(path.join(tmpDir, '.proj-track.txt'), 'utf-8');
    expect(content).toContain('npm test');
    consoleSpy.mockRestore();
  });

  it('handles paused state during remove', async () => {
    fs.writeFileSync(path.join(tmpDir, '.proj-track.json.paused'), JSON.stringify({
      projectName: 'test',
      commands: [{ id: 1, command: 'npm build', timestamp: '1/1/2026' }],
    }));

    const { removeCommand } = await import('../src/commands/remove.js');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await removeCommand();

    expect(fs.existsSync(path.join(tmpDir, '.proj-track.json'))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, '.proj-track.json.paused'))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, '.proj-track.txt'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.proj-track-disabled'))).toBe(true);
    consoleSpy.mockRestore();
  });
});

describe('clear command', () => {
  it('clears command history', async () => {
    // Create project marker
    fs.mkdirSync(path.join(tmpDir, '.git'));
    fs.writeFileSync(path.join(tmpDir, '.proj-track.json'), JSON.stringify({
      projectName: 'test',
      commands: [
        { id: 1, command: 'npm test', timestamp: '1/1/2026' },
      ],
    }));

    const { clearCommand } = await import('../src/commands/clear.js');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await clearCommand();

    const raw = fs.readFileSync(path.join(tmpDir, '.proj-track.json'), 'utf-8');
    const data = JSON.parse(raw);
    expect(data.commands).toHaveLength(0);
    consoleSpy.mockRestore();
  });
});

describe('list command', () => {
  it('shows message when no commands tracked', async () => {
    fs.writeFileSync(path.join(tmpDir, '.proj-track.json'), JSON.stringify({
      projectName: 'test',
      commands: [],
    }));

    const { listCommand } = await import('../src/commands/list.js');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await listCommand();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No commands tracked'));
    // Check auto-capture messaging
    const allOutput = consoleSpy.mock.calls.map(c => String(c[0])).join('\n');
    expect(allOutput).toContain('auto-captured');
    consoleSpy.mockRestore();
  });

  it('lists tracked commands', async () => {
    fs.writeFileSync(path.join(tmpDir, '.proj-track.json'), JSON.stringify({
      projectName: 'test',
      commands: [
        { id: 1, command: 'npm test', timestamp: '1/1/2026' },
        { id: 2, command: 'npm build', timestamp: '2/1/2026' },
      ],
    }));

    const { listCommand } = await import('../src/commands/list.js');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await listCommand();

    const allOutput = consoleSpy.mock.calls.map(c => String(c[0])).join('\n');
    expect(allOutput).toContain('Tracked Commands (2)');
    consoleSpy.mockRestore();
  });
});
