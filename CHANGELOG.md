# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [2.0.1] - 2026-04-04

### Fixed
- Uncommented npm download badge in README
- Removed unnecessary link wrapper from Codecov badge in README
- Updated LinkedIn profile link in credits documentation

## [2.0.0] - 2026-03-26

### Added
- `proj-track gitignore` command — add proj-track files to `.gitignore`
- Auto-add to `.gitignore` during `proj-track init` (when `.gitignore` exists)
- Professional table output for `proj-track list` using `cli-table3`
- Redesigned `--help` with grouped commands, quick start examples, and links footer
- Dynamic version reading from `package.json` in CLI and docs
- Version badge in VitePress docs navigation
- Tab completion for the `gitignore` command (bash + zsh)

### Changed
- Command IDs are now auto-incrementing (1, 2, 3...) instead of timestamp-based
- `proj-track list` timestamps now display in short `MM/DD HH:MM` format
- Long commands are truncated at 50 characters with `...` in list output
- Running `proj-track` with no arguments now shows the full help

## [1.0.1] - 2026-03-25

### Fixed
- ID column alignment in `proj-track list` when IDs have varying widths

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
