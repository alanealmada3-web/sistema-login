const crypto = require('crypto')
const fs = require('fs/promises')
const path = require('path')

const LOG_DIR = path.resolve(__dirname, '../../logs')
const SECURITY_LOG_FILE = path.join(LOG_DIR, 'security-events.log')

function getLogSecret() {
  return process.env.SIEM_LOG_SECRET || process.env.JWT_SECRET || 'dev-only-log-secret'
}

function hashValue(value) {
  return crypto
    .createHmac('sha256', getLogSecret())
    .update(String(value || ''))
    .digest('hex')
}

function maskEmail(email = '') {
  const normalized = String(email).trim().toLowerCase()
  const [localPart, domain] = normalized.split('@')

  if (!localPart || !domain) return 'email-mascarado'

  return `${localPart.slice(0, 2)}***@${domain}`
}

function sanitizeUserAgent(userAgent = '') {
  return String(userAgent)
    .replace(/[\r\n\t]/g, ' ')
    .slice(0, 240)
}

function getRequestIp(req) {
  const forwardedFor = String(req.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim()

  return forwardedFor || req.ip || req.socket.remoteAddress || 'ip-nao-informado'
}

function createTrackingHash({ event, email, ip, timestamp }) {
  return hashValue(`${event}:${email}:${ip}:${timestamp}:${crypto.randomUUID()}`)
}

async function writeSecurityEvent(req, {
  event,
  status,
  userId = '',
  email = '',
  reason = '',
  provider = '',
  metadata = {},
}) {
  const timestamp = new Date().toISOString()
  const ip = getRequestIp(req)
  const logEntry = {
    timestamp,
    event,
    status,
    provider,
    maskedUserId: userId ? hashValue(userId).slice(0, 16) : null,
    maskedEmail: email ? maskEmail(email) : null,
    ip,
    userAgent: sanitizeUserAgent(req.headers['user-agent'] || ''),
    reason: String(reason || '').slice(0, 180),
    trackingHash: createTrackingHash({ event, email, ip, timestamp }),
    metadata,
  }

  await fs.mkdir(LOG_DIR, { recursive: true })
  await fs.appendFile(SECURITY_LOG_FILE, `${JSON.stringify(logEntry)}\n`, 'utf8')

  if (process.env.SIEM_LOG_TO_STDOUT === 'true') {
    console.log(JSON.stringify(logEntry))
  }

  return logEntry
}

module.exports = {
  getRequestIp,
  hashValue,
  maskEmail,
  writeSecurityEvent,
}
