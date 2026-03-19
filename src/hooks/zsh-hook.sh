# --- proj-track hook start ---
# AUTO-CAPTURE via preexec hook (Zsh native, no DEBUG trap)

__proj_track_preexec() {
  local cmd="$1"

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
