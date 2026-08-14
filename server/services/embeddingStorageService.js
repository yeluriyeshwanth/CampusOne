const DocumentChunk = require("../models/DocumentChunk");
const { generateEmbedding } = require("./embeddingService");

async function generateAndStoreEmbeddings(documentId) {
  try {
    if (!documentId) {
      throw new Error("Document ID is required");
    }

    const chunks = await DocumentChunk.find({
      documentId: documentId,
    }).sort({
      chunkIndex: 1,
    });

    if (chunks.length === 0) {
      throw new Error(
        "No chunks found for this document"
      );
    }

    console.log(
      `Found ${chunks.length} chunks`
    );

    let processed = 0;

    for (const chunk of chunks) {
      console.log(
        `\nGenerating embedding for chunk ${chunk.chunkIndex + 1}/${chunks.length}...`
      );

      const embedding = await generateEmbedding(
        chunk.text
      );

      chunk.embedding = embedding;

      await chunk.save();

      processed++;

      console.log(
        `Chunk ${chunk.chunkIndex} embedding saved`
      );

      console.log(
        `Embedding dimensions: ${embedding.length}`
      );
    }

    console.log(
      `\nSuccessfully generated embeddings for ${processed} chunks`
    );

    return processed;

  } catch (error) {
    console.error(
      "Embedding storage error:",
      error
    );

    throw error;
  }
}

module.exports = {
  generateAndStoreEmbeddings,
};