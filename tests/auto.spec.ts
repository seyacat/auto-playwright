import { expect, test } from "@playwright/test";
import { auto } from "../src/auto";

const options = undefined;

test("executes query", async ({ page }) => {
  await page.goto("/");

  const headerText = await auto("get the header text", { page, test }, options);

  expect(headerText).toBe("Hello, Rayrun!");
});

test("executes query using locator_evaluate", async ({ page }) => {
  await page.goto("/");

  const headerText = await auto(
    "get the first letter of the header text",
    {
      page,
      test,
    },
    options,
  );

  // TODO assert that we are using locator_evaluate to get the first letter
  expect(headerText).toBe("H");
});

test("executes action", async ({ page }) => {
  await page.goto("/");

  await auto(`Type "foo" in the search box`, { page, test }, options);

  await page.pause();

  await expect(page.getByTestId("search-input")).toHaveValue("foo");
});

test("executes click", async ({ page }) => {
  await page.goto("/");

  await auto(
    "Click the button until the counter value is equal to 2",
    {
      page,
      test,
    },
    options,
  );

  await expect(page.getByTestId("current-count")).toHaveText("2");
});

test("asserts (toBe)", async ({ page }) => {
  await page.goto("/");

  const searchInputHasHeaderText = await auto(
    `Is the contents of the header equal to "Hello, Rayrun!"?`,
    { page, test },
    options,
  );

  expect(searchInputHasHeaderText).toBe(true);
});

test("asserts (not.toBe)", async ({ page }) => {
  await page.goto("/");

  const searchInputHasHeaderText = await auto(
    `Is the contents of the header equal to "Flying Donkeys"?`,
    { page, test },
    options,
  );

  expect(searchInputHasHeaderText).toBe(false);
});

test("executes query, action and assertion", async ({ page }) => {
  await page.goto("/");

  const headerText = await auto("get the header text", { page, test }, options);

  await auto(`type "${headerText}" in the search box`, { page, test }, options);

  const searchInputHasHeaderText = await auto(
    `is the contents of the search box equal to "${headerText}"?`,
    { page, test },
    options,
  );

  expect(searchInputHasHeaderText).toBe(true);
});

test("runs without test parameter", async ({ page }) => {
  await page.goto("/");

  const headerText = await auto("get the header text", { page }, options);

  expect(headerText.query).toBe("Hello, Rayrun!");
});

test("selects an option from dropdown using auto", async ({ page }) => {
  await page.goto("/");

  await auto(
    "Select the 'Banana' option from the fruit dropdown",
    { page, test },
    options,
  );

  await expect(page.getByTestId("selected-fruit")).toHaveText("Banana");
});

test("selects an option from dropdown by value using auto", async ({
  page,
}) => {
  await page.goto("/");

  await auto(
    "Select the option with value 'cherry' from the fruit dropdown",
    { page, test },
    options,
  );

  await expect(page.getByTestId("selected-fruit")).toHaveText("Cherry");
});

test("selects multiple options from multi-select using auto", async ({
  page,
}) => {
  await page.goto("/");

  await auto(
    "Select the 'Red' and 'Blue' options from the colors multi-select",
    { page, test },
    options,
  );

  await expect(page.getByTestId("selected-colors")).toHaveText("Red, Blue");
});

test("extracts visible structure of the page using auto", async ({ page }) => {
  test.setTimeout(3 * 60 * 1000);

  await page.goto("/");

  const structure = await auto(
    "Get the visible structure of the page",
    { page, test },
    options,
  );

  expect(typeof structure).toBe("string");
  expect(structure.length).toBeGreaterThan(0);
});

test("locates elements by ARIA role using auto", async ({ page }) => {
  await page.goto("/");

  await auto(
    "Find and click the 'Click me' button using its role",
    { page, test },
    options,
  );

  const countText = await page
    .locator("[data-testid='current-count']")
    .innerText();
  expect(countText).toBe("1");
});

test("locates elements by visible text using auto", async ({ page }) => {
  await page.goto("/");

  await auto(
    "Find the fruit dropdown and select the option 'Banana' by visible text",
    { page, test },
    options,
  );

  const selectedFruit = await page
    .locator("[data-testid='selected-fruit']")
    .innerText();
  expect(selectedFruit).toBe("Banana");
});

test("waits for dynamic content to load using auto", async ({ page }) => {
  await page.goto("/");

  await auto(
    "Wait for the dynamic content to appear on the page",
    { page, test },
    options,
  );

  const dynamicContent = await page.locator("[data-testid='dynamic-content']");
  await expect(dynamicContent).toBeVisible();
});

test("extracts only visible text from a specific element using auto", async ({
  page,
}) => {
  await page.goto("/");

  const extractedText = await auto(
    "Extract the visible text from the 'Selected fruit' area",
    { page, test },
    options,
  );

  expect(typeof extractedText).toBe("string");
  expect(extractedText.length).toBeGreaterThan(0);
});

test("scrolls element into view using auto", async ({ page }) => {
  await page.goto("/");

  await auto(
    "Scroll to the bottom of the page where it says 'You have reached the bottom of the page!'",
    {
      page,
      test,
    },
    options,
  );

  const isVisible = await page.locator("#bottom-of-page").isVisible();
  expect(isVisible).toBeTruthy();
});

test("waits for network idle state using auto", async ({ page }) => {
  await page.goto("/");

  await auto("Wait until network is idle", { page, test }, options);

  expect(true).toBe(true);
});
