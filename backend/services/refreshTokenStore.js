const crypto = require('crypto')

const RefreshToken = require('../models/RefreshToken')

const REFRESH_TOKEN_TTL_MS = Number(process.env.REFRESH_TOKEN_TTL_MS || 30 * 60 * 1000)

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function createPlainToken() {
  return crypto.randomBytes(48).toString('base64url')
}

function requestMeta(req) {
  return {
    createdByIp: req?.ip || req?.socket?.remoteAddress || '',
    createdByUserAgent: String(req?.headers?.['user-agent'] || '').slice(0, 500),
  }
}

async function createRefreshToken(userId, req, familyId = crypto.randomUUID()) {
  const token = createPlainToken()
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS)

  await RefreshToken.create({
    tokenHash,
    user: userId,
    familyId,
    expiresAt,
    ...requestMeta(req),
  })

  return {
    token,
    tokenHash,
    familyId,
    expiresInMs: REFRESH_TOKEN_TTL_MS,
  }
}

async function revokeRefreshTokenFamily(familyId, reasonDate = new Date()) {
  if (!familyId) return
  await RefreshToken.updateMany(
    { familyId, revokedAt: null },
    { $set: { revokedAt: reasonDate, reusedAt: reasonDate } }
  )
}

async function rotateRefreshToken(token, req) {
  if (!token) return { ok: false, reason: 'missing' }

  const tokenHash = hashToken(token)
  const session = await RefreshToken.findOne({ tokenHash })

  if (!session) {
    return { ok: false, reason: 'not_found' }
  }

  if (session.revokedAt || session.replacedByTokenHash) {
    await revokeRefreshTokenFamily(session.familyId)
    return { ok: false, reason: 'reuse_detected', reuseDetected: true, userId: session.user }
  }

  if (session.expiresAt < new Date()) {
    session.revokedAt = new Date()
    await session.save()
    return { ok: false, reason: 'expired', userId: session.user }
  }

  const next = await createRefreshToken(session.user, req, session.familyId)
  session.revokedAt = new Date()
  session.replacedByTokenHash = next.tokenHash
  await session.save()

  return {
    ok: true,
    userId: session.user,
    token: next.token,
    familyId: session.familyId,
  }
}

async function revokeRefreshToken(token) {
  if (!token) return

  const tokenHash = hashToken(token)
  await RefreshToken.updateOne(
    { tokenHash, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  )
}

async function revokeUserRefreshTokens(userId) {
  if (!userId) return
  await RefreshToken.updateMany(
    { user: userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  )
}

module.exports = {
  createRefreshToken,
  hashToken,
  revokeRefreshToken,
  revokeRefreshTokenFamily,
  revokeUserRefreshTokens,
  rotateRefreshToken,
}
