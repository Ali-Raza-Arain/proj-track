import chalk from 'chalk';
import { readHistory } from '../utils/file-handler.js';
import { isProjectDirectory, isTrackingPaused } from '../utils/project-detector.js';

/**
 * List all tracked commands for the current project.
 */
export async function listCommand(): Promise<void> {
  if (!isProjectDirectory()) {
    console.log(chalk.yellow('Not a project directory. Run `proj-track init` to enable tracking.'));
    return;
  }

  if (isTrackingPaused()) {
    console.log(chalk.yellow('Tracking is paused. Run `proj-track resume` to resume.'));
    return;
  }

  const history = readHistory();

  if (history.commands.length === 0) {
    console.log(chalk.dim('No commands tracked yet.'));
    console.log(chalk.dim('Commands are auto-captured as you work. Try running some commands!'));
    return;
  }

  console.log('');
  console.log(chalk.bold(`  Tracked Commands (${history.commands.length})`));
  console.log(chalk.dim('  ID            Timestamp             Command'));
  console.log(chalk.dim('  ' + '─'.repeat(60)));

  for (const entry of history.commands) {
    const id = chalk.cyan(String(entry.id).padEnd(14));
    const ts = chalk.dim(entry.timestamp.padEnd(22));
    const cmd = chalk.white(entry.command);
    console.log(`  ${id}${ts}${cmd}`);
  }

  console.log('');
}
