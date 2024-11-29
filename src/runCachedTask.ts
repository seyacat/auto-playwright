import { type Page, TaskResult, ToolCall } from "./types";
import { createActions } from "./createActions";

export const runCachedTask = async (
  page: Page,
  cache: {taskHash: string, functions: ToolCall[]},
): Promise<TaskResult> => {
  const actions = createActions(page);
  let lastFunctionResult:TaskResult = {errorMessage: ""};
  for( const toolcall of cache.functions){
    await (actions[toolcall.name] as any).function(JSON.parse(toolcall.arguments))
  }
  return lastFunctionResult
};
