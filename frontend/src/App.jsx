// frontend/src/App.jsx
import React, { useState, useRef, useEffect } from "react";

const PROXY_BASE = "http://localhost:8080/r/";

function App() {
  const [inputUrl, setInputUrl] = useState("");
  const [proxiedUrl, setProxiedUrl] = useState("");
  const iframeRef = useRef();

  const encodeUrl = (url) => btoa(url);

  const goToUrl = (url) => {
    if (!url.startsWith("http")) {
      url = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
    }
    const proxied = `${PROXY_BASE}${encodeUrl(url)}`;
    setProxiedUrl(proxied);
  };

  // Particle effect
  useEffect(() => {
    const canvas = document.getElementById("particles");
    const ctx = canvas.getContext("2d");
    const particles = [];
    const particleCount = 80;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: Math.random() * 0.5 - 0.25,
        vy: Math.random() * 0.5 - 0.25,
        radius: Math.random() * 2 + 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Background gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-200 to-blue-600"></div>
      {/* Canvas for particles */}
      <canvas id="particles" className="absolute top-0 left-0 w-full h-full"></canvas>

      {proxiedUrl ? (
        <iframe
          ref={iframeRef}
          src={proxiedUrl}
          title="BlueProxy"
          className="relative w-full h-full border-none z-10"
        />
      ) : (
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-white">
          <h1 className="text-6xl font-bold mb-8 drop-shadow-lg">Blue Proxy</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goToUrl(inputUrl);
            }}
            className="flex w-96"
          >
            <input
              type="text"
              placeholder="Search DuckDuckGo or input URL"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 p-3 rounded-l-lg text-black shadow-lg focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-900 text-white font-bold px-4 rounded-r-lg shadow-lg"
            >
              Go
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;

