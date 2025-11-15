// frontend/src/App.jsx
import React, { useRef, useEffect, useState } from "react";
import Particles from "@tsparticles/react";
import { loadFull } from "tsparticles";

export default function App() {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize tsparticles
  const particlesInit = async (engine) => {
    await loadFull(engine);
  };

  useEffect(() => {
    // Connect to backend WebSocket
    const ws = new WebSocket("ws://localhost:3000/ws");
    wsRef.current = ws;

    const pc = new RTCPeerConnection();
    pcRef.current = pc;

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
      pc.createDataChannel("blueproxy");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws.send(JSON.stringify(offer));
    };

    ws.onmessage = async (message) => {
      let data;
      try {
        data = JSON.parse(message.data);
      } catch {
        console.log("Received non-JSON message:", message.data);
        return;
      }

      if (data.type === "answer") {
        await pc.setRemoteDescription(data);
      } else if (data.type === "ice") {
        if (data.candidate && data.candidate.candidate !== "") {
          try {
            await pc.addIceCandidate(data.candidate);
          } catch (err) {
            console.error("Error adding ICE candidate:", err);
          }
        }
      }
    };

    return () => {
      ws.close();
      pc.close();
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", fontFamily: "Arial, sans-serif" }}>
      {/* Particles background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "#0a0a0a" } },
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
            number: { value: 60 },
            opacity: { value: 0.4 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 4 } },
          },
          detectRetina: true,
        }}
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      {/* Title */}
      <h1 style={{
        position: "absolute",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        color: "#00ffff",
        fontSize: "2.5rem",
        fontWeight: "bold",
        textShadow: "0 0 10px #00ffff",
      }}>
        Blue Proxy
      </h1>

      {/* Search bar */}
      <div style={{
        position: "absolute",
        top: "90px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "50%",
        display: "flex",
      }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter URL here..."
          style={{
            width: "100%",
            padding: "12px 20px",
            borderRadius: "30px 0 0 30px",
            border: "none",
            outline: "none",
            fontSize: "1rem",
            boxShadow: "0 0 15px rgba(0,255,255,0.3)",
            backgroundColor: "#111",
            color: "#fff",
          }}
        />
        <button style={{
          padding: "12px 20px",
          borderRadius: "0 30px 30px 0",
          border: "none",
          backgroundColor: "#00ffff",
          color: "#000",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 0 15px rgba(0,255,255,0.5)",
        }}>
          Go
        </button>
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
          borderRadius: "20px",
          boxShadow: "0 0 30px rgba(0,255,255,0.5)",
          backgroundColor: "#000",
        }}
      />
    </div>
  );
}
