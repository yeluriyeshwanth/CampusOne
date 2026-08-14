const OLLAMA_URL = "http://localhost:11434";

const EMBEDDING_MODEL = "nomic-embed-text";

async function generateEmbedding(text) {
  try {
    if (!text || !text.trim()) {
      throw new Error("Text is required to generate embedding");
    }

    const response = await fetch(
      `${OLLAMA_URL}/api/embeddings`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          prompt: text,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Ollama embedding request failed: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();

    if (!data.embedding) {
      throw new Error(
        "Ollama did not return an embedding"
      );
    }

    return data.embedding;

  } catch (error) {
    console.error(
      "Embedding generation error:",
      error
    );

    throw error;
  }
}

module.exports = {
  generateEmbedding,
};