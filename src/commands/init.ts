import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { readHistory, writeHistory } from '../utils/file-handler.js';
import { installShellFunction, isShellFunctionInstalled } from '../utils/shell-installer.js';

/**
 * Initialize proj-track in the current project.
 * Creates .proj-track.json and installs auto-capture hook if needed.
 */
export async function initCommand(): Promise<void> {
  const configPath = path.join(process.cwd(), '.proj-track.json');

  if (fs.existsSync(configPath)) {
    console.log(chalk.yellow('proj-track is already initialized in this project.'));
    return;
  }

  // Check for paused state
  const pausedPath = configPath + '.paused';
  if (fs.existsSync(pausedPath)) {
    console.log(chalk.yellow('proj-track is paused in this project. Use `proj-track resume` to resume.'));
    return;
  }

  // Remove disabled marker if re-initializing after a remove
  const disabledPath = path.join(process.cwd(), '.proj-track-disabled');
  if (fs.existsSync(disabledPath)) {
    fs.unlinkSync(disabledPath);
  }

  // Create initial history file
  const history = readHistory();
  writeHistory(history);

  console.log(chalk.green('✓ proj-track initialized in this project.'));
  console.log(chalk.dim(`  Created ${configPath}`));

  // Install shell hook if not already installed
  if (!isShellFunctionInstalled()) {
    const modified = installShellFunction();
    if (modified.length > 0) {
      console.log(chalk.green('✓ Auto-capture hook installed.'));
      modified.forEach(f => console.log(chalk.dim(`  Updated ${f}`)));
      console.log('');
      console.log(chalk.cyan('Run the following to activate:'));
      console.log(chalk.white(`  source ${modified[0]}`));
    }
  } else {
    console.log(chalk.dim('  Auto-capture hook already installed.'));
  }

  console.log('');
  console.log(chalk.cyan('Commands are now auto-captured when you press Enter.'));
  console.log(chalk.dim('  proj-track list') + chalk.dim('    — view history'));
  console.log(chalk.dim('  proj-track clear') + chalk.dim('   — clear history'));
  console.log(chalk.dim('  proj-track pause') + chalk.dim('   — pause tracking'));
}
