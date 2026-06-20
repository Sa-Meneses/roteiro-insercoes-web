#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const DEFAULT_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    args[key] = value;
  }
  return args;
}

async function waitForJson(port, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      if (res.ok) return await res.json();
    } catch {
      // Chrome is still starting.
    }
    await sleep(250);
  }
  throw new Error(`Chrome DevTools did not become ready on port ${port}`);
}

async function cdp(wsUrl) {
  let seq = 0;
  const pending = new Map();
  const ws = new WebSocket(wsUrl);

  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const item = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) item.reject(new Error(JSON.stringify(msg.error)));
      else item.resolve(msg.result);
    }
  });

  return {
    send(method, params = {}) {
      const id = ++seq;
      ws.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
      });
    },
    close() {
      ws.close();
    },
  };
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.url || !args.out) {
    throw new Error("Usage: capture_fullpage_chrome.mjs --url <url> --out <file.png> [--width 1280] [--height 1920]");
  }

  const width = Number(args.width || 1280);
  const height = Number(args.height || 1920);
  const delay = Number(args.delay || 5000);
  const port = Number(args.port || 9333);
  const chrome = args.chrome || DEFAULT_CHROME;
  const profile = args.profile || `/tmp/codex-capture-${Date.now()}`;

  await mkdir(dirname(args.out), { recursive: true });

  const child = spawn(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    `--window-size=${width},${height}`,
    `--user-data-dir=${profile}`,
    args.url,
  ], { stdio: "ignore" });

  try {
    const targets = await waitForJson(port);
    const page = targets.find((target) => target.type === "page");
    if (!page) throw new Error("No Chrome page target found");

    const client = await cdp(page.webSocketDebuggerUrl);
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Page.navigate", { url: args.url });
    await sleep(delay);
    await client.send("Runtime.evaluate", {
      expression: "window.scrollTo(0, 0); document.body.style.zoom='1';",
      awaitPromise: true,
    });
    await sleep(500);

    const metrics = await client.send("Page.getLayoutMetrics");
    const content = metrics.contentSize;
    await client.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    const shot = await client.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: content.width, height: content.height, scale: 1 },
    });
    await writeFile(args.out, Buffer.from(shot.data, "base64"));
    client.close();
    console.log(args.out);
  } finally {
    child.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
