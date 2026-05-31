const jwt = require('jsonwebtoken')
const { Server } = require('socket.io')

const ChatMessage = require('../models/ChatMessage')
const Ticket = require('../models/Ticket')
const User = require('../models/User')
const { COOKIE_NAME, parseCookies } = require('../utils/authSession')

function canView(ticket, usuario) {
  const perfil = usuario.perfil
  const userId = String(usuario._id)

  if (perfil === 'gestor') return true
  if (String(ticket.solicitante?._id || ticket.solicitante) === userId) return true
  if (String(ticket.responsavel?._id || ticket.responsavel || '') === userId) return true
  if (perfil === 'n1') return ticket.fila === 'n1' && ['baixa', 'media'].includes(ticket.prioridade)
  if (perfil === 'n2') return ticket.fila === 'n2' || ['alta', 'critica'].includes(ticket.prioridade)

  return false
}

function publicMessage(message) {
  return {
    id: message._id,
    ticket: message.ticket,
    autor: message.autor,
    autorNome: message.autorNome,
    autorPerfil: message.autorPerfil,
    mensagem: message.mensagem,
    createdAt: message.createdAt,
  }
}

function setupChatGateway(httpServer, clientOrigin) {
  const io = new Server(httpServer, {
    cors: {
      origin: clientOrigin,
      credentials: true,
    },
  })

  io.use(async (socket, next) => {
    try {
      const cookies = parseCookies({ headers: { cookie: socket.handshake.headers.cookie || '' } })
      const token = cookies[COOKIE_NAME]

      if (!token) return next(new Error('Sessao nao informada'))

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const usuario = await User.findById(decoded.id).select('-senha')

      if (!usuario) return next(new Error('Usuario nao encontrado'))

      socket.user = usuario
      return next()
    } catch (error) {
      return next(new Error('Sessao invalida'))
    }
  })

  io.on('connection', (socket) => {
    socket.on('chat:join', async ({ ticketId } = {}, ack) => {
      try {
        const ticket = await Ticket.findById(ticketId)

        if (!ticket || !canView(ticket, socket.user)) {
          return ack?.({ ok: false, mensagem: 'Sem permissao para acessar este chat' })
        }

        Array.from(socket.rooms)
          .filter((room) => room.startsWith('ticket:'))
          .forEach((room) => socket.leave(room))

        const room = `ticket:${ticket._id}`
        socket.join(room)

        const messages = await ChatMessage.find({ ticket: ticket._id })
          .sort({ createdAt: -1 })
          .limit(80)
          .lean()

        return ack?.({
          ok: true,
          messages: messages.reverse().map(publicMessage),
        })
      } catch (error) {
        return ack?.({ ok: false, mensagem: 'Erro ao entrar no chat' })
      }
    })

    socket.on('chat:message', async ({ ticketId, mensagem } = {}, ack) => {
      try {
        const text = String(mensagem || '').trim()

        if (text.length < 1 || text.length > 800) {
          return ack?.({ ok: false, mensagem: 'A mensagem deve ter entre 1 e 800 caracteres' })
        }

        const ticket = await Ticket.findById(ticketId)

        if (!ticket || !canView(ticket, socket.user)) {
          return ack?.({ ok: false, mensagem: 'Sem permissao para enviar mensagem neste chat' })
        }

        const message = await ChatMessage.create({
          ticket: ticket._id,
          autor: socket.user._id,
          autorNome: socket.user.nome,
          autorPerfil: socket.user.perfil,
          mensagem: text,
        })

        io.to(`ticket:${ticket._id}`).emit('chat:message', publicMessage(message))
        return ack?.({ ok: true })
      } catch (error) {
        return ack?.({ ok: false, mensagem: 'Erro ao enviar mensagem' })
      }
    })
  })

  return io
}

module.exports = {
  setupChatGateway,
}
