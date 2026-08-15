require("dotenv").config();

const mongoose = require("mongoose");
const DocumentChunk = require("./models/DocumentChunk");

async function checkChunks() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const results = await DocumentChunk.aggregate([
      {
        $group: {
          _id: "$documentId",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    console.log("\nDocuments with chunks:\n");

    console.log(results);

    await mongoose.disconnect();

  } catch (error) {
    console.error("Error:", error);

    await mongoose.disconnect();
  }
}

checkChunks();