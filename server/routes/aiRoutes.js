const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  generateAnswer,
} = require("../services/ollamaService");

const router = express.Router();

// ======================================================
// CAMPUSONE AI CHAT
// ======================================================

router.post("/ask", protect, async (req, res) => {
  try {
    const { question } = req.body;

    // Validate question
    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

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
    // GENERATE ANSWER WITH GEMINI
    // ==================================================

    console.log("\nGenerating answer with Gemini...");

    const answer = await generateAnswer(question);

    // ==================================================
    // SEND RESPONSE
    // ==================================================

    console.log("\nAI answer generated successfully.");

    return res.status(200).json({
      message: "AI answer generated successfully",
      question: question,
      answer: answer,
    });

  } catch (error) {

    console.error("\nCampusOne AI error:");
    console.error(error);

    return res.status(500).json({
      message: "Failed to generate AI answer",
      error: error.message,
    });
  }
});

module.exports = router;