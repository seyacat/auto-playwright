import { Page } from "@playwright/test";
import * as crypto from 'crypto';
import { RunnableFunctionWithParse } from "openai/lib/RunnableFunction";
import { z } from "zod";
import { getSanitizeOptions } from "./sanitizeHtml";

const randomUUID = (args : any) => {
  return crypto.createHash("sha256").update(JSON.stringify(args)).digest("hex")
}
export const createActions = (
  page: Page,
): Record<string, RunnableFunctionWithParse<any>> => {
  const locatorMap = new Map();

  const getLocator = (elementId: string) => {
    const locator = locatorMap.get(elementId);

    if (!locator) {
      throw new Error('Unknown elementId "' + elementId + '"');
    }

    return locator;
  };

  return {
    locator_pressKey: {
      function: async (args: { elementId: string; key: string }) => {
        const { elementId, key } = args;
        await getLocator(elementId).press(key);
        return { success: true };
      },
      name: "locator_pressKey",
      description: "Presses a key while focused on the specified element.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
            key: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: { type: "string" },
          key: {
            type: "string",
            description:
              "The name of the key to press, e.g., 'Enter', 'ArrowUp', 'a'.",
          },
        },
      },
    },
    page_pressKey: {
      function: async (args: { elementId: string; key: string }) => {
        const { key } = args;
        await page.keyboard.press(key);
        return { success: true };
      },
      name: "page_pressKey",
      description: "Presses a key globally on the page.",
      parse: (args: string) => {
        return z
          .object({
            key: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          key: {
            type: "string",
            description:
              "The name of the key to press, e.g., 'Enter', 'ArrowDown', 'b'.",
          },
        },
      },
    },
    locateElement: {
      function: async (args: { cssSelector: string }) => {
        const locator = await page.locator(args.cssSelector);

        
        const elementId = randomUUID(args);

        locatorMap.set(elementId, locator);

        return {
          elementId,
        };
      },
      name: "locateElement",
      description:
        "Locates element using a CSS selector and returns elementId. This element ID can be used with other functions to perform actions on the element.",
      parse: (args: string) => {
        return z
          .object({
            cssSelector: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          cssSelector: {
            type: "string",
          },
        },
      },
    },
    locator_evaluate: {
      function: async (args: { pageFunction: string; elementId: string }) => {
        return {
          result: await getLocator(args.elementId).evaluate(args.pageFunction),
        };
      },
      description:
        "Execute JavaScript code in the page, taking the matching element as an argument.",
      name: "locator_evaluate",
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
          pageFunction: {
            type: "string",
            description:
              "Function to be evaluated in the page context, e.g. node => node.innerText",
          },
        },
      },
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
            pageFunction: z.string(),
          })
          .parse(JSON.parse(args));
      },
    },
    locator_getAttribute: {
      function: async (args: { attributeName: string; elementId: string }) => {
        return {
          attributeValue: await getLocator(args.elementId).getAttribute(
            args.attributeName,
          ),
        };
      },
      name: "locator_getAttribute",
      description: "Returns the matching element's attribute value.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
            attributeName: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          attributeName: {
            type: "string",
          },
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_innerHTML: {
      function: async (args: { elementId: string }) => {
        return { innerHTML: await getLocator(args.elementId).innerHTML() };
      },
      name: "locator_innerHTML",
      description: "Returns the element.innerHTML.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_innerText: {
      function: async (args: { elementId: string }) => {
        return { innerText: await getLocator(args.elementId).innerText() };
      },
      name: "locator_innerText",
      description: "Returns the element.innerText.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_textContent: {
      function: async (args: { elementId: string }) => {
        return {
          textContent: await getLocator(args.elementId).textContent(),
        };
      },
      name: "locator_textContent",
      description: "Returns the node.textContent.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_inputValue: {
      function: async (args: { elementId: string }) => {
        return {
          inputValue: await getLocator(args.elementId).inputValue(),
        };
      },
      name: "locator_inputValue",
      description:
        "Returns input.value for the selected <input> or <textarea> or <select> element.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_blur: {
      function: async (args: { elementId: string }) => {
        await getLocator(args.elementId).blur();

        return { success: true };
      },
      name: "locator_blur",
      description: "Removes keyboard focus from the current element.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_boundingBox: {
      function: async (args: { elementId: string }) => {
        return await getLocator(args.elementId).boundingBox();
      },
      name: "locator_boundingBox",
      description:
        "This method returns the bounding box of the element matching the locator, or null if the element is not visible. The bounding box is calculated relative to the main frame viewport - which is usually the same as the browser window. The returned object has x, y, width, and height properties.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_check: {
      function: async (args: { elementId: string }) => {
        await getLocator(args.elementId).check();

        return { success: true };
      },
      name: "locator_check",
      description: "Ensure that checkbox or radio element is checked.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_uncheck: {
      function: async (args: { elementId: string }) => {
        await getLocator(args.elementId).uncheck();

        return { success: true };
      },
      name: "locator_uncheck",
      description: "Ensure that checkbox or radio element is unchecked.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_isChecked: {
      function: async (args: { elementId: string }) => {
        return { isChecked: await getLocator(args.elementId).isChecked() };
      },
      name: "locator_isChecked",
      description: "Returns whether the element is checked.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_isEditable: {
      function: async (args: { elementId: string }) => {
        return {
          isEditable: await getLocator(args.elementId).isEditable(),
        };
      },
      name: "locator_isEditable",
      description:
        "Returns whether the element is editable. Element is considered editable when it is enabled and does not have readonly property set.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_isEnabled: {
      function: async (args: { elementId: string }) => {
        return { isEnabled: await getLocator(args.elementId).isEnabled() };
      },
      name: "locator_isEnabled",
      description:
        "Returns whether the element is enabled. Element is considered enabled unless it is a <button>, <select>, <input> or <textarea> with a disabled property.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_isVisible: {
      function: async (args: { elementId: string }) => {
        return { isVisible: await getLocator(args.elementId).isVisible() };
      },
      name: "locator_isVisible",
      description: "Returns whether the element is visible.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_clear: {
      function: async (args: { elementId: string }) => {
        await getLocator(args.elementId).clear();

        return { success: true };
      },
      name: "locator_clear",
      description: "Clear the input field.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_click: {
      function: async (args: { elementId: string }) => {
        await getLocator(args.elementId).click();

        return { success: true };
      },
      name: "locator_click",
      description: "Click an element.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_count: {
      function: async (args: { elementId: string }) => {
        return { elementCount: await getLocator(args.elementId).count() };
      },
      name: "locator_count",
      description: "Returns the number of elements matching the locator.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_fill: {
      function: async (args: { value: string; elementId: string }) => {
        await getLocator(args.elementId).fill(args.value);

        return {
          success: true,
        };
      },
      name: "locator_fill",
      description: "Set a value to the input field.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
            value: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          value: {
            type: "string",
          },
          elementId: {
            type: "string",
          },
        },
      },
    },
    page_goto: {
      function: async (args: { url: string }) => {
        return {
          url: await page.goto(args.url),
        };
      },
      name: "page_goto",
      description: "Navigate to the specified URL.",
      parse: (args: string) => {
        return z
          .object({
            url: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL to navigate to",
          },
        },
        required: ["url"],
      },
    },
    locator_selectOption: {
      function: async (args: {
        elementId?: string;
        cssSelector?: string;
        value?: string | string[];
        label?: string | string[];
        index?: number | number[];
      }) => {
        const { elementId, cssSelector, value, label, index } = args;

        let locator;

        if (elementId) {
          locator = page.locator(`[data-element-id="${elementId}"]`);
        } else if (cssSelector) {
          locator = page.locator(cssSelector);
        } else {
          throw new Error(
            "You must provide either an elementId or a cssSelector.",
          );
        }

        if (value !== undefined) {
          await locator.selectOption(value);
        } else if (label !== undefined) {
          const options = Array.isArray(label)
            ? label.map((l) => ({ label: l }))
            : { label };
          await locator.selectOption(options);
        } else if (index !== undefined) {
          const options = Array.isArray(index)
            ? index.map((i) => ({ index: i }))
            : { index };
          await locator.selectOption(options);
        } else {
          throw new Error(
            "You must provide at least one of the parameters: value, label, or index.",
          );
        }

        return { success: true };
      },
      name: "locator_selectOption",
      description:
        "Selects option(s) in a <select> element. Requires either an elementId (obtained via locateElement) or a direct cssSelector.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string().optional(),
            cssSelector: z.string().optional(),
            value: z.union([z.string(), z.array(z.string())]).optional(),
            label: z.union([z.string(), z.array(z.string())]).optional(),
            index: z.union([z.number(), z.array(z.number())]).optional(),
          })
          .refine(
            (data) =>
              data.elementId !== undefined || data.cssSelector !== undefined,
            {
              message: "Either elementId or cssSelector must be provided.",
            },
          )
          .refine(
            (data) =>
              data.value !== undefined ||
              data.label !== undefined ||
              data.index !== undefined,
            {
              message:
                "At least one of value, label, or index must be provided.",
            },
          )
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
            description:
              "The ID of the <select> element, obtained via locateElement.",
          },
          cssSelector: {
            type: "string",
            description:
              "CSS selector to locate the <select> element directly, e.g., '#my-select' or 'form select'.",
          },
          value: {
            type: ["string", "array"],
            description:
              "Select options with matching value attribute. Can be a string or an array for multi-select.",
            items: {
              type: "string"
            }
          },
          label: {
            type: ["string", "array"],
            description:
              "Select options with matching visible text. Can be a string or an array for multi-select.",
            items: {
              type: "string"
            }
          },
          index: {
            type: ["number", "array"],
            description:
              "Select options by their index (zero-based). Can be a number or an array for multi-select.",
            items: {
              type: "number"
            }
          },
        },
      },
    },
    expect_toBe: {
      function: (args: { actual: string; expected: string }) => {
        return {
          actual: args.actual,
          expected: args.expected,
          success: args.actual === args.expected,
        };
      },
      name: "expect_toBe",
      description:
        "Asserts that the actual value is equal to the expected value.",
      parse: (args: string) => {
        return z
          .object({
            actual: z.string(),
            expected: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          actual: {
            type: "string",
          },
          expected: {
            type: "string",
          },
        },
      },
    },
    expect_notToBe: {
      function: (args: { actual: string; expected: string }) => {
        return {
          actual: args.actual,
          expected: args.expected,
          success: args.actual !== args.expected,
        };
      },
      name: "expect_notToBe",
      description:
        "Asserts that the actual value is not equal to the expected value.",
      parse: (args: string) => {
        return z
          .object({
            actual: z.string(),
            expected: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          actual: {
            type: "string",
          },
          expected: {
            type: "string",
          },
        },
      },
    },
    resultAssertion: {
      function: (args: { assertion: boolean }) => {
        return args;
      },
      parse: (args: string) => {
        return z
          .object({
            assertion: z.boolean(),
          })
          .parse(JSON.parse(args));
      },
      description:
        "This function is called when the initial instructions asked to assert something; then 'assertion' is either true or false (boolean) depending on whether the assertion succeeded.",
      name: "resultAssertion",
      parameters: {
        type: "object",
        properties: {
          assertion: {
            type: "boolean",
          },
        },
      },
    },
    resultQuery: {
      function: (args: { query: string }) => {
        return args;
      },
      parse: (args: string) => {
        return z
          .object({
            query: z.string(),
          })
          .parse(JSON.parse(args));
      },
      description:
        "This function is called at the end when the initial instructions asked to extract data; then 'query' property is set to a text value of the extracted data.",
      name: "resultQuery",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
          },
        },
      },
    },
    resultAction: {
      function: () => {
        return { success: true };
      },
      parse: (args: string) => {
        return z.object({}).parse(JSON.parse(args));
      },
      description:
        "This function is called at the end when the initial instructions asked to perform an action.",
      name: "resultAction",
      parameters: {
        type: "object",
        properties: {},
      },
    },
    resultError: {
      function: (args: { errorMessage: string }) => {
        return {
          errorMessage: args.errorMessage,
        };
      },
      parse: (args: string) => {
        return z
          .object({
            errorMessage: z.string(),
          })
          .parse(JSON.parse(args));
      },
      description:
        "If user instructions cannot be completed, then this function is used to produce the final response.",
      name: "resultError",
      parameters: {
        type: "object",
        properties: {
          errorMessage: {
            type: "string",
          },
        },
      },
    },
    getVisibleStructure: {
      function: async () => {
        const sanitizeOptions = getSanitizeOptions();
        const allowedTags = sanitizeOptions.allowedTags || [];
        const allowedAttributes = sanitizeOptions.allowedAttributes;
        const maxDepth = 30; // Можно вынести наверх файла в константу при желании

        return {
          structure: await page.evaluate(
            ({ allowedTags, allowedAttributes, maxDepth }) => {
              // @ts-ignore
              const extractVisibleStructure = (element, depth = 0) => {
                if (!element || depth > maxDepth) return null;

                const style = window.getComputedStyle(element);
                if (
                  style.display === "none" ||
                  style.visibility === "hidden" ||
                  style.opacity === "0"
                ) {
                  return null;
                }

                const tag = element.tagName.toLowerCase();
                if (!allowedTags.includes(tag)) {
                  return null;
                }

                const node = {
                  tag: tag,
                  attributes: {},
                  children: [],
                };

                const elementAttributes = element.attributes;
                if (allowedAttributes === false) {
                  for (let i = 0; i < elementAttributes.length; i++) {
                    const attr = elementAttributes[i];
                    // @ts-ignore
                    node.attributes[attr.name] = attr.value;
                  }
                } else if (typeof allowedAttributes === "object") {
                  const allowedForAll = allowedAttributes["*"];
                  const allowedForTag = allowedAttributes[tag];

                  // @ts-ignore
                  const allowAllForTag = allowedForTag === true;
                  // @ts-ignore
                  const allowAllGlobal = allowedForAll === true;

                  for (let i = 0; i < elementAttributes.length; i++) {
                    const attr = elementAttributes[i];
                    const attrName = attr.name;

                    if (
                      allowAllForTag ||
                      allowAllGlobal ||
                      (Array.isArray(allowedForTag) &&
                        allowedForTag.includes(attrName)) ||
                      (Array.isArray(allowedForAll) &&
                        allowedForAll.includes(attrName))
                    ) {
                      // @ts-ignore
                      node.attributes[attrName] = attr.value;
                    }
                  }
                }

                const id = element.id;
                if (id) {
                  // @ts-ignore
                  node.id = id;
                }

                const role = element.getAttribute("role");
                if (role) {
                  // @ts-ignore
                  node.role = role;
                }

                const ariaLabel = element.getAttribute("aria-label");
                if (ariaLabel) {
                  // @ts-ignore
                  node.ariaLabel = ariaLabel;
                }

                const className = element.className?.trim();
                if (className) {
                  // @ts-ignore
                  node.className = className;
                }

                if (
                  element.childNodes.length === 1 &&
                  element.childNodes[0].nodeType === 3
                ) {
                  const text = element.textContent?.trim() || "";
                  if (text) {
                    // @ts-ignore
                    node.text =
                      text.length > 50 ? text.slice(0, 50) + "..." : text;
                  }
                }

                if (depth + 1 < maxDepth) {
                  for (let i = 0; i < element.children.length; i++) {
                    const child = extractVisibleStructure(
                      element.children[i],
                      depth + 1,
                    );
                    if (child) {
                      // @ts-ignore
                      node.children.push(child);
                    }
                  }
                }

                return node;
              };

              return extractVisibleStructure(document.body);
            },
            { allowedTags, allowedAttributes, maxDepth },
          ),
        };
      },
      name: "getVisibleStructure",
      description:
        "Returns a simplified hierarchical structure of visible DOM elements, focusing on roles, attributes, and basic content.",
      parse: (args: string) => {
        return z.object({}).parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {},
      },
    },
    locateElementsByRole: {
      function: async (args: {
        role:
          | "alert"
          | "alertdialog"
          | "application"
          | "article"
          | "banner"
          | "blockquote"
          | "button"
          | "caption"
          | "cell"
          | "checkbox"
          | "code"
          | "columnheader"
          | "combobox"
          | "complementary"
          | "contentinfo"
          | "definition"
          | "deletion"
          | "dialog"
          | "directory"
          | "document"
          | "emphasis"
          | "feed"
          | "figure"
          | "form"
          | "generic"
          | "grid"
          | "gridcell"
          | "group"
          | "heading"
          | "img"
          | "insertion"
          | "link"
          | "list"
          | "listbox"
          | "listitem"
          | "log"
          | "main"
          | "marquee"
          | "math"
          | "menu"
          | "menubar"
          | "menuitem"
          | "menuitemcheckbox"
          | "menuitemradio"
          | "meter"
          | "navigation"
          | "none"
          | "note"
          | "option"
          | "paragraph"
          | "presentation"
          | "progressbar"
          | "radio"
          | "radiogroup"
          | "region"
          | "row"
          | "rowgroup"
          | "rowheader"
          | "scrollbar"
          | "search"
          | "searchbox"
          | "separator"
          | "slider"
          | "spinbutton"
          | "status"
          | "strong"
          | "subscript"
          | "superscript"
          | "switch"
          | "tab"
          | "table"
          | "tablist"
          | "tabpanel"
          | "term"
          | "textbox"
          | "time"
          | "timer"
          | "toolbar"
          | "tooltip"
          | "tree"
          | "treegrid"
          | "treeitem";
        exact?: boolean;
      }) => {
        const locators = await page
          .getByRole(args.role, { exact: args.exact ?? false })
          .all();
        const elementIds: string[] = [];

        for (const locator of locators) {
          const elementId = randomUUID(args);
          await locator.evaluate(
            (node, id) => node.setAttribute("data-element-id", id),
            elementId,
          );
          elementIds.push(elementId);
        }

        return {
          elementIds,
          count: elementIds.length,
        };
      },
      name: "locateElementsByRole",
      description:
        "Finds elements by their ARIA role attribute and returns array of element IDs.",
      parse: (args: string) => {
        return z
          .object({
            role: z.string(),
            exact: z.boolean().optional(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          role: {
            type: "string",
            description:
              "ARIA role to search for, e.g. 'button', 'grid', 'row', etc.",
          },
          exact: {
            type: "boolean",
            description:
              "Whether to match the role exactly or allow partial matches.",
          },
        },
        required: ["role"],
      },
    },
    locateElementsWithText: {
      function: async (args: { text: string; exact?: boolean }) => {
        const allLocators = await page
          .getByText(args.text, { exact: args.exact ?? false })
          .all();

        const elementIds: string[] = [];

        for (const locator of allLocators) {
          if (await locator.isVisible()) {
            const elementId = randomUUID(args);
            await locator.evaluate(
              (node, id) => node.setAttribute("data-element-id", id),
              elementId,
            );
            elementIds.push(elementId);
          }
        }

        return {
          elementIds,
          count: elementIds.length,
        };
      },
      name: "locateElementsWithText",
      description:
        "Finds visible elements containing specified text and returns array of element IDs. Hidden elements are excluded.",
      parse: (args: string) => {
        return z
          .object({
            text: z.string(),
            exact: z.boolean().optional(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "Text to search for within elements.",
          },
          exact: {
            type: "boolean",
            description:
              "Whether to match the text exactly or allow partial matches.",
          },
        },
        required: ["text"],
      },
    },
    waitForContentToLoad: {
      function: async (args: {
        selector: string;
        textMarker?: string;
        timeout?: number;
      }) => {
        try {
          if (args.textMarker) {
            await page.waitForSelector(
              `${args.selector}:has-text("${args.textMarker}")`,
              {
                timeout: args.timeout || 30000,
                state: "visible",
              },
            );
          } else {
            await page.waitForSelector(args.selector, {
              timeout: args.timeout || 30000,
              state: "visible",
            });
          }
          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: `Timeout waiting for content to load: ${error.message}`,
          };
        }
      },
      name: "waitForContentToLoad",
      description:
        "Waits for dynamic content to load based on selector and optional text marker.",
      parse: (args: string) => {
        return z
          .object({
            selector: z.string(),
            textMarker: z.string().optional(),
            timeout: z.number().optional(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: "CSS selector to wait for.",
          },
          textMarker: {
            type: "string",
            description:
              "Optional text content to wait for within the selector.",
          },
          timeout: {
            type: "number",
            description:
              "Maximum time to wait in milliseconds. Default is 30000 (30 seconds).",
          },
        },
        required: ["selector"],
      },
    },
    extractVisibleText: {
      function: async (args: { elementId?: string; selector?: string }) => {
        let result;

        if (args.elementId) {
          result = await getLocator(args.elementId).evaluate(
            (node: Element) => {
              const getVisibleText = (element: Element | Node): string => {
                if (element.nodeType === 3) {
                  return element.textContent?.trim() || "";
                }

                if (element instanceof Element) {
                  const style = window.getComputedStyle(element);
                  if (
                    style.display === "none" ||
                    style.visibility === "hidden" ||
                    style.opacity === "0"
                  ) {
                    return "";
                  }

                  let text = "";
                  Array.from(element.childNodes).forEach((child) => {
                    text += getVisibleText(child);
                  });

                  return text;
                }

                return "";
              };

              return getVisibleText(node);
            },
          );
        } else if (args.selector) {
          result = await page.evaluate((selector: string) => {
            const elements = document.querySelectorAll(selector);
            let allText = "";

            elements.forEach((element) => {
              const style = window.getComputedStyle(element);
              if (
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                style.opacity !== "0"
              ) {
                allText += (element.textContent?.trim() || "") + " ";
              }
            });

            return allText.trim();
          }, args.selector);
        } else {
          throw new Error("Either elementId or selector must be provided");
        }

        return { text: result };
      },
      name: "extractVisibleText",
      description:
        "Extracts only visible text from elements, ignoring hidden content.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string().optional(),
            selector: z.string().optional(),
          })
          .refine(
            (data) =>
              data.elementId !== undefined || data.selector !== undefined,
            {
              message: "Either elementId or selector must be provided",
            },
          )
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
            description: "ID of the element to extract text from.",
          },
          selector: {
            type: "string",
            description: "CSS selector to locate elements for text extraction.",
          },
        },
      },
    },
    scrollIntoElementView: {
      function: async (args: { elementId: string; behavior?: string }) => {
        await getLocator(args.elementId).evaluate(
          (node: Element, behavior: string | undefined) => {
            node.scrollIntoView({
              behavior: (behavior as "auto" | "smooth") || "smooth",
              block: "center",
            });
          },
          args.behavior,
        );

        await page.waitForTimeout(500);

        return { success: true };
      },
      name: "scrollIntoElementView",
      description:
        "Scrolls to bring an element into view, useful for loading content dynamically as user scrolls.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
            behavior: z.enum(["auto", "smooth"]).optional(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
            description: "ID of the element to scroll into view.",
          },
          behavior: {
            type: "string",
            enum: ["auto", "smooth"],
            description:
              "Scrolling behavior: 'auto' for instant scrolling or 'smooth' for animated scrolling.",
          },
        },
        required: ["elementId"],
      },
    },
    waitForNetworkIdle: {
      function: async (args: { timeout?: number; idleTime?: number }) => {
        try {
          await page.waitForLoadState("networkidle", {
            timeout: args.timeout || 30000,
          });

          if (args.idleTime) {
            await page.waitForTimeout(args.idleTime);
          }

          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: `Timeout waiting for network idle: ${error.message}`,
          };
        }
      },
      name: "waitForNetworkIdle",
      description:
        "Waits for network activity to be minimal or stopped, useful for SPA applications.",
      parse: (args: string) => {
        return z
          .object({
            timeout: z.number().optional(),
            idleTime: z.number().optional(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          timeout: {
            type: "number",
            description:
              "Maximum time to wait in milliseconds. Default is 30000 (30 seconds).",
          },
          idleTime: {
            type: "number",
            description:
              "Additional wait time after network becomes idle, in milliseconds.",
          },
        },
      },
    },
  };
};
