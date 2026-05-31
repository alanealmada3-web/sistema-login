const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['sucesso', 'falha'],
      required: true,
    },
    motivo: {
      type: String,
      default: '',
      maxlength: 240,
    },
    provedor: {
      type: String,
      enum: ['local', 'microsoft_entra'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

auditLogSchema.index({ email: 1, createdAt: -1 })
auditLogSchema.index({ usuario: 1, createdAt: -1 })
auditLogSchema.index({ status: 1, createdAt: -1 })

module.exports = mongoose.model('AuditLog', auditLogSchema)
