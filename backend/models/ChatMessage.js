const mongoose = require('mongoose')

const chatMessageSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true,
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    autorNome: {
      type: String,
      required: true,
    },
    autorPerfil: {
      type: String,
      enum: ['funcionario', 'n1', 'n2', 'gestor'],
      required: true,
    },
    mensagem: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 800,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('ChatMessage', chatMessageSchema)
