import React, { useState, useEffect, useRef } from "react";

const PROXY_BASE = "http://localhost:8080/r?url=";

export default function App() {
  const [inputUrl, setInputUrl] = useState("");
  const [proxiedUrl, setProxiedUrl] = useState("");
  const iframeRef = useRef();

  const go = (raw) => {
    let url = raw;
    if (!/^https?:\\/\\//i.test(url)) {
      url = `https://duckduckgo.com/?q=${encodeURIComponent(raw)}`;
    }
    setProxiedUrl(PROXY_BASE + encodeURIComponent(url));
  };

  return (
    <div className="h-screen w-screen relative bg-blue-200 flex flex-col">
      <div className="p-4 bg-blue-700 text-white flex items-center">
        <button onClick={() => iframeRef.current && iframeRef.current.contentWindow.history.back()} className="px-2">◀</button>
        <button onClick={() => iframeRef.current && iframeRef.current.contentWindow.history.forward()} className="px-2">▶</button>
        <button onClick={() => iframeRef.current && (iframeRef.current.src = proxiedUrl)} className="px-2">⟳</button>
        <form onSubmit={e => { e.preventDefault(); go(inputUrl); }} className="flex flex-1 ml-4">
          <input
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            placeholder="Enter URL or search"
            className="p-2 rounded-l bg-white flex-1 text-black"
          />
          <button type="submit" className="bg-blue-500 px-4 text-white rounded-r">Go</button>
        </form>
      </div>
      <div className="flex-1 overflow-hidden">
        {proxiedUrl && (
          <iframe
            ref={iframeRef}
            src={proxiedUrl}
            className="w-full h-full border-none"
            title="BlueProxy"
          />
        )}
        {!proxiedUrl && (
          <div className="flex items-center justify-center h-full text-blue-800">
            Enter a URL above to start proxy browsing
          </div>
        )}
      </div>
    </div>
  );
}
