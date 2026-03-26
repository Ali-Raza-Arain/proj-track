<p align="center">
  <img src="https://img.shields.io/npm/v/proj-track?style=for-the-badge&color=blue&label=proj-track" alt="version" />
</p>

<h1 align="center">proj-track</h1>

<p align="center">
  <strong>Silently track every terminal command per project — auto-captured, filtered, and instantly replayable.</strong><br/>
  Auto-capture CLI command history per-project with zero terminal interference.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="license" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="node" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue" alt="typescript" />
  <img src="https://img.shields.io/badge/tests-57%20passed-green" alt="tests" />
  <a href="https://codecov.io/gh/Ali-Raza-Arain/proj-track"><img src="https://codecov.io/gh/Ali-Raza-Arain/proj-track/branch/main/graph/badge.svg?style=for-the-badge" alt="codecov" /></a>
  <!-- <img src="https://img.shields.io/npm/dt/proj-track?style=flat&color=blue&label=downloads" alt="downloads" /> -->
</p>

---

## The Problem

Your shell history is global. It mixes commands from every project into one giant, unsearchable list. When you switch between projects, you can't remember the exact `docker-compose` flags, the migration command, or the deployment script you used last week.

Existing solutions require you to manually type `track "your command"` every time — adding friction to your workflow and guaranteeing you'll forget.

---

## Why proj-track?

- **Zero-config auto-capture** — Commands are captured when you press Enter. No wrapping, no prefixes.
- **Per-project isolation** — Each project gets its own history in `.proj-track.json`.
- **Zero terminal interference** — No `[1]+ Done` messages, no broken arrow keys, no Ctrl+C conflicts.
- **Smart filtering** — Noise commands (cd, ls, clear) and sensitive data (passwords, tokens, API keys) are automatically skipped.
- **Instant replay** — Re-run any tracked command by its ID.
- **Bash + Zsh** — Works with both shells out of the box.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Smart Filtering](#smart-filtering)
- [Zero Interference Guarantee](#zero-interference-guarantee)
- [Data Storage](#data-storage)
- [Comparison with Alternatives](#comparison-with-alternatives)
- [Running Tests](#running-tests)
- [Contributing](#contributing)
- [Security](#security)
- [Support](#support)
- [License](#license)

---

## How It Works

```
┌──────────────┐     ┌─────────────────────┐     ┌───────────────────┐
│  You type a  │────>│  Shell hook fires   │────>│  Silent logger    │
│   command    │     │  (PROMPT_COMMAND /  │     │  saves to         │
│              │     │   preexec)          │     │  .proj-track.json │
└──────────────┘     └─────────────────────┘     └───────────────────┘
```

| Shell | Hook | Why |
| :--- | :--- | :--- |
| **Bash** | `PROMPT_COMMAND` | Fires AFTER each command, doesn't intercept input |
| **Zsh** | `preexec` | Native Zsh hook, fires before command execution |

**Why not `DEBUG` trap?** The `DEBUG` trap fires on every keystroke/expansion and breaks arrow keys in VS Code Terminal. `PROMPT_COMMAND` only fires once after the command completes — no interference.

---

## Installation

```bash
npm install -g proj-track
```

---

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

---

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

### Pause / Resume

```bash
proj-track pause     # Stops auto-capture, preserves history
proj-track resume    # Resumes auto-capture
```

### Remove

```bash
proj-track remove    # Converts history to .proj-track.txt and disables tracking
```

---

## Smart Filtering

### Project Detection

| Marker | Example |
| :--- | :--- |
| `.git/` directory | Any git repository |
| `package.json` file | Any Node.js project |
| `.proj-track.json` file | Created via `proj-track init` |

If none of these exist, proj-track silently does nothing.

### Noise Commands (skipped automatically)

`cd`, `ls`, `clear`, `echo`, `cat`, `pwd`, `exit`, `history`, `which`, `whoami`

### Sensitive Commands (never saved)

- Commands containing `password`, `secret`, `token`, `api_key`, `credential`
- Inline assignments like `PASSWORD=123 ./run.sh`
- MySQL password flags (`-p`)

### Internal Commands (filtered)

- VS Code's `__vsc_*` terminal commands
- Any `__proj_*` or `__git_*` internal commands

### Deduplication

Running the same command consecutively only creates one history entry. Maximum 50 commands per project.

---

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

---

## Data Storage

All data is stored locally in `.proj-track.json` in each project directory:

```json
{
  "projectName": "my-project",
  "commands": [
    {
      "id": 1,
      "command": "docker-compose up -d",
      "timestamp": "3/19/2026, 8:00:00 PM"
    }
  ]
}
```

No data leaves your machine. No cloud. No telemetry.

---

## Comparison with Alternatives

| Feature | proj-track | Manual `history \| grep` | Custom bash scripts |
| :--- | :---: | :---: | :---: |
| Auto-capture | Yes | No | Varies |
| Per-project isolation | Yes | No | Manual |
| Zero terminal interference | Yes | N/A | No |
| Noise filtering | Yes | No | Manual |
| Sensitive data filtering | Yes | No | No |
| Instant replay | Yes | No | No |
| Bash + Zsh | Yes | Bash only | Varies |
| No config needed | Yes | N/A | No |

For a detailed comparison, see the [docs](https://Ali-Raza-Arain.github.io/proj-track/guide/comparison).

---

## Running Tests

```bash
npm test
```

---

## Contributing

We welcome contributions! Please read the [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)

Look for issues labeled [`good first issue`](https://github.com/Ali-Raza-Arain/proj-track/labels/good%20first%20issue) to get started.

---

## Security

To report vulnerabilities, please see our [Security Policy](SECURITY.md).

---

## Support

If this package helps you, consider supporting its development:

<a href="https://github.com/sponsors/Ali-Raza-Arain">
  <img src="https://img.shields.io/badge/Sponsor_on_GitHub-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white" alt="GitHub Sponsors" />
</a>
<a href="https://buymeacoffee.com/alirazaarain">
  <img src="https://img.shields.io/badge/Buy_Me_a_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me a Coffee" />
</a>

---

## Contributors

<a href="https://github.com/ali-raza-arain/proj-track/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ali-raza-arain/proj-track" />
</a>

---

## License

[MIT](https://opensource.org/licenses/MIT) — Made by [Ali Raza](https://github.com/Ali-Raza-Arain)
