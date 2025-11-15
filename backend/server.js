// backend/server.js
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import pkg from "wrtc";

const { RTCPeerConnection, nonstandard: { RTCVideoSource, RTCVideoFrame } } = pkg;

const HTTP_PORT = 3000;
const WS_PORT = 3001;

// Simple HTTP server (optional, can serve frontend if needed)
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("BlueProxy Backend is running");
});

server.listen(HTTP_PORT, () => {
  console.log(`HTTP server running on http://localhost:${HTTP_PORT}`);
});

// WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });
console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);

wss.on("connection", (ws) => {
  console.log("Client connected via WebSocket");

  // Create WebRTC PeerConnection
  const pc = new RTCPeerConnection();

  // Create a video track with a placeholder black frame
  const videoSource = new RTCVideoSource();
  const videoTrack = videoSource.createTrack();
  pc.addTrack(videoTrack);

  // Generate a simple black frame every 40ms (~25fps)
  const width = 640;
  const height = 480;
  const frameData = new Uint8ClampedArray(width * height * 4); // all 0 = black
  const sendFrame = () => {
    const frame = new RTCVideoFrame(frameData, width, height);
    videoSource.onFrame(frame);
  };
  const interval = setInterval(sendFrame, 40);

  pc.onicecandidate = ({ candidate }) => {
    if (candidate) {
      ws.send(JSON.stringify({ type: "ice", candidate }));
    }
  };

  ws.onmessage = async (msg) => {
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
  };

  ws.on("close", () => {
    clearInterval(interval);
    pc.close();
    console.log("Client disconnected");
  });
});
