const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    // Academic information
    cgpa: {
      type: Number,
      default: 0
    },

    attendance: {
      type: Number,
      default: 0
    },

    semesterProgress: {
      type: Number,
      default: 0
    },

    assignmentCompletion: {
      type: Number,
      default: 0
    },

    placementProgress: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('User', userSchema)