// backend/server.js
import express from "express";
import { WebSocketServer } from "ws";
import wrtc from "wrtc";

const { RTCPeerConnection, RTCVideoSource, RTCVideoFrame } = wrtc;

const app = express();
const HTTP_PORT = 3000;
const WS_PORT = 3001;

// Serve static files if needed
app.use(express.static("../frontend"));

// Start HTTP server
app.listen(HTTP_PORT, () => {
  console.log(`HTTP server running on http://localhost:${HTTP_PORT}`);
});

// Start WebSocket server
const wss = new WebSocketServer({ port: WS_PORT }, () => {
  console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);
});

wss.on("connection", (ws) => {
  console.log("Client connected via WebSocket");

  // Create PeerConnection
  const pc = new RTCPeerConnection();

  // Create a video source and track
  const videoSource = new RTCVideoSource();
  const track = videoSource.createTrack();
  pc.addTrack(track);

  // Send ICE candidates to client
  pc.onicecandidate = ({ candidate }) => {
    if (candidate) ws.send(JSON.stringify({ type: "candidate", candidate }));
  };

  // Handle incoming messages from client
  ws.on("message", async (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === "offer") {
      await pc.setRemoteDescription(data.offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ws.send(JSON.stringify({ type: "answer", answer }));
    }

    if (data.type === "candidate") {
      try {
        await pc.addIceCandidate(data.candidate);
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    pc.close();
  });

  // Dummy video frames generator (black screen)
  setInterval(() => {
    const width = 640;
    const height = 360;
    const frameData = new Uint8ClampedArray(width * height * 4); // RGBA black frame
    const frame = new RTCVideoFrame(frameData, width, height);
    videoSource.onFrame(frame);
  }, 1000 / 30); // 30 FPS
});
