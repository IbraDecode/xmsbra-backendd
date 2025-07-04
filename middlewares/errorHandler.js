const logger = require("../utils/logger")

/**
 * Middleware untuk menangani error secara terpusat
 */
function errorHandler(err, req, res, next) {
  // Log error detail
  logger.error("Unhandled error:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  })

  // Default error response
  let statusCode = 500
  let message = "Internal server error"

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400
    message = "Validation error: " + err.message
  } else if (err.name === "SequelizeValidationError") {
    statusCode = 400
    message = "Database validation error"
  } else if (err.name === "SequelizeConnectionError") {
    statusCode = 503
    message = "Database connection error"
  } else if (err.message && err.message.includes("Ollama")) {
    statusCode = 503
    message = "AI service temporarily unavailable: " + err.message
  } else if (err.status) {
    statusCode = err.status
    message = err.message
  }

  // Jangan expose stack trace di production
  const response = {
    success: false,
    message: message,
    timestamp: new Date().toISOString(),
  }

  // Tambahkan detail error hanya di development
  if (process.env.NODE_ENV === "development") {
    response.error = {
      name: err.name,
      stack: err.stack,
    }
  }

  res.status(statusCode).json(response)
}

module.exports = errorHandler
