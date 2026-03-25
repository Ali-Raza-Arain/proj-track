import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';

const PROJ_TRACK_FILES = [
  '.proj-track.json',
  '.proj-track.json.paused',
  '.proj-track.txt',
  '.proj-track-disabled',
];

const HEADER = '# proj-track';

/**
 * Add proj-track files to .gitignore.
 * Creates the file if it doesn't exist, appends only missing entries.
 */
export function addToGitignore(dir?: string): { added: string[]; alreadyPresent: string[] } {
  const targetDir = dir || process.cwd();
  const gitignorePath = path.join(targetDir, '.gitignore');

  const existing = fs.existsSync(gitignorePath)
    ? fs.readFileSync(gitignorePath, 'utf-8')
    : '';

  const lines = existing.split('\n');
  const added: string[] = [];
  const alreadyPresent: string[] = [];

  for (const file of PROJ_TRACK_FILES) {
    if (lines.some(line => line.trim() === file)) {
      alreadyPresent.push(file);
    } else {
      added.push(file);
    }
  }

  if (added.length > 0) {
    const newEntries = `\n${HEADER}\n${added.join('\n')}\n`;
    fs.appendFileSync(gitignorePath, newEntries, 'utf-8');
  }

  return { added, alreadyPresent };
}

/**
 * Standalone gitignore command — adds proj-track files to .gitignore.
 */
export async function gitignoreCommand(): Promise<void> {
  const { added, alreadyPresent } = addToGitignore();

  if (added.length > 0) {
    console.log(chalk.green('✓ Added proj-track files to .gitignore:'));
    added.forEach(f => console.log(chalk.dim(`  ${f}`)));
  }

  if (alreadyPresent.length === PROJ_TRACK_FILES.length) {
    console.log(chalk.yellow('All proj-track files are already in .gitignore.'));
  }
}
