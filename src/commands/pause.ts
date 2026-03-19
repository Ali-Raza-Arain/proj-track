import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';

/**
 * Pause tracking in the current project.
 * Renames .proj-track.json → .proj-track.json.paused
 */
export async function pauseCommand(): Promise<void> {
  const configPath = path.join(process.cwd(), '.proj-track.json');
  const pausedPath = configPath + '.paused';

  if (fs.existsSync(pausedPath)) {
    console.log(chalk.yellow('Tracking is already paused.'));
    return;
  }

  if (!fs.existsSync(configPath)) {
    console.log(chalk.yellow('No proj-track history found in this project.'));
    console.log(chalk.dim('Run `proj-track init` first.'));
    return;
  }

  fs.renameSync(configPath, pausedPath);
  console.log(chalk.green('✓ Tracking paused.'));
  console.log(chalk.dim('  Run `proj-track resume` to resume tracking.'));
}
