import chalk from 'chalk';

export function getBanner(version: string): string {
  const w = 57;
  const hr = '─'.repeat(w + 2);

  const pad = (raw: string, styled: string) =>
    styled + ' '.repeat(Math.max(0, w - raw.length));

  const line = (raw: string, styled: string) =>
    `  ${chalk.cyan('│')} ${pad(raw, styled)} ${chalk.cyan('│')}`;

  const title = `🎯  proj-track  v${version}`;
  const tagline = 'Auto-capture CLI history per-project';
  const features = '✓ Zero interference  ✓ VS Code ready  ✓ TypeScript';

  const box = [
    '',
    `  ${chalk.cyan('┌' + hr + '┐')}`,
    `  ${chalk.cyan('│')} ${' '.repeat(w)} ${chalk.cyan('│')}`,
    line(title, `🎯  ${chalk.bold.white('proj-track')}  ${chalk.dim(`v${version}`)}`),
    line(tagline, chalk.dim(tagline)),
    line(features, `${chalk.green('✓')} Zero interference  ${chalk.green('✓')} VS Code ready  ${chalk.green('✓')} TypeScript`),
    `  ${chalk.cyan('│')} ${' '.repeat(w)} ${chalk.cyan('│')}`,
    `  ${chalk.cyan('└' + hr + '┘')}`,
  ].join('\n');

  return box;
}

export function getFullHelp(version: string): string {
  const banner = getBanner(version);

  const s = (label: string, desc: string) =>
    `    ${chalk.cyan(label.padEnd(18))}${chalk.dim(desc)}`;

  const example = (cmd: string, comment: string) =>
    `  ${chalk.green('$')} ${chalk.white(cmd.padEnd(30))}${chalk.dim(`# ${comment}`)}`;

  const link = (icon: string, label: string, url: string) =>
    `  ${icon}  ${chalk.bold(label.padEnd(11))}${chalk.cyan(url)}`;

  const sections = [
    banner,
    '',
    `${chalk.bold('Usage:')} proj-track ${chalk.dim('[options] [command]')}`,
    '',
    chalk.dim('Track CLI command history per-project with zero terminal interference.'),
    chalk.dim('Commands are auto-captured when you press Enter — no manual typing needed.'),
    '',
    chalk.bold('Options:'),
    `    ${chalk.cyan('-V, --version'.padEnd(18))}${chalk.dim('Output the version number')}`,
    `    ${chalk.cyan('-h, --help'.padEnd(18))}${chalk.dim('Display help for command')}`,
    '',
    chalk.bold('Commands:'),
    `  ${chalk.yellow('Setup')}`,
    s('init', 'Initialize proj-track in current project'),
    s('install', 'Install shell hook to .bashrc/.zshrc'),
    s('uninstall', 'Remove shell hook from .bashrc/.zshrc'),
    '',
    `  ${chalk.yellow('View & Run')}`,
    s('list', 'List tracked commands'),
    s('run <id>', 'Re-run a tracked command by ID'),
    s('clear', 'Clear command history'),
    '',
    `  ${chalk.yellow('Manage')}`,
    s('pause', 'Pause tracking in current project'),
    s('resume', 'Resume tracking in current project'),
    s('remove', 'Remove proj-track (saves history as .txt)'),
    s('gitignore', 'Add proj-track files to .gitignore'),
    '',
    chalk.bold('Quick Start:'),
    example('proj-track init', 'Initialize in current project'),
    example('proj-track list', 'View tracked commands'),
    example('proj-track run 2', 'Re-run command #2'),
    example('proj-track pause', 'Temporarily stop tracking'),
    '',
    chalk.bold('Links:'),
    link('📖', 'Docs', 'https://ali-raza-arain.github.io/proj-track/'),
    link('📦', 'npm', 'https://npmjs.com/package/proj-track'),
    link('🐛', 'Issues', 'https://github.com/ali-raza-arain/proj-track/issues'),
    '',
    chalk.dim(`Made with ${chalk.red('❤')}  by Ali Raza Arain`),
    '',
  ];

  return sections.join('\n');
}
