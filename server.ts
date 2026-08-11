import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { getProducts } from "./src/services/catalogService";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "YOUR_API_KEY",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for AI Search
  app.post("/api/ai-search", async (req, res) => {
    try {
      const { query } = req.body;
      const products = await getProducts();
      
      const prompt = `
You are an AI shopping assistant for LUMINA. 
The user searched for: "${query}"

Here is the list of available products in our catalog (JSON):
${JSON.stringify(products.map((p) => ({ id: p.id, name: p.name, category: p.category, type: p.type, description: p.description, aiSummary: p.aiSummary })))}

Return a JSON array of product IDs that best match this query.
Do not return any other text, just the JSON array.
If no products match, return an empty array [].
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const matchedIds = JSON.parse(response.text || "[]");
      res.json({ matchedIds });
    } catch (error) {
      console.error("AI Search Error:", error);
      res.status(500).json({ error: "Failed to perform AI search" });
    }
  });

  // API route for AI Chat
  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const products = await getProducts();
      
      let chatHistoryText = history.map((h: any) => `${h.role}: ${h.text}`).join("\n");
      
      const prompt = `
You are LUMINA, a premium AI shopping assistant for an e-commerce store.
Here is the product catalog:
${JSON.stringify(products.map((p) => ({ id: p.id, name: p.name, price: p.price, category: p.category, description: p.description })))}

Conversation history:
${chatHistoryText}
user: ${message}

Provide a helpful, concise, and friendly response. If recommending products, use their names. Keep the answer under 100 words unless necessary.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      res.json({ reply: response.text });
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: "Failed to process chat" });
    }
  });

  // API route for AI Recommendations (Phase 4)
  app.post("/api/ai-recommend", async (req, res) => {
    try {
      const { wishlistIds, cartIds } = req.body;
      const products = await getProducts();
      
      const prompt = `
You are an expert AI recommendation engine for LUMINA.
The user has the following product IDs in their wishlist: ${JSON.stringify(wishlistIds)}
The user has the following product IDs in their cart: ${JSON.stringify(cartIds)}

Here is our catalog:
${JSON.stringify(products.map((p) => ({ id: p.id, name: p.name, category: p.category, type: p.type })))}

Based on their wishlist and cart, suggest 4 related product IDs from the catalog that they might also like. Do not suggest products already in their wishlist or cart if possible.
Return a JSON array of 4 string product IDs. Only the array.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const recommendedIds = JSON.parse(response.text || "[]");
      res.json({ recommendedIds });
    } catch (error) {
      console.error("AI Recommend Error:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  // API route for AI Comparison (Phase 5)
  app.post("/api/ai-compare", async (req, res) => {
    try {
      const { productIds } = req.body;
      const products = await getProducts();
      const productsToCompare = products.filter(p => productIds.includes(p.id));
      
      const prompt = `
You are a technical product comparison expert.
Please compare the following products:
${JSON.stringify(productsToCompare)}

Provide a detailed but concise comparison highlighting:
1. Best Overall Choice
2. Pros and Cons of each
3. A final verdict

Return the result as a JSON object with this schema:
{
  "bestOverallId": "string (the ID of the best product)",
  "verdict": "string (2-3 sentences summarizing the choice)",
  "comparisons": [
    {
      "productId": "string",
      "pros": ["string", "string"],
      "cons": ["string", "string"]
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const comparison = JSON.parse(response.text || "{}");
      res.json(comparison);
    } catch (error) {
      console.error("AI Compare Error:", error);
      res.status(500).json({ error: "Failed to compare products" });
    }
  });


  // API route for AI Review Summary (Phase 8)
  app.post("/api/ai-review-summary", async (req, res) => {
    try {
      const { productId, reviews } = req.body;
      const products = await getProducts();
      const product = products.find(p => p.id === productId);
      
      const prompt = `
You are LUMINA, an expert AI shopping assistant. 
Summarize these reviews for the product "${product?.name || 'Unknown'}".
Extract the key positive themes and key negative themes.
Also give a 1-sentence overall AI verdict.

Reviews:
${JSON.stringify(reviews)}

Return as JSON:
{
  "summary": "string",
  "positives": ["string"],
  "negatives": ["string"],
  "verdict": "string"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const summary = JSON.parse(response.text || "{}");
      res.json(summary);
    } catch (error) {
      console.error("AI Review Summary Error:", error);
      res.status(500).json({ error: "Failed to summarize reviews" });
    }
  });

  // API route for Price Intelligence (Phase 7)
  app.post("/api/ai-price-insight", async (req, res) => {
    try {
      const { productId } = req.body;
      const products = await getProducts();
      const product = products.find(p => p.id === productId);
      
      const prompt = `
You are LUMINA's Price Intelligence AI. 
Analyze the pricing for "${product?.name || 'Unknown'}", current price: ${product?.price || 0}.

Generate a realistic mock price intelligence report.
Return JSON:
{
  "advice": "Buy Now | Wait | Price Dropping",
  "confidence": number (0-100),
  "analysis": "string explaining the trend",
  "historicalTrend": "up | down | stable"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const insight = JSON.parse(response.text || "{}");
      res.json(insight);
    } catch (error) {
      console.error("AI Price Insight Error:", error);
      res.status(500).json({ error: "Failed to get price insight" });
    }
  });


  // API route for AI Compatibility (Phase 6)
  app.post("/api/ai-compatibility-profile", async (req, res) => {
    try {
      const { productId, userProfile } = req.body;
      const products = await getProducts();
      const product = products.find(p => p.id === productId);
      
      const prompt = `
You are LUMINA. Analyze if this product is a good match for this user profile.
Product: ${JSON.stringify({ name: product?.name, category: product?.category, description: product?.description })}
User Profile: ${JSON.stringify({ name: userProfile.name, preferences: userProfile.preferences, address: userProfile.address })}

Return JSON:
{
  "score": number (0-100),
  "reason": "string (1-2 sentences explaining why)"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const insight = JSON.parse(response.text || "{}");
      res.json(insight);
    } catch (error) {
      console.error("AI Compat Error:", error);
      res.status(500).json({ error: "Failed to get compatibility insight" });
    }
  });

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
