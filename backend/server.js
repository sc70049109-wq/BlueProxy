// backend/server.js
import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = 8080;

app.get("/r", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing `url` parameter");

  let browser;
  try {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // Get full HTML after JS execution:
    const html = await page.content();
    res.set("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    console.error("Puppeteer error:", err);
    res.status(500).send("Error proxying page");
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`BlueProxy Puppeteer server at http://localhost:${PORT}`);
});

