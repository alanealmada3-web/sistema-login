const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const root = path.resolve(__dirname, '..')

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

test('cadastro publico sempre cria funcionario e email nao verificado', () => {
  const auth = read('backend/routes/auth.js')

  assert.match(auth, /perfil:\s*'funcionario'/)
  assert.match(auth, /emailVerificado:\s*false/)
  assert.doesNotMatch(auth, /perfil:\s*req\.body\.perfil/)
})

test('login local bloqueia email nao verificado', () => {
  const auth = read('backend/routes/auth.js')

  assert.match(auth, /if\s*\(!usuario\.emailVerificado\)/)
  assert.match(auth, /precisaVerificarEmail:\s*true/)
})

test('refresh token usa persistencia MongoDB e rotacao', () => {
  const auth = read('backend/routes/auth.js')
  const store = read('backend/services/refreshTokenStore.js')
  const model = read('backend/models/RefreshToken.js')

  assert.match(auth, /rotateRefreshToken\(refreshToken,\s*req\)/)
  assert.doesNotMatch(auth, /consumeRefreshToken/)
  assert.match(store, /RefreshToken\.findOne/)
  assert.match(store, /replacedByTokenHash/)
  assert.match(model, /familyId/)
})

test('rate limit cobre endpoints sensiveis e usa express-rate-limit', () => {
  const auth = read('backend/routes/auth.js')
  const tickets = read('backend/routes/tickets.js')
  const limiter = read('backend/middlewares/redisRateLimit.js')

  assert.match(limiter, /express-rate-limit/)
  assert.match(auth, /router\.post\('\/login',\s*rateLimiters\.login/)
  assert.match(auth, /router\.post\('\/cadastro',\s*rateLimiters\.cadastro/)
  assert.match(auth, /router\.post\('\/recuperar-senha',\s*rateLimiters\.recuperarSenhaIp,\s*rateLimiters\.recuperarSenhaEmail/)
  assert.match(auth, /router\.post\('\/reenviar-codigo',\s*rateLimiters\.reenviarCodigo/)
  assert.match(tickets, /rateLimiters\.upload/)
  assert.doesNotMatch(limiter, /Rate limiting indisponivel/)
  assert.match(limiter, /RATE_LIMIT_DISABLED/)
})

test('uploads validam assinatura real de imagem', () => {
  const secureUpload = read('backend/utils/secureUpload.js')
  const auth = read('backend/routes/auth.js')
  const tickets = read('backend/routes/tickets.js')

  assert.match(secureUpload, /fileTypeFromBuffer/)
  assert.match(secureUpload, /allowedImageMimes/)
  assert.match(auth, /createImageUpload/)
  assert.match(tickets, /createImageUpload/)
})

test('perfil nao retorna historico nem segredos', () => {
  const auth = read('backend/routes/auth.js')
  const perfilRoute = auth.slice(auth.indexOf("router.get('/perfil'"), auth.indexOf("router.put('/perfil'"))

  assert.doesNotMatch(perfilRoute, /historico/)
  assert.doesNotMatch(perfilRoute, /codigoVerificacao|resetSenhaToken|senha/)
})
