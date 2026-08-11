const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const additionalRoutes = `
  // API route for AI Review Summary (Phase 8)
  app.post("/api/ai-review-summary", async (req, res) => {
    try {
      const { productId, reviews } = req.body;
      const products = await getProducts();
      const product = products.find(p => p.id === productId);
      
      const prompt = \`
You are LUMINA, an expert AI shopping assistant. 
Summarize these reviews for the product "\${product?.name || 'Unknown'}".
Extract the key positive themes and key negative themes.
Also give a 1-sentence overall AI verdict.

Reviews:
\${JSON.stringify(reviews)}

Return as JSON:
{
  "summary": "string",
  "positives": ["string"],
  "negatives": ["string"],
  "verdict": "string"
}
\`;

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
      
      const prompt = \`
You are LUMINA's Price Intelligence AI. 
Analyze the pricing for "\${product?.name || 'Unknown'}", current price: \${product?.price || 0}.

Generate a realistic mock price intelligence report.
Return JSON:
{
  "advice": "Buy Now | Wait | Price Dropping",
  "confidence": number (0-100),
  "analysis": "string explaining the trend",
  "historicalTrend": "up | down | stable"
}
\`;

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
`;

content = content.replace('  if (process.env.NODE_ENV !== "production") {', additionalRoutes + '\n  if (process.env.NODE_ENV !== "production") {');

fs.writeFileSync('server.ts', content);
