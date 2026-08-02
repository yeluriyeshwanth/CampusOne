const express = require('express')
const CGPA = require('../models/CGPA')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// ============================================
// GET ALL SEMESTERS
// GET /api/cgpa
// ============================================

router.get('/', authMiddleware, async (req, res) => {
  try {
    const semesters = await CGPA.find({
      user: req.userId
    }).sort({ semester: 1 })

    // Calculate weighted CGPA
    let totalWeightedPoints = 0
    let totalCredits = 0

    semesters.forEach((item) => {
      totalWeightedPoints += item.sgpa * item.credits
      totalCredits += item.credits
    })

    const cgpa =
      totalCredits === 0
        ? 0
        : Number(
            (totalWeightedPoints / totalCredits).toFixed(2)
          )

    res.status(200).json({
      semesters,
      cgpa
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Server error'
    })
  }
})


// ============================================
// ADD SEMESTER
// POST /api/cgpa
// ============================================

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { semester, sgpa, credits } = req.body

    if (
      semester === undefined ||
      sgpa === undefined ||
      credits === undefined
    ) {
      return res.status(400).json({
        message: 'Please provide semester, SGPA and credits'
      })
    }

    const semesterNumber = Number(semester)
    const sgpaNumber = Number(sgpa)
    const creditsNumber = Number(credits)

    // Validate semester
    if (
      !Number.isInteger(semesterNumber) ||
      semesterNumber < 1 ||
      semesterNumber > 8
    ) {
      return res.status(400).json({
        message: 'Semester must be between 1 and 8'
      })
    }

    // Validate SGPA
    if (
      Number.isNaN(sgpaNumber) ||
      sgpaNumber < 0 ||
      sgpaNumber > 10
    ) {
      return res.status(400).json({
        message: 'SGPA must be between 0 and 10'
      })
    }

    // Validate credits
    if (
      Number.isNaN(creditsNumber) ||
      creditsNumber <= 0
    ) {
      return res.status(400).json({
        message: 'Credits must be greater than 0'
      })
    }

    // Check whether semester already exists
    const existingSemester = await CGPA.findOne({
      user: req.userId,
      semester: semesterNumber
    })

    if (existingSemester) {
      return res.status(400).json({
        message: 'This semester has already been added'
      })
    }

    const semesterData = await CGPA.create({
      user: req.userId,
      semester: semesterNumber,
      sgpa: sgpaNumber,
      credits: creditsNumber
    })

    res.status(201).json({
      message: 'Semester added successfully',
      semester: semesterData
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Server error'
    })
  }
})


// ============================================
// UPDATE SEMESTER
// PUT /api/cgpa/:id
// ============================================

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { sgpa, credits } = req.body

    const semester = await CGPA.findOne({
      _id: req.params.id,
      user: req.userId
    })

    if (!semester) {
      return res.status(404).json({
        message: 'Semester not found'
      })
    }

    if (sgpa !== undefined) {
      const sgpaNumber = Number(sgpa)

      if (
        Number.isNaN(sgpaNumber) ||
        sgpaNumber < 0 ||
        sgpaNumber > 10
      ) {
        return res.status(400).json({
          message: 'SGPA must be between 0 and 10'
        })
      }

      semester.sgpa = sgpaNumber
    }

    if (credits !== undefined) {
      const creditsNumber = Number(credits)

      if (
        Number.isNaN(creditsNumber) ||
        creditsNumber <= 0
      ) {
        return res.status(400).json({
          message: 'Credits must be greater than 0'
        })
      }

      semester.credits = creditsNumber
    }

    await semester.save()

    res.status(200).json({
      message: 'Semester updated successfully',
      semester
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Server error'
    })
  }
})


// ============================================
// DELETE SEMESTER
// DELETE /api/cgpa/:id
// ============================================

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const semester = await CGPA.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    })

    if (!semester) {
      return res.status(404).json({
        message: 'Semester not found'
      })
    }

    res.status(200).json({
      message: 'Semester deleted successfully'
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Server error'
    })
  }
})

module.exports = router