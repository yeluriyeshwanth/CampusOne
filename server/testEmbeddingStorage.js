const dotenv = require("dotenv");

dotenv.config();

const mongoose = require("mongoose");

const Document = require("./models/Document");
const DocumentChunk = require("./models/DocumentChunk");

const {
  generateAndStoreEmbeddings,
} = require("./services/embeddingStorageService");

async function testEmbeddingStorage() {
  try {
    // ============================================
    // CONNECT TO MONGODB
    // ============================================

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // ============================================
    // FIND A DOCUMENT THAT HAS CHUNKS
    // ============================================

    const chunkDocument = await DocumentChunk.findOne();

    if (!chunkDocument) {
      throw new Error(
        "No document chunks found in the database"
      );
    }

    const document = await Document.findById(
      chunkDocument.documentId
    );

    if (!document) {
      throw new Error(
        "Document associated with chunks was not found"
      );
    }

    console.log("\nDocument found:");
    console.log("Name:", document.originalName);
    console.log("ID:", document._id);
    console.log("User ID:", document.userId);

    // ============================================
    // CHECK CHUNK COUNT
    // ============================================

    const chunkCount = await DocumentChunk.countDocuments({
      documentId: document._id,
    });

    console.log(
      "Chunks found:",
      chunkCount
    );

    if (chunkCount === 0) {
      throw new Error(
        "Selected document has no chunks"
      );
    }

    // ============================================
    // GENERATE EMBEDDINGS
    // ============================================

    console.log(
      "\nStarting embedding generation..."
    );

    const count =
      await generateAndStoreEmbeddings(
        document._id
      );

    // ============================================
    // SUCCESS
    // ============================================

    console.log("\n=================================");
    console.log("EMBEDDING STORAGE SUCCESSFUL");
    console.log("=================================");

    console.log(
      "Embeddings generated:",
      count
    );

    // ============================================
    // CLOSE CONNECTION
    // ============================================

    await mongoose.connection.close();

    console.log(
      "\nMongoDB connection closed"
    );

  } catch (error) {

    console.error(
      "\nEMBEDDING STORAGE TEST FAILED"
    );

    console.error(error);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

testEmbeddingStorage();