// backend/server.js (modified frame sending)
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import pkg from "wrtc";

const { RTCPeerConnection, nonstandard } = pkg;
const { RTCVideoSource } = nonstandard;

const HTTP_PORT = 3000;
const WS_PORT = 3001;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("BlueProxy backend running");
});

server.listen(HTTP_PORT, () => {
  console.log(`HTTP server running on http://localhost:${HTTP_PORT}`);
});

const wss = new WebSocketServer({ port: WS_PORT });
console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);

wss.on("connection", (ws) => {
  console.log("Client connected via WebSocket");

  const pc = new RTCPeerConnection();

  // Video source and track
  const videoSource = new RTCVideoSource();
  const videoTrack = videoSource.createTrack();
  pc.addTrack(videoTrack);

  pc.onicecandidate = ({ candidate }) => {
    if (candidate) ws.send(JSON.stringify({ type: "ice", candidate }));
  };

  ws.on("message", async (msg) => {
    let data;
    try {
      data = JSON.parse(msg.toString());
    } catch {
      console.error("Invalid JSON:", msg.toString());
      return;
    }

    if (data.type === "offer") {
      await pc.setRemoteDescription(data);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ws.send(JSON.stringify(answer));
    } else if (data.type === "ice") {
      if (data.candidate) {
        try { await pc.addIceCandidate(data.candidate); } 
        catch (err) { console.error("ICE Error:", err); }
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    pc.close();
    clearInterval(interval);
  });

  // Send black frames (640x480) via RTCVideoSource
  const width = 640;
  const height = 480;
  const sendVideoFrame = () => {
    const frameData = Buffer.alloc(width * height * 3); // RGB black
    videoSource.onFrame({ data: frameData, width, height });
  };

  const interval = setInterval(sendVideoFrame, 16); // ~60fps
});
