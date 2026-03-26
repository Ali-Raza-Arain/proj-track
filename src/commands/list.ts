import chalk from 'chalk';
import Table from 'cli-table3';
import { readHistory } from '../utils/file-handler.js';
import { isProjectDirectory, isTrackingPaused } from '../utils/project-detector.js';

const CMD_MAX_LEN = 50;

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts);
    if (isNaN(date.getTime())) return ts;
    const mon = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hr = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${mon}/${day} ${hr}:${min}`;
  } catch {
    return ts;
  }
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '...' : str;
}

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
    console.log('');
    console.log(chalk.dim('  No commands tracked yet.'));
    console.log(chalk.dim('  Commands are auto-captured as you work. Try running some commands!'));
    console.log('');
    return;
  }

  console.log('');
  console.log(chalk.bold(`  Tracked Commands (${history.commands.length})`));
  console.log('');

  const table = new Table({
    head: [
      chalk.cyan('ID'),
      chalk.dim('Time'),
      chalk.white('Command'),
    ],
    style: { head: [], border: ['dim'], 'padding-left': 1, 'padding-right': 1 },
    chars: {
      'top': '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
      'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
      'left': '│', 'left-mid': '├', 'mid': '─', 'mid-mid': '┼',
      'right': '│', 'right-mid': '┤', 'middle': '│',
    },
    colAligns: ['right', 'left', 'left'],
  });

  for (const entry of history.commands) {
    table.push([
      chalk.cyan(String(entry.id)),
      // chalk.dim(formatTimestamp(entry.timestamp)),
      chalk.dim(entry.timestamp),
      chalk.white(truncate(entry.command, CMD_MAX_LEN)),
    ]);
  }

  console.log(table.toString());
  console.log('');
  console.log(chalk.dim(`  Run a command: proj-track run <id>`));
  console.log('');
}
