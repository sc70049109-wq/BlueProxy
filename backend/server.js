// backend/server.js
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import pkg from "wrtc";
const { RTCPeerConnection, nonstandard } = pkg;

const PORT_HTTP = 3000;
const PORT_WS = 3001;

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Blue Proxy Backend is running");
});

server.listen(PORT_HTTP, () => {
  console.log(`HTTP server running on http://localhost:${PORT_HTTP}`);
});

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT_WS });
console.log(`WebSocket server running on ws://localhost:${PORT_WS}`);

wss.on("connection", (ws) => {
  console.log("Client connected via WebSocket");

  // Create WebRTC PeerConnection
  const pc = new RTCPeerConnection();

  // Create a video source and track
  const videoSource = new nonstandard.RTCVideoSource();
  const videoTrack = videoSource.createTrack();
  pc.addTrack(videoTrack);

  // Send video frames periodically
  const width = 640;
  const height = 480;
  const interval = setInterval(() => {
    const frameData = Buffer.alloc(width * height * 1.5); // I420 format
    try {
      videoSource.onFrame({ data: frameData, width, height });
    } catch (err) {
      console.error("Error sending video frame:", err.message);
    }
  }, 1000 / 30); // 30 FPS

  // Handle ICE candidates
  pc.onicecandidate = ({ candidate }) => {
    if (candidate) {
      ws.send(JSON.stringify({ type: "ice", candidate }));
    }
  };

  // Handle incoming data channel (optional)
  pc.ondatachannel = (event) => {
    console.log("Data channel received:", event.channel.label);
  };

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === "offer") {
        await pc.setRemoteDescription(data);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify(answer));
      } else if (data.type === "ice") {
        if (data.candidate && data.candidate.candidate) {
          await pc.addIceCandidate(data.candidate);
        }
      }
    } catch (err) {
      console.error("Failed to handle WS message:", err.message);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(interval);
    pc.close();
  });
});
