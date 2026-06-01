const express = require('express')
const fs = require('fs')
const path = require('path')

const Ticket = require('../models/Ticket')
const User = require('../models/User')
const authMiddleware = require('../middlewares/auth')
const { rateLimiters } = require('../middlewares/redisRateLimit')
const { createImageUpload } = require('../utils/secureUpload')

const router = express.Router()
const ticketUploadsDir = path.resolve(__dirname, '../../uploads/tickets')

fs.mkdirSync(ticketUploadsDir, { recursive: true })

const uploadTicketFiles = createImageUpload({
  fieldName: 'anexos',
  destinationDir: ticketUploadsDir,
  maxSizeBytes: Number(process.env.TICKET_UPLOAD_MAX_BYTES || 5 * 1024 * 1024),
  maxFiles: Number(process.env.TICKET_UPLOAD_MAX_FILES || 5),
  filenamePrefix: (req) => req.userId || 'ticket',
})

const statusLabels = {
  aberto: 'Aberto',
  triagem: 'Triagem',
  andamento: 'Em Andamento',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
}

const priorityLabels = {
  baixa: 'Baixa',
  media: 'Media',
  alta: 'Alta',
  critica: 'Critica',
}

const slaHoursByPriority = {
  critica: 2,
  alta: 4,
  media: 24,
  baixa: 72,
}

const queueLabels = {
  n1: 'N1',
  n2: 'N2',
}

function normalize(value) {
  return String(value || '').trim()
}

function calculatePriority(impacto, urgencia) {
  const impactScore = { baixo: 1, medio: 2, alto: 3 }[impacto] || 1
  const urgencyScore = { baixa: 1, media: 2, alta: 3 }[urgencia] || 1
  const total = impactScore + urgencyScore

  if (total >= 6) return 'critica'
  if (total === 5) return 'alta'
  if (total >= 3) return 'media'
  return 'baixa'
}

function defaultQueue(priority) {
  return ['alta', 'critica'].includes(priority) ? 'n2' : 'n1'
}

function getSlaHours(priority) {
  return slaHoursByPriority[priority] || slaHoursByPriority.baixa
}

function calculateSlaDeadline(priority, startDate = new Date()) {
  return new Date(startDate.getTime() + getSlaHours(priority) * 60 * 60 * 1000)
}

function isClosedStatus(status) {
  return ['resolvido', 'fechado'].includes(status)
}

function getSlaInfo(ticket) {
  const now = new Date()
  const deadline = ticket.prazoSla ? new Date(ticket.prazoSla) : null
  const solvedAt = ticket.resolvidoEm ? new Date(ticket.resolvidoEm) : null
  const referenceDate = solvedAt || now
  const remainingMs = deadline ? deadline.getTime() - referenceDate.getTime() : 0
  const overdue = Boolean(deadline && remainingMs < 0 && !isClosedStatus(ticket.status))
  const dueSoon = Boolean(deadline && remainingMs >= 0 && remainingMs <= 4 * 60 * 60 * 1000 && !isClosedStatus(ticket.status))
  let status = 'no-prazo'
  let label = 'Dentro do SLA'

  if (isClosedStatus(ticket.status)) {
    status = solvedAt && deadline && solvedAt > deadline ? 'resolvido-atrasado' : 'resolvido'
    label = status === 'resolvido-atrasado' ? 'Resolvido fora do SLA' : 'Resolvido no SLA'
  } else if (overdue) {
    status = 'vencido'
    label = 'SLA vencido'
  } else if (dueSoon) {
    status = 'vence-breve'
    label = 'SLA vence em breve'
  }

  return {
    prazo: deadline,
    horasContratadas: ticket.slaHoras || getSlaHours(ticket.prioridade),
    horasRestantes: Number((remainingMs / 60 / 60 / 1000).toFixed(1)),
    vencido: overdue,
    status,
    label,
  }
}

