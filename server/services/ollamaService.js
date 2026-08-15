const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateAnswer(question) {
  try {
    if (!question || !question.trim()) {
      throw new Error("Question is required");
    }

    console.log("\n==============================");
    console.log("GEMINI CHAT REQUEST");
    console.log("==============================");
    console.log("Question:", question);

    const response = await ai.interactions.create({
      model: "gemini-3.5-flash",

      input: `
You are CampusOne AI, a helpful and intelligent academic assistant.

Answer the student's question clearly, accurately, and naturally.

You can answer general questions about:
- Computer Science
- Programming
- Java
- C
- C++
- Python
- DSA
- DBMS
- Operating Systems
- Computer Networks
- Data Structures
- Algorithms
- Web Development
- AI and Machine Learning
- College academics
- General knowledge
- Career and placement preparation

IMPORTANT RULES:

1. Answer the question directly.
2. Explain concepts in simple language.
3. Use examples when they help.
4. For programming questions, provide correct and understandable code when requested.
5. For comparison questions, use tables or bullet points when useful.
6. Do not claim that information came from uploaded documents.
7. If you don't know something, say so instead of inventing information.
8. For current or time-sensitive information, clearly indicate that the information may change.
9. Do not unnecessarily make every answer extremely long.
10. Respond like a helpful college-level AI assistant.

STUDENT QUESTION:

${question}
      `,
    });

    if (!response || !response.output_text) {
      throw new Error("Gemini did not return a valid answer");
    }

    console.log("\nGemini answer generated successfully.");

    return response.output_text;

  } catch (error) {
    console.error("\nGemini chat error:");
    console.error(error);

    throw error;
  }
}

module.exports = {
  generateAnswer,
};