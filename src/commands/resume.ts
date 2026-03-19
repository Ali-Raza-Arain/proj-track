import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';

/**
 * Resume tracking in the current project.
 * Renames .proj-track.json.paused → .proj-track.json
 */
export async function resumeCommand(): Promise<void> {
  const configPath = path.join(process.cwd(), '.proj-track.json');
  const pausedPath = configPath + '.paused';

  if (!fs.existsSync(pausedPath)) {
    if (fs.existsSync(configPath)) {
      console.log(chalk.yellow('Tracking is not paused.'));
    } else {
      console.log(chalk.yellow('No proj-track history found in this project.'));
      console.log(chalk.dim('Run `proj-track init` first.'));
    }
    return;
  }

  fs.renameSync(pausedPath, configPath);
  console.log(chalk.green('✓ Tracking resumed.'));
}
