import { type TestType } from "@playwright/test";

export { type Page } from "@playwright/test";

export type Test = TestType<any, any>;

export type StepOptions = {
  debug?: boolean;
  model?: string;
  openaiApiKey?: string;
  openaiBaseUrl?: string;
  openaiDefaultQuery?: {};
  openaiDefaultHeaders?: {};
  cache_path?: string;
  // DeepSeek specific options
  deepseekApiKey?: string;
  deepseekBaseUrl?: string;
  provider?: 'openai' | 'deepseek';
};

export type TaskMessage = {
  task: string;
  snapshot: {
    dom: string;
  };
  options?: StepOptions;
};

export type TaskResult = {
  assertion?: boolean;
  query?: string;
  errorMessage?: string;
};

export type ToolCall = {
  
    name: string;
    arguments: string
  
}
