const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()


// ========================================
// REGISTER USER
// ========================================

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide all required fields'
      })
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      })
    }

    // Check whether email already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase()
    })

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    })

    // Send response
    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Server error'
    })
  }
})


// ========================================
// LOGIN USER
// ========================================

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password'
      })
    }

    // Find user by email
    const user = await User.findOne({
      email: email.toLowerCase().trim()
    })

    // User does not exist
    if (!user) {
      return res.status(400).json({
        message: 'Invalid email or password'
      })
    }

    // Compare entered password with hashed password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    )

    // Password incorrect
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: 'Invalid email or password'
      })
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    )

    // Login successful
    res.status(200).json({
      message: 'Login successful',

      token: token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Server error'
    })
  }
})


// ========================================
// EXPORT ROUTER
// ========================================

module.exports = router