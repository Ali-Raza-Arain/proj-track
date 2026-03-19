import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const START_MARKER = '# --- proj-track hook start ---';
const END_MARKER = '# --- proj-track hook end ---';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the path to the hooks directory (works in both dev and installed contexts).
 */
function getHooksDir(): string {
  const packageRoot = path.resolve(__dirname, '..', '..');
  const srcHooks = path.join(packageRoot, 'src', 'hooks');
  if (fs.existsSync(srcHooks)) {
    return srcHooks;
  }
  return path.join(packageRoot, 'hooks');
}

/**
 * Detect which shell config files exist.
 */
function getShellConfigs(): string[] {
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const configs: string[] = [];

  const bashrc = path.join(home, '.bashrc');
  const zshrc = path.join(home, '.zshrc');

  if (fs.existsSync(bashrc)) configs.push(bashrc);
  if (fs.existsSync(zshrc)) configs.push(zshrc);

  if (configs.length === 0) {
    configs.push(bashrc);
  }

  return configs;
}

/**
 * Read the appropriate shell hook file content.
 */
function getHookContent(shell: 'bash' | 'zsh'): string {
  const hooksDir = getHooksDir();
  const hookFile = path.join(hooksDir, `${shell}-hook.sh`);

  if (fs.existsSync(hookFile)) {
    return fs.readFileSync(hookFile, 'utf-8');
  }

  return shell === 'zsh' ? getInlineZshHook() : getInlineBashHook();
}

function getInlineBashHook(): string {
  return `${START_MARKER}
# AUTO-CAPTURE via PROMPT_COMMAND (NOT DEBUG trap - doesn't break arrow keys)

# Cleanup any previous installation from shell memory first
if declare -f __proj_track_capture >/dev/null 2>&1; then
  PROMPT_COMMAND="\${PROMPT_COMMAND//__proj_track_capture;/}"
  PROMPT_COMMAND="\${PROMPT_COMMAND//__proj_track_capture/}"
  unset -f __proj_track_capture 2>/dev/null
fi

__proj_track_old_prompt="\${PROMPT_COMMAND:-}"

__proj_track_capture() {
  if ! command -v proj-track-logger >/dev/null 2>&1; then
    return
  fi

  local last_cmd
  last_cmd=$(HISTTIMEFORMAT='' builtin history 1 | sed 's/^[ ]*[0-9]*[ ]*//')

  [ -z "$last_cmd" ] && return

  [[ "$last_cmd" =~ ^proj-track ]] && return
  [[ "$last_cmd" =~ ^__vsc ]] && return
  [[ "$last_cmd" =~ ^__proj ]] && return
  [[ "$last_cmd" =~ ^__git ]] && return

  if [ -d ".git" ] || [ -f "package.json" ] || [ -f ".proj-track.json" ]; then
    [ -f ".proj-track-disabled" ] && return
    [ -f ".proj-track.json.paused" ] && return
    (proj-track-logger "$last_cmd" >/dev/null 2>&1 &)
    disown -a 2>/dev/null
  fi
}

if [ -n "$__proj_track_old_prompt" ]; then
  PROMPT_COMMAND="__proj_track_capture; \${__proj_track_old_prompt}"
else
  PROMPT_COMMAND='__proj_track_capture'
fi

alias thistory='proj-track list 2>/dev/null'
alias trun='proj-track run'
alias tclear='proj-track clear'
alias tinit='proj-track init'
alias tremove='proj-track remove'
alias tpause='proj-track pause'
alias tresume='proj-track resume'
${END_MARKER}`;
}

