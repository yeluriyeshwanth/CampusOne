const fs = require("fs");
const { PDFParse } = require("pdf-parse");

async function extractTextFromPDF(filePath) {
  let parser;

  try {
    const buffer = fs.readFileSync(filePath);

    parser = new PDFParse({
      data: buffer,
    });

    const result = await parser.getText();

    return {
      text: result.text,
      pages: result.total,
    };
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}

module.exports = {
  extractTextFromPDF,
};