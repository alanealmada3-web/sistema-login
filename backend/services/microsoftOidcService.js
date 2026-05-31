const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const jwksCache = new Map()
const JWKS_CACHE_MS = 60 * 60 * 1000

function getMicrosoftTenantId() {
  return process.env.MICROSOFT_TENANT_ID || 'common'
}

function getMicrosoftIssuer() {
  return `https://login.microsoftonline.com/${getMicrosoftTenantId()}/v2.0`
}

function getMicrosoftJwksUrl() {
  return `${getMicrosoftIssuer()}/discovery/v2.0/keys`
}

function getExpectedAudience() {
  if (!process.env.MICROSOFT_CLIENT_ID) {
    throw new Error('MICROSOFT_CLIENT_ID nao configurado')
  }

  return process.env.MICROSOFT_CLIENT_ID
}

async function fetchMicrosoftJwks() {
  const url = getMicrosoftJwksUrl()
  const cached = jwksCache.get(url)

  if (cached && cached.expiresAt > Date.now()) {
    return cached.keys
  }

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Nao foi possivel carregar chaves publicas da Microsoft')
  }

  const data = await response.json()
  const keys = Array.isArray(data.keys) ? data.keys : []

  jwksCache.set(url, {
    keys,
    expiresAt: Date.now() + JWKS_CACHE_MS,
  })

  return keys
}

async function getMicrosoftSigningKey(token) {
  const decoded = jwt.decode(token, { complete: true })

  if (!decoded?.header?.kid) {
    throw new Error('Token OIDC sem identificador de chave')
  }

  const keys = await fetchMicrosoftJwks()
  const jwk = keys.find((key) => key.kid === decoded.header.kid)

  if (!jwk) {
    throw new Error('Chave publica do token nao encontrada')
  }

  return crypto.createPublicKey({
    key: jwk,
    format: 'jwk',
  })
}

function mapMicrosoftClaimsToProfile(claims) {
  const roles = [
    ...normalizeClaimList(claims.roles),
    ...normalizeClaimList(claims.groups),
  ].map((item) => item.toLowerCase())

  if (roles.some((item) => ['gestor', 'diretor', 'helpdesk-gestor'].includes(item))) {
    return 'gestor'
  }

  if (roles.some((item) => ['n2', 'analista-n2', 'helpdesk-n2'].includes(item))) {
    return 'n2'
  }

  if (roles.some((item) => ['n1', 'analista-n1', 'helpdesk-n1'].includes(item))) {
    return 'n1'
  }

  return 'funcionario'
}

function normalizeClaimList(value) {
  if (Array.isArray(value)) return value.map(String)
  if (!value) return []
  return [String(value)]
}

async function verifyMicrosoftIdToken(idToken) {
  const signingKey = await getMicrosoftSigningKey(idToken)
  const claims = jwt.verify(idToken, signingKey, {
    algorithms: ['RS256'],
    audience: getExpectedAudience(),
    issuer: getMicrosoftIssuer(),
    clockTolerance: 30,
  })

  if (!claims.email && !claims.preferred_username) {
    throw new Error('Token OIDC sem email corporativo')
  }

  return claims
}

module.exports = {
  mapMicrosoftClaimsToProfile,
  verifyMicrosoftIdToken,
}
