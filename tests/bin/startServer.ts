import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { resolve } from "path";
import { readFile } from "node:fs/promises";

export const startServer = (port: number) => {
  const app = new Hono();

  const PAGES_DIR = resolve(process.cwd(), "tests/pages");

  // Ручная раздача HTML из tests/pages
  app.get("/tests/pages/:file", async (c) => {
    const fileName = c.req.param("file");
    const fullPath = resolve(PAGES_DIR, fileName);
    try {
      const html = await readFile(fullPath, "utf-8");
      return c.html(html);
    } catch (err) {
      console.error("File not found:", fullPath);
      return c.text("404 Not Found", 404);
    }
  });

  // Главная страница (как раньше)
  app.get("/", (c) =>
    c.html(`<html>
  <body>
    <h1>Hello, Rayrun!</h1>
    <form id="search">
      <label>Search</label>
      <input type="text" name="query" data-testid="search-input" />
    </form>
    <div id="click-counter">
      <p>Click count: <span id="current-count" data-testid="current-count">0</span></p>
      <button id="click-button">Click me</button>
      <script>
      const clickButton = document.getElementById("click-button");
      const currentCount = document.getElementById("current-count");
      let clickCount = 0;
      clickButton.addEventListener("click", () => {
        currentCount.innerText = ++clickCount;
      });
      </script>
    </div>
    <div id="select-container">
      <label for="fruit-select">Choose a fruit:</label>
      <select id="fruit-select" data-testid="fruit-select">
        <option value="">--Please choose an option--</option>
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
        <option value="cherry">Cherry</option>
        <option value="orange">Orange</option>
      </select>
      <p>Selected fruit: <span id="selected-fruit" data-testid="selected-fruit">None</span></p>
      <script>
      const fruitSelect = document.getElementById("fruit-select");
      const selectedFruit = document.getElementById("selected-fruit");
      fruitSelect.addEventListener("change", () => {
        selectedFruit.innerText = fruitSelect.value ? fruitSelect.options[fruitSelect.selectedIndex].text : "None";
      });
      </script>
    </div>
    <div id="multi-select-container">
      <label for="colors-select">Choose colors:</label>
      <select id="colors-select" data-testid="colors-select" multiple>
        <option value="red">Red</option>
        <option value="green">Green</option>
        <option value="blue">Blue</option>
        <option value="yellow">Yellow</option>
      </select>
      <p>Selected colors: <span id="selected-colors" data-testid="selected-colors">None</span></p>
      <script>
      const colorsSelect = document.getElementById("colors-select");
      const selectedColors = document.getElementById("selected-colors");
      colorsSelect.addEventListener("change", () => {
        const selectedOptions = Array.from(colorsSelect.selectedOptions).map(option => option.text);
        selectedColors.innerText = selectedOptions.length ? selectedOptions.join(", ") : "None";
      });
      </script>
    </div>
    <div id="dynamic-content" style="display: none;" data-testid="dynamic-content">
      This is dynamic content.
    </div>

    <script>
      setTimeout(() => {
        const dynamicContent = document.getElementById("dynamic-content");
        if (dynamicContent) {
          dynamicContent.style.display = "block";
        }
      }, 2000); // появится через 2 секунды
    </script>

    <div style="height: 3000px;"></div>

    <div id="bottom-of-page" data-testid="bottom-of-page">
      You have reached the bottom of the page!
    </div>
  </body>
</html>`),
  );

  return new Promise((resolve) => {
    const server = serve(
      {
        fetch: app.fetch,
        port,
      },
      (info) => {
        resolve({
          close: () => {
            server.close();
          },
          port: info.port,
        });
      },
    );
  });
};

startServer(3000);
