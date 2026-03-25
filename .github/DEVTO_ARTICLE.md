---
title: "I Built a CLI Tool That Auto-Captures Your Terminal Commands Per Project"
published: false
description: Auto-capture CLI command history per-project with zero terminal interference.
tags: javascript, typescript, node, opensource
---

# I Built a CLI Tool That Auto-Captures Your Terminal Commands Per Project

Have you ever switched between projects and completely forgotten which commands you ran? Maybe it was the exact `docker-compose` flags for that microservice, the database migration script, or the deployment command with all those environment variables.

Your shell's built-in history is global — it mixes commands from every directory into one giant list. When you're juggling multiple projects, finding the right command is like searching for a needle in a haystack.

I built [proj-track](https://www.npmjs.com/package/proj-track) to fix this.

## What It Does

proj-track hooks into your shell (bash or zsh) and silently captures every command you type — but only when you're inside a project directory. Each project gets its own isolated history file.

```
┌──────────────┐     ┌────────────────────┐     ┌──────────────────┐
│  You type a  │────>│  Shell hook fires  │────>│  Silent logger   │
│   command    │     │  (PROMPT_COMMAND/  │     │  saves to        │
│              │     │   preexec)         │     │  .proj-track.json│
└──────────────┘     └────────────────────┘     └──────────────────┘
```

The key insight: it uses `PROMPT_COMMAND` (not `DEBUG` trap) so there's zero interference with your terminal — no broken arrow keys, no `[1]+ Done` messages, no Ctrl+C conflicts.

## Quick Start

```bash
npm install -g proj-track
cd ~/my-project
proj-track init
source ~/.bashrc

# Just work normally — commands are captured automatically!
docker-compose up -d
npm run build
git push origin main

# View your project-specific history
proj-track list

# Re-run a command by its ID
proj-track run 1710864000000
```

## Key Features

- **Zero config auto-capture** — No `track "command"` needed, just press Enter
- **Smart filtering** — Skips noise commands (cd, ls, clear) and sensitive data (passwords, tokens, API keys)
- **Per-project isolation** — Each project gets its own `.proj-track.json`
- **Instant replay** — Re-run any command by ID
- **Pause/resume** — Temporarily stop tracking without losing history
- **Bash + Zsh** — Works with both shells out of the box
- **No telemetry** — All data stays on your machine

## Links

- **npm**: [npmjs.com/package/proj-track](https://www.npmjs.com/package/proj-track)
- **GitHub**: [github.com/Ali-Raza-Arain/proj-track](https://github.com/Ali-Raza-Arain/proj-track)
- **Docs**: [Ali-Raza-Arain.github.io/proj-track](https://Ali-Raza-Arain.github.io/proj-track/)

---

Give it a try and let me know what you think!
