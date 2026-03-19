import fs from 'node:fs';
import path from 'node:path';

/**
 * Check if the current directory is a trackable project.
 * A project is detected if any of these exist:
 *   - .git/ directory
 *   - package.json file
 *   - .proj-track.json file
 */
export function isProjectDirectory(dir?: string): boolean {
  const cwd = dir ?? process.cwd();
  return (
    fs.existsSync(path.join(cwd, '.git')) ||
    fs.existsSync(path.join(cwd, 'package.json')) ||
    fs.existsSync(path.join(cwd, '.proj-track.json'))
  );
}

/**
 * Check if tracking is paused in the current project.
 */
export function isTrackingPaused(dir?: string): boolean {
  const cwd = dir ?? process.cwd();
  return fs.existsSync(path.join(cwd, '.proj-track.json.paused'));
}
