const rateLimit = require("express-rate-limit")
const logger = require("../utils/logger")

/**
 * Rate limiting middleware - 20 requests per minute per IP
 */
const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 20, // maksimal 20 request per menit per IP
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later.",
    retryAfter: "1 minute",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers

  // Custom handler untuk logging
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} - ${req.method} ${req.path}`)
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP. Please try again later.",
      retryAfter: "1 minute",
    })
  },

  // Skip rate limiting untuk health check
  skip: (req) => {
    return req.path === "/health"
  },

  // Log ketika rate limit hampir tercapai
  onLimitReached: (req) => {
    logger.warn(`Rate limit approaching for IP: ${req.ip}`)
  },
})

module.exports = rateLimitMiddleware
