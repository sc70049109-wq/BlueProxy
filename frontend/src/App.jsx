// frontend/src/App.jsx
import React, { useRef, useEffect, useState } from "react";
import Particles from "@tsparticles/react";
import { loadFull } from "@tsparticles/engine";

export default function App() {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize particles engine
  const particlesInit = async (engine) => {
    await loadFull(engine);
  };

  useEffect(() => {
    // Connect to backend WebSocket
    const ws = new WebSocket("ws://localhost:3001");
    wsRef.current = ws;

    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    // Receive video track from backend
    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        ws.send(JSON.stringify({ type: "ice", candidate }));
      }
    };

    ws.onopen = async () => {
      console.log("WebSocket connected");

      // Optional data channel
      pc.createDataChannel("blueproxy");

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws.send(JSON.stringify(offer));
    };

    ws.onmessage = async (message) => {
      try {
        const data = JSON.parse(message.data);

        if (data.type === "answer") {
          await pc.setRemoteDescription(data);
        } else if (data.type === "ice" && data.candidate) {
          await pc.addIceCandidate(data.candidate);
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    return () => {
      ws.close();
      pc.close();
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Particles background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "#0f0f0f" } },
          fpsLimit: 60,
          interactivity: {
            events: {
              onClick: { enable: true, mode: "push" },
              onHover: { enable: true, mode: "repulse" },
              resize: true,
            },
          },
          particles: {
            color: { value: "#ffffff" },
            links: { enable: true, color: "#ffffff", distance: 150 },
            collisions: { enable: true },
            move: { enable: true, speed: 2 },
            number: { value: 50 },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 5 } },
          },
          detectRetina: true,
        }}
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      {/* Title */}
      <h1
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#00ffff",
          fontFamily: "Arial, sans-serif",
          textShadow: "0 0 10px #00ffff, 0 0 20px #00ffff",
          zIndex: 2,
        }}
      >
        Blue Proxy
      </h1>

      {/* Search bar */}
      <div
        style={{
          position: "absolute",
          top: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
        }}
      >
        <input
          type="text"
          placeholder="Enter URL..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "10px 20px",
            width: "400px",
            borderRadius: "25px",
            border: "none",
            outline: "none",
            boxShadow: "0 0 10px rgba(0,255,255,0.5)",
            fontSize: "16px",
            backgroundColor: "#111",
            color: "#fff",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              console.log("Searching for:", searchQuery);
              // Here you can implement actual proxy navigation
            }
          }}
        />
      </div>

      {/* WebRTC video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          height: "80%",
          borderRadius: "12px",
          boxShadow: "0 0 30px rgba(0,255,255,0.7)",
          backgroundColor: "#000",
          zIndex: 1,
        }}
      />
    </div>
  );
}
