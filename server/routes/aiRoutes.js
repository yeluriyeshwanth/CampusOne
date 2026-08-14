const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  searchSimilarChunks,
} = require("../services/vectorSearchService");

const {
  generateAnswer,
} = require("../services/ollamaService");

const router = express.Router();

// ======================================================
// ASK CAMPUSONE AI
// ======================================================

router.post("/ask", protect, async (req, res) => {
  try {
    // ==================================================
    // GET USER QUESTION
    // ==================================================

    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    // ==================================================
    // GET LOGGED-IN USER
    // ==================================================

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    console.log("\n=================================");
    console.log("CAMPUSONE AI REQUEST");
    console.log("=================================");

    console.log("User ID:", userId);
    console.log("Question:", question);

    // ==================================================
    // STEP 1
    // SEARCH RELEVANT DOCUMENT CHUNKS
    // ==================================================

    console.log("\nSearching relevant document chunks...");

    const results = await searchSimilarChunks(
      question,
      userId,
      5
    );

    console.log(
      "Chunks retrieved:",
      results.length
    );

    // ==================================================
    // NO RELEVANT DOCUMENTS
    // ==================================================

    if (results.length === 0) {
      return res.status(404).json({
        message:
          "I couldn't find relevant information in your uploaded documents.",
      });
    }

    // ==================================================
    // STEP 2
    // BUILD CONTEXT
    // ==================================================

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

    // ==================================================
    // STEP 3
    // GENERATE ANSWER WITH QWEN
    // ==================================================

    console.log("\nGenerating answer with Qwen...");

    const answer = await generateAnswer(
      question,
      context
    );

    // ==================================================
    // STEP 4
    // SEND RESPONSE
    // ==================================================

    console.log("\nAI answer generated successfully.");

    return res.status(200).json({
      message: "AI answer generated successfully",

      question: question,

      answer: answer,

      sources: results.map((result) => ({
        documentId: result.documentId,
        chunkIndex: result.chunkIndex,
        score: result.score,
      })),
    });

  } catch (error) {

    console.error(
      "\nCampusOne AI error:",
      error
    );

    return res.status(500).json({
      message: "Failed to generate AI answer",
      error: error.message,
    });
  }
});

module.exports = router;