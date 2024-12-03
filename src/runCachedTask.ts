import { type Page, ToolCall } from "./types";
import { createActions } from "./createActions";
import OpenAI from "openai";
import * as crypto from "crypto";

export const runCachedTask = async (
  page: Page,
  cache: { taskHash: string; functions: ToolCall[][] }
): Promise<OpenAI.Chat.Completions.ChatCompletionMessageParam[]> => {
  const results: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  const actions = createActions(page);
  for (const f of cache.functions) {
    for (const toolcall of f) {
      console.log("Executing:", toolcall.name);
      const tool_call_id = crypto
        .createHash("sha256")
        .update(toolcall.name + toolcall.arguments)
        .digest("hex");
      const result = await (actions[toolcall.name] as any).function(
        JSON.parse(toolcall.arguments)
      );
      console.log("result:", result);
      results.push({
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: tool_call_id,
            type: "function",
            function: { name: toolcall.name, arguments: toolcall.arguments },
          },
        ],
      });
      results.push({
        role: "tool",
        tool_call_id: tool_call_id,
        content: result,
      });
    }
  }
  return results;
};
