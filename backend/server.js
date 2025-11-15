import http from "http";
import express from "express";
import httpProxy from "http-proxy";

const app = express();
const proxy = httpProxy.createProxyServer({});
const PORT = process.env.PORT || 8080;

app.get("/proxy", (req, res) => {
  const target = req.query.url;
  if (!target) {
    return res.status(400).send("Error: url query parameter is required, e.g. /proxy?url=https://example.com");
  }

  // Proxy the request to the target
  proxy.web(req, res, { target, changeOrigin: true }, (e) => {
    console.error("Proxy error:", e);
    res.status(500).send("Proxy error");
  });
});

// For everything else, return 404 or something
app.all("*", (req, res) => {
  res.status(404).send("Not found");
});

// Start server
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`BlueProxy server running on http://localhost:${PORT}`);
});

proxy.on("error", (err, req, res) => {
  console.error("Proxy server error:", err);
  try {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Something went wrong in proxy.");
  } catch (e) {
    console.error("Error sending proxy failure:", e);
  }
});


