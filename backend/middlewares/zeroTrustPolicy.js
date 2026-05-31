const { getRequestIp, writeSecurityEvent } = require('../services/securityLogService')

function parseAccessWindows() {
  const raw = process.env.ACCESS_WINDOWS || 'mon-fri:00:00-23:59;sat-sun:00:00-23:59'

  return raw
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const separator = item.indexOf(':')
      const days = separator === -1 ? '' : item.slice(0, separator)
      const range = separator === -1 ? '' : item.slice(separator + 1)
      const [start, end] = String(range || '').split('-')
      return {
        days: parseDays(days),
        start: parseMinutes(start),
        end: parseMinutes(end),
      }
    })
    .filter((window) => window.days.length && window.start !== null && window.end !== null)
}

function parseDays(value = '') {
  const aliases = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  }

  return value.split(',').flatMap((part) => {
    const normalized = part.trim().toLowerCase()
    if (normalized.includes('-')) {
      const [start, end] = normalized.split('-').map((item) => aliases[item])
      if (start === undefined || end === undefined) return []
      const days = []
      let current = start
      while (true) {
        days.push(current)
        if (current === end) break
        current = (current + 1) % 7
      }
      return days
    }
    return aliases[normalized] === undefined ? [] : [aliases[normalized]]
  })
}

function parseMinutes(value = '') {
  const match = String(value).match(/^(\d{2}):(\d{2})$/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

function isInsideAccessWindow(date = new Date()) {
  const windows = parseAccessWindows()
  const day = date.getDay()
  const minutes = date.getHours() * 60 + date.getMinutes()

  return windows.some((window) => {
    if (!window.days.includes(day)) return false
    if (window.start <= window.end) {
      return minutes >= window.start && minutes <= window.end
    }
    return minutes >= window.start || minutes <= window.end
  })
}

function parseIpv4(ip) {
  const normalized = String(ip || '').replace('::ffff:', '')
  const parts = normalized.split('.').map(Number)

  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return null
  }

  return parts.reduce((total, part) => (total << 8) + part, 0) >>> 0
}

function isIpv4InCidr(ip, cidr) {
  const [range, bitsRaw] = cidr.split('/')
  const bits = Number(bitsRaw)
  const address = parseIpv4(ip)
  const network = parseIpv4(range)

  if (address === null || network === null || Number.isNaN(bits) || bits < 0 || bits > 32) {
    return false
  }

  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0
  return (address & mask) === (network & mask)
}

function normalizeIp(ip) {
  return String(ip || '').replace('::ffff:', '')
}

function isTrustedNetwork(ip) {
  const normalizedIp = normalizeIp(ip)
  const cidrs = String(process.env.TRUSTED_CIDRS || '127.0.0.1/32,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  if (normalizedIp === '::1') return cidrs.includes('::1/128') || process.env.NODE_ENV !== 'production'

  return cidrs.some((cidr) => isIpv4InCidr(normalizedIp, cidr))
}

function zeroTrustPolicy(policyName = 'default') {
  return async (req, res, next) => {
    const ip = getRequestIp(req)

    if (!isTrustedNetwork(ip)) {
      await writeSecurityEvent(req, {
        event: 'zero_trust_policy_denied',
        status: 'falha',
        reason: 'IP fora da rede corporativa ou VPN',
        metadata: { policyName },
      })
      return res.status(403).json({
        mensagem: 'Acesso negado pela politica de rede corporativa',
      })
    }

    if (!isInsideAccessWindow()) {
      await writeSecurityEvent(req, {
        event: 'zero_trust_policy_denied',
        status: 'falha',
        reason: 'Fora da janela de horario permitida',
        metadata: { policyName },
      })
      return res.status(403).json({
        mensagem: 'Acesso fora da janela de horario permitida',
      })
    }

    return next()
  }
}

module.exports = {
  isInsideAccessWindow,
  isTrustedNetwork,
  zeroTrustPolicy,
}
