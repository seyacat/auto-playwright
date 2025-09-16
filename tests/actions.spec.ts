import { expect, test } from "@playwright/test";
import { createActions } from "../src/createActions";
import { ChatCompletionRunner } from "openai/lib/ChatCompletionRunner";
import { getSanitizeOptions } from "../src/sanitizeHtml";

const runner = {} as ChatCompletionRunner;

test("finds element using a CSS locator and returns elementId", async ({
  page,
}) => {
  await page.goto("/");

  const actions = createActions(page);

  const result = await actions.locateElement.function(
    {
      cssSelector: "h1",
    },
    runner,
  );

  expect(result).toStrictEqual({
    elementId: expect.any(String),
  });
});

test("selects option by value in a select element using elementId", async ({
  page,
}) => {
  await page.goto("/");

  const actions = createActions(page);

  const locateResult = (await actions.locateElement.function(
    {
      cssSelector: "#fruit-select",
    },
    runner,
  )) as { elementId: string };

  const selectResult = await actions.locator_selectOption.function(
    {
      elementId: locateResult.elementId,
      value: "banana",
    },
    runner,
  );

  expect(selectResult).toStrictEqual({
    success: true,
  });

  await expect(page.locator("#selected-fruit")).toHaveText("Banana");
});

test("selects option by value in a select element using CSS selector", async ({
  page,
}) => {
  await page.goto("/");

  const actions = createActions(page);

  const selectResult = await actions.locator_selectOption.function(
    {
      cssSelector: "#fruit-select",
      value: "cherry",
    },
    runner,
  );

  expect(selectResult).toStrictEqual({
    success: true,
  });

  await expect(page.locator("#selected-fruit")).toHaveText("Cherry");
});

test("selects option by label in a select element using CSS selector", async ({
  page,
}) => {
  await page.goto("/");

  const actions = createActions(page);

  const selectResult = await actions.locator_selectOption.function(
    {
      cssSelector: "#fruit-select",
      label: "Orange",
    },
    runner,
  );

  expect(selectResult).toStrictEqual({
    success: true,
  });

  await expect(page.locator("#selected-fruit")).toHaveText("Orange");
});

test("selects option by index in a select element using CSS selector", async ({
  page,
}) => {
  await page.goto("/");

  const actions = createActions(page);

  const selectResult = await actions.locator_selectOption.function(
    {
      cssSelector: "#fruit-select",
      index: 1,
    },
    runner,
  );

  expect(selectResult).toStrictEqual({
    success: true,
  });

  await expect(page.locator("#selected-fruit")).toHaveText("Apple");
});

test("selects multiple options in a multiple select element using CSS selector", async ({
  page,
}) => {
  await page.goto("/");

  const actions = createActions(page);

  const selectResult = await actions.locator_selectOption.function(
    {
      cssSelector: "#colors-select",
      value: ["red", "blue"],
    },
    runner,
  );

  expect(selectResult).toStrictEqual({
    success: true,
  });

  await expect(page.locator("#selected-colors")).toHaveText("Red, Blue");
});

function createValidationFunction(
  allowedTags: string[],
  allowedAttributes: any,
  maxDepth = 3,
) {
  return function validateNode(node: any, depth = 0) {
    expect(node.tag).toBeDefined();
    expect(allowedTags).toContain(node.tag);

    if (allowedAttributes !== false) {
      const allowedForAll = allowedAttributes?.["*"];
      const allowedForTag = allowedAttributes?.[node.tag];

      const isAllowAllForTag = allowedForTag === true;
      const isAllowAllGlobal = allowedForAll === true;

      for (const attrName of Object.keys(node.attributes || {})) {
        if (!(isAllowAllForTag || isAllowAllGlobal)) {
          if (Array.isArray(allowedForTag)) {
            expect(allowedForTag).toContain(attrName);
          } else if (Array.isArray(allowedForAll)) {
            expect(allowedForAll).toContain(attrName);
          } else {
            throw new Error(
              `Attribute ${attrName} is not allowed for tag ${node.tag}`,
            );
          }
        }
      }
    }

    if (depth > maxDepth) {
      throw new Error(`Depth exceeded maxDepth: ${depth}`);
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        validateNode(child, depth + 1);
      }
    }
  };
}

test("getVisibleStructure on default page", async ({ page }) => {
  await page.goto("http://localhost:3000/tests/pages/default.html");

  const actions = createActions(page);

  const { structure } = (await actions.getVisibleStructure.function(
    {},
    runner,
  )) as { structure: any };

  expect(typeof structure).toBe("object");
  expect(structure).not.toBeNull();

  const sanitizeOptions = getSanitizeOptions();
  const validateNode = createValidationFunction(
    sanitizeOptions.allowedTags || [],
    sanitizeOptions.allowedAttributes,
  );

  validateNode(structure);
});

test("getVisibleStructure on all attributes page", async ({ page }) => {
  await page.goto("http://localhost:3000/tests/pages/all-attributes.html");

  const actions = createActions(page);

  const { structure } = (await actions.getVisibleStructure.function(
    {},
    runner,
  )) as { structure: any };

  expect(typeof structure).toBe("object");
  expect(structure).not.toBeNull();

  const sanitizeOptions = getSanitizeOptions();
  const validateNode = createValidationFunction(
    sanitizeOptions.allowedTags || [],
    sanitizeOptions.allowedAttributes,
  );

  validateNode(structure);
});

test("getVisibleStructure respects max depth", async ({ page }) => {
  await page.goto("http://localhost:3000/tests/pages/deep-nesting.html");

  const actions = createActions(page);

  const { structure } = (await actions.getVisibleStructure.function(
    {},
    runner,
  )) as { structure: any };

  expect(typeof structure).toBe("object");
  expect(structure).not.toBeNull();

  const sanitizeOptions = getSanitizeOptions();
  const validateNode = createValidationFunction(
    sanitizeOptions.allowedTags || [],
    sanitizeOptions.allowedAttributes,
    5,
  );

  validateNode(structure);
});
