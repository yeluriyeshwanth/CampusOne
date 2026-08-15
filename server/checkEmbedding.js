require("dotenv").config();

const mongoose = require("mongoose");
const DocumentChunk = require("./models/DocumentChunk");

async function checkEmbedding() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const chunk = await DocumentChunk.findOne({
      documentId: "6a7f39278142757391e69119",
    }).select("embedding");

    if (!chunk) {
      console.log("No chunk found");
      return;
    }

    console.log(
      "Embedding exists:",
      Array.isArray(chunk.embedding)
    );

    console.log(
      "Embedding dimensions:",
      Array.isArray(chunk.embedding)
        ? chunk.embedding.length
        : 0
    );

    await mongoose.disconnect();

  } catch (error) {
    console.error("Error:", error);

    await mongoose.disconnect();
  }
}

checkEmbedding();