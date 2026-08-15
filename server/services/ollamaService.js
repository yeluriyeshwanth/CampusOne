const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateAnswer(question) {
  try {
    if (!question || !question.trim()) {
      throw new Error("Question is required");
    }

    console.log("Generating answer with Gemini...");
    console.log("Question:", question);

    const prompt = `
You are CampusOne AI, a helpful and intelligent academic assistant.

Answer the student's question accurately and clearly.

You can answer:
- General knowledge questions
- Academic questions
- Programming questions
- Data Structures and Algorithms questions
- Operating Systems questions
- DBMS questions
- Computer Science questions
- Career and placement questions
- College-related questions
- Any other normal question the student asks

Rules:
1. Give a direct and useful answer.
2. Explain concepts clearly and simply.
3. Use examples when useful.
4. For programming questions, provide correct code when requested.
5. Do not claim that information must come from uploaded documents.
6. If the question is ambiguous, explain the likely interpretation.
7. Do not mention RAG, embeddings, vector search, or document context.

Student Question:
${question}
`;

    const response = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: prompt,
    });

    if (!response || !response.output_text) {
      throw new Error("Gemini did not return a valid answer");
    }

    console.log("Gemini answer generated successfully.");

    return response.output_text;

  } catch (error) {
    console.error("Gemini answer generation error:", error);
    throw error;
  }
}

module.exports = {
  generateAnswer,
};