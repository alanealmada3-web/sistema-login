const { ipKeyGenerator, rateLimit } = require('express-rate-limit')
const { RedisStore } = require('rate-limit-redis')

const { getRedisClient } = require('../services/redisClient')

function clientIp(req) {
  return ipKeyGenerator(req.ip || req.socket.remoteAddress || '127.0.0.1')
}

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase()
}

function buildLimiter({ name, max, windowSeconds, keyGenerator, store }) {
  return rateLimit({
    windowMs: windowSeconds * 1000,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      mensagem: 'Muitas solicitacoes. Tente novamente em alguns minutos.',
    },
    keyGenerator: keyGenerator || clientIp,
    store,
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
    identifier: name,
  })
}

function isRateLimitDisabled() {
  return process.env.RATE_LIMIT_DISABLED === 'true'
}

function redisRateLimit(config) {
  let limiterPromise = null
  let memoryLimiter = null

  return async (req, res, next) => {
    if (isRateLimitDisabled()) {
      return next()
    }

    try {
      if (!limiterPromise) {
        limiterPromise = (async () => {
          const redis = await getRedisClient()
          const store = redis
            ? new RedisStore({
                sendCommand: (...args) => redis.sendCommand(args),
                prefix: `rl:${config.name}:`,
              })
            : undefined

          return buildLimiter({ ...config, store })
        })()
      }

      const limiter = await limiterPromise
      return limiter(req, res, next)
    } catch (error) {
      limiterPromise = null

      if (!memoryLimiter) {
        memoryLimiter = buildLimiter(config)
      }

      return memoryLimiter(req, res, next)
    }
  }
}

const rateLimiters = {
  login: redisRateLimit({
    name: 'auth-login',
    max: Number(process.env.RATE_LIMIT_LOGIN_MAX || 5),
    windowSeconds: Number(process.env.RATE_LIMIT_LOGIN_WINDOW_SECONDS || 15 * 60),
    keyGenerator: (req) => `${clientIp(req)}:${normalizeEmail(req.body?.email)}`,
  }),
  cadastro: redisRateLimit({
    name: 'auth-cadastro',
    max: Number(process.env.RATE_LIMIT_REGISTER_MAX || 5),
    windowSeconds: Number(process.env.RATE_LIMIT_REGISTER_WINDOW_SECONDS || 60 * 60),
  }),
  recuperarSenhaIp: redisRateLimit({
    name: 'auth-recuperar-ip',
    max: Number(process.env.RATE_LIMIT_PASSWORD_RESET_IP_MAX || 5),
    windowSeconds: Number(process.env.RATE_LIMIT_PASSWORD_RESET_WINDOW_SECONDS || 60 * 60),
  }),
  recuperarSenhaEmail: redisRateLimit({
    name: 'auth-recuperar-email',
    max: Number(process.env.RATE_LIMIT_PASSWORD_RESET_EMAIL_MAX || 3),
    windowSeconds: Number(process.env.RATE_LIMIT_PASSWORD_RESET_WINDOW_SECONDS || 60 * 60),
    keyGenerator: (req) => normalizeEmail(req.body?.email),
  }),
  reenviarCodigo: redisRateLimit({
    name: 'auth-reenviar-codigo',
    max: Number(process.env.RATE_LIMIT_VERIFY_CODE_MAX || 3),
    windowSeconds: Number(process.env.RATE_LIMIT_VERIFY_CODE_WINDOW_SECONDS || 15 * 60),
    keyGenerator: (req) => `${clientIp(req)}:${normalizeEmail(req.body?.email)}`,
  }),
  upload: redisRateLimit({
    name: 'uploads',
    max: Number(process.env.RATE_LIMIT_UPLOAD_MAX || 20),
    windowSeconds: Number(process.env.RATE_LIMIT_UPLOAD_WINDOW_SECONDS || 60 * 60),
    keyGenerator: (req) => req.userId || clientIp(req),
  }),
}

module.exports = {
  rateLimiters,
  redisRateLimit,
}
