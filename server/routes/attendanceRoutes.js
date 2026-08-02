const express = require('express')
const Attendance = require('../models/Attendance')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()


// ============================================
// GET ALL SUBJECTS
// GET /api/attendance
// ============================================

router.get('/', authMiddleware, async (req, res) => {
  try {
    const subjects = await Attendance.find({
      user: req.userId
    }).sort({ createdAt: -1 })

    res.status(200).json({
      subjects
    })

  } catch (error) {
    console.error('Get attendance error:', error)

    res.status(500).json({
      message: 'Server error'
    })
  }
})


// ============================================
// ADD SUBJECT
// POST /api/attendance
// ============================================

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { subject, attendedClasses, totalClasses } = req.body

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        message: 'Subject name is required'
      })
    }

    const attended = Number(attendedClasses)
    const total = Number(totalClasses)

    if (
      Number.isNaN(attended) ||
      Number.isNaN(total) ||
      attended < 0 ||
      total < 0
    ) {
      return res.status(400).json({
        message: 'Attendance values must be valid numbers'
      })
    }

    if (attended > total) {
      return res.status(400).json({
        message: 'Attended classes cannot be greater than total classes'
      })
    }

    const attendance = await Attendance.create({
      user: req.userId,
      subject: subject.trim(),
      attendedClasses: attended,
      totalClasses: total
    })

    res.status(201).json({
      message: 'Subject added successfully',
      attendance
    })

  } catch (error) {
    console.error('Add attendance error:', error)

    res.status(500).json({
      message: 'Server error'
    })
  }
})


// ============================================
// MARK CLASS AS ATTENDED
// PUT /api/attendance/:id/attended
// ============================================

router.put('/:id/attended', authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      user: req.userId
    })

    if (!attendance) {
      return res.status(404).json({
        message: 'Subject not found'
      })
    }

    attendance.attendedClasses += 1
    attendance.totalClasses += 1

    await attendance.save()

    res.status(200).json({
      message: 'Attendance updated',
      attendance
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Server error'
    })
  }
})


// ============================================
// MARK CLASS AS MISSED
// PUT /api/attendance/:id/missed
// ============================================

router.put('/:id/missed', authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      user: req.userId
    })

    if (!attendance) {
      return res.status(404).json({
        message: 'Subject not found'
      })
    }

    attendance.totalClasses += 1

    await attendance.save()

    res.status(200).json({
      message: 'Attendance updated',
      attendance
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Server error'
    })
  }
})


// ============================================
// DELETE SUBJECT
// DELETE /api/attendance/:id
// ============================================

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    })

    if (!attendance) {
      return res.status(404).json({
        message: 'Subject not found'
      })
    }

    res.status(200).json({
      message: 'Subject deleted successfully'
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Server error'
    })
  }
})


module.exports = router