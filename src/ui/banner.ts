import chalk from 'chalk';

export function getBanner(version: string): string {
  const title = `proj-track  v${version}`;
  const tagline = 'Auto-capture CLI history per-project';

  const contentWidth = 45;
  const padRight = (raw: string, styled: string) => {
    return styled + ' '.repeat(Math.max(0, contentWidth - raw.length));
  };

  const top    = `  ${chalk.cyan('┌' + '─'.repeat(contentWidth + 2) + '┐')}`;
  const empty  = `  ${chalk.cyan('│')} ${' '.repeat(contentWidth)} ${chalk.cyan('│')}`;
  const line1  = `  ${chalk.cyan('│')} ${padRight(title, chalk.bold.white(title))} ${chalk.cyan('│')}`;
  const line2  = `  ${chalk.cyan('│')} ${padRight(tagline, chalk.dim(tagline))} ${chalk.cyan('│')}`;
  const bottom = `  ${chalk.cyan('└' + '─'.repeat(contentWidth + 2) + '┘')}`;

  return `\n${top}\n${empty}\n${line1}\n${line2}\n${empty}\n${bottom}\n`;
}
