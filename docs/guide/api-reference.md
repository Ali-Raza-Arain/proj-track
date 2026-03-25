# API Reference

proj-track is a CLI tool. All interaction happens through the `proj-track` command (or its aliases).

## CLI Commands

### `proj-track init`

**Alias:** `tinit`

Initialize proj-track in the current project directory.

- Creates `.proj-track.json` with an empty command list
- Installs the shell hook in `.bashrc`/`.zshrc` if not already present
- Removes `.proj-track-disabled` marker if re-initializing after a remove

### `proj-track list`

**Alias:** `thistory`

Display all tracked commands for the current project, showing:

- Command ID (timestamp-based)
- The command string
- Timestamp of when the command was captured

### `proj-track run <id>`

**Alias:** `trun <id>`

Re-run a previously tracked command by its ID. The command is executed in the current shell.

### `proj-track clear`

**Alias:** `tclear`

Clear all tracked commands for the current project. The `.proj-track.json` file is preserved with an empty command list.

### `proj-track pause`

**Alias:** `tpause`

Pause auto-capture for the current project. History is preserved. Renames `.proj-track.json` to `.proj-track.json.paused`.

### `proj-track resume`

**Alias:** `tresume`

Resume auto-capture for a paused project. Renames `.proj-track.json.paused` back to `.proj-track.json`.

### `proj-track remove`

**Alias:** `tremove`

Remove tracking from the current project:

1. Exports command history to `.proj-track.txt` (plain text backup)
2. Deletes `.proj-track.json` (or `.proj-track.json.paused`)
3. Creates `.proj-track-disabled` marker to permanently prevent tracking

### `proj-track install`

Install the auto-capture shell hook into `.bashrc` and/or `.zshrc`. Run this after a fresh install or if the hook is missing.

### `proj-track uninstall`

Remove the auto-capture shell hook from `.bashrc` and `.zshrc`.

## Data Format

### `.proj-track.json`

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

| Field | Type | Description |
| :--- | :--- | :--- |
| `projectName` | `string` | Derived from the directory name |
| `commands` | `array` | List of tracked commands (max 50) |
| `commands[].id` | `number` | Timestamp-based unique ID |
| `commands[].command` | `string` | The captured command string |
| `commands[].timestamp` | `string` | Human-readable timestamp |

## Filtering Rules

### Noise Commands

These commands are always skipped: `cd`, `ls`, `clear`, `echo`, `cat`, `pwd`, `exit`, `history`, `which`, `whoami`

Both exact matches (`cd`) and commands with arguments (`cd /home`) are filtered.

### Sensitive Commands

Commands matching any of these patterns are never saved:

- Contains `password`, `secret`, `token`, `api_key`, `credential` (case-insensitive)
- Inline environment variable assignment with sensitive names (e.g., `PASSWORD=123 ./run.sh`)
- MySQL password flag (`-p`)
- VS Code internal commands (`__vsc_*`)
- Internal commands (`__proj_*`, `__git_*`)

### Deduplication

Consecutive identical commands produce only one history entry.

## Project Detection

A directory is considered a project if any of these exist:

- `.git/` directory
- `package.json` file
- `.proj-track.json` file

If none exist, proj-track silently does nothing.
