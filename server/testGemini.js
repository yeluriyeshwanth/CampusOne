require("dotenv").config();

async function testGemini() {
  try {
    console.log("Loading Gemini SDK...");

    const { GoogleGenAI } = await import("@google/genai");

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        apiVersion: "v1",
      },
    });

    console.log("Sending request to Gemini...");

    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: "Explain First Fit memory allocation in simple terms.",
    });

    console.log("\n=================================");
    console.log("GEMINI TEST SUCCESSFUL");
    console.log("=================================\n");

    console.log(interaction.output_text);

  } catch (error) {
    console.error("\n=================================");
    console.error("GEMINI TEST FAILED");
    console.error("=================================\n");

    console.error(error);
  }
}

testGemini();