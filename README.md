# opencode-compact-instructions

Customize OpenCode's `/compact` with per-invocation instructions.

```text
/compact keep only necessary information
```

Normally `/compact` summarizes the session with a fixed prompt. This plugin lets
you steer the summary every time you compact.

## Install

Add it to your OpenCode V2 config (`~/.config/opencode/opencode.json` or a
project `opencode.json`).

From GitHub:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["github:cesumilo/opencode-compact-instructions"]
}
```

From npm (if published):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["opencode-compact-instructions"]
}
```

OpenCode reloads plugin configuration automatically.

## Usage

```text
/compact
/compact keep only necessary information
/compact focus on the API design and open questions
```

What happens:

1. The plugin registers a `compact` command that accepts arguments.
2. Running it requests compaction through `session.compact`.
3. The `compaction` session hook appends your instructions to the prompt used
   for the next compaction.

## Notes

- The plugin leaves an existing user-defined `compact` command alone.
- Compaction uses the `agents.compaction.model` setting when configured, and
  otherwise the session's model.
- Instructions apply to the next compaction only.

## Development

```bash
bun install
bunx tsc --noEmit
```

## License

MIT
