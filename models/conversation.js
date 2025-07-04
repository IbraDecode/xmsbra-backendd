const { DataTypes } = require("sequelize")
const { sequelize } = require("./initDB")

/**
 * Model untuk menyimpan riwayat conversation
 */
const Conversation = sequelize.define(
  "Conversation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "anonymous",
      comment: "ID pengguna yang melakukan request",
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Prompt asli dari user",
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Hasil summary dari phi3",
    },
    optimizedPrompt: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Prompt yang dioptimasi oleh mistral",
    },
    codeResult: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Kode yang dihasilkan oleh deepseek-coder",
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Waktu pembuatan conversation",
    },
  },
  {
    tableName: "conversations",
    timestamps: false,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["timestamp"],
      },
    ],
  },
)

module.exports = Conversation
