import nodemailer from "nodemailer";
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

const searchCache = new Map<string, string[]>();
const recommendCache = new Map<string, string[]>();
const compareCache = new Map<string, any>();
const priceCache = new Map<string, any>();
const compatCache = new Map<string, any>();


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));


  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'sontrachithkumar@gmail.com',
      pass: process.env.EMAIL_PASS || 'dcpw xxcz ehuy kugf',
    },
  });

  const getEmailTemplate = (title, contentHTML) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 0; color: #333;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <tr>
          <td style="background-color: #3b82f6; padding: 40px 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; letter-spacing: 2px;">LUMINA</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 14px;">Next-Generation Technology</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px;">
            ${contentHTML}
          </td>
        </tr>
        <tr>
          <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 30px; text-align: center;">
            <p style="margin: 0; color: #64748b; font-size: 13px;">Lumina Technologies Inc.</p>
            <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 12px;">123 Tech Avenue, Silicon Valley, CA 94025</p>
            <p style="margin: 15px 0 0 0; color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} Lumina. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  app.post("/api/send-order-email", async (req, res) => {
    try {
      const { email, name, order, pdfBase64 } = req.body;
      
      const expectedDel = order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString();
      const customerName = name || order.address?.fullName || 'Valued Customer';
      const orderDate = new Date(order.date).toLocaleDateString();
      const deliveryAddress = order.address 
        ? `${order.address.addressLine1}${order.address.addressLine2 ? ', ' + order.address.addressLine2 : ''}, ${order.address.city}, ${order.address.state} ${order.address.zipCode}, ${order.address.country}`
        : 'Address not provided';
        
      const orderItemsHtml = order.items.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.warrantyInfo || '12 Months'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `).join('');

      const contentHTML = `
        <h2 style="color: #1e293b; margin-top: 0; font-size: 24px;">Order Confirmation</h2>
        <p style="font-size: 16px; line-height: 1.6;">Dear <strong>${customerName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6;">Thank you for shopping with LUMINA. We are thrilled to confirm that your order <strong>#${order.id}</strong> has been successfully placed on ${orderDate}.</p>
        
        <div style="margin: 30px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f8fafc; padding: 15px 20px; border-bottom: 1px solid #e2e8f0;">
            <h3 style="margin: 0; color: #3b82f6; font-size: 16px;">Delivery Details</h3>
          </div>
          <div style="padding: 20px;">
            <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Expected Delivery:</strong> ${expectedDel}</p>
            <p style="margin: 0; font-size: 15px;"><strong>Shipping Address:</strong><br>${deliveryAddress}</p>
          </div>
        </div>

        <div style="margin: 30px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f8fafc; padding: 15px 20px; border-bottom: 1px solid #e2e8f0;">
            <h3 style="margin: 0; color: #3b82f6; font-size: 16px;">Order Summary</h3>
          </div>
          <table width="100%" style="border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="padding: 10px; text-align: left; font-size: 14px; color: #64748b;">Item</th>
                <th style="padding: 10px; text-align: left; font-size: 14px; color: #64748b;">Warranty</th>
                <th style="padding: 10px; text-align: center; font-size: 14px; color: #64748b;">Qty</th>
                <th style="padding: 10px; text-align: right; font-size: 14px; color: #64748b;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 16px;">Total Amount:</td>
                <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 16px; color: #3b82f6;">$${order.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        ${order.isGiftWrapped && order.giftMessage ? `
        <div style="background-color: #fff8f1; border-left: 4px solid #f97316; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
          <h4 style="margin-top: 0; color: #c2410c; font-size: 16px;">Gift Message</h4>
          <p style="margin: 0; font-size: 15px; font-style: italic; color: #9a3412;">"${order.giftMessage}"</p>
        </div>
        ` : ''}
        <p style="font-size: 16px; line-height: 1.6;">We have attached a detailed PDF invoice to this email for your records, which includes all warranty information and product details.</p>
        
        <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">Best regards,<br><strong style="color: #3b82f6;">The LUMINA Team</strong></p>
      `;

      const mailOptions = {
        from: '"LUMINA Store" <sontrachithkumar@gmail.com>',
        to: email,
        subject: `LUMINA Order Confirmation - #${order.id}`,
        html: getEmailTemplate('Order Confirmation', contentHTML),
        attachments: [
          {
            filename: `LUMINA_Invoice_${order.id}.pdf`,
            content: pdfBase64.split("base64,")[1],
            encoding: 'base64'
          }
        ]
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error) {
      console.error('Email send error:', error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  
  app.post("/api/send-cancel-email", async (req, res) => {
    try {
      const { email, name, order, reason } = req.body;
      
      const customerName = name || order.address?.fullName || 'Valued Customer';
      const orderDate = new Date(order.date).toLocaleDateString();

      const contentHTML = `
        <h2 style="color: #1e293b; margin-top: 0; font-size: 24px;">Order Cancellation Confirmation</h2>
        <p style="font-size: 16px; line-height: 1.6;">Dear <strong>${customerName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6;">This email is to confirm that your order <strong>#${order.id}</strong> placed on ${orderDate} has been successfully cancelled.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 30px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5;"><strong>Reason for Cancellation:</strong> ${reason || 'No reason provided'}</p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">If you have already been charged, a refund will be issued to your original payment method within 3-5 business days.</p>
        
        <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">Best regards,<br><strong style="color: #3b82f6;">The LUMINA Team</strong></p>
      `;

      const mailOptions = {
        from: '"LUMINA Store" <sontrachithkumar@gmail.com>',
        to: email,
        subject: `LUMINA Order Cancelled - #${order.id}`,
        html: getEmailTemplate('Order Cancellation', contentHTML)
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error) {
      console.error('Cancel email error:', error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  app.post("/api/send-forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      const contentHTML = `
        <h2 style="color: #1e293b; margin-top: 0; font-size: 24px;">Password Reset Request</h2>
        <p style="font-size: 16px; line-height: 1.6;">Hello,</p>
        <p style="font-size: 16px; line-height: 1.6;">We received a request to reset the password for your LUMINA account associated with <strong>${email}</strong>.</p>
        <p style="font-size: 16px; line-height: 1.6;">Please note that you will receive a secondary email containing a secure link to complete the password reset process.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 30px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5;"><strong>Security Notice:</strong> If you did not request a password reset, please ignore this email or contact support immediately. Your password will remain unchanged unless you click the official reset link.</p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">Best regards,<br><strong style="color: #3b82f6;">LUMINA Security</strong></p>
      `;

      const mailOptions = {
        from: '"LUMINA Security" <sontrachithkumar@gmail.com>',
        to: email,
        subject: "LUMINA - Password Reset Request",
        html: getEmailTemplate('Password Reset Request', contentHTML)
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error) {
      console.error('Forgot password email error:', error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  app.post("/api/ai-search", async (req, res) => {
    const startTime = Date.now();
    try {
      const { query } = req.body;
      if (!query) return res.json({ matchedIds: [] });
      
      const cacheKey = query.toLowerCase().trim();
      if (searchCache.has(cacheKey)) {
         const matchedIds = searchCache.get(cacheKey) || [];
         console.log(`[AI Search] Cache hit | Query: "${query}" | Latency: ${Date.now() - startTime}ms | Matches: ${matchedIds.length}`);
         return res.json({ matchedIds });
      }

      const products = await getProducts();
      
      const prompt = `You are LUMINA, an expert AI shopping assistant.
The user is searching for: "${query}"
Here is the list of available products in our catalog (JSON):
${JSON.stringify(products.map((p) => ({ id: p.id, name: p.name, category: p.category, type: p.type, description: p.description, aiSummary: p.aiSummary })))}

Return a JSON array of product IDs that best match this query.
Do not return any other text, just the JSON array.
If no products match, return an empty array [].`;

      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      const matchedIds = JSON.parse(response.text || "[]");
      searchCache.set(cacheKey, matchedIds);
      
      console.log(`[AI Search] API call | Query: "${query}" | Latency: ${Date.now() - startTime}ms | Matches: ${matchedIds.length} | Results: ${JSON.stringify(matchedIds)}`);
      
      res.json({ matchedIds });
    } catch (error) {
      console.error(`[AI Search Error] Query: "${req.body?.query}" | Latency: ${Date.now() - startTime}ms`, error);
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
        model: "gemini-flash-lite-latest",
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
      const cacheKey = JSON.stringify({ w: wishlistIds, c: cartIds });
      if (recommendCache.has(cacheKey)) {
        return res.json({ recommendedIds: recommendCache.get(cacheKey) });
      }
      const products = await getProducts();
      
      const prompt = `You are an expert AI recommendation engine for LUMINA.
The user has the following product IDs in their wishlist: ${JSON.stringify(wishlistIds)}
The user has the following product IDs in their cart: ${JSON.stringify(cartIds)}
Here is our catalog:
${JSON.stringify(products.map((p) => ({ id: p.id, name: p.name, category: p.category, type: p.type })))}

Based on their wishlist and cart, suggest 4 related product IDs from the catalog that they might also like. Do not suggest products already in their wishlist or cart if possible.
Return a JSON array of 4 string product IDs. Only the array.`;

      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
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
        model: "gemini-flash-lite-latest",
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
        model: "gemini-flash-lite-latest",
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
      if (priceCache.has(productId)) {
        return res.json(priceCache.get(productId));
      }
      const products = await getProducts();
      const product = products.find(p => p.id === productId);
      
      const prompt = `You are LUMINA's Price Intelligence AI. Analyze the pricing for "${product?.name || 'Unknown'}", current price: ${product?.price || 0}.
Generate a realistic mock price intelligence report.
Return JSON:
{
  "advice": "Buy Now | Wait | Price Dropping",
  "confidence": number (0-100),
  "analysis": "string explaining the trend",
  "historicalTrend": "up | down | stable"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
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


  // API route for AI Compatibility (Phase 6)
  
  app.post("/api/frequently-bought", async (req, res) => {
    try {
      const { productId, cartIds = [] } = req.body;
      
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

  app.post("/api/ai-compatibility-profile", async (req, res) => {
    try {
      const { productId, userProfile } = req.body;
      const cacheKey = JSON.stringify({ p: productId, u: userProfile.name });
      if (compatCache.has(cacheKey)) {
        return res.json(compatCache.get(cacheKey));
      }
      const products = await getProducts();
      const product = products.find(p => p.id === productId);
      
      const prompt = `You are LUMINA. Analyze if this product is a good match for this user profile.
Product: ${JSON.stringify({ name: product?.name, category: product?.category, description: product?.description })}
User Profile: ${JSON.stringify({ name: userProfile.name, preferences: userProfile.preferences, address: userProfile.address })}

Return JSON:
{
  "score": number (0-100),
  "reason": "string (1-2 sentences explaining why)"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
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
