import { expect, test } from "@playwright/test";
import { createActions } from "../src/createActions";
import { ChatCompletionRunner } from "openai/lib/ChatCompletionRunner";

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
    runner
  );

  expect(result).toStrictEqual({
    elementId: expect.any(String),
  });
});

// Тест выбора опции по значению с использованием elementId
test("selects option by value in a select element using elementId", async ({ page }) => {
  await page.goto("/");

  const actions = createActions(page);

  // First locate the select element
  const locateResult = await actions.locateElement.function(
    {
      cssSelector: "#fruit-select",
    },
    runner
  ) as { elementId: string };

  // Then select an option by value
  const selectResult = await actions.locator_selectOption.function(
    {
      elementId: locateResult.elementId,
      value: "banana",
    },
    runner
  );

  expect(selectResult).toStrictEqual({
    success: true,
  });

  // Verify the selection was made correctly
  await expect(page.locator("#selected-fruit")).toHaveText("Banana");
});

// Тест выбора опции по значению с использованием CSS-селектора напрямую
test("selects option by value in a select element using CSS selector", async ({ page }) => {
  await page.goto("/");

  const actions = createActions(page);

  // Select an option by value using CSS selector directly
  const selectResult = await actions.locator_selectOption.function(
    {
      cssSelector: "#fruit-select",
      value: "cherry",
    },
    runner
  );

  expect(selectResult).toStrictEqual({
    success: true,
  });

  // Verify the selection was made correctly
  await expect(page.locator("#selected-fruit")).toHaveText("Cherry");
});

// Тест выбора опции по тексту с использованием CSS-селектора напрямую
test("selects option by label in a select element using CSS selector", async ({ page }) => {
  await page.goto("/");

  const actions = createActions(page);

  // Select an option by label using CSS selector directly
  const selectResult = await actions.locator_selectOption.function(
    {
      cssSelector: "#fruit-select",
      label: "Orange",
    },
    runner
  );

  expect(selectResult).toStrictEqual({
    success: true,
  });

  // Verify the selection was made correctly
  await expect(page.locator("#selected-fruit")).toHaveText("Orange");
});

// Тест выбора опции по индексу с использованием CSS-селектора напрямую
test("selects option by index in a select element using CSS selector", async ({ page }) => {
  await page.goto("/");

  const actions = createActions(page);

  // Select an option by index using CSS selector directly
  const selectResult = await actions.locator_selectOption.function(
    {
      cssSelector: "#fruit-select",
      index: 1, // index 1 = Apple
    },
    runner
  );

  expect(selectResult).toStrictEqual({
    success: true,
  });

  // Verify the selection was made correctly
  await expect(page.locator("#selected-fruit")).toHaveText("Apple");
});

// Тест множественного выбора опций с использованием CSS-селектора напрямую
test("selects multiple options in a multiple select element using CSS selector", async ({ page }) => {
  await page.goto("/");

  const actions = createActions(page);

  // Select multiple options using CSS selector directly
  const selectResult = await actions.locator_selectOption.function(
    {
      cssSelector: "#colors-select",
      value: ["red", "blue"],
    },
    runner
  );

  expect(selectResult).toStrictEqual({
    success: true,
  });

  // Verify the selections were made correctly
  await expect(page.locator("#selected-colors")).toHaveText("Red, Blue");
});
