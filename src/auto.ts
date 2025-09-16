import { MAX_TASK_CHARS } from "./config";
import { type Page, type Test, StepOptions } from "./types";
import { completeTask } from "./completeTask";
import { getSnapshot } from "./getSnapshot";
import { runCachedTask } from "./runCachedTask";
import * as crypto from "crypto";
import { existsSync, readFileSync } from "fs";
import path from "path";
import OpenAI from "openai";

export const auto = async (
  task: string,
  config: { page: Page; test?: Test },
  options?: StepOptions,
  additionalParams?: Record<string, string>,
  cache_filename?: string
): Promise<{allProcess: any[], lastResults: any}> => {
  if (!config || !config.page) {
    throw Error(
      "The auto() function is missing the required `{ page }` argument.",
    );
  }

  const { page } = config as { page: Page; test?: Test };
  const taskHash = crypto
    .createHash("sha256")
    .update(task + (cache_filename ?? ""))
    .digest("hex");

  if (options?.cache_path) {
    if (!existsSync(options.cache_path)) {
      throw new Error(`Cache path ${options.cache_path} does not exist`);
    }
    let cache_file_path = path.join(options.cache_path, taskHash + ".json");
    if (cache_filename) {
      cache_file_path = path.join(
        options?.cache_path,
        cache_filename.replace(/\s/g, "_") + ".json"
      );
    }

    if (existsSync(cache_file_path)) {
      let cacheString = readFileSync(cache_file_path).toString();
      //replace arguments in cache string file
      for (const [key, value] of Object.entries(additionalParams ?? {})) {
        cacheString = cacheString.replaceAll(`@{${key}}`, value);
      }
      let cache_data = JSON.parse(cacheString);
      if (cache_data?.[taskHash]) {
        console.log("Cache hit: " + cache_filename);
        return getAssistantCalls(await runCachedTask(page, cache_data[taskHash]));
      }
    }
  }
  
  return getAssistantCalls(await runTask(task, page, options, additionalParams, cache_filename));
};

function getAssistantCalls(
  result: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): any {
  
  result.forEach((r: OpenAI.Chat.Completions.ChatCompletionMessageParam) => {
    if (r.role === "tool") {
      const msg = result.find(
        (r2) => {
          return r2.role === "assistant" &&
            r2.tool_calls?.find((t) => t.id === r.tool_call_id);
        }
      );
      if (msg?.role === "assistant") {
        const tool_call = msg.tool_calls?.find(
          (t) => t.id === r.tool_call_id
        );
        
        if (tool_call) {
          (tool_call as any).result = r.content;
        }
      }
    }
  });
  const allProcess:any = result.filter((r: any) => r.role === "assistant").map((r: any) => r.tool_calls).flat();
  let lastResults:any = {};
  for(const p of allProcess) {
    if(typeof p.result === 'string' ){
      try{
        p.result = JSON.parse(p.result);
      } catch(e) {
        console.log(e);
      }
    }
    lastResults = {...lastResults, ...p.result};
  }
  return {allProcess, lastResults};
}

async function runTask(
  task: string,
  page: Page,
  options: StepOptions | undefined,
  additionalParams?: Record<string, string>,
  cache_filename?: string
): Promise<OpenAI.Chat.Completions.ChatCompletionMessageParam[]> {
  if (task.length > MAX_TASK_CHARS) {
    throw new Error(
      `Provided task string is too long, max length is ${MAX_TASK_CHARS} chars.`,
    );
  }

  const result = await completeTask(
    page,
    {
      task,
      snapshot: await getSnapshot(page),
      options: options
        ? {
            model: options.model ?? "gpt-4o-mini",
            debug: options.debug ?? false,
            openaiApiKey: options.openaiApiKey,
            openaiBaseUrl: options.openaiBaseUrl,
            openaiDefaultQuery: options.openaiDefaultQuery,
            openaiDefaultHeaders: options.openaiDefaultHeaders,
          }
        : undefined,
    },
    options,
    additionalParams,
    cache_filename
  );
  return result;
}
