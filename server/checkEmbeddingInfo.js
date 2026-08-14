const dotenv = require("dotenv");

dotenv.config();

const mongoose = require("mongoose");
const DocumentChunk = require("./models/DocumentChunk");

async function checkEmbeddingInfo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const chunk = await DocumentChunk.findOne({
      embedding: {
        $exists: true,
        $ne: [],
      },
    });

    if (!chunk) {
      throw new Error(
        "No chunk with an embedding was found"
      );
    }

    console.log("\n=================================");
    console.log("EMBEDDING INFORMATION");
    console.log("=================================");

    console.log(
      "Document ID:",
      chunk.documentId
    );

    console.log(
      "User ID:",
      chunk.userId
    );

    console.log(
      "Chunk index:",
      chunk.chunkIndex
    );

    console.log(
      "Embedding dimensions:",
      chunk.embedding.length
    );

    console.log(
      "Embedding stored:",
      Array.isArray(chunk.embedding)
    );

    console.log(
      "First 5 values:",
      chunk.embedding.slice(0, 5)
    );

    console.log("\n=================================");

    await mongoose.connection.close();

    console.log("MongoDB connection closed");

  } catch (error) {

    console.error(
      "\nEMBEDDING INFORMATION CHECK FAILED"
    );

    console.error(error);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

checkEmbeddingInfo();