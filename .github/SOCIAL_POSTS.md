# Social Posts for proj-track

## Reddit r/node and r/javascript

**Title:** Tired of forgetting which commands you ran in each project? I built a zero-config CLI history tracker

**Body:**

Ever switch between projects and forget the exact docker-compose flags, build commands, or deployment scripts you used last week?

I built `proj-track` — it silently captures every terminal command per project, automatically, with zero terminal interference.

```bash
npm install -g proj-track
cd ~/my-project
proj-track init
source ~/.bashrc
# That's it — commands are auto-captured when you press Enter
proj-track list   # View your project-specific history
```

Features:
- Auto-capture via shell hooks (PROMPT_COMMAND / preexec) — no `track "cmd"` needed
- Zero interference: no `[1]+ Done` messages, no broken arrow keys, no Ctrl+C conflicts
- Smart filtering: skips noise (cd, ls, clear) and sensitive data (passwords, tokens, API keys)
- Per-project isolation: each project has its own `.proj-track.json`
- Instant replay: re-run any command by ID with `proj-track run <id>`
- Pause/resume tracking, export history to plain text
- Works with bash and zsh

Links:
- npm: https://www.npmjs.com/package/proj-track
- GitHub: https://github.com/Ali-Raza-Arain/proj-track
- Docs: https://Ali-Raza-Arain.github.io/proj-track/

Would love feedback!

---

## Hacker News (Show HN)

**Title:** Show HN: proj-track — Auto-capture CLI command history per-project with zero terminal interference

**Body:**

I built a Node.js CLI tool that silently tracks every terminal command per project — auto-captured via shell hooks, filtered for noise and sensitive data, and instantly replayable.

No manual `track "command"` needed. No background job messages. No arrow key issues. Works with bash and zsh.

npm: https://www.npmjs.com/package/proj-track
GitHub: https://github.com/Ali-Raza-Arain/proj-track

---

## X/Twitter Thread

**Tweet 1:**
You're debugging a production issue. You ran 15 commands across 3 projects. Now you need to remember exactly what you did.

Shell history won't help — it's global, not per-project.

I built a fix. Thread

**Tweet 2:**
proj-track: silently captures every terminal command per project, automatically.

```
npm install -g proj-track
```

Zero config. Zero interference. Just works.

**Tweet 3:**
It supports:
- Auto-capture via PROMPT_COMMAND (bash) and preexec (zsh)
- Smart filtering of noise and sensitive commands
- Per-project isolation with .proj-track.json
- Instant replay with `proj-track run <id>`

**Tweet 4:**
Try it:

npm: https://npmjs.com/package/proj-track
GitHub: https://github.com/Ali-Raza-Arain/proj-track
Docs: https://Ali-Raza-Arain.github.io/proj-track/

---

## StackOverflow — Target Questions

Search for these questions and answer mentioning proj-track where genuinely helpful:

- "How to track terminal commands per project"
- "Per-directory shell history bash"
- "Save command history per folder linux"
- "Project-specific bash history"
- "How to log all terminal commands in a project"
- "Track CLI commands used in development"
