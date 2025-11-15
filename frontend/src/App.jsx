import React, { useRef } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function App() {
  const videoRef = useRef(null);

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
        position: "relative",
        paddingTop: "20px",
      }}
    >
      {/* Moving Particles */}
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
      <h1 style={{ textAlign: "center" }}>🌐 BlueProxy WebRTC</h1>

      {/* Video Placeholder */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
        <video
          ref={videoRef}
          style={{
            width: "80%",
            maxHeight: "400px",
            borderRadius: "20px",
            boxShadow: "0 0 20px rgba(0,0,0,0.5)",
            background: "linear-gradient(90deg, #222, #111)",
            objectFit: "cover",
          }}
          autoPlay
          playsInline
          muted
        />
      </div>

      {/* Cards / Images Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: "50px",
          gap: "20px",
        }}
      >
        <div style={{ width: "150px", height: "150px", background: "#333", borderRadius: "15px" }} />
        <div style={{ width: "150px", height: "150px", background: "#444", borderRadius: "15px" }} />
        <div style={{ width: "150px", height: "150px", background: "#555", borderRadius: "15px" }} />
      </div>
    </div>
  );
}

