const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const userRoutes = require('./routes/userRoutes')

const authRoutes = require('./routes/authRoutes')
const attendanceRoutes = require('./routes/attendanceRoutes')
const assignmentRoutes = require('./routes/assignmentRoutes')
const cgpaRoutes = require('./routes/cgpaRoutes')
const placementRoutes = require('./routes/placementRoutes')
const resumeRoutes = require('./routes/resumeRoutes')
const documentRoutes = require("./routes/documentRoutes");
const aiRoutes = require("./routes/aiRoutes");
// Load variables from .env
dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"));
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/assignments', assignmentRoutes)
app.use('/api/cgpa', cgpaRoutes)
app.use('/api/placements', placementRoutes)
app.use('/api/resume',resumeRoutes)
app.use("/api/documents", documentRoutes);
app.use("/api/ai", aiRoutes);

// Connect to MongoDBcs
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully')
  })
  .catch((error) => {
  console.log("MongoDB connection failed");

  console.log("Main error:");
  console.log(error.message);

  console.log("\n--- INDIVIDUAL SERVER ERRORS ---");

  if (error.reason && error.reason.servers) {
    for (const [address, server] of error.reason.servers) {
      console.log("\nSERVER:", address);

      if (server.error) {
        console.log("Error name:", server.error.name);
        console.log("Error message:", server.error.message);
        console.log("Error cause:", server.error.cause);
      }
    }
  }
});

// Test route
app.get('/', (req, res) => {
  res.send('CampusOne Backend is running!')
})

// Test API route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'CampusOne API is working successfully!'
  })
})

// Server port
const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})