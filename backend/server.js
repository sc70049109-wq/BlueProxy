// backend/server.js
import express from "express";
import { WebSocketServer } from "ws";
import wrtc from "wrtc";

const { RTCPeerConnection } = wrtc;
const { RTCVideoSource, RTCVideoFrame } = wrtc.nonstandard;

const app = express();
const HTTP_PORT = 3000;
const WS_PORT = 3001;

// Serve a simple message on HTTP
app.get("/", (req, res) => {
  res.send("BlueProxy WebRTC Backend is running!");
});

app.listen(HTTP_PORT, () => {
  console.log(`HTTP server running on http://localhost:${HTTP_PORT}`);
});

// WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });
console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);

wss.on("connection", (ws) => {
  console.log("Client connected via WebSocket");

  // Create PeerConnection
  const pc = new RTCPeerConnection();

  // Create a dummy video track
  const videoSource = new RTCVideoSource();
  const track = videoSource.createTrack();
  pc.addTrack(track);

  // Send ICE candidates to client
  pc.onicecandidate = ({ candidate }) => {
    if (candidate) {
      ws.send(JSON.stringify({ type: "ice", candidate }));
    }
  };

  // Handle incoming messages from client
  ws.on("message", async (msg) => {
    const data = JSON.parse(msg.toString());

    if (data.type === "offer") {
      await pc.setRemoteDescription(data);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ws.send(JSON.stringify(pc.localDescription));
    } else if (data.type === "ice") {
      try {
        await pc.addIceCandidate(data.candidate);
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    }
  });

  // Send dummy video frames every 33ms (~30fps)
  setInterval(() => {
    const width = 640;
    const height = 480;
    const frameData = new Uint8ClampedArray(width * height * 4); // black frame
    const frame = new RTCVideoFrame(frameData, width, height);
    videoSource.onFrame(frame);
  }, 33);
});
