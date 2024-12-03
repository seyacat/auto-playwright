import OpenAI from "openai";
import { type Page, StepOptions, TaskMessage } from "./types";
import { prompt } from "./prompt";
import { createActions } from "./createActions";
import * as crypto from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const defaultDebug = process.env.AUTO_PLAYWRIGHT_DEBUG === "true";

export const completeTask = async (
  page: Page,
  task: TaskMessage,
  options?: StepOptions,
  additionalParams?: Record<string, string>,
  cache_filename?: string
): Promise<OpenAI.Chat.Completions.ChatCompletionMessageParam[]> => {
  const openai = new OpenAI({
    apiKey: task.options?.openaiApiKey,
    baseURL: task.options?.openaiBaseUrl,
    defaultQuery: task.options?.openaiDefaultQuery,
    defaultHeaders: task.options?.openaiDefaultHeaders,
  });

  const results: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  const cache: any[] = [];

  const actions = createActions(page);

  const debug = task.options?.debug ?? defaultDebug;

  const taskHash = crypto
    .createHash("sha256")
    .update(task.task + (cache_filename ?? ""))
    .digest("hex");

  //REPLACE ADDITIONAL PARAMS
  for (const [key, value] of Object.entries(additionalParams ?? {})) {
    task.task = task.task.replaceAll(`@{${key}}`, value);
  }

  const runner = openai.beta.chat.completions
    .runTools({
      model: task.options?.model ?? "gpt-4o",
      messages: [{ role: "user", content: prompt(task) }],
      tools: Object.values(actions).map((action) => ({
        type: "function",
        function: action,
      })),
    })
    .on("message", (message) => {
      results.push(message);
      if (
        message.role === "assistant" &&
        message.tool_calls &&
        message.tool_calls.length > 0
      ) {
        cache.push(
          message.tool_calls.map((tool_call) => {
            let fuction_arguments = tool_call.function.arguments;
            if (tool_call.function.name === "locator_fill") {
              for (const [key, value] of Object.entries(
                additionalParams ?? {}
              )) {
                fuction_arguments = fuction_arguments.replace(
                  value,
                  `@{${key}}`
                );
              }
            }
            return {
              name: tool_call.function.name,
              arguments: fuction_arguments,
            };
          })
        );
      }
      if (debug) {
        console.log("> message", message);
      }

      
    });

  const finalContent = await runner.finalContent();

  if (debug) {
    console.log("> finalContent", finalContent);
  }

  if (options?.cache_path) {
    if (!existsSync(options.cache_path)) {
      throw new Error(`Cache path ${options.cache_path} does not exist`);
    }
    let cache_file_path = path.join(options.cache_path, taskHash + ".json");
    if (cache_filename) {
      cache_file_path = path.join(
        options?.cache_path,
        cache_filename?.replace(/\s/g, "_") + ".json"
      );
    }
    const cache_data = {
      taskHash,
      functions: cache,
    };
    //get previous cache data
    let data;
    if (existsSync(cache_file_path)) {
      data = JSON.parse(readFileSync(cache_file_path, "utf8"));
    } else {
      data = {};
    }
    data[taskHash] = cache_data;
    writeFileSync(cache_file_path, JSON.stringify(data, null, 2));
  }

  return results;
};
