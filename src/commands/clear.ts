import chalk from 'chalk';
import { clearHistory } from '../utils/file-handler.js';
import { isProjectDirectory } from '../utils/project-detector.js';

/**
 * Clear all tracked command history for the current project.
 */
export async function clearCommand(): Promise<void> {
  if (!isProjectDirectory()) {
    console.log(chalk.yellow('Not a project directory.'));
    return;
  }

  clearHistory();
  console.log(chalk.green('✓ Command history cleared.'));
}
