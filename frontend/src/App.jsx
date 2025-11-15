// frontend/src/App.jsx
import React, { useEffect, useRef, useCallback, useState } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function App() {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const [connected, setConnected] = useState(false);

  // Particles init
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  useEffect(() => {
    // Setup WebSocket signaling
    const ws = new WebSocket("ws://localhost:3001");
    wsRef.current = ws;

    ws.onopen = () => console.log("Connected to WebSocket");
    ws.onmessage = async (message) => {
      const data = JSON.parse(message.data);

      if (data.type === "answer") {
        await pcRef.current.setRemoteDescription(data.answer);
        setConnected(true);
      }

      if (data.type === "candidate") {
        try {
          await pcRef.current.addIceCandidate(data.candidate);
        } catch (e) {
          console.error(e);
        }
      }
    };

    // Setup WebRTC PeerConnection
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    // Receive video track from backend
    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    // Send ICE candidates to backend
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) ws.send(JSON.stringify({ type: "candidate", candidate }));
    };

    // Create dummy data channel to trigger connection
    pc.createDataChannel("blueproxy");

    // Create offer
    (async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws.send(JSON.stringify({ type: "offer", offer }));
    })();

    return () => {
      ws.close();
      pc.close();
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: "20px",
        color: "white",
      }}
    >
      {/* Particles background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          particles: {
            color: { value: "#ffffff" },
            links: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
            collisions: { enable: true },
            move: { enable: true, speed: 2, direction: "none", random: false, straight: false, outModes: { default: "bounce" }, attract: { enable: false } },
            number: { density: { enable: true, area: 800 }, value: 80 },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 5 } }
          },
          detectRetina: true
        }}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
      />

      {/* Header */}
      <h1 style={{ zIndex: 1 }}>🌐 BlueProxy WebRTC</h1>

      {/* Video from backend */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "70%",
          maxWidth: "800px",
          border: "3px solid white",
          borderRadius: "12px",
          margin: "20px 0",
          zIndex: 1,
        }}
      />

      {/* Cards */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          zIndex: 1,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <div style={{ background: "rgba(255,255,255,0.1)", padding: "20px", borderRadius: "12px", minWidth: "150px" }}>
          <h2>⚡ Card 1</h2>
          <p>Some info</p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.1)", padding: "20px", borderRadius: "12px", minWidth: "150px" }}>
          <h2>🔥 Card 2</h2>
          <p>More info</p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.1)", padding: "20px", borderRadius: "12px", minWidth: "150px" }}>
          <h2>💎 Card 3</h2>
          <p>Even more info</p>
        </div>
      </div>

      {/* Connection status */}
      <p style={{ marginTop: "20px", zIndex: 1 }}>
        {connected ? "🟢 Connected to backend" : "🔴 Connecting..."}
      </p>
    </div>
  );
}
