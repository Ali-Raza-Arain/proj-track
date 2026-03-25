# Comparison with Alternatives

## Feature Comparison

| Feature | proj-track | `history \| grep` | Custom DEBUG trap | Per-dir HISTFILE |
| :--- | :---: | :---: | :---: | :---: |
| Auto-capture | Yes | No | Yes | Yes |
| Per-project isolation | Yes | No | Varies | Yes |
| Zero terminal interference | Yes | N/A | No | Yes |
| Noise filtering | Yes | No | No | No |
| Sensitive data filtering | Yes | No | No | No |
| Deduplication | Yes | No | No | No |
| Instant replay by ID | Yes | No | No | No |
| Pause/resume | Yes | No | No | No |
| Export to plain text | Yes | No | No | No |
| Bash + Zsh | Yes | Bash only | Varies | Varies |
| No config needed | Yes | N/A | No | No |

## `history | grep` (Built-in)

**Pros:** Always available, no installation needed.

**Cons:** Global history mixes commands from every directory. No filtering. No per-project isolation. Must manually search with `grep`. No replay functionality.

## Custom DEBUG trap scripts

**Pros:** Can auto-capture commands.

**Cons:** The `DEBUG` trap fires on every keystroke and expansion, which breaks arrow keys in VS Code Terminal. Background logging often produces `[1]+ Done` messages. Can interfere with Ctrl+C signal handling.

proj-track avoids all of these issues by using `PROMPT_COMMAND` (bash) and `preexec` (zsh) instead of the `DEBUG` trap.

## Per-directory HISTFILE

**Pros:** Built-in shell feature, per-directory history.

**Cons:** Requires complex `HISTFILE` manipulation in shell config. No filtering of noise or sensitive commands. No deduplication. No replay. Switching between directories changes your entire history context.

## proj-track's Approach

proj-track combines the best of all approaches:

- **Auto-capture** like DEBUG trap scripts — but without the terminal interference
- **Per-project isolation** like per-dir HISTFILE — but with smart filtering and replay
- **Zero config** — just `proj-track init` and you're done
