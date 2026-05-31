const AuditLog = require('../models/AuditLog')
const { writeSecurityEvent } = require('./securityLogService')

function getRequestIp(req) {
  const forwardedFor = String(req.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim()

  return forwardedFor || req.ip || req.socket.remoteAddress || 'ip-nao-informado'
}

async function registerLoginAudit(req, {
  usuario = null,
  email = '',
  status,
  motivo = '',
  provedor,
}) {
  try {
    await AuditLog.create({
      usuario: usuario?._id || usuario || null,
      email: String(email || 'email-nao-informado').trim().toLowerCase(),
      ip: getRequestIp(req),
      userAgent: String(req.headers['user-agent'] || 'user-agent-nao-informado'),
      status,
      motivo,
      provedor,
    })
    await writeSecurityEvent(req, {
      event: 'login_attempt',
      status,
      userId: usuario?._id || usuario || '',
      email,
      reason: motivo,
      provider: provedor,
    })
  } catch (error) {
    console.error('Falha ao registrar auditoria de login:', error.message)
  }
}

module.exports = {
  registerLoginAudit,
}
