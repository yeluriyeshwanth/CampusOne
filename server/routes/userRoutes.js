const express = require('express')
const User = require('../models/User')
const Attendance = require('../models/Attendance')
const Assignment = require('../models/Assignment')
const CGPA = require('../models/CGPA')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()


// ============================================
// GET DASHBOARD DATA
// GET /api/user/dashboard
// ============================================

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {

    // ========================================
    // USER
    // ========================================

    const user = await User.findById(req.userId).select('-password')

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }


    // ========================================
    // ATTENDANCE
    // ========================================

    const attendanceRecords = await Attendance.find({
      user: req.userId
    })

    let totalAttended = 0
    let totalClasses = 0

    attendanceRecords.forEach((record) => {
      totalAttended += Number(record.attendedClasses || 0)
      totalClasses += Number(record.totalClasses || 0)
    })

    const attendance =
      totalClasses === 0
        ? 0
        : Number(
            ((totalAttended / totalClasses) * 100).toFixed(1)
          )


    // ========================================
    // ASSIGNMENTS
    // ========================================

    const assignments = await Assignment.find({
      user: req.userId
    })

    const totalAssignments = assignments.length

    const completedAssignments = assignments.filter(
      (assignment) => assignment.completed === true
    ).length

    const pendingAssignments =
      totalAssignments - completedAssignments

    const assignmentCompletion =
      totalAssignments === 0
        ? 0
        : Number(
            (
              (completedAssignments / totalAssignments) *
              100
            ).toFixed(1)
          )


    // ========================================
    // CGPA
    // ========================================

    const semesters = await CGPA.find({
      user: req.userId
    })

    let weightedPoints = 0
    let totalCredits = 0

    semesters.forEach((semester) => {
      weightedPoints +=
        Number(semester.sgpa) *
        Number(semester.credits)

      totalCredits += Number(semester.credits)
    })

    const cgpa =
      totalCredits === 0
        ? 0
        : Number(
            (weightedPoints / totalCredits).toFixed(2)
          )


    // ========================================
    // UPCOMING ASSIGNMENTS
    // ========================================

    const upcomingAssignments = await Assignment.find({
      user: req.userId,
      completed: false
    })
      .sort({ dueDate: 1 })
      .limit(3)


    // ========================================
    // SEND DASHBOARD DATA
    // ========================================

    res.status(200).json({

      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },

      stats: {
        cgpa,
        attendance,
        pendingAssignments,
        assignmentCompletion
      },

      upcomingAssignments

    })

  } catch (error) {

    console.error('Dashboard error:', error)

    res.status(500).json({
      message: 'Server error'
    })

  }
})


module.exports = router