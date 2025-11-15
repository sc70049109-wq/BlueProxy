// server.js
import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import puppeteer from "puppeteer";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static("frontend"));

let browser;

async function startBrowser() {
  browser = await puppeteer.launch({
    headless: true,
    args: [
      "--use-fake-ui-for-media-stream",
      "--enable-usermedia-screen-capturing",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--enable-audio"
    ]
  });
}

startBrowser();

wss.on("connection", async (ws) => {
  console.log("New client connected");

  // Launch a new page per connection
  const page = await browser.newPage();

  // Serve a blank page
  await page.goto("about:blank");

  // Setup a simple WebRTC adapter
  ws.on("message", async (msg) => {
    const data = JSON.parse(msg);

    if (data.type === "offer") {
      const offer = data.offer;

      // Here you would integrate a WebRTC library to handle Puppeteer stream
      // For simplicity, echo back (you can expand with wrtc or similar)
      ws.send(JSON.stringify({ type: "answer", answer: offer }));
    }

    if (data.type === "ice-candidate") {
      // handle ICE candidates if needed
    }
  });

  ws.on("close", async () => {
    await page.close();
    console.log("Client disconnected");
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
