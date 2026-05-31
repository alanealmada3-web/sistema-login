const mongoose = require('mongoose')

const slaHoursByPriority = {
  critica: 2,
  alta: 4,
  media: 24,
  baixa: 72,
}

function getSlaHours(priority) {
  return slaHoursByPriority[priority] || slaHoursByPriority.baixa
}

const timelineSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ['criacao', 'status', 'prioridade', 'atribuicao', 'fila', 'comentario', 'anexo', 'sla'],
      required: true,
    },
    mensagem: {
      type: String,
      required: true,
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
    data: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
)

const ticketSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      maxlength: 100,
    },
    descricao: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1200,
    },
    categoria: {
      type: String,
      enum: ['tecnico', 'infraestrutura', 'administrativo'],
      required: true,
    },
    impacto: {
      type: String,
      enum: ['baixo', 'medio', 'alto'],
      required: true,
    },
    urgencia: {
      type: String,
      enum: ['baixa', 'media', 'alta'],
      required: true,
    },
    prioridade: {
      type: String,
      enum: ['baixa', 'media', 'alta', 'critica'],
      required: true,
    },
    status: {
      type: String,
      enum: ['aberto', 'triagem', 'andamento', 'resolvido', 'fechado'],
      default: 'aberto',
    },
    prazoSla: {
      type: Date,
      required: true,
      default: function defaultSlaDeadline() {
        const baseDate = this.createdAt || new Date()
        return new Date(baseDate.getTime() + getSlaHours(this.prioridade) * 60 * 60 * 1000)
      },
    },
    resolvidoEm: {
      type: Date,
      default: null,
    },
    slaHoras: {
      type: Number,
      required: true,
      default: function defaultSlaHours() {
        return getSlaHours(this.prioridade)
      },
    },
    fila: {
      type: String,
      enum: ['n1', 'n2'],
      default: 'n1',
    },
    solicitante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    responsavel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    anexos: {
      type: [
        {
          nomeOriginal: {
            type: String,
            required: true,
          },
          nomeArquivo: {
            type: String,
            required: true,
          },
          caminho: {
            type: String,
            required: true,
          },
          tipoMime: {
            type: String,
            required: true,
          },
          tamanho: {
            type: Number,
            required: true,
          },
          enviadoPor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          enviadoPorNome: {
            type: String,
            required: true,
          },
          criadoEm: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    timeline: {
      type: [timelineSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Ticket', ticketSchema)
