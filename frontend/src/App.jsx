// frontend/src/App.jsx
import React, { useRef, useEffect } from "react";
import Particles from "@tsparticles/react";
import { tsParticles } from "tsparticles";

export default function App() {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const pcRef = useRef(null);

  // Initialize particles background
  const particlesInit = async () => {
    await tsParticles.load("tsparticles", {
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
    });
  };

  useEffect(() => {
    // Connect to backend WebSocket
    const ws = new WebSocket("ws://localhost:3001");
    wsRef.current = ws;

    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) ws.send(JSON.stringify({ type: "ice", candidate }));
    };

    ws.onopen = async () => {
      console.log("WebSocket connected");
      pc.createDataChannel("blueproxy"); // optional data channel

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws.send(JSON.stringify(offer));
    };

    ws.onmessage = async (message) => {
      const data = JSON.parse(message.data);
      if (data.type === "answer") {
        await pc.setRemoteDescription(data);
      } else if (data.type === "ice") {
        try {
          await pc.addIceCandidate(data.candidate);
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    };

    return () => {
      ws.close();
      pc.close();
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Particles background */}
      <Particles id="tsparticles" init={particlesInit} style={{ position: "absolute", top: 0, left: 0 }} />

      {/* WebRTC video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
