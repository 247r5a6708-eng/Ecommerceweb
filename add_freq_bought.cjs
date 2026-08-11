const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const endpoint = `
  app.post("/api/frequently-bought", async (req, res) => {
    try {
      const { productId, cartIds = [] } = req.body;
      const model = ai.models.get("gemini-2.5-flash");
      const prompt = \`
      You are an e-commerce recommendation engine.
      The user is currently viewing the product ID: "\${productId}".
      They currently have these product IDs in their cart: \${JSON.stringify(cartIds)}.
      Based on this context, suggest exactly 2 complementary product IDs from our catalog that are frequently bought together with the current product.
      Available products:
      \${JSON.stringify(catalog.map(p => ({ id: p.id, name: p.name, category: p.category, type: p.type })))}
      
      Respond with ONLY a JSON array of string IDs, nothing else. Example: ["id1", "id2"]
      \`;

      const response = await model.generateContent({
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
        }
      });
      
      let ids = [];
      try {
        ids = JSON.parse(response.text || "[]");
      } catch (e) {
        // fallback
      }
      res.json({ recommendedIds: ids });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });
`;

content = content.replace(
  'app.post("/api/ai-compatibility-profile"',
  endpoint + '\n  app.post("/api/ai-compatibility-profile"'
);
fs.writeFileSync('server.ts', content);
