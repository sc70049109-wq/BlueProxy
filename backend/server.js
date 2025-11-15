// backend/server.js
import express from "express";
import { WebSocketServer } from "ws";
import puppeteer from "puppeteer";

const app = express();
const HTTP_PORT = 3000;
const WS_PORT = 3001;

// Serve frontend (optional, if you build frontend later)
app.use(express.static("../frontend/dist"));

app.get("/", (req, res) => {
  res.send("BlueProxy WebRTC Backend Running!");
});

app.listen(HTTP_PORT, () => {
  console.log(`HTTP server running on http://localhost:${HTTP_PORT}`);
});

// WebSocket signaling
const wss = new WebSocketServer({ port: WS_PORT });

wss.on("connection", async (ws) => {
  console.log("Client connected via WebSocket");

  // Launch Puppeteer headless browser
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto("about:blank"); // placeholder page

  // Expose a function in Puppeteer to send WebRTC SDP candidates back
  await page.exposeFunction("sendCandidate", (candidate) => {
    ws.send(JSON.stringify({ type: "candidate", candidate }));
  });

  // Initialize a WebRTC peer connection inside the page
  await page.evaluate(() => {
    const pc = new RTCPeerConnection();

    // Capture page media (e.g., video element or canvas)
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      .then((stream) => {
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        window.sendCandidate(event.candidate);
      }
    };

    window.pc = pc;
  });

  ws.on("message", async (msg) => {
    const data = JSON.parse(msg.toString());

    if (data.type === "offer") {
      // Forward offer to Puppeteer page and get answer
      const answer = await page.evaluate(async (offer) => {
        const pc = window.pc;
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        return pc.localDescription;
      }, data.offer);

      ws.send(JSON.stringify({ type: "answer", answer }));
    }
  });

  ws.on("close", async () => {
    await browser.close();
    console.log("Client disconnected, browser closed");
  });
});
