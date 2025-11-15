// backend/server.js
import express from "express";
import { WebSocketServer } from "ws";
import puppeteer from "puppeteer";
import wrtc from "wrtc"; // ✅ Option 1: default import

const { RTCPeerConnection, RTCVideoSource, RTCVideoFrame } = wrtc;

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

// WebSocket signaling server
const wss = new WebSocketServer({ port: WS_PORT });

wss.on("connection", async (ws) => {
  console.log("Client connected via WebSocket");

  // Launch headless browser
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto("https://example.com"); // page to stream

  // Create WebRTC peer connection
  const pc = new RTCPeerConnection();
  const videoSource = new RTCVideoSource();
  const track = videoSource.createTrack();
  pc.addTrack(track);

  // Send ICE candidates to frontend
  pc.onicecandidate = ({ candidate }) => {
    if (candidate) ws.send(JSON.stringify({ type: "candidate", candidate }));
  };

  ws.on("message", async (msg) => {
    const data = JSON.parse(msg.toString());

    if (data.type === "offer") {
      await pc.setRemoteDescription(data.offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ws.send(JSON.stringify({ type: "answer", answer: pc.localDescription }));
    }

    if (data.type === "candidate") {
      try {
        await pc.addIceCandidate(data.candidate);
      } catch (e) {
        console.error("Error adding ICE candidate:", e);
      }
    }
  });

  // Capture browser screenshots and feed them to the WebRTC track
  const intervalId = setInterval(async () => {
    try {
      const screenshot = await page.screenshot({ encoding: "binary" });
      const frame = new RTCVideoFrame(screenshot, 640, 480); // 640x480 resolution
      videoSource.onFrame(frame);
    } catch (e) {
      console.error("Screenshot error:", e);
    }
  }, 1000 / 10); // ~10 FPS

  ws.on("close", async () => {
    clearInterval(intervalId);
    await browser.close();
    console.log("Client disconnected, browser closed");
  });
});
