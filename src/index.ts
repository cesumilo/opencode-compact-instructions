import { Plugin } from "@opencode/plugin"

/**
 * Customize `/compact` with per-invocation instructions.
 *
 * Usage: `/compact keep only necessary information`
 *
 * - A `compact` command accepts the optional instructions and requests
 *   compaction through `session.compact` (skipped if you already define your
 *   own `compact` command).
 * - The `compaction` session hook appends the instructions to the prompt used
 *   for the next compaction.
 */
export default Plugin.define({
  id: "compact-instructions",
  async setup(ctx) {
    // Per-session compaction instructions supplied via `/compact <instructions>`.
    const instructions = new Map<string, string>()

    const { data: commands } = await ctx.command.list()
    const hasCompactCommand = commands.some((command) => command.name === "compact")

    if (!hasCompactCommand) {
      await ctx.command.transform((editor) => {
        editor.add({
          name: "compact",
          description:
            "Compact the session. Optional instructions customize the summary, e.g. /compact keep only necessary information.",
          async execute({ sessionID, prompt, delivery }) {
            const text = prompt.text.trim()
            if (text) instructions.set(sessionID, text)
            else instructions.delete(sessionID)

            try {
              await ctx.session.compact({ sessionID, delivery })
            } catch (error) {
              instructions.delete(sessionID)
              throw error
            }
          },
        })
      })
    }

    await ctx.session.hook("compaction", (event) => {
      const text = instructions.get(event.sessionID)
      if (!text) return
      instructions.delete(event.sessionID)

      event.system.push({
        type: "text",
        text: `The user requested that this summary follow these extra instructions. Honor them while keeping the required output structure:\n${text}`,
      })
    })
  },
})
