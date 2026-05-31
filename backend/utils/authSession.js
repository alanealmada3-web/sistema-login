const COOKIE_NAME = 'helpdesk_session'
const REFRESH_COOKIE_NAME = 'helpdesk_refresh'
const SESSION_MAX_AGE_MS = Number(process.env.SESSION_MAX_AGE_MS || 15 * 60 * 1000)
const REFRESH_MAX_AGE_MS = Number(process.env.REFRESH_TOKEN_TTL_MS || 30 * 60 * 1000)

function parseCookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || '')
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf('=')
        if (separator === -1) return [part, '']
        return [
          part.slice(0, separator),
          decodeURIComponent(part.slice(separator + 1)),
        ]
      })
  )
}

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE !== 'false',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE_MS,
  }
}

function getAuthTokenFromRequest(req) {
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '').trim()
  }

  return parseCookies(req)[COOKIE_NAME] || ''
}

function getRefreshTokenFromRequest(req) {
  return parseCookies(req)[REFRESH_COOKIE_NAME] || ''
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, getCookieOptions())
}

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...getCookieOptions(),
    maxAge: REFRESH_MAX_AGE_MS,
  })
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    path: '/',
    sameSite: 'strict',
    secure: process.env.COOKIE_SECURE !== 'false',
  })
  res.clearCookie(REFRESH_COOKIE_NAME, {
    path: '/',
    sameSite: 'strict',
    secure: process.env.COOKIE_SECURE !== 'false',
  })
}

module.exports = {
  clearAuthCookie,
  COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  getAuthTokenFromRequest,
  getRefreshTokenFromRequest,
  parseCookies,
  setAuthCookie,
  setRefreshCookie,
}
