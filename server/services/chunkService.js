function normalizeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function createChunks(
  text,
  chunkSize = 1000,
  overlap = 200
) {
  if (!text || !text.trim()) {
    return [];
  }

  const cleanedText = normalizeText(text);

  const chunks = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < cleanedText.length) {
    let end = start + chunkSize;

    if (end < cleanedText.length) {
      const lastSpace = cleanedText.lastIndexOf(
        " ",
        end
      );

      if (lastSpace > start) {
        end = lastSpace;
      }
    } else {
      end = cleanedText.length;
    }

    const chunkText = cleanedText
      .slice(start, end)
      .trim();

    if (chunkText) {
      chunks.push({
        chunkIndex,
        text: chunkText,
      });

      chunkIndex++;
    }

    if (end >= cleanedText.length) {
      break;
    }

    start = Math.max(
      end - overlap,
      start + 1
    );
  }

  return chunks;
}

module.exports = {
  createChunks,
};