require("dotenv").config();

const mongoose = require("mongoose");
const Document = require("./models/Document");

async function checkDocumentUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const document = await Document.findById(
      "6a7f39278142757391e69119"
    ).select("_id originalName userId");

    console.log(document);

    await mongoose.disconnect();

  } catch (error) {
    console.error(error);
    await mongoose.disconnect();
  }
}

checkDocumentUser();