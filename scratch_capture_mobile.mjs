import { spawn } from 'child_process';
import fs from 'fs';

const chrome = spawn("C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless",
  "--remote-debugging-port=9249",
  "--disable-gpu",
  "--no-sandbox",
  "http://localhost:3000"
]);

for (let i = 0; i < 20; i++) {
  await new Promise(r => setTimeout(r, 200));
  try {
    const res = await fetch("http://localhost:9249/json");
    if (res.ok) break;
  } catch { }
}

const res = await fetch("http://localhost:9249/json");
const pages = await res.json();
const target = pages.find(p => p.type === 'page' && p.url.includes('localhost:3000'));

const ws = new WebSocket(target.webSocketDebuggerUrl);

let id = 1;
const send = (m, p = {}) => new Promise(resolve => {
  const i = id++;
  const h = e => {
    const d = JSON.parse(e.data);
    if (d.id === i) {
      ws.removeEventListener("message", h);
      resolve(d.result);
    }
  };
  ws.addEventListener("message", h);
  ws.send(JSON.stringify({ id: i, method: m, params: p }));
});

await new Promise(r => ws.onopen = r);

// Emulate mobile device (iPhone 12 / 13: 390 x 844)
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send("Page.navigate", { url: "http://localhost:3000" });
await new Promise(r => setTimeout(r, 3500));

// Capture top of page screenshot
const shot1 = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync("C:\\Users\\USER-PC\\.gemini\\antigravity-ide\\brain\\cc42232c-5f52-4954-80af-6fefefd76674\\mobile_view_top.png", Buffer.from(shot1.data, "base64"));

// Scroll down 150px
await send("Runtime.evaluate", { expression: "window.scrollTo(0, 150);" });
await new Promise(r => setTimeout(r, 1000));

// Capture scrolled screenshot
const shot2 = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync("C:\\Users\\USER-PC\\.gemini\\antigravity-ide\\brain\\cc42232c-5f52-4954-80af-6fefefd76674\\mobile_view_scrolled.png", Buffer.from(shot2.data, "base64"));

console.log("Screenshots captured successfully!");

ws.close();
chrome.kill();
process.exit(0);
