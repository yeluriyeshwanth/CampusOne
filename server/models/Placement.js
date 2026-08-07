const mongoose = require('mongoose')

const placementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    company: {
      type: String,
      required: true,
      trim: true
    },

    role: {
      type: String,
      required: true,
      trim: true
    },

    package: {
      type: Number,
      min: 0,
      default: 0
    },

    location: {
      type: String,
      trim: true,
      default: ''
    },

    appliedDate: {
      type: Date,
      default: Date.now
    },

    deadline: {
      type: Date
    },

    minimumCGPA: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },

    status: {
      type: String,
      enum: [
        'Applied',
        'Online Assessment',
        'Technical Interview',
        'HR Interview',
        'Selected',
        'Rejected'
      ],
      default: 'Applied'
    },

    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model(
  'Placement',
  placementSchema
)