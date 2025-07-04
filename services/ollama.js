const axios = require("axios")
const logger = require("../utils/logger")

/**
 * Service untuk berinteraksi dengan Ollama API lokal
 */
class OllamaService {
  constructor() {
    this.baseURL = process.env.OLLAMA_BASE_URL || "http://localhost:11434"
    this.timeout = 300000 // 5 menit timeout
  }

  /**
   * Memanggil model Ollama dengan prompt tertentu
   * @param {string} model - Nama model (phi3, mistral, deepseek-coder:6.7b)
   * @param {string} prompt - Prompt untuk model
   * @returns {Promise<Object>} Response dari Ollama
   */
  async callModel(model, prompt) {
    const startTime = Date.now()

    try {
      logger.info(`Calling Ollama model: ${model}`)

      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        {
          model: model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
          },
        },
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      const processingTime = Date.now() - startTime

      logger.info(`Model ${model} responded in ${processingTime}ms`)

      if (!response.data || !response.data.response) {
        throw new Error(`Invalid response from model ${model}`)
      }

      return {
        response: response.data.response,
        model: model,
        processingTime: processingTime,
        done: response.data.done,
      }
    } catch (error) {
      const processingTime = Date.now() - startTime

      logger.error(`Error calling model ${model} after ${processingTime}ms:`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
      })

      // Handle specific error types
      if (error.code === "ECONNREFUSED") {
        throw new Error(`Ollama server is not running. Please start Ollama on ${this.baseURL}`)
      } else if (error.code === "ETIMEDOUT") {
        throw new Error(`Model ${model} request timed out after ${this.timeout}ms`)
      } else if (error.response?.status === 404) {
        throw new Error(`Model ${model} not found. Please pull the model first: ollama pull ${model}`)
      } else {
        throw new Error(`Failed to call model ${model}: ${error.message}`)
      }
    }
  }

  /**
   * Mengecek status kesehatan Ollama server
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`, {
        timeout: 5000,
      })

      return {
        status: "healthy",
        models: response.data.models || [],
      }
    } catch (error) {
      logger.error("Ollama health check failed:", error.message)
      return {
        status: "unhealthy",
        error: error.message,
      }
    }
  }

  /**
   * Mendapatkan daftar model yang tersedia
   */
  async getAvailableModels() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`)
      return response.data.models || []
    } catch (error) {
      logger.error("Failed to get available models:", error.message)
      throw new Error("Failed to retrieve available models")
    }
  }
}

module.exports = new OllamaService()
