# Why proj-track?

## The Problem

Your shell history is **global**. It mixes commands from every project, every directory, and every session into one giant, unsearchable list.

When you switch between projects, you can't easily find:

- The exact `docker-compose` flags you used for that microservice
- The database migration command with the right parameters
- The deployment script you ran last Friday
- The test command with that specific environment variable

Running `history | grep docker` gives you results from *every project you've ever worked on* — not just the one you're in right now.

## Existing Solutions Fall Short

**Manual tracking** (`track "your command"`) adds friction. You have to remember to wrap every command, and you *will* forget.

**Custom bash scripts** using `DEBUG` trap break arrow keys in VS Code Terminal, produce `[1]+ Done` background job messages, and interfere with Ctrl+C.

**Per-directory `.bash_history`** requires complex `HISTFILE` manipulation and doesn't handle filtering, deduplication, or replay.

## How proj-track Solves This

proj-track captures commands **automatically** via shell hooks — no wrapping needed. It stores per-project history in `.proj-track.json` and provides instant replay.

| Feature | proj-track | Manual tracking | DEBUG trap scripts |
| :--- | :---: | :---: | :---: |
| Auto-capture | Yes | No | Yes |
| Zero terminal interference | Yes | N/A | No |
| Per-project isolation | Yes | Varies | Varies |
| Noise filtering | Yes | No | No |
| Sensitive data filtering | Yes | No | No |
| Instant replay | Yes | No | No |

## Design Principles

1. **Zero interference** — Uses `PROMPT_COMMAND` (not `DEBUG` trap) to avoid breaking terminal behavior
2. **Silent operation** — Background logger with all stdout/stderr suppressed via subshell + `disown`
3. **Smart defaults** — Noise commands, sensitive data, and VS Code internals are filtered automatically
4. **Local-only** — All data stays in `.proj-track.json` on your machine. No cloud. No telemetry.
5. **Minimal footprint** — One shell function + aliases. No daemons, no watchers, no overhead.
