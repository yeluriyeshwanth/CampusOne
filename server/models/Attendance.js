const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    attendedClasses: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },

    totalClasses: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Attendance', attendanceSchema)