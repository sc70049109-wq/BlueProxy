// backend/server.js
import express from "express";
import fetch from "node-fetch";
import cheerio from "cheerio";

const app = express();
const PORT = 8080;

// Helper: encode and decode URLs
const decodeBase64Url = (b64) => Buffer.from(b64, "base64").toString("utf-8");
const encodeBase64Url = (url) => Buffer.from(url, "utf-8").toString("base64");

// Middleware: serve all proxied content
app.get("/r/:b64(*)", async (req, res) => {
  try {
    const targetUrl = decodeBase64Url(req.params.b64);
    const targetResponse = await fetch(targetUrl, {
      headers: { "User-Agent": req.get("User-Agent") || "BlueProxy" },
      redirect: "manual", // handle redirects manually
    });

    // Handle redirects
    if (targetResponse.status >= 300 && targetResponse.status < 400) {
      const location = targetResponse.headers.get("location");
      if (location) {
        const absoluteLocation = new URL(location, targetUrl).href;
        return res.redirect(`/r/${encodeBase64Url(absoluteLocation)}`);
      }
    }

    const contentType = targetResponse.headers.get("content-type") || "";

    // HTML content: rewrite links/forms/iframes
    if (contentType.includes("text/html")) {
      let html = await targetResponse.text();
      const $ = cheerio.load(html);

      // Rewrite <a href>
      $("a").each((i, el) => {
        const href = $(el).attr("href");
        if (href && !href.startsWith("javascript:")) {
          try {
            const abs = new URL(href, targetUrl).href;
            $(el).attr("href", `/r/${encodeBase64Url(abs)}`);
          } catch (e) {}
        }
      });

      // Rewrite <form action>
      $("form").each((i, el) => {
        const action = $(el).attr("action");
        if (action) {
          try {
            const abs = new URL(action, targetUrl).href;
            $(el).attr("action", `/r/${encodeBase64Url(abs)}`);
          } catch (e) {}
        }
      });

      // Rewrite <iframe src>
      $("iframe").each((i, el) => {
        const src = $(el).attr("src");
        if (src) {
          try {
            const abs = new URL(src, targetUrl).href;
            $(el).attr("src", `/r/${encodeBase64Url(abs)}`);
          } catch (e) {}
        }
      });

      res.set("Content-Type", "text/html");
      return res.send($.html());
    }

    // For other content types (CSS, JS, images, media)
    targetResponse.body.pipe(res);
    targetResponse.body.on("error", (err) => {
      console.error("Stream error:", err);
      res.sendStatus(500);
    });
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("BlueProxy encountered an error.");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`BlueProxy backend running at http://localhost:${PORT}`);
});
