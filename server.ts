import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload size limit since we'll be transferring self base64 images
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API route for AI image analysis
  app.post("/api/analyze-images", async (req, res) => {
    try {
      const { selfieBase64, images } = req.body;
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const imageParts = [];
      const validIndices = [];
      
      // limit max images to 50
      const maxImagesToAnalyze = Math.min(images.length, 50);
      
      for (let i = 0; i < maxImagesToAnalyze; i++) {
        try {
          if (images[i].type?.startsWith('video/')) continue;
          
          const imgUrl = images[i].url;
          if (!imgUrl) continue;
          
          const response = await fetch(imgUrl);
          if (!response.ok) {
            console.warn(`Failed to fetch image ${imgUrl}`);
            continue;
          }
          const buffer = await response.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const contentType = response.headers.get("content-type") || "image/jpeg";
          
          imageParts.push({
            inlineData: {
              data: base64,
              mimeType: contentType
            }
          });
          validIndices.push(images[i].index);
        } catch (e) {
          console.warn("Could not fetch image for AI analysis", e);
        }
      }

      if (imageParts.length === 0) {
        return res.status(400).json({ error: "Could not fetch any gallery images." });
      }

      let selfieMimeType = "image/jpeg";
      let selfieData = selfieBase64;
      if (selfieBase64.includes(',')) {
        selfieMimeType = selfieBase64.split(';')[0].split(':')[1];
        selfieData = selfieBase64.split(',')[1];
      }

      const selfiePart = {
        inlineData: {
          data: selfieData,
          mimeType: selfieMimeType
        }
      };

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: "Here is a selfie of a person:" },
              selfiePart,
              { text: "Here are some gallery images, provided in order starting from index 0:" },
              ...imageParts,
              { text: "Identify which of the gallery images contain the person shown in the selfie. Return a JSON array of the 0-based indices of the matching gallery images. If the person is not found in any gallery image, return []. Only return the JSON array." }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: { type: "INTEGER" }
          }
        }
      });

      const matchedIndices = JSON.parse(aiResponse.text || "[]");
      const finalMatches = matchedIndices.map((idx: number) => validIndices[idx]).filter((idx: number) => idx !== undefined);
      
      res.json({ matches: finalMatches });
    } catch (error) {
      console.error("Error analyzing images:", error);
      res.status(500).json({ error: "AI analysis failed." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
