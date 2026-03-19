#!/usr/bin/env node

/**
 * Pre-uninstall script for proj-track.
 * Runs on `npm uninstall -g proj-track` (even with sudo).
 *
 * Handles the sudo case: when user runs `sudo npm uninstall -g`,
 * HOME=/root but the real user's shell config is in /home/<user>.
 * We use SUDO_USER to find the correct home directory.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

/**
 * Get the real user's home directory, even when running under sudo.
 */
function getRealHome() {
  const sudoUser = process.env.SUDO_USER;

  if (sudoUser) {
    // Running under sudo — resolve real user's home
    try {
      const home = execSync(`eval echo ~${sudoUser}`, { encoding: 'utf-8' }).trim();
      if (home && fs.existsSync(home)) {
        return home;
      }
    } catch {
      // Fall through
    }

    // Fallback: common Linux home path
    const linuxHome = `/home/${sudoUser}`;
    if (fs.existsSync(linuxHome)) {
      return linuxHome;
    }
  }

  // Not sudo — use normal HOME
  return process.env.HOME || process.env.USERPROFILE || '';
}

/**
 * Remove all proj-track content from a shell config file.
 */
function cleanConfig(configPath) {
  if (!fs.existsSync(configPath)) return false;

  const content = fs.readFileSync(configPath, 'utf-8');
  if (!content.includes('proj-track')) return false;

  const lines = content.split('\n');
  const cleaned = [];
  let insideBlock = false;

  for (const line of lines) {
    if (line.includes('# --- proj-track') && line.includes('start ---')) {
      insideBlock = true;
      continue;
    }
    if (line.includes('# --- proj-track') && line.includes('end ---')) {
      insideBlock = false;
      continue;
    }
    if (insideBlock) continue;
    cleaned.push(line);
  }

  // Remove trailing blank lines
  while (cleaned.length > 0 && cleaned[cleaned.length - 1].trim() === '') {
    cleaned.pop();
  }

  fs.writeFileSync(configPath, cleaned.join('\n') + '\n', 'utf-8');
  return true;
}

// --- Main ---
try {
  const home = getRealHome();
  if (!home) process.exit(0);

  const configs = [
    path.join(home, '.bashrc'),
    path.join(home, '.zshrc'),
  ];

  for (const configPath of configs) {
    if (cleanConfig(configPath)) {
      console.log(`proj-track: cleaned ${configPath}`);
    }
  }
} catch {
  // Silent exit — never block npm uninstall
  process.exit(0);
}
