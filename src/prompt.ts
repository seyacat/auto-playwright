import { TaskMessage } from "./types";

/**
 * The prompt itself is very simple because the vast majority of the logic is derived from
 * the instructions contained in the parameter and function descriptions provided to `openai.beta.chat.completions`.
 * @see https://www.npmjs.com/package/openai#automated-function-calls
 * @see https://openai.com/blog/function-calling-and-other-api-updates
 */
export const prompt = (message: TaskMessage) => {
  return `This is your task: ${message.task}

* When creating CSS selectors, ensure they are unique and specific enough to select only one element, even if there are multiple elements of the same type (like multiple h1 elements).
* Avoid using generic tags like 'h1' alone. Instead, combine them with other attributes or structural relationships to form a unique selector.
* You must not derive data from the page if you are able to do so by using one of the provided functions, e.g. locator_evaluate.
* After you complete the task, you MUST call one of the result functions:
  - Call resultAction() if you were asked to perform an action (like clicking or selecting an option)
  - Call resultQuery() with the extracted data if you were asked to extract information
  - Call resultAssertion() if you were asked to check or verify something

Webpage snapshot:

\`\`\`
${message.snapshot.dom}
\`\`\`
`;
};
