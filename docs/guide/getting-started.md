# Getting Started

## Installation

```bash
npm install -g proj-track
```

Requires Node.js 18 or later.

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

## How Auto-Capture Works

When you run `proj-track init`, two things happen:

1. A `.proj-track.json` file is created in your project directory
2. A shell hook is installed in your `.bashrc` or `.zshrc`

The hook uses `PROMPT_COMMAND` (bash) or `preexec` (zsh) to silently capture every command you type while inside a project directory.

```
┌──────────────┐     ┌─────────────────────┐     ┌───────────────────┐
│  You type a  │────>│  Shell hook fires   │────>│  Silent logger    │
│   command    │     │  (PROMPT_COMMAND /  │     │  saves to         │
│              │     │   preexec)          │     │  .proj-track.json │
└──────────────┘     └─────────────────────┘     └───────────────────┘
```

## Commands

| Command | Alias | Description |
| :--- | :--- | :--- |
| `proj-track init` | `tinit` | Initialize tracking in current project |
| `proj-track list` | `thistory` | Show tracked commands |
| `proj-track run <id>` | `trun <id>` | Re-run a command by its ID |
| `proj-track clear` | `tclear` | Clear command history |
| `proj-track pause` | `tpause` | Pause auto-capture |
| `proj-track resume` | `tresume` | Resume auto-capture |
| `proj-track remove` | `tremove` | Remove tracking (saves history as `.txt`) |
| `proj-track gitignore` | — | Add proj-track files to `.gitignore` |
| `proj-track install` | — | Install shell hook to `.bashrc`/`.zshrc` |
| `proj-track uninstall` | — | Remove shell hook |

## Pause and Resume

```bash
proj-track pause     # Stops auto-capture, preserves history
proj-track resume    # Resumes auto-capture
```

When paused, `.proj-track.json` is renamed to `.proj-track.json.paused`.

## Remove Tracking

```bash
proj-track remove
```

Converts `.proj-track.json` to `.proj-track.txt` (plain text backup) and creates a `.proj-track-disabled` marker to permanently disable tracking in the directory.

## Uninstall

```bash
# Remove shell hook
proj-track uninstall

# Remove the global package
npm uninstall -g proj-track

# Optionally remove project history files
rm .proj-track.json
```

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

### Hook not updating after upgrade

```bash
proj-track install    # Re-installs the hook
source ~/.bashrc      # Reload
```
