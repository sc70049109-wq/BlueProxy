// backend/server.js
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import pkg from "wrtc";

const { RTCPeerConnection, nonstandard } = pkg;
const { RTCVideoSource, RTCVideoFrame } = nonstandard;

const HTTP_PORT = 3000;
const WS_PORT = 3001;

// Create HTTP server (optional, can serve static files if needed)
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("BlueProxy backend running");
});

server.listen(HTTP_PORT, () => {
  console.log(`HTTP server running on http://localhost:${HTTP_PORT}`);
});

// Create WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });
console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);

wss.on("connection", (ws) => {
  console.log("Client connected via WebSocket");

  const pc = new RTCPeerConnection();

  // Create video source and track
  const videoSource = new RTCVideoSource();
  const videoTrack = videoSource.createTrack();
  pc.addTrack(videoTrack);

  // Handle ICE candidates
  pc.onicecandidate = ({ candidate }) => {
    if (candidate) {
      ws.send(JSON.stringify({ type: "ice", candidate }));
    }
  };

  // Handle incoming WebRTC offer
  ws.on("message", async (message) => {
    let data;
    try {
      data = JSON.parse(message.toString());
    } catch (err) {
      console.error("Invalid JSON:", message.toString());
      return;
    }

    if (data.type === "offer") {
      await pc.setRemoteDescription(data);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ws.send(JSON.stringify(answer));
    } else if (data.type === "ice") {
      if (data.candidate) {
        try {
          await pc.addIceCandidate(data.candidate);
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    pc.close();
  });

  // OPTIONAL: send a blank video frame every 16ms (simulate video)
  const sendVideoFrame = () => {
    const width = 640;
    const height = 480;
    const data = Buffer.alloc(width * height * 3); // black frame
    const frame = new RTCVideoFrame(data, width, height);
    videoSource.onFrame(frame);
  };

  const interval = setInterval(sendVideoFrame, 16);

  ws.on("close", () => clearInterval(interval));
});
