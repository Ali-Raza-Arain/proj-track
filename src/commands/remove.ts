import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { convertToTxt } from '../utils/file-handler.js';

/**
 * Remove proj-track from the current project.
 * Converts .proj-track.json → .proj-track.txt (plain text backup).
 */
export async function removeCommand(): Promise<void> {
  const configPath = path.join(process.cwd(), '.proj-track.json');
  const pausedPath = configPath + '.paused';

  // Handle paused state
  if (fs.existsSync(pausedPath)) {
    fs.renameSync(pausedPath, configPath);
  }

  if (!fs.existsSync(configPath)) {
    console.log(chalk.yellow('No proj-track history found in this project.'));
    return;
  }

  convertToTxt();

  console.log(chalk.green('✓ proj-track removed from this project.'));
  console.log(chalk.dim('  History saved to .proj-track.txt'));
}
