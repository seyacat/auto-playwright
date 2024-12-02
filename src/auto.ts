import { MAX_TASK_CHARS } from "./config";
import { type Page, type Test, StepOptions } from "./types";
import { completeTask } from "./completeTask";
import { UnimplementedError } from "./errors";
import { getSnapshot } from "./getSnapshot";
import { runCachedTask } from "./runCachedTask";
import * as crypto from "crypto";
import { existsSync, readFileSync } from "fs";
import path from "path";

export const auto = async (
  task: string,
  config: { page: Page; test?: Test },
  options?: StepOptions,
  additionalParams?: Record<string, string>,
  cache_filename?: string
): Promise<any> => {
  if (!config || !config.page) {
    throw Error(
      "The auto() function is missing the required `{ page }` argument."
    );
  }

  const { test, page } = config as { page: Page; test?: Test };

  const taskHash = crypto.createHash("sha256").update(task).digest("hex");

  if (options?.cache_path) {
    if (!existsSync(options.cache_path)) {
      throw new Error(`Cache path ${options.cache_path} does not exist`);
    }
    let cache_file_path = path.join(
      options.cache_path,
       taskHash + ".json"
    );
    if(cache_filename){
      cache_file_path = path.join(
        options?.cache_path,
         cache_filename.replace(/\s/g, "_")+".json"
      )
    }
    
    if (existsSync(cache_file_path)) {
      let cacheString = readFileSync(cache_file_path).toString();
      //replace arguments in cache string file
      for (const [key, value] of Object.entries(additionalParams ?? {})) {
        cacheString = cacheString.replace(`@{${key}}`, value);
      }
      let cache_data = JSON.parse(cacheString);
      if( cache_data.taskHash === taskHash){
        return await runCachedTask(page, JSON.parse(cacheString));
      }      
    }
  }

  if (!test) {
    return await runTask(task, page, options, additionalParams, cache_filename);
  }

  return test.step(`auto-playwright.ai '${task}'`, async () => {
    const result = await runTask(
      task,
      page,
      options,
      additionalParams,
      cache_filename
    );

    if (result.errorMessage) {
      throw new UnimplementedError(result.errorMessage);
    }

    if (result.assertion !== undefined) {
      return result.assertion;
    }

    if (result.query !== undefined) {
      return result.query;
    }

    return undefined;
  });
};

async function runTask(
  task: string,
  page: Page,
  options: StepOptions | undefined,
  additionalParams?: Record<string, string>,
  cache_filename?: string
) {
  if (task.length > MAX_TASK_CHARS) {
    throw new Error(
      `Provided task string is too long, max length is ${MAX_TASK_CHARS} chars.`
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
