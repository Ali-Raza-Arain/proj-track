# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-03-25

### Added
- Auto-capture CLI commands via `PROMPT_COMMAND` (bash) and `preexec` (zsh)
- Silent background logger with zero terminal interference
- Smart filtering: noise commands, sensitive data, VS Code internals
- Consecutive deduplication (max 50 commands per project)
- Commands: `init`, `list`, `run`, `clear`, `pause`, `resume`, `remove`, `install`, `uninstall`
- Shell aliases: `thistory`, `trun`, `tclear`, `tinit`, `tpause`, `tresume`, `tremove`
- Project detection via `.git/`, `package.json`, or `.proj-track.json`
- Pause/resume tracking with `.proj-track.json.paused`
- Permanent disable with `.proj-track-disabled` marker
- Export history to `.proj-track.txt` on remove
