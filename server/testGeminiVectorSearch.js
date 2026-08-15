require("dotenv").config();

const mongoose = require("mongoose");
const {
  searchSimilarChunks,
} = require("./services/vectorSearchService");

async function testVectorSearch() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("=================================");
    console.log("GEMINI VECTOR SEARCH TEST");
    console.log("=================================");

    const userId = "6a6ee55c5fc51c1bdfed621c";
    const question =
      "What is First Fit memory allocation?";

    console.log("\nQuestion:");
    console.log(question);

    console.log("\nSearching MongoDB...");

    const results = await searchSimilarChunks(
      question,
      userId,
      5
    );

    console.log("\n=================================");
    console.log("SEARCH RESULTS");
    console.log("=================================\n");

    results.forEach((result, index) => {
      console.log(`--- Result ${index + 1} ---`);

      console.log(
        "Document ID:",
        result.documentId
      );

      console.log(
        "Chunk:",
        result.chunkIndex
      );

      console.log(
        "Score:",
        result.score
      );

      console.log(
        "Text:",
        result.text
      );

      console.log();
    });

    await mongoose.disconnect();

  } catch (error) {
    console.error(
      "\nVECTOR SEARCH TEST FAILED"
    );

    console.error(error);

    await mongoose.disconnect();
  }
}

testVectorSearch();