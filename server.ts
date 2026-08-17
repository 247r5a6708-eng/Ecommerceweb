import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { getProducts } from "./src/services/catalogService.ts";
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  let ai: GoogleGenAI | undefined;
  if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  const recommendCache = new Map();
  const priceCache = new Map();
  const compatCache = new Map();
  const searchCache = new Map();

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/ai-recommend", async (req, res) => {
    try {
      const { wishlistIds, cartIds } = req.body;
      const cacheKey = JSON.stringify({ w: wishlistIds, c: cartIds });
      if (recommendCache.has(cacheKey)) {
        return res.json({ recommendedIds: recommendCache.get(cacheKey) });
      }
      if (!ai) return res.json({ recommendedIds: [] });
      const products = await getProducts();
      
      const prompt = `You are an expert AI recommendation engine for LUMINA.The user has the following product IDs in their wishlist: ${JSON.stringify(wishlistIds)}The user has the following product IDs in their cart: ${JSON.stringify(cartIds)}Here is our catalog:${JSON.stringify(products.map((p) => ({ id: p.id, name: p.name, category: p.category, type: p.type })))}Based on their wishlist and cart, suggest 4 related product IDs from the catalog that they might also like. Do not suggest products already in their wishlist or cart if possible.Return a JSON array of 4 string product IDs. Only the array.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const recommendedIds = JSON.parse(response.text || "[]");
      recommendCache.set(cacheKey, recommendedIds);
      res.json({ recommendedIds });
    } catch (error) {
      console.error("AI Recommend Error:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  app.post("/api/ai-compare", async (req, res) => {
    try {
      const { productIds } = req.body;
      if (!ai) return res.json({ bestOverallId: productIds[0], verdict: "AI disabled.", comparisons: [] });
      const products = await getProducts();
      const productsToCompare = products.filter(p => productIds.includes(p.id));
            
      const prompt = `You are a technical product comparison expert.Please compare the following products:${JSON.stringify(productsToCompare)}Provide a detailed but concise comparison highlighting:1. Best Overall Choice2. Pros and Cons of each3. A final verdictReturn the result as a JSON object with this schema:{  "bestOverallId": "string (the ID of the best product)",  "verdict": "string (2-3 sentences summarizing the choice)",  "comparisons": [    {      "productId": "string",      "pros": ["string", "string"],      "cons": ["string", "string"]    }  ]}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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

  app.post("/api/ai-review-summary", async (req, res) => {
    try {
      const { productId, reviews } = req.body;
      if (!ai) return res.json({ summary: "AI disabled.", positives: [], negatives: [], verdict: "" });
      const products = await getProducts();
      const product = products.find(p => p.id === productId);
            
      const prompt = `You are LUMINA, an expert AI shopping assistant. Summarize these reviews for the product "${product?.name || 'Unknown'}".Extract the key positive themes and key negative themes.Also give a 1-sentence overall AI verdict.Reviews:${JSON.stringify(reviews)}Return as JSON:{  "summary": "string",  "positives": ["string"],  "negatives": ["string"],  "verdict": "string"}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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

  app.post("/api/ai-price-insight", async (req, res) => {
    try {
      const { productId } = req.body;
      if (priceCache.has(productId)) {
        return res.json(priceCache.get(productId));
      }
      if (!ai) return res.json({ advice: "Wait", confidence: 50, analysis: "AI disabled.", historicalTrend: "stable" });
      const products = await getProducts();
      const product = products.find(p => p.id === productId);
            
      const prompt = `You are LUMINA's Price Intelligence AI. Analyze the pricing for "${product?.name || 'Unknown'}", current price: ${product?.price || 0}.Generate a realistic mock price intelligence report.Return JSON:{  "advice": "Buy Now | Wait | Price Dropping",  "confidence": number (0-100),  "analysis": "string explaining the trend",  "historicalTrend": "up | down | stable"}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const insight = JSON.parse(response.text || "{}");
      priceCache.set(productId, insight);
      res.json(insight);
    } catch (error) {
      console.error("AI Price Insight Error:", error);
      res.status(500).json({ error: "Failed to get price insight" });
    }
  });

  app.post("/api/frequently-bought", async (req, res) => {
    try {
      const { productId, cartIds = [] } = req.body;
      if (!ai) return res.json({ recommendedIds: [] });      
      const catalog = await getProducts();
      const prompt = `
      You are an e-commerce recommendation engine.
      The user is currently viewing the product ID: "${productId}".
      They currently have these product IDs in their cart: ${JSON.stringify(cartIds)}.
      Based on this context, suggest exactly 2 complementary product IDs from our catalog that are frequently bought together with the current product.
      Available products:
      ${JSON.stringify(catalog.map(p => ({ id: p.id, name: p.name, category: p.category, type: p.type })))}
      
      Respond with ONLY a JSON array of string IDs, nothing else. Example: ["id1", "id2"]
      `;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
        }
      });
            
      let ids: string[] = [];
      try {
        ids = JSON.parse(response.text || "[]");
      } catch (e) {}
      res.json({ recommendedIds: ids });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  app.post("/api/ai-compatibility-profile", async (req, res) => {
    try {
      const { productId, userProfile } = req.body;
      const cacheKey = JSON.stringify({ p: productId, u: userProfile.name });
      if (compatCache.has(cacheKey)) {
        return res.json(compatCache.get(cacheKey));
      }
      if (!ai) return res.json({ score: 50, reason: "AI disabled." });
      const products = await getProducts();
      const product = products.find(p => p.id === productId);
            
      const prompt = `You are LUMINA. Analyze if this product is a good match for this user profile.Product: ${JSON.stringify({ name: product?.name, category: product?.category, description: product?.description })}User Profile: ${JSON.stringify({ name: userProfile.name, preferences: userProfile.preferences, address: userProfile.address })}Return JSON:{  "score": number (0-100),  "reason": "string (1-2 sentences explaining why)"}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const insight = JSON.parse(response.text || "{}");
      compatCache.set(cacheKey, insight);
      res.json(insight);
    } catch (error) {
      console.error("AI Compat Error:", error);
      res.status(500).json({ error: "Failed to get compatibility insight" });
    }
  });

  app.post("/api/ai-search", async (req, res) => {
    try {
      const { query } = req.body;
      if (searchCache.has(query)) return res.json({ matchedIds: searchCache.get(query) });
      if (!ai) return res.json({ matchedIds: [] });
      const products = await getProducts();
      const prompt = `You are a semantic search engine for LUMINA store. The user searched for: "${query}". Return a JSON array of up to 10 string IDs from our catalog that match this intent.
      Catalog: ${JSON.stringify(products.map(p => ({id: p.id, name: p.name, desc: p.description})))}
      Return ONLY a JSON array.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const matchedIds = JSON.parse(response.text || "[]");
      searchCache.set(query, matchedIds);
      res.json({ matchedIds });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!ai) return res.json({ reply: "AI is currently disabled." });
      const prompt = `You are an AI assistant for a luxury ecommerce store named LUMINA. Be helpful and concise.
      Context history: ${JSON.stringify(history)}
      User message: ${message}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      res.json({ reply: response.text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Chat failed" });
    }
  });

  app.post("/api/send-forgot-password", (req, res) => res.json({ success: true }));
  app.post("/api/send-order-email", (req, res) => res.json({ success: true }));
  app.post("/api/send-cancel-email", (req, res) => res.json({ success: true }));

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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