function ensureSla(ticket) {
  if (!ticket.prazoSla) {
    ticket.slaHoras = getSlaHours(ticket.prioridade)
    ticket.prazoSla = calculateSlaDeadline(ticket.prioridade, ticket.createdAt || new Date())
  }
}

function withSlaInfo(ticket) {
  const plainTicket = typeof ticket.toObject === 'function'
    ? ticket.toObject()
    : JSON.parse(JSON.stringify(ticket))

  if (!plainTicket.prazoSla) {
    plainTicket.slaHoras = getSlaHours(plainTicket.prioridade)
    plainTicket.prazoSla = calculateSlaDeadline(plainTicket.prioridade, plainTicket.createdAt || new Date())
  }

  plainTicket.sla = getSlaInfo(plainTicket)
  return plainTicket
}

function withSlaInfoList(tickets) {
  return tickets.map((ticket) => withSlaInfo(ticket))
}

async function getCurrentUser(req) {
  return User.findById(req.userId).select('-senha')
}

function addTimeline(ticket, usuario, tipo, mensagem) {
  ticket.timeline.unshift({
    tipo,
    mensagem,
    autor: usuario._id,
    autorNome: usuario.nome,
  })
  ticket.timeline = ticket.timeline.slice(0, 80)
}

function fileToAttachment(file, usuario) {
  return {
    nomeOriginal: file.originalname,
    nomeArquivo: file.filename,
    caminho: `/uploads/tickets/${file.filename}`,
    tipoMime: file.mimetype,
    tamanho: file.size,
    enviadoPor: usuario._id,
    enviadoPorNome: usuario.nome,
  }
}

function cleanupUploadedFiles(files = []) {
  files.forEach((file) => {
    fs.unlink(file.path, () => {})
  })
}

function canView(ticket, usuario) {
  const perfil = usuario.perfil
  const userId = String(usuario._id)

  if (perfil === 'gestor') return true
  if (String(ticket.solicitante?._id || ticket.solicitante) === userId) return true
  if (String(ticket.responsavel?._id || ticket.responsavel || '') === userId) return true
  if ((ticket.timeline || []).some((item) => String(item.autor?._id || item.autor || '') === userId)) return true
  if (perfil === 'n1') {
    return ticket.fila === 'n1'
  }
  if (perfil === 'n2') {
    return ticket.fila === 'n2' || ['alta', 'critica'].includes(ticket.prioridade)
  }

  return false
}

function listFilter(usuario) {
  const attendedByUser = { 'timeline.autor': usuario._id }

  if (usuario.perfil === 'gestor') return {}
  if (usuario.perfil === 'funcionario') return { solicitante: usuario._id }
  if (usuario.perfil === 'n1') {
    return {
      $or: [
        { solicitante: usuario._id },
        { responsavel: usuario._id },
        attendedByUser,
        { fila: 'n1' },
      ],
    }
  }
  if (usuario.perfil === 'n2') {
    return {
      $or: [
        { solicitante: usuario._id },
        { responsavel: usuario._id },
        attendedByUser,
        { fila: 'n2' },
        { prioridade: { $in: ['alta', 'critica'] } },
      ],
    }
  }

  return { solicitante: usuario._id }
}

function canOperate(ticket, usuario) {
  if (usuario.perfil === 'gestor') return true
  if (usuario.perfil === 'n1') {
    return ticket.fila === 'n1' && ['baixa', 'media'].includes(ticket.prioridade)
  }
  if (usuario.perfil === 'n2') {
    return ticket.fila === 'n2' || ['alta', 'critica'].includes(ticket.prioridade)
  }
  return false
}

function canComment(ticket, usuario) {
  return canView(ticket, usuario)
}

function canCloseOwnResolved(ticket, usuario, nextStatus) {
  return (
    usuario.perfil === 'funcionario' &&
    nextStatus === 'fechado' &&
    ticket.status === 'resolvido' &&
    String(ticket.solicitante?._id || ticket.solicitante) === String(usuario._id)
  )
}

