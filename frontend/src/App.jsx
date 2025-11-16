import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadFull } from "@tsparticles/engine";
import "./App.css";

function App() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #0a0a0f, #111827, #0f172a)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* PARTICLES */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: "transparent" },
          fpsLimit: 120,
          particles: {
            number: { value: 80 },
            size: { value: 2 },
            move: { enable: true, speed: 1 },
            opacity: { value: 0.4 },
            links: { enable: true, color: "#3b82f6", opacity: 0.3 },
            color: { value: "#60a5fa" },
          },
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />

      {/* MAIN UI CONTENT */}
      <div
        style={{
          textAlign: "center",
          zIndex: 10,
          width: "100%",
          maxWidth: "600px",
          padding: "20px",
          color: "white",
          userSelect: "none",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "700",
            marginBottom: "20px",
            textShadow: "0 0 20px #3b82f6",
          }}
        >
          Blue Proxy
        </h1>

        {/* SEARCH BAR */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            background: "rgba(255,255,255,0.1)",
            padding: "10px",
            borderRadius: "12px",
            backdropFilter: "blur(10px)",
          }}
        >
          <input
            id="urlInput"
            type="text"
            placeholder="Enter URL…"
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              outline: "none",
              background: "rgba(255,255,255,0.15)",
              color: "white",
              fontSize: "1rem",
            }}
          />
          <button
            onClick={() => {
              const url = document.getElementById("urlInput").value;
              if (url.trim() !== "") {
                alert("Navigate to backend with: " + url);
                // TODO: send to backend
              }
            }}
            style={{
              padding: "12px 20px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
              transition: "0.2s",
            }}
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
