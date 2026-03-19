import { describe, it, expect } from 'vitest';
import { isSensitive, isNoiseCommand } from '../src/utils/security-filter.js';

describe('isSensitive', () => {
  // Commands that SHOULD be allowed
  it('allows proj-track commands', () => {
    expect(isSensitive('proj-track init')).toBe(false);
    expect(isSensitive('proj-track list')).toBe(false);
    expect(isSensitive('proj-track remove')).toBe(false);
  });

  it('allows track commands', () => {
    expect(isSensitive('track docker-compose up')).toBe(false);
    expect(isSensitive('track')).toBe(false);
  });

  it('allows meaningful commands', () => {
    expect(isSensitive('npm install')).toBe(false);
    expect(isSensitive('git status')).toBe(false);
    expect(isSensitive('docker-compose up')).toBe(false);
    expect(isSensitive('npm run build')).toBe(false);
    expect(isSensitive('git push origin main')).toBe(false);
  });

  // Noise commands that SHOULD be filtered
  it('filters noise commands (exact match)', () => {
    expect(isSensitive('cd')).toBe(true);
    expect(isSensitive('ls')).toBe(true);
    expect(isSensitive('clear')).toBe(true);
    expect(isSensitive('echo')).toBe(true);
    expect(isSensitive('cat')).toBe(true);
    expect(isSensitive('pwd')).toBe(true);
    expect(isSensitive('exit')).toBe(true);
    expect(isSensitive('history')).toBe(true);
    expect(isSensitive('which')).toBe(true);
    expect(isSensitive('whoami')).toBe(true);
  });

  it('filters noise commands with arguments', () => {
    expect(isSensitive('cd /home')).toBe(true);
    expect(isSensitive('ls -la')).toBe(true);
    expect(isSensitive('echo hello world')).toBe(true);
    expect(isSensitive('cat README.md')).toBe(true);
  });

  // Sensitive commands that SHOULD be filtered
  it('filters commands with password keyword', () => {
    expect(isSensitive('export PASSWORD=123')).toBe(true);
    expect(isSensitive('mysql -u root -p mydb')).toBe(true);
    expect(isSensitive('echo password123')).toBe(true);
  });

  it('filters commands with secret keyword', () => {
    expect(isSensitive('export SECRET=abc')).toBe(true);
    expect(isSensitive('echo my_secret')).toBe(true);
  });

  it('filters commands with token keyword', () => {
    expect(isSensitive('export TOKEN=xyz')).toBe(true);
    expect(isSensitive('curl -H "auth_token: abc"')).toBe(true);
  });

  it('filters commands with API key keyword', () => {
    expect(isSensitive('export API_KEY=123')).toBe(true);
    expect(isSensitive('APIKEY=test node app.js')).toBe(true);
  });

  it('filters VS Code internal commands', () => {
    expect(isSensitive('__vsc_prompt_cmd')).toBe(true);
    expect(isSensitive('__vsc_precmd')).toBe(true);
  });

  it('filters other internal commands', () => {
    expect(isSensitive('__proj_internal')).toBe(true);
    expect(isSensitive('__git_ps1')).toBe(true);
  });

  it('filters commands with inline sensitive env assignments', () => {
    expect(isSensitive('PASSWORD=hello ./run.sh')).toBe(true);
    expect(isSensitive('SECRET=mysecret node app.js')).toBe(true);
    expect(isSensitive('AUTH=bearer123 curl http://api')).toBe(true);
  });

  it('is case-insensitive for sensitive keywords', () => {
    expect(isSensitive('export PASSWORD=123')).toBe(true);
    expect(isSensitive('export password=123')).toBe(true);
    expect(isSensitive('export Password=123')).toBe(true);
  });
});

describe('isNoiseCommand', () => {
  it('detects exact noise commands', () => {
    expect(isNoiseCommand('cd')).toBe(true);
    expect(isNoiseCommand('ls')).toBe(true);
    expect(isNoiseCommand('clear')).toBe(true);
    expect(isNoiseCommand('pwd')).toBe(true);
    expect(isNoiseCommand('exit')).toBe(true);
    expect(isNoiseCommand('history')).toBe(true);
  });

  it('detects noise commands with arguments', () => {
    expect(isNoiseCommand('cd /var/log')).toBe(true);
    expect(isNoiseCommand('ls -la /tmp')).toBe(true);
    expect(isNoiseCommand('echo test')).toBe(true);
    expect(isNoiseCommand('cat file.txt')).toBe(true);
  });

  it('does not flag non-noise commands', () => {
    expect(isNoiseCommand('npm install')).toBe(false);
    expect(isNoiseCommand('git push')).toBe(false);
    expect(isNoiseCommand('docker-compose up')).toBe(false);
    expect(isNoiseCommand('mkdir new-folder')).toBe(false);
  });

  it('does not match partial names', () => {
    expect(isNoiseCommand('catalog')).toBe(false);
    expect(isNoiseCommand('clearall')).toBe(false);
    expect(isNoiseCommand('lsblk')).toBe(false);
    expect(isNoiseCommand('cdr')).toBe(false);
  });

  it('handles trimming', () => {
    expect(isNoiseCommand('  cd  ')).toBe(true);
    expect(isNoiseCommand('  ls -la ')).toBe(true);
  });
});
