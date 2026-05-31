const express = require('express')

const AuditLog = require('../models/AuditLog')
const User = require('../models/User')
const authMiddleware = require('../middlewares/auth')

const router = express.Router()

router.use(authMiddleware)

router.get('/logins', async (req, res) => {
  try {
    const usuario = await User.findById(req.userId).select('perfil')

    if (!usuario || usuario.perfil !== 'gestor') {
      return res.status(403).json({
        mensagem: 'Apenas gestores podem consultar logs de auditoria',
      })
    }

    const logs = await AuditLog.find()
      .populate('usuario', 'nome email perfil')
      .sort({ createdAt: -1 })
      .limit(200)

    return res.json(logs.map((log) => ({
      id: log._id,
      usuario: log.usuario ? {
        id: log.usuario._id,
        nome: log.usuario.nome,
        email: log.usuario.email,
        perfil: log.usuario.perfil,
      } : null,
      email: log.email,
      status: log.status,
      motivo: log.motivo,
      provedor: log.provedor,
      criadoEm: log.createdAt,
    })))
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao consultar logs de auditoria',
    })
  }
})

module.exports = router
