import type { Plugin } from "@opencode-ai/plugin"

// Per-session compaction instructions supplied via `/compact <instructions>`.
const instructions = new Map<string, string>()

/**
 * Customize `/compact` with per-invocation instructions.
 *
 * Usage: `/compact keep only necessary information`
 *
 * - `config` registers a `compact` command that overrides the built-in one so
 *   it accepts arguments (skipped if you already define your own).
 * - `command.execute.before` captures the instructions, triggers the real
 *   compaction (`session.summarize`), then replaces the command's parts with a
 *   hidden synthetic acknowledgement so no raw template is sent.
 * - `experimental.session.compacting` appends the instructions to the
 *   compaction prompt.
 */
export const CompactInstructions: Plugin = async ({ client }) => {
  return {
    config: async (cfg) => {
      cfg.command = cfg.command ?? {}
      if (!cfg.command.compact) {
        cfg.command.compact = {
          description:
            "Compact the session. Optional instructions customize the summary, e.g. /compact keep only necessary information.",
          template: "$ARGUMENTS",
        }
      }
    },

    "command.execute.before": async (input, output) => {
      if (input.command !== "compact") return

      const text = (input.arguments ?? "").trim()
      if (text) instructions.set(input.sessionID, text)

      // Use the model from the session's most recent message.
      let model: { providerID: string; modelID: string } | undefined
      try {
        const result: any = await client.session.messages({ path: { id: input.sessionID } })
        const messages: any[] = Array.isArray(result) ? result : (result?.data ?? [])
        for (let i = messages.length - 1; i >= 0; i--) {
          const info = messages[i]?.info
          if (info?.model?.providerID && info?.model?.modelID) {
            model = { providerID: info.model.providerID, modelID: info.model.modelID }
            break
          }
        }
      } catch {
        // No messages yet; nothing to compact.
      }

      if (model) {
        await client.session
          .summarize({
            path: { id: input.sessionID },
            body: { providerID: model.providerID, modelID: model.modelID },
          })
          .catch(() => {})
      }

      // The command handler always sends a prompt after this hook. Replace the
      // template with a synthetic (hidden) instruction so the extra turn is a
      // harmless acknowledgement instead of the raw template.
      output.parts.length = 0
      output.parts.push({
        type: "text",
        synthetic: true,
        text: "The session was just compacted. Reply with exactly this line and nothing else: Session compacted — ready to continue.",
      } as any)
    },

    "experimental.session.compacting": async (input, output) => {
      const text = instructions.get(input.sessionID)
      if (!text) return
      instructions.delete(input.sessionID)
      output.context.push(
        `The user requested that this summary follow these extra instructions. Honor them while keeping the required output structure:\n${text}`,
      )
    },
  }
}

export default CompactInstructions
