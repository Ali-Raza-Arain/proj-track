---
layout: home
title: proj-track — Per-Project CLI Command History
titleTemplate: Auto-capture your terminal commands

hero:
  name: proj-track
  text: Auto-capture your terminal commands
  tagline: Auto-capture CLI command history per-project with zero terminal interference.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/Ali-Raza-Arain/proj-track
    - theme: alt
      text: npm
      link: https://www.npmjs.com/package/proj-track

features:
  - title: Zero-Config Auto-Capture
    details: Commands are captured when you press Enter. No wrapping, no prefixes, no manual tracking.
  - title: Per-Project Isolation
    details: Each project gets its own history in .proj-track.json. No more global shell history chaos.
  - title: Zero Terminal Interference
    details: No [1]+ Done messages, no broken arrow keys, no Ctrl+C conflicts. Uses PROMPT_COMMAND, not DEBUG trap.
  - title: Smart Filtering
    details: Automatically skips noise commands (cd, ls, clear) and sensitive data (passwords, tokens, API keys).
  - title: Instant Replay
    details: Re-run any tracked command by its ID with proj-track run. No more copy-pasting from history.
  - title: Bash + Zsh Support
    details: Works with both shells out of the box. One install, both shells covered.
---
