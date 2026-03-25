# --- proj-track hook start ---
# AUTO-CAPTURE via PROMPT_COMMAND (NOT DEBUG trap - doesn't break arrow keys)

# Cleanup any previous installation from shell memory first
if declare -f __proj_track_capture >/dev/null 2>&1; then
  # Remove old function from PROMPT_COMMAND
  PROMPT_COMMAND="${PROMPT_COMMAND//__proj_track_capture;/}"
  PROMPT_COMMAND="${PROMPT_COMMAND//__proj_track_capture/}"
  unset -f __proj_track_capture 2>/dev/null
fi

# Store the original PROMPT_COMMAND so we don't clobber it
__proj_track_old_prompt="${PROMPT_COMMAND:-}"

__proj_track_capture() {
  # Guard: if proj-track-logger is not installed, disable self
  if ! command -v proj-track-logger >/dev/null 2>&1; then
    return
  fi

  # Get the last command from bash history (strip leading number + spaces)
  local last_cmd
  last_cmd=$(HISTTIMEFORMAT='' builtin history 1 | sed 's/^[ ]*[0-9]*[ ]*//')

  # Skip empty
  [ -z "$last_cmd" ] && return

  # Skip proj-track's own commands (prevent self-tracking)
  [[ "$last_cmd" =~ ^proj-track ]] && return

  # Skip VS Code internal commands
  [[ "$last_cmd" =~ ^__vsc ]] && return
  [[ "$last_cmd" =~ ^__proj ]] && return
  [[ "$last_cmd" =~ ^__git ]] && return

  # Check if in a project directory (.git, package.json, or .proj-track.json)
  if [ -d ".git" ] || [ -f "package.json" ] || [ -f ".proj-track.json" ]; then
    # Check if permanently disabled (proj-track remove)
    [ -f ".proj-track-disabled" ] && return

    # Check if paused
    [ -f ".proj-track.json.paused" ] && return

    # Run logger in SUBSHELL with full suppression (NO job control messages)
    (proj-track-logger "$last_cmd" >/dev/null 2>&1 &)

    # Disown to prevent "[1]+ Done" messages
    disown -a 2>/dev/null
  fi
}

# Chain with existing PROMPT_COMMAND (don't clobber git prompt, etc.)
if [ -n "$__proj_track_old_prompt" ]; then
  PROMPT_COMMAND="__proj_track_capture; ${__proj_track_old_prompt}"
else
  PROMPT_COMMAND='__proj_track_capture'
fi

# Tab completion
_proj_track_completions() {
  local cur="${COMP_WORDS[COMP_CWORD]}"
  local commands="init list run clear pause resume remove gitignore install uninstall"
  COMPREPLY=($(compgen -W "$commands" -- "$cur"))
}
complete -F _proj_track_completions proj-track

# Convenience aliases (manual commands still available)
alias thistory='proj-track list 2>/dev/null'
alias trun='proj-track run'
alias tclear='proj-track clear'
alias tinit='proj-track init'
alias tremove='proj-track remove'
alias tpause='proj-track pause'
alias tresume='proj-track resume'
# --- proj-track hook end ---
