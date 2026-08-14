const dotenv = require("dotenv");

// Load environment variables FIRST
dotenv.config();

const mongoose = require("mongoose");

const DocumentChunk = require("./models/DocumentChunk");

const {
  generateEmbedding,
} = require("./services/embeddingService");

async function testEmbedding() {
  try {
    // ============================================
    // CHECK API KEY
    // ============================================

    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is missing from server/.env"
      );
    }

    console.log("OpenAI API key loaded");

    // ============================================
    // CONNECT TO MONGODB
    // ============================================

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // ============================================
    // GET ONE CHUNK
    // ============================================

    const chunk = await DocumentChunk.findOne().sort({
      createdAt: 1,
    });

    if (!chunk) {
      throw new Error("No document chunks found");
    }

    console.log("\nChunk found:");
    console.log("Document ID:", chunk.documentId);
    console.log("User ID:", chunk.userId);
    console.log("Chunk index:", chunk.chunkIndex);

    console.log("\nChunk text:");
    console.log(chunk.text);

    // ============================================
    // GENERATE EMBEDDING
    // ============================================

    console.log("\nGenerating embedding...");

    const embedding = await generateEmbedding(
      chunk.text
    );

    // ============================================
    // DISPLAY RESULT
    // ============================================

    console.log("\n=================================");
    console.log("EMBEDDING TEST SUCCESSFUL");
    console.log("=================================");

    console.log(
      "Embedding dimensions:",
      embedding.length
    );

    console.log("\nFirst 10 values:");

    console.log(
      embedding.slice(0, 10)
    );

    // ============================================
    // CLOSE MONGODB
    // ============================================

    await mongoose.connection.close();

    console.log("\nMongoDB connection closed");

  } catch (error) {

    console.error("\nEMBEDDING TEST FAILED");
    console.error(error);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

testEmbedding();