const logger = require("../utils/logger")

/**
 * Middleware untuk autentikasi API Key
 */
function authMiddleware(req, res, next) {
  try {
    const apiKey = req.headers["x-api-key"]
    const expectedApiKey = process.env.API_KEY

    // Cek apakah API key disediakan
    if (!apiKey) {
      logger.warn(`Authentication failed: No API key provided - IP: ${req.ip}`)
      return res.status(401).json({
        success: false,
        message: "API key is required. Please provide x-api-key header.",
      })
    }

    // Cek apakah API key valid
    if (apiKey !== expectedApiKey) {
      logger.warn(`Authentication failed: Invalid API key - IP: ${req.ip}`)
      return res.status(401).json({
        success: false,
        message: "Invalid API key provided.",
      })
    }

    // Log successful authentication
    logger.info(`Authentication successful - IP: ${req.ip}`)
    next()
  } catch (error) {
    logger.error("Error in auth middleware:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    })
  }
}

module.exports = authMiddleware
