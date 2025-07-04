const express = require("express")
const cors = require("cors")
require("dotenv").config()

// Import middlewares
const authMiddleware = require("./middlewares/auth")
const rateLimitMiddleware = require("./middlewares/rateLimit")
const errorHandler = require("./middlewares/errorHandler")

// Import controllers
const ibradecodeController = require("./controllers/ibradecodeController")

// Import utils
const logger = require("./utils/logger")

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`)
  next()
})

// Apply rate limiting
app.use(rateLimitMiddleware)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "XMsbra IbraDecode Projects API",
  })
})

// Main API routes with authentication
app.post("/api/xmsbra/ibradecodeprojects", authMiddleware, ibradecodeController.processRequest)

// Error handling middleware (must be last)
app.use(errorHandler)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  })
})

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 XMsbra IbraDecode Projects API running on port ${PORT}`)
  logger.info(`📊 Health check: http://localhost:${PORT}/health`)
})

module.exports = app
