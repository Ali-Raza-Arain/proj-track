#!/usr/bin/env node

import { Command } from 'commander';
import { createRequire } from 'module';
import { initCommand } from './commands/init.js';
import { listCommand } from './commands/list.js';
import { runCommand } from './commands/run.js';
import { clearCommand } from './commands/clear.js';
import { pauseCommand } from './commands/pause.js';
import { resumeCommand } from './commands/resume.js';
import { removeCommand } from './commands/remove.js';
import { gitignoreCommand } from './commands/gitignore.js';
import { installShellFunction, uninstallShellFunction } from './utils/shell-installer.js';
import { getFullHelp } from './ui/banner.js';
import chalk from 'chalk';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const program = new Command();

program
  .name('proj-track')
  .description('Track CLI command history per-project with zero terminal interference')
  .version(version, '-V, --version')
  .helpOption(false)
  .addHelpCommand(false);

// Custom --help flag
program.option('-h, --help', 'Display help for command');
program.on('option:help', () => {
  console.log(getFullHelp(version));
  process.exit(0);
});

// Show custom help when no args
program.action(() => {
  console.log(getFullHelp(version));
});

program
  .command('init')
  .description('Initialize proj-track in the current project')
  .action(initCommand);

program
  .command('list')
  .description('List tracked commands')
  .action(listCommand);

program
  .command('run <id>')
  .description('Re-run a tracked command by its ID')
  .action(runCommand);

program
  .command('clear')
  .description('Clear command history')
  .action(clearCommand);

program
  .command('pause')
  .description('Pause tracking in the current project')
  .action(pauseCommand);

program
  .command('resume')
  .description('Resume tracking in the current project')
  .action(resumeCommand);

program
  .command('remove')
  .description('Remove proj-track from the current project (saves history as .txt)')
  .action(removeCommand);

program
  .command('gitignore')
  .description('Add proj-track files to .gitignore')
  .action(gitignoreCommand);

program
  .command('install')
  .description('Install the shell function to .bashrc/.zshrc')
  .action(() => {
    const modified = installShellFunction();
    if (modified.length > 0) {
      console.log(chalk.green('✓ Shell function installed.'));
      modified.forEach(f => console.log(chalk.dim(`  Updated ${f}`)));
      console.log('');
      console.log(chalk.cyan('Run the following to activate:'));
      console.log(chalk.white(`  source ${modified[0]}`));
    } else {
      console.log(chalk.yellow('No shell config files found.'));
    }
  });

program
  .command('uninstall')
  .description('Remove the shell function from .bashrc/.zshrc')
  .action(() => {
    const modified = uninstallShellFunction();
    if (modified.length > 0) {
      console.log(chalk.green('✓ Shell function removed.'));
      modified.forEach(f => console.log(chalk.dim(`  Updated ${f}`)));
      console.log('');
      console.log(chalk.cyan('Restart your terminal or run:'));
      console.log(chalk.white(`  source ${modified[0]}`));
    } else {
      console.log(chalk.yellow('Shell function was not installed.'));
    }
  });

program.parse();
