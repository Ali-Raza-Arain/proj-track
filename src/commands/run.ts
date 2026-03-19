import { execSync } from 'node:child_process';
import chalk from 'chalk';
import { findCommandById } from '../utils/file-handler.js';
import { isProjectDirectory } from '../utils/project-detector.js';

/**
 * Re-run a previously tracked command by its ID.
 */
export async function runCommand(idStr: string): Promise<void> {
  if (!isProjectDirectory()) {
    console.log(chalk.yellow('Not a project directory.'));
    return;
  }

  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    console.log(chalk.red('Invalid command ID. Use `track` to see available commands.'));
    return;
  }

  const entry = findCommandById(id);
  if (!entry) {
    console.log(chalk.red(`Command with ID ${id} not found.`));
    console.log(chalk.dim('Use `track` to see available commands.'));
    return;
  }

  console.log(chalk.cyan(`▶ Running: ${entry.command}`));
  console.log('');

  try {
    execSync(entry.command, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  } catch (error) {
    const exitCode = (error as { status?: number }).status ?? 1;
    console.log('');
    console.log(chalk.red(`Command exited with code ${exitCode}`));
    process.exitCode = exitCode;
  }
}
