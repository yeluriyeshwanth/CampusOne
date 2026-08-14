require("dotenv").config();

const mongoose = require("mongoose");

const DocumentChunk = require("./models/DocumentChunk");
const { searchSimilarChunks } = require("./services/vectorSearchService");

async function testVectorSearch() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // Use the user ID from the document we already tested
    const userId = new mongoose.Types.ObjectId(
      "6a6ee55c5fc51c1bdfed621c"
    );

    const question = "What is First Fit memory allocation?";

    console.log("\n=================================");
    console.log("VECTOR SEARCH TEST");
    console.log("=================================");

    console.log("\nQuestion:");
    console.log(question);

    console.log("\nSearching...");

    const results = await searchSimilarChunks(
      question,
      userId,
      5
    );

    console.log("\nResults found:", results.length);

    results.forEach((result, index) => {
      console.log("\n---------------------------------");
      console.log("Result:", index + 1);
      console.log("Chunk index:", result.chunkIndex);
      console.log("Score:", result.score);
      console.log("---------------------------------");
      console.log(result.text);
    });

    console.log("\n=================================");
    console.log("VECTOR SEARCH TEST SUCCESSFUL");
    console.log("=================================");

  } catch (error) {
    console.error("\nVECTOR SEARCH TEST FAILED");
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log("\nMongoDB connection closed");
  }
}

testVectorSearch();