function validateTicketInput(body) {
  const titulo = normalize(body.titulo)
  const descricao = normalize(body.descricao)
  const categoria = normalize(body.categoria)
  const impacto = normalize(body.impacto)
  const urgencia = normalize(body.urgencia)

  if (titulo.length < 4 || titulo.length > 100) return 'O titulo deve ter entre 4 e 100 caracteres'
  if (descricao.length < 10 || descricao.length > 1200) return 'A descricao deve ter entre 10 e 1200 caracteres'
  if (!['tecnico', 'infraestrutura', 'administrativo'].includes(categoria)) return 'Categoria invalida'
  if (!['baixo', 'medio', 'alto'].includes(impacto)) return 'Impacto invalido'
  if (!['baixa', 'media', 'alta'].includes(urgencia)) return 'Urgencia invalida'

  return ''
}

function populateTicket(query) {
  return query
    .populate('solicitante', 'nome email perfil')
    .populate('responsavel', 'nome email perfil')
}

router.use(authMiddleware)

router.post('/', rateLimiters.upload, uploadTicketFiles, async (req, res) => {
  try {
    const usuario = await getCurrentUser(req)

    if (!usuario) {
      cleanupUploadedFiles(req.files)
      return res.status(401).json({ mensagem: 'Usuario nao encontrado' })
    }

    const validationError = validateTicketInput(req.body)

    if (validationError) {
      cleanupUploadedFiles(req.files)
      return res.status(400).json({ mensagem: validationError })
    }

    const prioridade = calculatePriority(req.body.impacto, req.body.urgencia)
    const ticket = new Ticket({
      titulo: normalize(req.body.titulo),
      descricao: normalize(req.body.descricao),
      categoria: normalize(req.body.categoria),
      impacto: normalize(req.body.impacto),
      urgencia: normalize(req.body.urgencia),
      prioridade,
      prazoSla: calculateSlaDeadline(prioridade),
      slaHoras: getSlaHours(prioridade),
      fila: defaultQueue(prioridade),
      solicitante: usuario._id,
      anexos: (req.files || []).map((file) => fileToAttachment(file, usuario)),
    })

    addTimeline(ticket, usuario, 'criacao', `${usuario.nome} abriu o chamado`)
    addTimeline(ticket, usuario, 'sla', `SLA definido automaticamente: ${getSlaHours(prioridade)}h para prioridade ${priorityLabels[prioridade]}`)
    if (ticket.anexos.length) {
      addTimeline(ticket, usuario, 'anexo', `${usuario.nome} anexou ${ticket.anexos.length} arquivo(s) ao abrir o chamado`)
    }
    await ticket.save()
    const savedTicket = await populateTicket(Ticket.findById(ticket._id))

    return res.status(201).json(withSlaInfo(savedTicket))
  } catch (error) {
    console.error('Erro real:', error)
    cleanupUploadedFiles(req.files)
    return res.status(500).json({ mensagem: 'Erro ao abrir chamado' })
  }
})

router.get('/', async (req, res) => {
  try {
    const usuario = await getCurrentUser(req)

    if (!usuario) {
      return res.status(401).json({ mensagem: 'Usuario nao encontrado' })
    }

    const filter = listFilter(usuario)
    console.log('Perfil:', usuario.perfil)
    console.log('Filtro tickets:', filter)

    const tickets = await populateTicket(Ticket.find(filter))
      .sort({ updatedAt: -1 })

    return res.json(withSlaInfoList(tickets))
  } catch (error) {
    console.error('Erro real:', error)
    return res.status(500).json({ mensagem: 'Erro ao listar chamados' })
  }
})

