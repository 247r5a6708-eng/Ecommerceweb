const { GoogleGenAI } = require("@google/genai");

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: "hello",
    });
    console.log("Success with gemini-flash-latest");
  } catch (err) {
    console.error("Error with gemini-flash-latest:", err.message);
  }
}
run();
