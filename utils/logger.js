const winston = require("winston")
const path = require("path")

/**
 * Konfigurasi Winston logger untuk XMsbra IbraDecode Projects
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: {
    service: "xmsbra-ibradecode-projects",
    version: "1.0.0",
  },
  transports: [
    // Error log file - hanya error dan fatal
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),

    // Combined log file - semua level
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  ],
})

// Jika bukan production, log ke console juga
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: "HH:mm:ss",
        }),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
          return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`
        }),
      ),
    }),
  )
}

// Buat direktori logs jika belum ada
const fs = require("fs")
const logsDir = path.join(__dirname, "..", "logs")
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

module.exports = logger
