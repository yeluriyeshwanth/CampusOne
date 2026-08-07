const express = require('express')
const Placement = require('../models/Placement')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// ============================================
// GET ALL PLACEMENT APPLICATIONS
// GET /api/placements
// ============================================

router.get('/', authMiddleware, async (req, res) => {
  try {
    const placements = await Placement.find({
      user: req.userId
    }).sort({
      createdAt: -1
    })

    res.status(200).json({
      placements
    })
  } catch (error) {
    console.error(
      'Get placements error:',
      error
    )

    res.status(500).json({
      message: 'Failed to fetch placement applications'
    })
  }
})


// ============================================
// ADD PLACEMENT APPLICATION
// POST /api/placements
// ============================================

router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      company,
      role,
      package: packageValue,
      location,
      appliedDate,
      deadline,
      minimumCGPA,
      status,
      notes
    } = req.body

    // ============================================
    // VALIDATE REQUIRED FIELDS
    // ============================================

    if (!company || !company.trim()) {
      return res.status(400).json({
        message: 'Company name is required'
      })
    }

    if (!role || !role.trim()) {
      return res.status(400).json({
        message: 'Role is required'
      })
    }

    // ============================================
    // VALIDATE PACKAGE
    // ============================================

    const packageNumber =
      packageValue === '' ||
      packageValue === undefined
        ? 0
        : Number(packageValue)

    if (
      Number.isNaN(packageNumber) ||
      packageNumber < 0
    ) {
      return res.status(400).json({
        message: 'Package must be a valid positive number'
      })
    }

    // ============================================
    // VALIDATE MINIMUM CGPA
    // ============================================

    const cgpa =
      minimumCGPA === '' ||
      minimumCGPA === undefined
        ? 0
        : Number(minimumCGPA)

    if (
      Number.isNaN(cgpa) ||
      cgpa < 0 ||
      cgpa > 10
    ) {
      return res.status(400).json({
        message: 'Minimum CGPA must be between 0 and 10'
      })
    }

    // ============================================
    // VALIDATE STATUS
    // ============================================

    const validStatuses = [
      'Applied',
      'Online Assessment',
      'Technical Interview',
      'HR Interview',
      'Selected',
      'Rejected'
    ]

    const applicationStatus =
      status || 'Applied'

    if (
      !validStatuses.includes(applicationStatus)
    ) {
      return res.status(400).json({
        message: 'Invalid placement status'
      })
    }

    // ============================================
    // CREATE PLACEMENT
    // ============================================

    const placement = await Placement.create({
      user: req.userId,

      company: company.trim(),

      role: role.trim(),

      package: packageNumber,

      location: location
        ? location.trim()
        : '',

      appliedDate:
        appliedDate || new Date(),

      deadline:
        deadline || undefined,

      minimumCGPA: cgpa,

      status: applicationStatus,

      notes: notes
        ? notes.trim()
        : ''
    })

    res.status(201).json({
      message:
        'Placement application added successfully',

      placement
    })
  } catch (error) {
    console.error(
      'Add placement error:',
      error
    )

    res.status(500).json({
      message: 'Failed to add placement application'
    })
  }
})


// ============================================
// EDIT PLACEMENT APPLICATION
// PUT /api/placements/:id
// ============================================

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      company,
      role,
      package: packageValue,
      location,
      appliedDate,
      deadline,
      minimumCGPA,
      status,
      notes
    } = req.body

    // ============================================
    // VALIDATE REQUIRED FIELDS
    // ============================================

    if (!company || !company.trim()) {
      return res.status(400).json({
        message: 'Company name is required'
      })
    }

    if (!role || !role.trim()) {
      return res.status(400).json({
        message: 'Role is required'
      })
    }

    // ============================================
    // VALIDATE PACKAGE
    // ============================================

    const packageNumber =
      packageValue === '' ||
      packageValue === undefined
        ? 0
        : Number(packageValue)

    if (
      Number.isNaN(packageNumber) ||
      packageNumber < 0
    ) {
      return res.status(400).json({
        message: 'Package must be a valid positive number'
      })
    }

    // ============================================
    // VALIDATE CGPA
    // ============================================

    const cgpa =
      minimumCGPA === '' ||
      minimumCGPA === undefined
        ? 0
        : Number(minimumCGPA)

    if (
      Number.isNaN(cgpa) ||
      cgpa < 0 ||
      cgpa > 10
    ) {
      return res.status(400).json({
        message: 'Minimum CGPA must be between 0 and 10'
      })
    }

    // ============================================
    // VALIDATE STATUS
    // ============================================

    const validStatuses = [
      'Applied',
      'Online Assessment',
      'Technical Interview',
      'HR Interview',
      'Selected',
      'Rejected'
    ]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid placement status'
      })
    }

    // ============================================
    // FIND APPLICATION
    // ============================================

    const placement = await Placement.findOne({
      _id: req.params.id,
      user: req.userId
    })

    if (!placement) {
      return res.status(404).json({
        message: 'Placement application not found'
      })
    }

    // ============================================
    // UPDATE APPLICATION
    // ============================================

    placement.company = company.trim()
    placement.role = role.trim()
    placement.package = packageNumber

    placement.location = location
      ? location.trim()
      : ''

    if (appliedDate) {
      placement.appliedDate = appliedDate
    }

    placement.deadline =
      deadline || undefined

    placement.minimumCGPA = cgpa
    placement.status = status

    placement.notes = notes
      ? notes.trim()
      : ''

    await placement.save()

    res.status(200).json({
      message:
        'Placement application updated successfully',

      placement
    })
  } catch (error) {
    console.error(
      'Edit placement error:',
      error
    )

    res.status(500).json({
      message:
        'Failed to update placement application'
    })
  }
})


// ============================================
// DELETE PLACEMENT APPLICATION
// DELETE /api/placements/:id
// ============================================

router.delete(
  '/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const placement =
        await Placement.findOneAndDelete({
          _id: req.params.id,
          user: req.userId
        })

      if (!placement) {
        return res.status(404).json({
          message: 'Placement application not found'
        })
      }

      res.status(200).json({
        message:
          'Placement application deleted successfully'
      })
    } catch (error) {
      console.error(
        'Delete placement error:',
        error
      )

      res.status(500).json({
        message:
          'Failed to delete placement application'
      })
    }
  }
)

module.exports = router