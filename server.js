require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname)));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /analyze — send image + prompt to Claude vision
app.post("/analyze", async (req, res) => {
  const { imageBase64, mimeType, prompt } = req.body;

  console.log(`[analyze] mimeType=${mimeType} promptLen=${prompt?.length} imageLen=${imageBase64?.length}`);

  if (!imageBase64 || !mimeType || !prompt) {
    return res.status(400).json({ error: "imageBase64, mimeType, and prompt are required." });
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(mimeType)) {
    return res.status(400).json({ error: `Unsupported image type: ${mimeType}` });
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const result = message.content[0]?.text || "No response generated.";
    res.json({ result });
  } catch (err) {
    console.error("Anthropic API error:", err.message);
    if (err.status === 401) {
      res.status(401).json({ error: "Invalid API key. Check your .env file." });
    } else if (err.status === 429) {
      res.status(429).json({ error: "Rate limit reached. Please wait and try again." });
    } else {
      res.status(500).json({ error: err.message || "Failed to analyze image." });
    }
  }
});

// GET /fetch-image?url=... — proxy image URL and return base64
app.get("/fetch-image", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "url query param required." });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.buffer();
    const base64 = buffer.toString("base64");

    res.json({ imageBase64: base64, mimeType: contentType.split(";")[0] });
  } catch (err) {
    console.error("Fetch image error:", err.message);
    res.status(500).json({ error: "Could not fetch image from URL. Make sure it is a direct image link." });
  }
});

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Image to Prompt server running on port ${PORT}`);
});
