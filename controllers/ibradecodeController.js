const ollamaService = require("../services/ollama")
const Conversation = require("../models/conversation")
const logger = require("../utils/logger")

/**
 * Controller untuk memproses request utama XMsbra IbraDecode Projects
 * Pipeline: phi3 (summarize) -> mistral (optimize) -> deepseek-coder (generate code)
 */
class IbradecodeController {
  /**
   * Memproses request dengan pipeline 3 langkah AI model
   */
  async processRequest(req, res, next) {
    const startTime = Date.now()

    try {
      const { prompt } = req.body
      const userId = req.headers["user-id"] || "anonymous"

      // Validasi input
      if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Prompt is required and must be a non-empty string",
        })
      }

      logger.info(`Processing request for user: ${userId}`)
      logger.info(`Original prompt: ${prompt.substring(0, 100)}...`)

      // Step 1: Summarize dengan phi3
      logger.info("Step 1: Summarizing with phi3...")
      const summaryPrompt = `Please summarize the following request in a clear and concise way, focusing on the main requirements and objectives:\n\n${prompt}`

      const summaryResult = await ollamaService.callModel("phi3", summaryPrompt)
      const summary = summaryResult.response

      logger.info(`Summary completed: ${summary.substring(0, 100)}...`)

      // Step 2: Optimize dengan mistral
      logger.info("Step 2: Optimizing with mistral...")
      const optimizePrompt = `Transform the following summary into a powerful, detailed, and technical prompt that will help generate high-quality code. Make it specific, actionable, and include technical requirements:\n\nSummary: ${summary}`

      const optimizedResult = await ollamaService.callModel("mistral", optimizePrompt)
      const optimizedPrompt = optimizedResult.response

      logger.info(`Optimization completed: ${optimizedPrompt.substring(0, 100)}...`)

      // Step 3: Generate code dengan deepseek-coder
      logger.info("Step 3: Generating code with deepseek-coder...")
      const codePrompt = `Based on the following optimized requirements, generate clean, well-documented, and production-ready code. Include comments and follow best practices:\n\n${optimizedPrompt}`

      const codeResult = await ollamaService.callModel("deepseek-coder:6.7b", codePrompt)
      const generatedCode = codeResult.response

      logger.info("Code generation completed")

      // Simpan ke database
      const conversation = await Conversation.create({
        userId,
        prompt,
        summary,
        optimizedPrompt,
        codeResult: generatedCode,
        timestamp: new Date(),
      })

      const processingTime = Date.now() - startTime

      logger.info(`Request processed successfully in ${processingTime}ms for conversation ID: ${conversation.id}`)

      // Response
      res.json({
        success: true,
        data: {
          conversationId: conversation.id,
          pipeline: {
            step1_summary: summary,
            step2_optimized: optimizedPrompt,
            step3_code: generatedCode,
          },
          metadata: {
            userId,
            processingTime: `${processingTime}ms`,
            timestamp: conversation.timestamp,
          },
        },
      })
    } catch (error) {
      logger.error("Error in processRequest:", error)
      next(error)
    }
  }

  /**
   * Mendapatkan riwayat conversation berdasarkan userId
   */
  async getHistory(req, res, next) {
    try {
      const userId = req.headers["user-id"] || "anonymous"
      const { limit = 10, offset = 0 } = req.query

      const conversations = await Conversation.findAll({
        where: { userId },
        order: [["timestamp", "DESC"]],
        limit: Number.parseInt(limit),
        offset: Number.parseInt(offset),
        attributes: ["id", "prompt", "timestamp"],
      })

      res.json({
        success: true,
        data: conversations,
        pagination: {
          limit: Number.parseInt(limit),
          offset: Number.parseInt(offset),
          total: await Conversation.count({ where: { userId } }),
        },
      })
    } catch (error) {
      logger.error("Error in getHistory:", error)
      next(error)
    }
  }
}

module.exports = new IbradecodeController()
