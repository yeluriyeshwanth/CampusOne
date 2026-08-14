const path = require("path");
const { extractTextFromPDF } = require("./services/pdfService");

async function testPDF() {
  try {
    const filePath = path.join(
      __dirname,
      "uploads",
      "1786631450473-569556309.pdf"
    );

    const result = await extractTextFromPDF(filePath);

    console.log("=================================");
    console.log("PDF EXTRACTION SUCCESSFUL");
    console.log("=================================");

    console.log("Pages:", result.pages);

    console.log("\nExtracted Text:\n");
    console.log(result.text);

  } catch (error) {
    console.error("PDF extraction failed:");
    console.error(error);
  }
}

testPDF();