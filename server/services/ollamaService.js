async function generateAnswer(question, context) {
  try {
    const response = await fetch(
      "http://localhost:11434/api/chat",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: "qwen3:1.7b",

          messages: [
            {
              role: "system",

              content: `
You are CampusOne AI, an academic assistant.

Your job is to answer the student's question using
the provided document context.

IMPORTANT RULES:

1. Use the provided document context as the primary source.
2. Do not invent information that is not supported by the context.
3. If the answer cannot be found in the context, say:
   "I couldn't find the answer in the uploaded documents."
4. Explain concepts clearly and simply.
5. You may organize the answer using headings,
   bullet points, examples, or numbered steps.
              `,
            },

            {
              role: "user",

              content: `
DOCUMENT CONTEXT:

${context}

END DOCUMENT CONTEXT


STUDENT QUESTION:

${question}
              `,
            },
          ],

          stream: false,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Ollama request failed: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();

    if (
      !data.message ||
      !data.message.content
    ) {
      throw new Error(
        "Invalid response received from Ollama"
      );
    }

    return data.message.content;

  } catch (error) {
    console.error(
      "Ollama answer generation error:",
      error
    );

    throw error;
  }
}

module.exports = {
  generateAnswer,
};