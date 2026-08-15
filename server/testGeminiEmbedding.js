require("dotenv").config();

const {
  generateEmbedding,
} = require("./services/embeddingService");

async function testEmbedding() {
  try {
    console.log("==============================");
    console.log("GEMINI EMBEDDING TEST");
    console.log("==============================");

    const text =
      "First Fit memory allocation is a memory management technique.";

    console.log("\nGenerating embedding...");

    const embedding =
      await generateEmbedding(text);

    console.log(
      "\nEmbedding generated successfully!"
    );

    console.log(
      "Dimensions:",
      embedding.length
    );

    console.log(
      "First 5 values:",
      embedding.slice(0, 5)
    );

  } catch (error) {
    console.error(
      "\nGEMINI EMBEDDING TEST FAILED"
    );

    console.error(error);
  }
}

testEmbedding();