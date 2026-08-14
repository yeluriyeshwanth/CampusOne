const DocumentChunk = require("../models/DocumentChunk");

async function saveDocumentChunks(
  documentId,
  userId,
  chunks
) {
  try {
    if (!documentId) {
      throw new Error("Document ID is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!Array.isArray(chunks) || chunks.length === 0) {
      throw new Error("Chunks are required");
    }

    const chunkDocuments = chunks.map((chunk, index) => ({
      documentId: documentId,
      userId: userId,

      chunkIndex:
        typeof chunk === "object"
          ? chunk.chunkIndex ?? index
          : index,

      text:
        typeof chunk === "object"
          ? chunk.text
          : chunk,
    }));

    const savedChunks =
      await DocumentChunk.insertMany(chunkDocuments);

    console.log(
      `Saved ${savedChunks.length} chunks for document ${documentId}`
    );

    return savedChunks;

  } catch (error) {
    console.error("Chunk storage error:", error);
    throw error;
  }
}

module.exports = {
  saveDocumentChunks,
};