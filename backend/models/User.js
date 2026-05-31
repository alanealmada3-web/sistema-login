const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    senha: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
      index: true,
    },
    provedor: {
      type: String,
      enum: ['local', 'google', 'microsoft_entra'],
      default: 'local',
    },
    perfil: {
      type: String,
      enum: ['funcionario', 'n1', 'n2', 'gestor'],
      default: 'funcionario',
    },
    fotoPerfil: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 180,
    },
    emailVerificado: {
      type: Boolean,
      default: false,
    },
    codigoVerificacao: {
      type: String,
      default: null,
    },
    codigoVerificacaoExpiraEm: {
      type: Date,
      default: null,
    },
    resetSenhaToken: {
      type: String,
      default: null,
    },
    resetSenhaExpiraEm: {
      type: Date,
      default: null,
    },
    historico: [
      {
        acao: {
          type: String,
          required: true,
        },
        data: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('User', userSchema)
