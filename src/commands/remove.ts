import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { convertToTxt } from '../utils/file-handler.js';

/**
 * Remove proj-track from the current project.
 * Converts .proj-track.json → .proj-track.txt (plain text backup).
 * Creates .proj-track-disabled marker to stop all future capture.
 */
export async function removeCommand(): Promise<void> {
  const cwd = process.cwd();
  const configPath = path.join(cwd, '.proj-track.json');
  const pausedPath = configPath + '.paused';
  const disabledPath = path.join(cwd, '.proj-track-disabled');

  // Handle paused state — rename back so convertToTxt can read it
  if (fs.existsSync(pausedPath)) {
    fs.renameSync(pausedPath, configPath);
  }

  if (!fs.existsSync(configPath)) {
    // Already removed but maybe they want to ensure it stays disabled
    if (fs.existsSync(disabledPath)) {
      console.log(chalk.yellow('proj-track is already removed from this project.'));
    } else {
      console.log(chalk.yellow('No proj-track history found in this project.'));
    }
    return;
  }

  // Convert history to plain text backup
  convertToTxt();

  // Create disabled marker to permanently stop capture in this project
  fs.writeFileSync(disabledPath, `Tracking disabled on ${new Date().toLocaleString()}\nRun "proj-track init" to re-enable.\n`, 'utf-8');

  console.log(chalk.green('✓ proj-track removed from this project.'));
  console.log(chalk.dim('  History saved to .proj-track.txt'));
  console.log(chalk.dim('  Auto-capture stopped. Run `proj-track init` to re-enable.'));
}
