# proj-track

**Auto-capture** CLI command history **per-project** with zero terminal interference.

Commands are tracked automatically when you press Enter. No manual typing needed. No background job messages. No arrow key issues. No Ctrl+C conflicts.

## Installation

```bash
npm install -g proj-track
```

## Quick Start

```bash
# 1. Initialize in your project directory
cd ~/my-project
proj-track init

# 2. Reload your shell
source ~/.bashrc   # or source ~/.zshrc

# 3. Just work normally — commands are captured automatically!
docker-compose up
npm run build
git push origin main

# 4. View your history
proj-track list
```

That's it. No `track "command"` needed. Everything is captured silently in the background.

## How It Works

### Auto-Capture Architecture

| Shell | Hook | Why |
| :--- | :--- | :--- |
| **Bash** | `PROMPT_COMMAND` | Fires AFTER each command, doesn't intercept input |
| **Zsh** | `preexec` | Native Zsh hook, fires before command execution |

**Why not `DEBUG` trap?** The `DEBUG` trap fires on every keystroke/expansion and breaks arrow keys in VS Code Terminal. `PROMPT_COMMAND` only fires once after the command completes — no interference.

### What Gets Captured

Commands are auto-captured when:
- You're in a **project directory** (has `.git/`, `package.json`, or `.proj-track.json`)
- The command is **not noise** (cd, ls, clear, echo, cat, pwd, etc. are skipped)
- The command is **not sensitive** (passwords, tokens, secrets are filtered)
- The command is **not a duplicate** of the previous entry

### Project Detection

| Marker | Example |
| :--- | :--- |
| `.git/` directory | Any git repository |
| `package.json` file | Any Node.js project |
| `.proj-track.json` file | Created via `proj-track init` |

If none of these exist, proj-track silently does nothing.

## Commands

| Command | Alias | Description |
| :--- | :--- | :--- |
| `proj-track list` | `thistory` | Show tracked commands |
| `proj-track run <id>` | `trun <id>` | Re-run a command by its ID |
| `proj-track clear` | `tclear` | Clear command history |
| `proj-track init` | `tinit` | Initialize tracking in current project |
| `proj-track pause` | `tpause` | Pause auto-capture |
| `proj-track resume` | `tresume` | Resume auto-capture |
| `proj-track remove` | `tremove` | Remove tracking (saves history as `.txt`) |
| `proj-track install` | — | Install shell hook to `.bashrc`/`.zshrc` |
| `proj-track uninstall` | — | Remove shell hook |

## Features

### Pause / Resume

```bash
proj-track pause     # Stops auto-capture, preserves history
proj-track resume    # Resumes auto-capture
```

When paused, `.proj-track.json` is renamed to `.proj-track.json.paused`.

### Remove

```bash
proj-track remove
```

Converts `.proj-track.json` to `.proj-track.txt` (plain text backup) and disables tracking.

### Smart Filtering

**Noise commands** (skipped automatically):
- `cd`, `ls`, `clear`, `echo`, `cat`, `pwd`, `exit`, `history`, `which`, `whoami`

**Sensitive commands** (never saved):
- Commands containing `password`, `secret`, `token`, `api_key`, `credential`
- Inline assignments like `PASSWORD=123 ./run.sh`
- MySQL password flags (`-p`)

**Internal commands** (filtered):
- VS Code's `__vsc_*` terminal commands
- Any `__proj_*` or `__git_*` internal commands

### Deduplication

Running the same command consecutively only creates one history entry.

### History Limit

Only the last 50 commands are kept per project.

## Zero Interference Guarantee

| Concern | How proj-track handles it |
| :--- | :--- |
| `[1]+ Done` messages | Background logging uses subshell + `disown` |
| Arrow keys (up/down/left/right) | Uses `PROMPT_COMMAND`, NOT `DEBUG` trap |
| Ctrl+C | No signal handlers installed |
| Ctrl+V | No clipboard interference |
| Command echoing | Logger suppresses all stdout/stderr |
| Shell startup time | One function + aliases, minimal overhead |
| Existing PROMPT_COMMAND | Chains with existing value, doesn't overwrite |

## Data Storage

All data is stored locally in `.proj-track.json` in each project directory:

```json
{
  "projectName": "my-project",
  "commands": [
    {
      "id": 1710864000000,
      "command": "docker-compose up -d",
      "timestamp": "3/19/2026, 8:00:00 PM"
    }
  ]
}
```

No data leaves your machine. No cloud. No telemetry.

## Troubleshooting

### Commands not being auto-captured

1. Make sure the hook is installed: `proj-track install && source ~/.bashrc`
2. Make sure you're in a project directory (has `.git/`, `package.json`, or `.proj-track.json`)
3. Check if tracking is paused: look for `.proj-track.json.paused`
4. Noise commands (cd, ls, clear, etc.) are intentionally skipped
5. Sensitive commands (containing passwords/tokens) are silently filtered

### `[1]+ Done` messages appearing

This shouldn't happen. If it does, reinstall the hook:
```bash
proj-track install
source ~/.bashrc
```

### Arrow keys not working

This should NOT happen with proj-track (we use `PROMPT_COMMAND`, not `DEBUG` trap). If you experience issues, check for other tools using `DEBUG` trap:
```bash
trap -p DEBUG
```

### Hook not updating after upgrade

```bash
proj-track install    # Re-installs the hook
source ~/.bashrc      # Reload
```

## Uninstall

```bash
# Remove shell hook
proj-track uninstall

# Remove the global package
npm uninstall -g proj-track

# Optionally remove project history files
rm .proj-track.json
```

## License

MIT
