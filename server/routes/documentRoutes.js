const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const protect = require("../middleware/authMiddleware");
const Document = require("../models/Document");

const {
  extractTextFromPDF,
} = require("../services/pdfService");

const {
  createChunks,
} = require("../services/chunkService");

const {
  saveDocumentChunks,
} = require("../services/chunkStorageService");

const {
  generateAndStoreEmbeddings,
} = require("../services/embeddingStorageService");

const router = express.Router();

// ======================================================
// UPLOAD DIRECTORY
// ======================================================

const uploadDir = path.join(
  __dirname,
  "../uploads"
);

// Create uploads folder if it doesn't exist

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(
    uploadDir,
    {
      recursive: true,
    }
  );
}

// ======================================================
// MULTER CONFIGURATION
// ======================================================

const storage = multer.diskStorage({

  destination: function (
    req,
    file,
    cb
  ) {
    cb(
      null,
      uploadDir
    );
  },

  filename: function (
    req,
    file,
    cb
  ) {

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(
        Math.random() * 1e9
      ) +
      path.extname(
        file.originalname
      );

    cb(
      null,
      uniqueName
    );
  },

});

const upload = multer({

  storage: storage,

  limits: {
    fileSize:
      10 * 1024 * 1024, // 10 MB
  },

  fileFilter:
    function (
      req,
      file,
      cb
    ) {

      if (
        file.mimetype ===
        "application/pdf"
      ) {

        cb(
          null,
          true
        );

      } else {

        cb(
          new Error(
            "Only PDF files are allowed"
          )
        );

      }

    },

});

// ======================================================
// UPLOAD DOCUMENT
// ======================================================

router.post(
  "/upload",
  protect,
  upload.single("document"),

  async (
    req,
    res
  ) => {

    let document = null;

    try {

      // ==================================================
      // CHECK FILE
      // ==================================================

      if (!req.file) {

        return res
          .status(400)
          .json({
            message:
              "No PDF file uploaded",
          });

      }

      // ==================================================
      // CHECK USER
      // ==================================================

      const userId =
        req.userId;

      if (!userId) {

        if (
          fs.existsSync(
            req.file.path
          )
        ) {

          fs.unlinkSync(
            req.file.path
          );

        }

        return res
          .status(401)
          .json({
            message:
              "User authentication required",
          });

      }

      // ==================================================
      // CREATE DOCUMENT RECORD
      // ==================================================

      document =
        await Document.create({

          userId:
            userId,

          filename:
            req.file.filename,

          originalName:
            req.file.originalname,

          fileUrl:
            `/uploads/${req.file.filename}`,

          fileType:
            req.file.mimetype,

          extractedText:
            "",

          pages:
            0,

          status:
            "processing",

        });

      console.log(
        "\n================================="
      );

      console.log(
        "DOCUMENT PROCESSING STARTED"
      );

      console.log(
        "================================="
      );

      console.log(
        "Document:",
        document.originalName
      );

      console.log(
        "Document ID:",
        document._id.toString()
      );

      console.log(
        "User ID:",
        userId.toString()
      );

      // ==================================================
      // STEP 1
      // EXTRACT TEXT FROM PDF
      // ==================================================

      console.log(
        "\n[1/5] Extracting PDF text..."
      );

      const extracted =
        await extractTextFromPDF(
          req.file.path
        );

      console.log(
        "PDF extraction completed."
      );

      console.log(
        "Pages:",
        extracted.pages
      );

      console.log(
        "Extracted characters:",
        extracted.text.length
      );

      // ==================================================
      // STEP 2
      // SAVE EXTRACTED TEXT
      // ==================================================

      console.log(
        "\n[2/5] Saving extracted text..."
      );

      document.extractedText =
        extracted.text;

      document.pages =
        extracted.pages;

      await document.save();

      console.log(
        "Extracted text saved."
      );

      // ==================================================
      // STEP 3
      // CREATE DOCUMENT CHUNKS
      // ==================================================

      console.log(
        "\n[3/5] Creating document chunks..."
      );

      const chunks =
        createChunks(
          extracted.text,
          1000,
          200
        );

      console.log(
        `Created ${chunks.length} chunks`
      );

      if (
        chunks.length === 0
      ) {

        throw new Error(
          "No chunks could be created from the PDF"
        );

      }

      // ==================================================
      // STEP 4
      // SAVE DOCUMENT CHUNKS
      // ==================================================

      console.log(
        "\n[4/5] Saving document chunks..."
      );

      const savedChunks =
        await saveDocumentChunks(
          document._id,
          userId,
          chunks
        );

      console.log(
        `Saved ${savedChunks.length} chunks`
      );

      // ==================================================
      // STEP 5
      // GENERATE AND STORE EMBEDDINGS
      // ==================================================

      console.log(
        "\n[5/5] Generating embeddings..."
      );

      const processed =
        await generateAndStoreEmbeddings(
          document._id
        );

      console.log(
        `Generated embeddings for ${processed} chunks`
      );

      // ==================================================
      // MARK DOCUMENT AS READY
      // ==================================================

      document.status =
        "ready";

      await document.save();

      console.log(
        "\n================================="
      );

      console.log(
        "DOCUMENT PROCESSING COMPLETED"
      );

      console.log(
        "================================="
      );

      console.log(
        "Document:",
        document.originalName
      );

      console.log(
        "Status:",
        document.status
      );

      console.log(
        "Chunks:",
        savedChunks.length
      );

      console.log(
        "Embeddings:",
        processed
      );

      // ==================================================
      // SEND RESPONSE
      // ==================================================

      return res
        .status(201)
        .json({

          message:
            "Document uploaded and processed successfully",

          document: {

            id:
              document._id,

            filename:
              document.filename,

            originalName:
              document.originalName,

            fileType:
              document.fileType,

            pages:
              document.pages,

            status:
              document.status,

          },

        });

    } catch (error) {

      // ==================================================
      // ERROR
      // ==================================================

      console.error(
        "\n================================="
      );

      console.error(
        "DOCUMENT PROCESSING FAILED"
      );

      console.error(
        "================================="
      );

      console.error(
        error
      );

      // ==================================================
      // MARK DOCUMENT AS FAILED
      // ==================================================

      if (document) {

        document.status =
          "failed";

        await document
          .save()
          .catch(
            () => {}
          );

      }

      // ==================================================
      // REMOVE UPLOADED FILE
      // ==================================================

      if (
        req.file &&
        fs.existsSync(
          req.file.path
        )
      ) {

        fs.unlinkSync(
          req.file.path
        );

      }

      // ==================================================
      // ERROR RESPONSE
      // ==================================================

      return res
        .status(500)
        .json({

          message:
            "Failed to process document",

          error:
            error.message,

        });

    }

  }
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports =
  router;