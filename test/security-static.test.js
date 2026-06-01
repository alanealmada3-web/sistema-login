const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const root = path.resolve(__dirname, '..')

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

test('cadastro publico decide perfil apenas pelo modo permitido', () => {
  const auth = read('backend/routes/auth.js')

  assert.match(auth, /function resolveRegistrationProfile\(modoCadastro\)/)
  assert.match(auth, /if\s*\(modoCadastro === 'ti'\)/)
  assert.match(auth, /return 'n1'/)
  assert.match(auth, /return 'funcionario'/)
  assert.match(auth, /perfilCadastro = resolveRegistrationProfile\(req\.body\.modoCadastro\)/)
  assert.match(auth, /console\.log\('modoCadastro:',\s*req\.body\.modoCadastro\)/)
  assert.match(auth, /emailVerificado:\s*true/)
  assert.doesNotMatch(auth, /perfil:\s*req\.body\.perfil/)
  assert.match(auth, /Senha local adicionada a conta Google/)
  assert.match(auth, /console\.error\('Erro real:',\s*error\)/)
  assert.match(auth, /console\.error\('Erro cadastro:',\s*error\)/)
  assert.match(auth, /async function sendOrExposeVerificationCode/)
})

test('frontend envia modoCadastro e nao expõe select livre de perfil', () => {
  const app = read('public/app.js')
  const html = read('public/index.html')

  assert.match(html, /name="modoCadastro"/)
  assert.doesNotMatch(html, /name="perfil"/)
  assert.match(app, /function getActiveRegistrationMode\(\)/)
  assert.match(app, /formData\.modoCadastro = getActiveRegistrationMode\(\)/)
  assert.match(app, /delete formData\.perfil/)
})

test('login local nao bloqueia email nao verificado temporariamente', () => {
  const auth = read('backend/routes/auth.js')
  const loginRoute = auth.slice(auth.indexOf("router.post('/login'"), auth.indexOf("router.post('/recuperar-senha'"))

  assert.doesNotMatch(loginRoute, /if\s*\(!usuario\.emailVerificado\)/)
  assert.doesNotMatch(loginRoute, /precisaVerificarEmail:\s*true/)
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

test('fila de ti mantem historico visivel na listagem', () => {
  const tickets = read('backend/routes/tickets.js')
  const app = read('public/app.js')

  assert.match(tickets, /'timeline\.autor': usuario\._id/)
  assert.match(tickets, /console\.log\('Perfil:', usuario\.perfil\)/)
  assert.match(tickets, /console\.log\('Filtro tickets:', filter\)/)
  assert.match(tickets, /router\.get\('\/historico'/)
  assert.match(tickets, /console\.error\('Erro real:',\s*error\)/)
  assert.match(tickets, /\{ fila: 'n1' \}/)
  assert.match(tickets, /\{ fila: 'n2' \}/)
  assert.doesNotMatch(tickets, /\{ fila: 'n1', responsavel: null, status: \{ \$in: \['aberto', 'triagem'\] \} \}/)
  assert.doesNotMatch(tickets, /\.limit\(120\)/)
  assert.match(app, /function resetTicketFilters\(\)/)
  assert.match(app, /resetTicketFilters\(\)\n\s*await loadTickets\(false\)/)
  assert.match(app, /resetTicketFilters\(\)\n\s*await loadTickets\(true\)/)
})

test('smtp usa variaveis corretas do render', () => {
  const emailService = read('backend/services/emailService.js')

  assert.match(emailService, /process\.env\.SMTP_USER/)
  assert.match(emailService, /process\.env\.SMTP_PASS/)
  assert.match(emailService, /process\.env\.EMAIL_FROM/)
  assert.doesNotMatch(emailService, /EMAIL_USER|EMAIL_PASS/)
})

test('perfil nao retorna historico nem segredos', () => {
  const auth = read('backend/routes/auth.js')
  const perfilRoute = auth.slice(auth.indexOf("router.get('/perfil'"), auth.indexOf("router.put('/perfil'"))

  assert.doesNotMatch(perfilRoute, /historico/)
  assert.doesNotMatch(perfilRoute, /codigoVerificacao|resetSenhaToken|senha/)
})