router.get('/historico', async (req, res) => {
  try {
    const usuario = await getCurrentUser(req)

    if (!usuario) {
      return res.status(401).json({ mensagem: 'Usuario nao encontrado' })
    }

    const filter = listFilter(usuario)
    console.log('Perfil:', usuario.perfil)
    console.log('Filtro tickets:', filter)

    const tickets = await populateTicket(Ticket.find(filter))
      .sort({ updatedAt: -1 })

    return res.json(withSlaInfoList(tickets))
  } catch (error) {
    console.error('Erro real:', error)
    return res.status(500).json({ mensagem: 'Erro ao listar historico de chamados' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const usuario = await getCurrentUser(req)
    const ticket = await populateTicket(Ticket.findById(req.params.id))

    if (!usuario || !ticket) {
      return res.status(404).json({ mensagem: 'Chamado nao encontrado' })
    }

    ensureSla(ticket)

    if (!canView(ticket, usuario)) {
      return res.status(403).json({ mensagem: 'Sem permissao para ver este chamado' })
    }

    return res.json(withSlaInfo(ticket))
  } catch (error) {
    console.error('Erro real:', error)
    return res.status(500).json({ mensagem: 'Erro ao buscar chamado' })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const usuario = await getCurrentUser(req)
    const ticket = await Ticket.findById(req.params.id)

    if (!usuario || !ticket) {
      return res.status(404).json({ mensagem: 'Chamado nao encontrado' })
    }

    ensureSla(ticket)

    const nextStatus = normalize(req.body.status)

    if (!canOperate(ticket, usuario) && !canCloseOwnResolved(ticket, usuario, nextStatus)) {
      return res.status(403).json({ mensagem: 'Sem permissao para alterar este chamado' })
    }

    if (nextStatus && nextStatus !== ticket.status) {
      if (!['aberto', 'triagem', 'andamento', 'resolvido', 'fechado'].includes(nextStatus)) {
        return res.status(400).json({ mensagem: 'Status invalido' })
      }
      ticket.status = nextStatus
      if (isClosedStatus(nextStatus) && !ticket.resolvidoEm) {
        ticket.resolvidoEm = new Date()
      } else if (!isClosedStatus(nextStatus)) {
        ticket.resolvidoEm = null
      }
      addTimeline(ticket, usuario, 'status', `${usuario.nome} alterou o status para ${statusLabels[nextStatus]}`)
    }

    const nextPriority = normalize(req.body.prioridade)
    if (nextPriority && nextPriority !== ticket.prioridade) {
      if (usuario.perfil !== 'gestor') {
        return res.status(403).json({ mensagem: 'Apenas gestores ajustam prioridade manualmente' })
      }
      if (!['baixa', 'media', 'alta', 'critica'].includes(nextPriority)) {
        return res.status(400).json({ mensagem: 'Prioridade invalida' })
      }
      ticket.prioridade = nextPriority
      ticket.slaHoras = getSlaHours(nextPriority)
      ticket.prazoSla = calculateSlaDeadline(nextPriority, ticket.createdAt || new Date())
      addTimeline(ticket, usuario, 'prioridade', `${usuario.nome} ajustou a prioridade para ${priorityLabels[nextPriority]}`)
      addTimeline(ticket, usuario, 'sla', `SLA recalculado automaticamente: ${getSlaHours(nextPriority)}h para prioridade ${priorityLabels[nextPriority]}`)
    }

    const nextQueue = normalize(req.body.fila)
    if (nextQueue && nextQueue !== ticket.fila) {
      if (!['n1', 'n2'].includes(nextQueue)) {
        return res.status(400).json({ mensagem: 'Fila invalida' })
      }
      if (!['n2', 'gestor'].includes(usuario.perfil)) {
        return res.status(403).json({ mensagem: 'Sem permissao para escalar chamado' })
      }
      ticket.fila = nextQueue
      addTimeline(ticket, usuario, 'fila', `${usuario.nome} moveu o chamado para a fila ${queueLabels[nextQueue]}`)
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'responsavel')) {
      const responsavelId = normalize(req.body.responsavel)
      const previous = String(ticket.responsavel || '')

      if (responsavelId && responsavelId !== previous) {
        const responsavel = await User.findById(responsavelId)

        if (!responsavel || !['n1', 'n2', 'gestor'].includes(responsavel.perfil)) {
          return res.status(400).json({ mensagem: 'Responsavel invalido' })
        }

        if (usuario.perfil !== 'gestor' && String(usuario._id) !== String(responsavel._id)) {
          return res.status(403).json({ mensagem: 'Apenas gestores reatribuem para outras pessoas' })
        }

        ticket.responsavel = responsavel._id
        addTimeline(ticket, usuario, 'atribuicao', `${usuario.nome} reatribuiu para ${responsavel.nome}`)
      } else if (!responsavelId && previous) {
        if (usuario.perfil !== 'gestor') {
          return res.status(403).json({ mensagem: 'Apenas gestores removem responsavel' })
        }
        ticket.responsavel = null
        addTimeline(ticket, usuario, 'atribuicao', `${usuario.nome} removeu o responsavel do chamado`)
      }
    }

    await ticket.save()
    const updatedTicket = await populateTicket(Ticket.findById(ticket._id))
    return res.json(withSlaInfo(updatedTicket))
  } catch (error) {
    console.error('Erro real:', error)
    return res.status(500).json({ mensagem: 'Erro ao atualizar chamado' })
  }
})

router.post('/:id/comentarios', async (req, res) => {
  try {
    const usuario = await getCurrentUser(req)
    const ticket = await Ticket.findById(req.params.id)
    const comentario = normalize(req.body.comentario)

    if (!usuario || !ticket) {
      return res.status(404).json({ mensagem: 'Chamado nao encontrado' })
    }

    if (!canComment(ticket, usuario)) {
      return res.status(403).json({ mensagem: 'Sem permissao para comentar este chamado' })
    }

    if (comentario.length < 2 || comentario.length > 500) {
      return res.status(400).json({ mensagem: 'O comentario deve ter entre 2 e 500 caracteres' })
    }

    addTimeline(ticket, usuario, 'comentario', `${usuario.nome} comentou: ${comentario}`)
    await ticket.save()

    const updatedTicket = await populateTicket(Ticket.findById(ticket._id))
    return res.status(201).json(withSlaInfo(updatedTicket))
  } catch (error) {
    console.error('Erro real:', error)
    return res.status(500).json({ mensagem: 'Erro ao comentar chamado' })
  }
})

router.post('/:id/anexos', rateLimiters.upload, uploadTicketFiles, async (req, res) => {
  try {
    const usuario = await getCurrentUser(req)
    const ticket = await Ticket.findById(req.params.id)

    if (!usuario || !ticket) {
      cleanupUploadedFiles(req.files)
      return res.status(404).json({ mensagem: 'Chamado nao encontrado' })
    }

    ensureSla(ticket)

    if (!canComment(ticket, usuario)) {
      cleanupUploadedFiles(req.files)
      return res.status(403).json({ mensagem: 'Sem permissao para anexar arquivos neste chamado' })
    }

    if (!req.files?.length) {
      return res.status(400).json({ mensagem: 'Selecione pelo menos um arquivo' })
    }

    const anexos = req.files.map((file) => fileToAttachment(file, usuario))
    ticket.anexos.push(...anexos)
    addTimeline(ticket, usuario, 'anexo', `${usuario.nome} anexou ${anexos.length} arquivo(s)`)
    await ticket.save()

    const updatedTicket = await populateTicket(Ticket.findById(ticket._id))
    return res.status(201).json(withSlaInfo(updatedTicket))
  } catch (error) {
    console.error('Erro real:', error)
    cleanupUploadedFiles(req.files)
    return res.status(500).json({ mensagem: 'Erro ao anexar arquivos' })
  }
})

module.exports = router
