const mongoose = require("mongoose");

const DocumentChunk = require("../models/DocumentChunk");
const { generateEmbedding } = require("./embeddingService");

async function searchSimilarChunks(query, userId, limit = 5) {
  // Convert authenticated user ID from string to MongoDB ObjectId
  const objectUserId = new mongoose.Types.ObjectId(userId);

  // Generate embedding for user's question
  const queryEmbedding = await generateEmbedding(query);

  // Search MongoDB Vector Search
  const results = await DocumentChunk.aggregate([
    {
      $vectorSearch: {
        index: "campusone_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: limit,

        filter: {
          userId: objectUserId
        }
      }
    },
    {
      $project: {
        _id: 1,
        documentId: 1,
        userId: 1,
        chunkIndex: 1,
        text: 1,

        score: {
          $meta: "vectorSearchScore"
        }
      }
    }
  ]);

  return results;
}

module.exports = {
  searchSimilarChunks
};