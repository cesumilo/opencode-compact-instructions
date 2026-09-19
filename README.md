# opencode-compact-instructions

Customize OpenCode's `/compact` with per-invocation instructions.

```text
/compact keep only necessary information
```

Normally `/compact` (alias `/summarize`) accepts no arguments and summarizes the
session with a fixed prompt. This plugin lets you steer the summary every time
you compact.

## Install

Add it to your OpenCode config (`~/.config/opencode/opencode.json` or a project
`opencode.json`).

From GitHub:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["github:cesumilo/opencode-compact-instructions"]
}
```

From npm (if published):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-compact-instructions"]
}
```

Restart OpenCode after changing the config.

## Usage

```text
/compact
/compact keep only necessary information
/compact focus on the API design and open questions
```

What happens:

1. The plugin registers a `compact` command that overrides the built-in one so
   it accepts arguments.
2. Running it triggers the real compaction (`session.summarize`).
3. Your instructions are appended to the compaction prompt.

## Notes

- The model used for compaction is taken from the session's most recent message.
- OpenCode's command pipeline always sends a prompt after the command hook, so a
  hidden synthetic turn acknowledges the compaction
  ("Session compacted — ready to continue.").
- If you already define your own `compact` command, this plugin leaves it alone.

## Development

```bash
bun install
bunx tsc --noEmit
```

## License

MIT
