import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

export const forkMethodSchema = z.enum(["native", "transcript"]);
export type ForkMethod = z.infer<typeof forkMethodSchema>;

// /fork reports its first answer back to the parent; /branch does not.
export const forkRpc = defineRpc({
  name: "tangent.fork",
  input: z.object({
    agentId: z.string(),
    prompt: z.string(),
    reportBack: z.boolean(),
  }),
  output: z.object({ agentId: z.string(), method: forkMethodSchema, opened: z.boolean() }),
});

export const subtaskRpc = defineRpc({
  name: "tangent.subtask",
  input: z.object({ agentId: z.string(), prompt: z.string() }),
  output: z.object({ agentId: z.string() }),
});

// Omit threadAgentId to start a new /btw thread forked from the main agent.
export const btwRpc = defineRpc({
  name: "tangent.btw",
  input: z.object({
    agentId: z.string(),
    question: z.string(),
    threadAgentId: z.string().optional(),
  }),
  output: z.object({
    threadAgentId: z.string(),
    method: forkMethodSchema,
    answer: z.string(),
  }),
});

export const btwCloseRpc = defineRpc({
  name: "tangent.btw-close",
  input: z.object({ threadAgentId: z.string() }),
  output: z.object({ ok: z.boolean() }),
});
