// src/App.jsx
import React, { useEffect, useRef } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function App() {
  const videoRef = useRef(null);
  let pc;
  let ws;

  // Initialize WebSocket and WebRTC safely
  useEffect(() => {
    ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
      console.log("WebSocket connected");

      // Initialize WebRTC after WS opens
      initWebRTC();
    };

    ws.onmessage = async (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === "answer") {
        await pc.setRemoteDescription(data.answer);
      }
    };

    pc = new RTCPeerConnection();

    pc.ontrack = (event) => {
      videoRef.current.srcObject = event.streams[0];
    };

    const initWebRTC = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws.send(JSON.stringify({ type: "offer", offer }));
    };
  }, []);

  // Initialize particles
  const particlesInit = async (engine) => {
    await loadFull(engine);
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #1a1a1a, #0d0d0d)",
        color: "white",
        overflow: "hidden",
      }}
    >
      {/* Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          particles: {
            color: { value: "#ffffff" },
            links: { enable: true, color: "#ffffff" },
            move: { enable: true, speed: 2 },
            number: { value: 50 },
            size: { value: 3 },
          },
        }}
      />

      {/* Header */}
      <h1 style={{ textAlign: "center", paddingTop: "20px" }}>
        🌐 BlueProxy WebRTC
      </h1>

      {/* Video Stream */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: "80%",
            borderRadius: "20px",
            boxShadow: "0 0 20px rgba(0,0,0,0.5)",
            backgroundColor: "#000", // placeholder black
          }}
        />
      </div>

      {/* Cards / Images Example */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: "50px",
          gap: "20px",
        }}
      >
        <div style={{ width: "150px", height: "150px", background: "#333", borderRadius: "15px" }}></div>
        <div style={{ width: "150px", height: "150px", background: "#444", borderRadius: "15px" }}></div>
        <div style={{ width: "150px", height: "150px", background: "#555", borderRadius: "15px" }}></div>
      </div>
    </div>
  );
}
