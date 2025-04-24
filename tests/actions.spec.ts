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

test("selects option by value in a select element using elementId", async ({ page }) => {
  await page.goto("/");

  const actions = createActions(page);

  const locateResult = await actions.locateElement.function(
    {
      cssSelector: "#fruit-select",
    },
    runner
  ) as { elementId: string };

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

  await expect(page.locator("#selected-fruit")).toHaveText("Banana");
});

test("selects option by value in a select element using CSS selector", async ({ page }) => {
  await page.goto("/");

  const actions = createActions(page);

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

  await expect(page.locator("#selected-fruit")).toHaveText("Cherry");
});

test("selects option by label in a select element using CSS selector", async ({ page }) => {
  await page.goto("/");

  const actions = createActions(page);

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

  await expect(page.locator("#selected-fruit")).toHaveText("Orange");
});

test("selects option by index in a select element using CSS selector", async ({ page }) => {
  await page.goto("/");

  const actions = createActions(page);

  const selectResult = await actions.locator_selectOption.function(
    {
      cssSelector: "#fruit-select",
      index: 1,
    },
    runner
  );

  expect(selectResult).toStrictEqual({
    success: true,
  });

  await expect(page.locator("#selected-fruit")).toHaveText("Apple");
});

test("selects multiple options in a multiple select element using CSS selector", async ({ page }) => {
  await page.goto("/");

  const actions = createActions(page);

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

  await expect(page.locator("#selected-colors")).toHaveText("Red, Blue");
});