function getInlineZshHook(): string {
  return `${START_MARKER}
# AUTO-CAPTURE via preexec hook (Zsh native, no DEBUG trap)

if typeset -f __proj_track_preexec >/dev/null 2>&1; then
  add-zsh-hook -d preexec __proj_track_preexec 2>/dev/null
  unfunction __proj_track_preexec 2>/dev/null
fi

__proj_track_preexec() {
  local cmd="$1"

  if ! command -v proj-track-logger >/dev/null 2>&1; then
    return
  fi

  [ -z "$cmd" ] && return

  [[ "$cmd" =~ ^proj-track ]] && return
  [[ "$cmd" =~ ^__vsc ]] && return
  [[ "$cmd" =~ ^__proj ]] && return
  [[ "$cmd" =~ ^__git ]] && return

  if [ -d ".git" ] || [ -f "package.json" ] || [ -f ".proj-track.json" ]; then
    [ -f ".proj-track-disabled" ] && return
    [ -f ".proj-track.json.paused" ] && return
    (proj-track-logger "$cmd" >/dev/null 2>&1 &)
    disown 2>/dev/null
  fi
}

autoload -Uz add-zsh-hook
add-zsh-hook preexec __proj_track_preexec

alias thistory='proj-track list 2>/dev/null'
alias trun='proj-track run'
alias tclear='proj-track clear'
alias tinit='proj-track init'
alias tremove='proj-track remove'
alias tpause='proj-track pause'
alias tresume='proj-track resume'
${END_MARKER}`;
}

/**
 * Check if the hook is already installed in a config file.
 */
function isInstalled(configPath: string): boolean {
  if (!fs.existsSync(configPath)) return false;
  const content = fs.readFileSync(configPath, 'utf-8');
  return content.includes(START_MARKER);
}

/**
 * Remove ALL proj-track related content from a config file.
 * Uses line-by-line filtering to cleanly remove everything between
 * start/end markers, including any orphaned partial blocks.
 */
function cleanConfig(configPath: string): void {
  if (!fs.existsSync(configPath)) return;

  const content = fs.readFileSync(configPath, 'utf-8');

  // Nothing to clean
  if (!content.includes('proj-track')) return;

  const lines = content.split('\n');
  const cleaned: string[] = [];
  let insideBlock = false;

  for (const line of lines) {
    // Detect start of any proj-track block
    if (line.includes('# --- proj-track') && line.includes('start ---')) {
      insideBlock = true;
      continue;
    }

    // Detect end of any proj-track block
    if (line.includes('# --- proj-track') && line.includes('end ---')) {
      insideBlock = false;
      continue;
    }

    // Skip lines inside a block
    if (insideBlock) continue;

    cleaned.push(line);
  }

  // Remove trailing blank lines that were left behind
  while (cleaned.length > 0 && cleaned[cleaned.length - 1].trim() === '') {
    cleaned.pop();
  }

  // Ensure file ends with a newline
  const newContent = cleaned.join('\n') + '\n';
  fs.writeFileSync(configPath, newContent, 'utf-8');
}

/**
 * Install the shell hook into .bashrc/.zshrc.
 * Returns the list of files that were modified.
 */
export function installShellFunction(): string[] {
  const configs = getShellConfigs();
  const modified: string[] = [];

  for (const configPath of configs) {
    // Clean any existing proj-track content first
    cleanConfig(configPath);

    const shell = configPath.endsWith('.zshrc') ? 'zsh' : 'bash';
    const hookContent = getHookContent(shell);

    fs.appendFileSync(configPath, `\n${hookContent}\n`, 'utf-8');
    modified.push(configPath);
  }

  return modified;
}

/**
 * Uninstall the shell hook from all config files.
 * Cleanly removes ALL proj-track content — no leftovers.
 * Returns the list of files that were modified.
 */
export function uninstallShellFunction(): string[] {
  const configs = getShellConfigs();
  const modified: string[] = [];

  for (const configPath of configs) {
    if (!fs.existsSync(configPath)) continue;

    const content = fs.readFileSync(configPath, 'utf-8');
    if (!content.includes('proj-track')) continue;

    cleanConfig(configPath);
    modified.push(configPath);
  }

  return modified;
}

/**
 * Check if the shell hook is installed in any config file.
 */
export function isShellFunctionInstalled(): boolean {
  const configs = getShellConfigs();
  return configs.some(c => isInstalled(c));
}
