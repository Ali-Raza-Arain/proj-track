import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const START_MARKER = '# --- proj-track hook start ---';
const END_MARKER = '# --- proj-track hook end ---';
const CLEANUP_START = '# --- proj-track cleanup start ---';
const CLEANUP_END = '# --- proj-track cleanup end ---';

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
 * Generate a self-removing cleanup snippet for bash.
 * When sourced, it unsets the function, removes itself from PROMPT_COMMAND,
 * removes aliases, then deletes itself from the config file.
 */
function getBashCleanupSnippet(configPath: string): string {
  return `
${CLEANUP_START}
# One-time cleanup: remove proj-track from live shell memory
if declare -f __proj_track_capture >/dev/null 2>&1; then
  PROMPT_COMMAND="\${PROMPT_COMMAND//__proj_track_capture;/}"
  PROMPT_COMMAND="\${PROMPT_COMMAND//__proj_track_capture/}"
  unset -f __proj_track_capture 2>/dev/null
  unset __proj_track_old_prompt 2>/dev/null
fi
unalias thistory trun tclear tinit tremove tpause tresume 2>/dev/null
# Auto-remove this cleanup block from ${configPath}
if [ -f "${configPath}" ]; then
  sed -i '/${CLEANUP_START.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&').replace(/\n/g, '\\n')}/,/${CLEANUP_END.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&').replace(/\n/g, '\\n')}/d' "${configPath}" 2>/dev/null
fi
${CLEANUP_END}`;
}

/**
 * Generate a self-removing cleanup snippet for zsh.
 */
function getZshCleanupSnippet(configPath: string): string {
  return `
${CLEANUP_START}
# One-time cleanup: remove proj-track from live shell memory
if typeset -f __proj_track_preexec >/dev/null 2>&1; then
  add-zsh-hook -d preexec __proj_track_preexec 2>/dev/null
  unfunction __proj_track_preexec 2>/dev/null
fi
unalias thistory trun tclear tinit tremove tpause tresume 2>/dev/null
# Auto-remove this cleanup block from ${configPath}
if [ -f "${configPath}" ]; then
  sed -i '/${CLEANUP_START.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&').replace(/\n/g, '\\n')}/,/${CLEANUP_END.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&').replace(/\n/g, '\\n')}/d' "${configPath}" 2>/dev/null
fi
${CLEANUP_END}`;
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
 * Install the shell hook into .bashrc/.zshrc.
 * Returns the list of files that were modified.
 */
export function installShellFunction(): string[] {
  const configs = getShellConfigs();
  const modified: string[] = [];

  for (const configPath of configs) {
    // Remove any existing hook or cleanup snippet
    if (isInstalled(configPath)) {
      removeFromConfig(configPath);
    }
    removeCleanupSnippet(configPath);

    const shell = configPath.endsWith('.zshrc') ? 'zsh' : 'bash';
    const hookContent = getHookContent(shell);

    fs.appendFileSync(configPath, `\n${hookContent}\n`, 'utf-8');
    modified.push(configPath);
  }

  return modified;
}

/**
 * Remove the shell hook from a specific config file.
 */
function removeFromConfig(configPath: string): void {
  if (!fs.existsSync(configPath)) return;

  const content = fs.readFileSync(configPath, 'utf-8');
  const startIdx = content.indexOf(START_MARKER);
  const endIdx = content.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) return;

  const before = content.substring(0, startIdx).replace(/\n+$/, '');
  const after = content.substring(endIdx + END_MARKER.length).replace(/^\n+/, '');

  const newContent = before + (after ? '\n' + after : '');
  fs.writeFileSync(configPath, newContent, 'utf-8');
}

/**
 * Remove the cleanup snippet from a config file.
 */
function removeCleanupSnippet(configPath: string): void {
  if (!fs.existsSync(configPath)) return;

  const content = fs.readFileSync(configPath, 'utf-8');
  const startIdx = content.indexOf(CLEANUP_START);
  const endIdx = content.indexOf(CLEANUP_END);

  if (startIdx === -1 || endIdx === -1) return;

  const before = content.substring(0, startIdx).replace(/\n+$/, '');
  const after = content.substring(endIdx + CLEANUP_END.length).replace(/^\n+/, '');

  const newContent = before + (after ? '\n' + after : '');
  fs.writeFileSync(configPath, newContent, 'utf-8');
}

/**
 * Uninstall the shell hook from all config files.
 * Adds a one-time cleanup snippet so `source ~/.bashrc` clears the live shell.
 * Returns the list of files that were modified.
 */
export function uninstallShellFunction(): string[] {
  const configs = getShellConfigs();
  const modified: string[] = [];

  for (const configPath of configs) {
    if (isInstalled(configPath)) {
      removeFromConfig(configPath);

      // Add self-removing cleanup snippet
      const shell = configPath.endsWith('.zshrc') ? 'zsh' : 'bash';
      const cleanup = shell === 'zsh'
        ? getZshCleanupSnippet(configPath)
        : getBashCleanupSnippet(configPath);
      fs.appendFileSync(configPath, cleanup + '\n', 'utf-8');

      modified.push(configPath);
    }
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
