import { type Page, TaskResult, ToolCall } from "./types";
import { createActions } from "./createActions";

export const runCachedTask = async (
  page: Page,
  cache: ToolCall[],
): Promise<TaskResult> => {
  const actions = createActions(page);
  let lastFunctionResult:TaskResult = {errorMessage: ""};
  for( const toolcall of cache){
    console.log("Running tool", toolcall.name);
    await (actions[toolcall.name] as any).function(JSON.parse(toolcall.arguments))
  }
  return lastFunctionResult
};
