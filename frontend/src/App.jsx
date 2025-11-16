import React, { useRef, useEffect } from "react";
import Particles from "@tsparticles/react";
import { loadFull } from "@tsparticles/engine";

export default function App() {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const pcRef = useRef(null);

  // tsParticles init
  const particlesInit = async (engine) => {
    await loadFull(engine);
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");
    wsRef.current = ws;

    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    pc.ontrack = (event) => {
      if (videoRef.current) videoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) ws.send(JSON.stringify({ type: "ice", candidate }));
    };

    ws.onopen = async () => {
      console.log("WebSocket connected");
      pc.createDataChannel("blueproxy");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws.send(JSON.stringify(offer));
    };

    ws.onmessage = async (message) => {
      try {
        const data = JSON.parse(message.data);
        if (data.type === "answer") await pc.setRemoteDescription(data);
        else if (data.type === "ice") await pc.addIceCandidate(data.candidate);
      } catch (err) {
        console.error("Invalid JSON from WebSocket:", message.data);
      }
    };

    return () => {
      ws.close();
      pc.close();
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Particles Background */}
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
      <h1 style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", color: "#00f", fontSize: "2rem" }}>
        Blue Proxy
      </h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search..."
        style={{
          position: "absolute",
          top: "70px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          outline: "none",
        }}
      />

      {/* Video */}
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
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          backgroundColor: "#000",
        }}
      />
    </div>
  );
}
