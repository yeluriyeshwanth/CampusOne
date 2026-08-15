require("dotenv").config();

const {
  generateAnswer,
} = require("./services/ollamaService");

async function testGeminiAnswer() {
  try {
    console.log("==============================");
    console.log("GEMINI ANSWER TEST");
    console.log("==============================");

    const context = `
rajukanna

PROFESSIONAL SUMMARY
my name is yeshwanth currently in my 3rd year of engineering

EDUCATION
B.Tech 2024 - 2028
Sri vasavi engineering college
CGPA: 8.26

TECHNICAL SKILLS
Programming Languages: Java, c++
Frontend: html, css
Backend: mongodb, oracle
Databases: mongodb
Tools: vscode

PROJECTS
Project
html,css,tailwind css
good application
`;

    const question =
      "What programming languages are mentioned in my resume?";

    console.log("\nQuestion:");
    console.log(question);

    console.log("\nGenerating answer...\n");

    const answer = await generateAnswer(
      question,
      context
    );

    console.log("==============================");
    console.log("ANSWER");
    console.log("==============================\n");

    console.log(answer);

  } catch (error) {
    console.error(
      "\nGEMINI ANSWER TEST FAILED"
    );

    console.error(error);
  }
}

testGeminiAnswer();