const express = require('express')
const User = require('../models/User')
const protect = require('../middleware/authMiddleware')
const Attendance = require('../models/Attendance')

const router = express.Router()

// GET LOGGED-IN USER DASHBOARD DATA
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')

    const attendanceRecords = await Attendance.find({
  user: req.userId
})

const totalAttended = attendanceRecords.reduce(
  (sum, record) => sum + record.attendedClasses,
  0
)

const totalClasses = attendanceRecords.reduce(
  (sum, record) => sum + record.totalClasses,
  0
)

const overallAttendance =
  totalClasses === 0
    ? 0
    : Number(
        ((totalAttended / totalClasses) * 100).toFixed(1)
      )

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        cgpa: user.cgpa,
        attendance: user.attendance,
        semesterProgress: user.semesterProgress,
        assignmentCompletion: user.assignmentCompletion,
        placementProgress: user.placementProgress
      }
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Server error'
    })
  }
})

module.exports = router