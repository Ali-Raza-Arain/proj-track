import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { isProjectDirectory, isTrackingPaused, isTrackingDisabled } from '../src/utils/project-detector.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'proj-track-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('isProjectDirectory', () => {
  it('returns true when .git directory exists', () => {
    fs.mkdirSync(path.join(tmpDir, '.git'));
    expect(isProjectDirectory(tmpDir)).toBe(true);
  });

  it('returns true when package.json exists', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{}');
    expect(isProjectDirectory(tmpDir)).toBe(true);
  });

  it('returns true when .proj-track.json exists', () => {
    fs.writeFileSync(path.join(tmpDir, '.proj-track.json'), '{"commands":[]}');
    expect(isProjectDirectory(tmpDir)).toBe(true);
  });

  it('returns false when no project markers exist', () => {
    expect(isProjectDirectory(tmpDir)).toBe(false);
  });

  it('returns true when multiple markers exist', () => {
    fs.mkdirSync(path.join(tmpDir, '.git'));
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{}');
    expect(isProjectDirectory(tmpDir)).toBe(true);
  });
});

describe('isTrackingPaused', () => {
  it('returns true when .proj-track.json.paused exists', () => {
    fs.writeFileSync(path.join(tmpDir, '.proj-track.json.paused'), '{}');
    expect(isTrackingPaused(tmpDir)).toBe(true);
  });

  it('returns false when .proj-track.json.paused does not exist', () => {
    expect(isTrackingPaused(tmpDir)).toBe(false);
  });

  it('returns false when only .proj-track.json exists (not paused)', () => {
    fs.writeFileSync(path.join(tmpDir, '.proj-track.json'), '{}');
    expect(isTrackingPaused(tmpDir)).toBe(false);
  });
});

describe('isTrackingDisabled', () => {
  it('returns true when .proj-track-disabled exists', () => {
    fs.writeFileSync(path.join(tmpDir, '.proj-track-disabled'), 'disabled');
    expect(isTrackingDisabled(tmpDir)).toBe(true);
  });

  it('returns false when .proj-track-disabled does not exist', () => {
    expect(isTrackingDisabled(tmpDir)).toBe(false);
  });

  it('returns false when only .proj-track.json exists (not disabled)', () => {
    fs.writeFileSync(path.join(tmpDir, '.proj-track.json'), '{}');
    expect(isTrackingDisabled(tmpDir)).toBe(false);
  });
});
