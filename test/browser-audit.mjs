import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const targetUrl = process.env.CAPABILITY_INTELLIGENCE_URL || "http://127.0.0.1:4317";
const screenshotDirectory = process.env.CAPABILITY_INTELLIGENCE_SCREENSHOT_DIR;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "capability-intelligence-chrome-"));
const chrome = spawn("google-chrome", [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--disable-background-networking",
  "--disable-component-update",
  "--remote-debugging-port=0",
  `--user-data-dir=${profile}`,
  "about:blank",
], { stdio: "ignore" });

try {
  const [port] = (await waitForFile(path.join(profile, "DevToolsActivePort"))).trim().split("\n");
  const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
  const page = targets.find((target) => target.type === "page");
  if (!page) throw new Error("No Chrome page target available");
  const cdp = await connect(page.webSocketDebuggerUrl);
  const results = [];
  for (const viewport of [{ width: 320, height: 800 }, { width: 1440, height: 900 }]) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      ...viewport,
      deviceScaleFactor: 1,
      mobile: viewport.width <= 430,
    });
    await cdp.send("Page.navigate", { url: targetUrl });
    await waitForDashboard(cdp, 12000);
    const evaluation = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const root = document.documentElement;
        const coverageElement = document.querySelector('#coverage');
        const coverage = coverageElement?.getBoundingClientRect();
        const coverageChildrenFit = [...(coverageElement?.children || [])].every((child) => {
          const rect = child.getBoundingClientRect();
          return rect.left >= coverage.left && rect.right <= coverage.right && rect.top >= coverage.top && rect.bottom <= coverage.bottom;
        });
        const table = document.querySelector('.table-wrap')?.getBoundingClientRect();
        return {
          title: document.title,
          viewportWidth: root.clientWidth,
          documentWidth: root.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          coverageRight: coverage ? Math.ceil(coverage.right) : null,
          coverageWidth: document.querySelector('#coverage')?.clientWidth || null,
          coverageScrollWidth: document.querySelector('#coverage')?.scrollWidth || null,
          coverageHeight: document.querySelector('#coverage')?.clientHeight || null,
          coverageScrollHeight: document.querySelector('#coverage')?.scrollHeight || null,
          coverageChildrenFit,
          tableRight: table ? Math.ceil(table.right) : null,
          rowCount: document.querySelectorAll('#capability-rows tr').length,
          coverageText: document.querySelector('#coverage')?.textContent || ''
        };
      })()`,
    });
    const value = evaluation.result.value;
    results.push({ viewport, ...value });
    if (value.documentWidth > value.viewportWidth || value.bodyWidth > value.viewportWidth) {
      throw new Error(`Horizontal document overflow at ${viewport.width}px`);
    }
    if (value.coverageRight > value.viewportWidth || value.tableRight > value.viewportWidth) {
      throw new Error(`A dashboard region exceeds the viewport at ${viewport.width}px`);
    }
    if (value.coverageScrollWidth > value.coverageWidth || value.coverageScrollHeight > value.coverageHeight) {
      throw new Error(`Coverage label is clipped at ${viewport.width}px`);
    }
    if (!value.coverageChildrenFit) throw new Error(`Coverage text exceeds its label at ${viewport.width}px`);
    if (value.rowCount === 0 || !value.coverageText.includes("unlabelled manifests retained")) {
      throw new Error(`Dashboard data did not render at ${viewport.width}px`);
    }
    if (screenshotDirectory) {
      fs.mkdirSync(screenshotDirectory, { recursive: true });
      const screenshot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      fs.writeFileSync(
        path.join(screenshotDirectory, `dashboard-${viewport.width}x${viewport.height}.png`),
        Buffer.from(screenshot.data, "base64"),
      );
    }
  }
  cdp.close();
  console.log(JSON.stringify({ status: "passed", results }, null, 2));
} finally {
  chrome.kill("SIGTERM");
  await wait(250);
  fs.rmSync(profile, { recursive: true, force: true });
}

function connect(url) {
  const socket = new WebSocket(url);
  let nextId = 1;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });
  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve({
      send(method, params = {}) {
        const id = nextId++;
        return new Promise((commandResolve, commandReject) => {
          pending.set(id, { resolve: commandResolve, reject: commandReject });
          socket.send(JSON.stringify({ id, method, params }));
        });
      },
      close() { socket.close(); },
    }), { once: true });
    socket.addEventListener("error", () => reject(new Error("Chrome DevTools connection failed")), { once: true });
  });
}

async function waitForDashboard(cdp, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const evaluation = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `document.querySelectorAll('#capability-rows tr').length > 0 && document.querySelector('#coverage')?.textContent.includes('unlabelled manifests retained')`,
    });
    if (evaluation.result.value) return;
    await wait(250);
  }
  throw new Error("Dashboard did not become ready before the bounded timeout");
}

async function waitForFile(file) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
    await wait(100);
  }
  throw new Error("Chrome DevTools port was not created");
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
