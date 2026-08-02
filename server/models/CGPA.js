const mongoose = require('mongoose')

const cgpaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8
    },

    sgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },

    credits: {
      type: Number,
      required: true,
      min: 1
    }
  },
  {
    timestamps: true
  }
)

// A user should only have one record for each semester
cgpaSchema.index(
  { user: 1, semester: 1 },
  { unique: true }
)

module.exports = mongoose.model('CGPA', cgpaSchema)