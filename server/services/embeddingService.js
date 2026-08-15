const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const EMBEDDING_MODEL = "gemini-embedding-2";

async function generateEmbedding(text) {
  try {
    if (!text || !text.trim()) {
      throw new Error(
        "Text is required to generate embedding"
      );
    }

    console.log(
      "Generating Gemini embedding..."
    );

    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,

      contents: text,

      config: {
        outputDimensionality: 768,
      },
    });

    if (
      !response ||
      !response.embeddings ||
      !response.embeddings[0] ||
      !response.embeddings[0].values
    ) {
      throw new Error(
        "Gemini did not return a valid embedding"
      );
    }

    const embedding =
      response.embeddings[0].values;

    console.log(
      `Gemini embedding generated: ${embedding.length} dimensions`
    );

    return embedding;

  } catch (error) {
    console.error(
      "Gemini embedding generation error:",
      error
    );

    throw error;
  }
}

module.exports = {
  generateEmbedding,
};