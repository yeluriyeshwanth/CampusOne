const express = require('express')
const Assignment = require('../models/Assignment')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// ============================================
// GET ALL ASSIGNMENTS
// GET /api/assignments
// ============================================

router.get('/', authMiddleware, async (req, res) => {
  try {
    const assignments = await Assignment.find({
      user: req.userId
    }).sort({
      dueDate: 1
    })

    res.status(200).json({
      assignments
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch assignments'
    })
  }
})

// ============================================
// ADD ASSIGNMENT
// POST /api/assignments
// ============================================

router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      subject,
      title,
      description,
      dueDate,
      priority
    } = req.body

    // Validate required fields
    if (!subject || !title || !dueDate) {
      return res.status(400).json({
        message:
          'Subject, title and due date are required'
      })
    }

    // Validate priority
    const allowedPriorities = [
      'Low',
      'Medium',
      'High'
    ]

    if (
      priority &&
      !allowedPriorities.includes(priority)
    ) {
      return res.status(400).json({
        message:
          'Priority must be Low, Medium or High'
      })
    }

    const assignment = await Assignment.create({
      user: req.userId,

      subject: subject.trim(),

      title: title.trim(),

      description: description
        ? description.trim()
        : '',

      dueDate,

      // If frontend does not send priority,
      // Medium will be used by default
      priority: priority || 'Medium',

      completed: false
    })

    res.status(201).json({
      message: 'Assignment added successfully',
      assignment
    })
  } catch (error) {
    console.error('Add assignment error:', error)

    res.status(500).json({
      message: 'Failed to add assignment'
    })
  }
})

// ============================================
// TOGGLE COMPLETED STATUS
// PUT /api/assignments/:id/toggle
// ============================================

router.put(
  '/:id/toggle',
  authMiddleware,
  async (req, res) => {
    try {
      const assignment = await Assignment.findOne({
        _id: req.params.id,
        user: req.userId
      })

      if (!assignment) {
        return res.status(404).json({
          message: 'Assignment not found'
        })
      }

      assignment.completed = !assignment.completed

      await assignment.save()

      res.status(200).json({
        message: assignment.completed
          ? 'Assignment completed'
          : 'Assignment marked as pending',

        assignment
      })
    } catch (error) {
      console.error('Toggle assignment error:', error)

      res.status(500).json({
        message: 'Failed to update assignment'
      })
    }
  }
)

// ============================================
// DELETE ASSIGNMENT
// DELETE /api/assignments/:id
// ============================================

router.delete(
  '/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const assignment =
        await Assignment.findOneAndDelete({
          _id: req.params.id,
          user: req.userId
        })

      if (!assignment) {
        return res.status(404).json({
          message: 'Assignment not found'
        })
      }

      res.status(200).json({
        message: 'Assignment deleted successfully'
      })
    } catch (error) {
      console.error('Delete assignment error:', error)

      res.status(500).json({
        message: 'Failed to delete assignment'
      })
    }
  }
)

module.exports = router