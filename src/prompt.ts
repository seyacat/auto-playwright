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

export const SYSTEM_PROMPT = `You must interact with the page using a set of functions.

Locating elements:

- The primary method is to use "locateElement" with a precise CSS selector.
- If you cannot find a reliable unique CSS selector, you can:
  - Use "locateElementsWithText" to find elements by visible text.
  - Use "locateElementsByRole" to find elements by ARIA role (e.g., button, listbox, combobox).

Rules:

1. Prefer locateElement with a specific CSS selector.
2. If a unique selector is not available, prefer locateElementsWithText if the element has unique visible text.
3. If neither CSS selector nor unique text is available, use locateElementsByRole if you know the expected role (such as "button" for buttons).
4. You must always locate an element first before performing actions like locator_click, locator_selectOption, locator_fill, etc.
5. Only the elementId returned by locate functions should be used for further interactions.
6. Never assume you can use a DOM id or text directly as elementId.

About getVisibleStructure:

- You can use "getVisibleStructure" if you need a full overview of the page elements to make decisions or choose the right selector or text.

If you skip locating an element first, your actions will fail. Always strictly follow this workflow.`;
