const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const Document = require("./models/Document");
const DocumentChunk = require("./models/DocumentChunk");

const { extractTextFromPDF } = require("./services/pdfService");
const { createChunks } = require("./services/chunkService");
const { saveDocumentChunks } = require("./services/chunkStorageService");

dotenv.config();

async function testChunkStorage() {
  try {
    // ============================================
    // CONNECT TO MONGODB
    // ============================================

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // ============================================
    // GET LATEST DOCUMENT
    // ============================================

    const document = await Document.findOne().sort({
      createdAt: -1,
    });

    if (!document) {
      throw new Error("No document found in MongoDB");
    }

    console.log("\nDocument found:");
    console.log("Name:", document.originalName);
    console.log("Filename:", document.filename);
    console.log("ID:", document._id);
    console.log("User ID:", document.userId);

    // ============================================
    // BUILD PDF PATH
    // ============================================

    const filePath = path.join(
      __dirname,
      "uploads",
      document.filename
    );

    console.log("\nPDF path:");
    console.log(filePath);

    // ============================================
    // EXTRACT PDF TEXT
    // ============================================

    console.log("\nExtracting PDF text...");

    const extracted = await extractTextFromPDF(filePath);

    console.log("PDF extraction successful");
    console.log("Pages:", extracted.pages);
    console.log("Characters:", extracted.text.length);

    // ============================================
    // CREATE CHUNKS
    // ============================================

    const chunks = createChunks(
      extracted.text,
      200,
      40
    );

    console.log("\nChunking completed");
    console.log("Total chunks:", chunks.length);

    // ============================================
    // REMOVE OLD CHUNKS
    // ============================================

    await DocumentChunk.deleteMany({
      documentId: document._id,
    });

    console.log("Old chunks removed");

    // ============================================
    // SAVE CHUNKS
    // ============================================

    console.log("\nSaving chunks...");

    const savedChunks = await saveDocumentChunks(
      document._id,
      document.userId,
      chunks
    );

    // ============================================
    // SUCCESS
    // ============================================

    console.log("\n=================================");
    console.log("CHUNK STORAGE TEST SUCCESSFUL");
    console.log("=================================");

    console.log("Total chunks saved:", savedChunks.length);

    savedChunks.forEach((chunk) => {
      console.log("\n------------------------------");
      console.log("Chunk:", chunk.chunkIndex);
      console.log("------------------------------");
      console.log(chunk.text);
    });

    // ============================================
    // CLOSE DATABASE
    // ============================================

    await mongoose.connection.close();

    console.log("\nMongoDB connection closed");

  } catch (error) {
    console.error("\nCHUNK STORAGE TEST FAILED");
    console.error(error);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

testChunkStorage();