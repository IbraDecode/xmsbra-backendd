const { Sequelize } = require("sequelize")
const path = require("path")
require("dotenv").config()

const logger = require("../utils/logger")

// Konfigurasi database SQLite
const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "database.sqlite")

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: (msg) => logger.debug(msg),
  define: {
    freezeTableName: true,
  },
})

/**
 * Inisialisasi dan sinkronisasi database
 */
async function initializeDatabase() {
  try {
    // Test koneksi
    await sequelize.authenticate()
    logger.info("✅ Database connection established successfully")

    // Import models
    const Conversation = require("./conversation")

    // Sinkronisasi tabel
    await sequelize.sync({ alter: true })
    logger.info("✅ Database tables synchronized successfully")

    // Log statistik
    const conversationCount = await Conversation.count()
    logger.info(`📊 Current conversations in database: ${conversationCount}`)

    return sequelize
  } catch (error) {
    logger.error("❌ Unable to connect to database:", error)
    throw error
  }
}

// Auto-initialize jika file dijalankan langsung
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      logger.info("🎉 Database setup completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      logger.error("💥 Database setup failed:", error)
      process.exit(1)
    })
}

module.exports = {
  sequelize,
  initializeDatabase,
}
