# --- proj-track hook start ---
# AUTO-CAPTURE via preexec hook (Zsh native, no DEBUG trap)

# Cleanup any previous installation from shell memory first
if typeset -f __proj_track_preexec >/dev/null 2>&1; then
  add-zsh-hook -d preexec __proj_track_preexec 2>/dev/null
  unfunction __proj_track_preexec 2>/dev/null
fi

__proj_track_preexec() {
  local cmd="$1"

  # Guard: if proj-track-logger is not installed, disable self
  if ! command -v proj-track-logger >/dev/null 2>&1; then
    return
  fi

  # Skip empty
  [ -z "$cmd" ] && return

  # Skip proj-track's own commands
  [[ "$cmd" =~ ^proj-track ]] && return

  # Skip VS Code internal commands
  [[ "$cmd" =~ ^__vsc ]] && return
  [[ "$cmd" =~ ^__proj ]] && return
  [[ "$cmd" =~ ^__git ]] && return

  # Check if in a project directory
  if [ -d ".git" ] || [ -f "package.json" ] || [ -f ".proj-track.json" ]; then
    # Check if permanently disabled (proj-track remove)
    [ -f ".proj-track-disabled" ] && return

    # Check if paused
    [ -f ".proj-track.json.paused" ] && return

    # Silent execution in subshell
    (proj-track-logger "$cmd" >/dev/null 2>&1 &)
    disown 2>/dev/null
  fi
}

autoload -Uz add-zsh-hook
add-zsh-hook preexec __proj_track_preexec

# Convenience aliases
alias thistory='proj-track list 2>/dev/null'
alias trun='proj-track run'
alias tclear='proj-track clear'
alias tinit='proj-track init'
alias tremove='proj-track remove'
alias tpause='proj-track pause'
alias tresume='proj-track resume'
# --- proj-track hook end ---
