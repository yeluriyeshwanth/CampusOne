const express = require('express')
const Resume = require('../models/Resume')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// ============================================
// GET RESUME
// GET /api/resume
// ============================================

router.get('/', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      user: req.userId
    })

    res.status(200).json({
      resume
    })
  } catch (error) {
    console.error(
      'Get resume error:',
      error
    )

    res.status(500).json({
      message: 'Failed to fetch resume'
    })
  }
})


// ============================================
// CREATE RESUME
// POST /api/resume
// ============================================

router.post('/', authMiddleware, async (req, res) => {
  try {
    // ============================================
    // CHECK IF RESUME ALREADY EXISTS
    // ============================================

    const existingResume = await Resume.findOne({
      user: req.userId
    })

    if (existingResume) {
      return res.status(400).json({
        message: 'Resume already exists'
      })
    }

    // ============================================
    // CREATE RESUME
    // ============================================

    const resume = await Resume.create({
      user: req.userId,

      ...req.body
    })

    res.status(201).json({
      message: 'Resume created successfully',
      resume
    })
  } catch (error) {
    console.error(
      'Create resume error:',
      error
    )

    res.status(500).json({
      message: 'Failed to create resume'
    })
  }
})


// ============================================
// UPDATE RESUME
// PUT /api/resume
// ============================================

router.put('/', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      {
        user: req.userId
      },

      {
        $set: req.body
      },

      {
        new: true,
        runValidators: true
      }
    )

    if (!resume) {
      return res.status(404).json({
        message: 'Resume not found'
      })
    }

    res.status(200).json({
      message: 'Resume updated successfully',
      resume
    })
  } catch (error) {
    console.error(
      'Update resume error:',
      error
    )

    res.status(500).json({
      message: 'Failed to update resume'
    })
  }
})


// ============================================
// DELETE RESUME
// DELETE /api/resume
// ============================================

router.delete('/', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      user: req.userId
    })

    if (!resume) {
      return res.status(404).json({
        message: 'Resume not found'
      })
    }

    res.status(200).json({
      message: 'Resume deleted successfully'
    })
  } catch (error) {
    console.error(
      'Delete resume error:',
      error
    )

    res.status(500).json({
      message: 'Failed to delete resume'
    })
  }
})


module.exports = router