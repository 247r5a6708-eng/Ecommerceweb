const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const additionalRoutes = `
  // API route for AI Compatibility (Phase 6)
  app.post("/api/ai-compatibility-profile", async (req, res) => {
    try {
      const { productId, userProfile } = req.body;
      const products = await getProducts();
      const product = products.find(p => p.id === productId);
      
      const prompt = \`
You are LUMINA. Analyze if this product is a good match for this user profile.
Product: \${JSON.stringify({ name: product?.name, category: product?.category, description: product?.description })}
User Profile: \${JSON.stringify({ name: userProfile.name, preferences: userProfile.preferences, address: userProfile.address })}

Return JSON:
{
  "score": number (0-100),
  "reason": "string (1-2 sentences explaining why)"
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
      console.error("AI Compat Error:", error);
      res.status(500).json({ error: "Failed to get compatibility insight" });
    }
  });
`;

content = content.replace('  if (process.env.NODE_ENV !== "production") {', additionalRoutes + '\n  if (process.env.NODE_ENV !== "production") {');

fs.writeFileSync('server.ts', content);
