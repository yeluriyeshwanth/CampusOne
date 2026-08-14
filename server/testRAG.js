require("dotenv").config();

const mongoose = require("mongoose");

const {
  searchSimilarChunks,
} = require("./services/vectorSearchService");

const {
  generateAnswer,
} = require("./services/ollamaService");

async function testRAG() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("MongoDB connected");

    // This is the user ID whose document we
    // have already embedded and indexed.
    const userId =
      new mongoose.Types.ObjectId(
        "6a6ee55c5fc51c1bdfed621c"
      );

    const question =
      "What is First Fit memory allocation?";

    console.log("\n=================================");
    console.log("CAMPUSONE RAG TEST");
    console.log("=================================");

    console.log("\nQuestion:");
    console.log(question);

    // ==========================================
    // STEP 1
    // RETRIEVE RELEVANT CHUNKS
    // ==========================================

    console.log(
      "\nGenerating query embedding..."
    );

    console.log(
      "Searching MongoDB Vector Search..."
    );

    const results =
      await searchSimilarChunks(
        question,
        userId,
        5
      );

    console.log(
      "Chunks retrieved:",
      results.length
    );

    if (results.length === 0) {
      throw new Error(
        "No relevant chunks found"
      );
    }

    // ==========================================
    // STEP 2
    // BUILD CONTEXT
    // ==========================================

    const context = results
      .map((result, index) => {
        return `
--- DOCUMENT CHUNK ${index + 1} ---

Chunk Index:
${result.chunkIndex}

Similarity Score:
${result.score}

Content:
${result.text}

--- END CHUNK ---
`;
      })
      .join("\n");

    console.log(
      "\n================================="
    );

    console.log(
      "RETRIEVED CONTEXT"
    );

    console.log(
      "================================="
    );

    console.log(context);

    // ==========================================
    // STEP 3
    // SEND CONTEXT TO QWEN
    // ==========================================

    console.log(
      "\n================================="
    );

    console.log(
      "GENERATING ANSWER WITH QWEN"
    );

    console.log(
      "================================="
    );

    const answer =
      await generateAnswer(
        question,
        context
      );

    // ==========================================
    // STEP 4
    // DISPLAY ANSWER
    // ==========================================

    console.log(
      "\n================================="
    );

    console.log(
      "CAMPUSONE AI ANSWER"
    );

    console.log(
      "================================="
    );

    console.log(answer);

    console.log(
      "\n================================="
    );

    console.log(
      "RAG TEST SUCCESSFUL"
    );

    console.log(
      "================================="
    );

  } catch (error) {

    console.error(
      "\nRAG TEST FAILED"
    );

    console.error(error);

  } finally {

    if (
      mongoose.connection.readyState !== 0
    ) {
      await mongoose.connection.close();

      console.log(
        "\nMongoDB connection closed"
      );
    }
  }
}

testRAG();