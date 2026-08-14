const {
  createChunks,
} = require("./services/chunkService");

const sampleText = `
Data mining is the process of discovering
interesting patterns and knowledge from large
amounts of data.

Classification is a supervised learning technique.
It is used to predict the class of new data.

Clustering is an unsupervised learning technique.
It groups similar objects together.

Association rule mining discovers relationships
between items in large datasets.
`;

const chunks = createChunks(
  sampleText,
  200,
  40
);

console.log("=================================");
console.log("CHUNKING TEST");
console.log("=================================");

console.log("Total chunks:", chunks.length);

chunks.forEach((chunk) => {
  console.log("\n------------------------------");
  console.log("Chunk:", chunk.chunkIndex);
  console.log("------------------------------");
  console.log(chunk.text);
});