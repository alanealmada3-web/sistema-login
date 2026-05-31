const express = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const path = require('path')
const { OAuth2Client } = require('google-auth-library')

const User = require('../models/User')
const authMiddleware = require('../middlewares/auth')
const { rateLimiters } = require('../middlewares/redisRateLimit')
const { isEmailConfigured, sendPasswordResetEmail, sendVerificationEmail } = require('../services/emailService')
const { registerLoginAudit } = require('../services/auditService')
const { createRefreshToken, revokeRefreshToken, revokeUserRefreshTokens, rotateRefreshToken } = require('../services/refreshTokenStore')
const { writeSecurityEvent } = require('../services/securityLogService')
const {
  verifyMicrosoftIdToken,
} = require('../services/microsoftOidcService')
const {
  clearAuthCookie,
  getRefreshTokenFromRequest,
  setAuthCookie,
  setRefreshCookie,
} = require('../utils/authSession')
const { createImageUpload } = require('../utils/secureUpload')

const router = express.Router()
const uploadsDir = path.resolve(__dirname, '../../uploads')

const uploadProfilePhoto = createImageUpload({
  fieldName: 'foto',
  destinationDir: uploadsDir,
  maxSizeBytes: Number(process.env.PROFILE_UPLOAD_MAX_BYTES || 2 * 1024 * 1024),
  filenamePrefix: (req) => req.userId,
})

function getGoogleOAuthClient() {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL || 'http://127.0.0.1:3000/auth/google/callback'
  )
}

function isGoogleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

function createAuthToken(usuario) {
  return jwt.sign(
    { id: usuario._id, perfil: usuario.perfil },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_TTL || '15m' }
  )
}

async function setSessionCookies(req, res, usuario) {
  const token = createAuthToken(usuario)
  const refresh = await createRefreshToken(usuario._id, req)

  setAuthCookie(res, token)
  setRefreshCookie(res, refresh.token)
}

function addHistory(usuario, acao) {
  usuario.historico.unshift({ acao })
  usuario.historico = usuario.historico.slice(0, 20)
}

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase()
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateRegisterData({ nome, email, senha }) {
  const normalizedName = String(nome || '').trim()
  const normalizedEmail = normalizeEmail(email)
  const password = String(senha || '')

  if (normalizedName.length < 2 || normalizedName.length > 80) {
    return 'O nome deve ter entre 2 e 80 caracteres'
  }

  if (!isValidEmail(normalizedEmail)) {
    return 'Informe um email valido'
  }

  if (password.length < 8) {
    return 'A senha deve ter no minimo 8 caracteres'
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'A senha deve conter letras e numeros'
  }

  return ''
}

function publicUser(usuario) {
  return {
    id: usuario._id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    emailVerificado: Boolean(usuario.emailVerificado),
  }
}

function createVerificationCode() {
  return crypto.randomInt(100000, 999999).toString()
}

function getVerificationExpiration() {
  return new Date(Date.now() + 15 * 60 * 1000)
}

function createPasswordResetToken() {
  return crypto.randomBytes(24).toString('hex')
}

function getPasswordResetExpiration() {
  return new Date(Date.now() + 15 * 60 * 1000)
}

async function setVerificationCode(usuario) {
  const codigoVerificacao = createVerificationCode()
  usuario.codigoVerificacao = await bcrypt.hash(codigoVerificacao, 10)
  usuario.codigoVerificacaoExpiraEm = getVerificationExpiration()
  return codigoVerificacao
}

async function sendOrExposeVerificationCode(usuario, codigoVerificacao) {
  if (!isEmailConfigured()) {
    return { emailEnviado: false }
  }

  await sendVerificationEmail({
    to: usuario.email,
    name: usuario.nome,
    code: codigoVerificacao,
  })
  return { emailEnviado: true }
}

async function requireProfileAdmin(req, res, next) {
  const usuario = await User.findById(req.userId).select('perfil')

  if (!usuario || usuario.perfil !== 'gestor') {
    return res.status(403).json({ mensagem: 'Apenas administradores podem alterar perfis' })
  }

  return next()
}

router.post('/cadastro', rateLimiters.cadastro, async (req, res) => {
  try {
    const { nome, senha } = req.body
    const email = normalizeEmail(req.body.email)
    const validationError = validateRegisterData({ nome, email, senha })

    if (validationError) {
      return res.status(400).json({
        mensagem: validationError,
      })
    }

    const usuarioExiste = await User.findOne({ email })

    if (usuarioExiste) {
      return res.status(400).json({
        mensagem: 'Email ja cadastrado',
      })
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10)

    const novoUsuario = new User({
      nome: String(nome).trim(),
      email,
      senha: senhaCriptografada,
      perfil: 'funcionario',
      emailVerificado: false,
      historico: [{ acao: 'Conta criada' }],
    })

    const codigoVerificacao = await setVerificationCode(novoUsuario)
    await novoUsuario.save()
    let emailStatus = { emailEnviado: false }

    try {
      emailStatus = await sendOrExposeVerificationCode(novoUsuario, codigoVerificacao)
    } catch (emailError) {
      console.error('Erro envio codigo cadastro:', emailError)
    }

    return res.status(201).json({
      mensagem: emailStatus.emailEnviado
        ? 'Usuario cadastrado com sucesso. Verifique seu email antes de entrar.'
        : 'Usuario cadastrado, mas nao foi possivel enviar o email de verificacao. Tente reenviar o codigo mais tarde.',
      email,
      usuario: publicUser(novoUsuario),
      precisaVerificarEmail: true,
      emailEnviado: emailStatus.emailEnviado,
    })
  } catch (error) {
    console.error('Erro cadastro:', error)

    if (error?.code === 11000) {
      return res.status(400).json({
        mensagem: 'Email ja cadastrado',
      })
    }

    return res.status(500).json({
      mensagem: 'Erro ao cadastrar usuario',
    })
  }
})

router.post('/verificar-email', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const codigo = String(req.body.codigo || '').trim()

    if (!isValidEmail(email) || !/^\d{6}$/.test(codigo)) {
      return res.status(400).json({
        mensagem: 'Codigo de verificacao invalido',
      })
    }

    const usuario = await User.findOne({ email })

    if (!usuario) {
      return res.status(400).json({
        mensagem: 'Codigo de verificacao invalido',
      })
    }

    if (usuario.emailVerificado) {
      return res.json({
        mensagem: 'Email ja verificado',
      })
    }

    if (!usuario.codigoVerificacao || usuario.codigoVerificacaoExpiraEm < new Date()) {
      return res.status(400).json({
        mensagem: 'Codigo expirado. Solicite um novo codigo.',
      })
    }

    const codigoValido = await bcrypt.compare(codigo, usuario.codigoVerificacao)

    if (!codigoValido) {
      return res.status(400).json({
        mensagem: 'Codigo de verificacao invalido',
      })
    }

    usuario.emailVerificado = true
    usuario.codigoVerificacao = null
    usuario.codigoVerificacaoExpiraEm = null
    addHistory(usuario, 'Email verificado')
    await usuario.save()

    return res.json({
      mensagem: 'Email verificado com sucesso',
    })
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao verificar email',
    })
  }
})

router.post('/reenviar-codigo', rateLimiters.reenviarCodigo, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)

    if (!isValidEmail(email)) {
      return res.status(400).json({
        mensagem: 'Informe um email valido',
      })
    }

    const usuario = await User.findOne({ email })

    if (!usuario) {
      return res.json({
        mensagem: 'Se o email existir, um novo codigo sera enviado',
      })
    }

    if (usuario.emailVerificado) {
      return res.json({
        mensagem: 'Email ja verificado',
      })
    }

    if (!isEmailConfigured()) {
      return res.status(500).json({
        mensagem: 'Envio de email nao configurado. Configure o SMTP no arquivo .env.',
      })
    }

    const codigoVerificacao = createVerificationCode()
    usuario.codigoVerificacao = await bcrypt.hash(codigoVerificacao, 10)
    usuario.codigoVerificacaoExpiraEm = getVerificationExpiration()
    await usuario.save()

    await sendVerificationEmail({
      to: usuario.email,
      name: usuario.nome,
      code: codigoVerificacao,
    })

    return res.json({
      mensagem: 'Novo codigo enviado',
    })
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao reenviar codigo',
    })
  }
})

router.post('/login', rateLimiters.login, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const senha = String(req.body.senha || '')

    if (!isValidEmail(email) || !senha) {
      await registerLoginAudit(req, {
        email,
        status: 'falha',
        motivo: 'Credenciais invalidas',
        provedor: 'local',
      })
      return res.status(400).json({
        mensagem: 'Email ou senha incorretos',
      })
    }

    const usuario = await User.findOne({ email })

    if (!usuario) {
      await registerLoginAudit(req, {
        email,
        status: 'falha',
        motivo: 'Usuario nao encontrado',
        provedor: 'local',
      })
      return res.status(400).json({
        mensagem: 'Email ou senha incorretos',
      })
    }

    if (!usuario.senha) {
      await registerLoginAudit(req, {
        usuario,
        email,
        status: 'falha',
        motivo: 'Conta sem senha local',
        provedor: 'local',
      })
      return res.status(400).json({
        mensagem: 'Email ou senha incorretos',
      })
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha)

    if (!senhaValida) {
      await registerLoginAudit(req, {
        usuario,
        email,
        status: 'falha',
        motivo: 'Senha incorreta',
        provedor: 'local',
      })
      return res.status(400).json({
        mensagem: 'Email ou senha incorretos',
      })
    }

    if (!usuario.emailVerificado) {
      await registerLoginAudit(req, {
        usuario,
        email,
        status: 'falha',
        motivo: 'Email nao verificado',
        provedor: 'local',
      })
      return res.status(403).json({
        mensagem: 'Verifique seu email antes de entrar',
        precisaVerificarEmail: true,
        email: usuario.email,
      })
    }

    await setSessionCookies(req, res, usuario)
    addHistory(usuario, 'Login realizado')
    await usuario.save()
    await registerLoginAudit(req, {
      usuario,
      email,
      status: 'sucesso',
      motivo: 'Login local realizado',
      provedor: 'local',
    })
    await writeSecurityEvent(req, {
      event: 'login_local',
      status: 'sucesso',
      userId: usuario._id,
      email,
      reason: 'Login local realizado',
      provider: 'local',
      metadata: { perfil: usuario.perfil },
    })

    return res.json({
      mensagem: 'Login realizado com sucesso',
      usuario: publicUser(usuario),
    })
  } catch (error) {
    await registerLoginAudit(req, {
      email: normalizeEmail(req.body.email),
      status: 'falha',
      motivo: 'Erro interno no login local',
      provedor: 'local',
    })
    return res.status(500).json({
      mensagem: 'Erro ao fazer login',
    })
  }
})

router.post('/recuperar-senha', rateLimiters.recuperarSenhaIp, rateLimiters.recuperarSenhaEmail, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)

    if (!isValidEmail(email)) {
      return res.status(400).json({
        mensagem: 'Informe um email valido',
      })
    }

    const usuario = await User.findOne({ email })

    if (!usuario) {
      return res.json({
        mensagem: 'Se o email existir, enviaremos instrucoes para recuperar a senha.',
      })
    }

    if (!usuario.senha) {
      return res.status(400).json({
        mensagem: 'Esta conta usa login corporativo. Redefina o acesso pelo provedor da conta.',
      })
    }

    const resetToken = createPasswordResetToken()
    usuario.resetSenhaToken = await bcrypt.hash(resetToken, 10)
    usuario.resetSenhaExpiraEm = getPasswordResetExpiration()
    addHistory(usuario, 'Recuperacao de senha solicitada')
    await usuario.save()

    if (!isEmailConfigured()) {
      usuario.resetSenhaToken = null
      usuario.resetSenhaExpiraEm = null
      await usuario.save()
      return res.status(500).json({
        mensagem: 'Envio de email nao configurado. Configure o SMTP no arquivo .env.',
      })
    }

    await sendPasswordResetEmail({
      to: usuario.email,
      name: usuario.nome,
      token: resetToken,
    })

    return res.json({
      mensagem: 'Enviamos as instrucoes de recuperacao para o email informado.',
    })
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao solicitar recuperacao de senha',
    })
  }
})

router.post('/redefinir-senha', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const token = String(req.body.token || '').trim()
    const novaSenha = String(req.body.novaSenha || '')

    if (!isValidEmail(email) || !token) {
      return res.status(400).json({
        mensagem: 'Informe email e codigo de recuperacao validos',
      })
    }

    if (novaSenha.length < 8 || !/[A-Za-z]/.test(novaSenha) || !/[0-9]/.test(novaSenha)) {
      return res.status(400).json({
        mensagem: 'A nova senha deve ter no minimo 8 caracteres, com letras e numeros',
      })
    }

    const usuario = await User.findOne({ email })

    if (!usuario || !usuario.resetSenhaToken || !usuario.resetSenhaExpiraEm) {
      return res.status(400).json({
        mensagem: 'Codigo de recuperacao invalido ou expirado',
      })
    }

    if (usuario.resetSenhaExpiraEm < new Date()) {
      usuario.resetSenhaToken = null
      usuario.resetSenhaExpiraEm = null
      await usuario.save()
      return res.status(400).json({
        mensagem: 'Codigo de recuperacao expirado. Solicite um novo codigo.',
      })
    }

    const tokenValido = await bcrypt.compare(token, usuario.resetSenhaToken)

    if (!tokenValido) {
      return res.status(400).json({
        mensagem: 'Codigo de recuperacao invalido ou expirado',
      })
    }

    usuario.senha = await bcrypt.hash(novaSenha, 10)
    usuario.resetSenhaToken = null
    usuario.resetSenhaExpiraEm = null
    usuario.emailVerificado = true
    addHistory(usuario, 'Senha redefinida por recuperacao')
    await usuario.save()
    await revokeUserRefreshTokens(usuario._id)

    await writeSecurityEvent(req, {
      event: 'password_reset',
      status: 'sucesso',
      userId: usuario._id,
      email,
      reason: 'Senha redefinida por recuperacao',
      provider: 'local',
      metadata: { perfil: usuario.perfil },
    })

    return res.json({
      mensagem: 'Senha redefinida com sucesso. Entre com a nova senha.',
    })
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao redefinir senha',
    })
  }
})

router.post('/oidc/microsoft', async (req, res) => {
  const idToken = String(req.body.idToken || req.body.id_token || '').trim()
  let auditEmail = ''

  try {
    if (!idToken) {
      await registerLoginAudit(req, {
        email: 'token-nao-informado',
        status: 'falha',
        motivo: 'Token OIDC nao informado',
        provedor: 'microsoft_entra',
      })
      return res.status(400).json({
        mensagem: 'Token OIDC nao informado',
      })
    }

    const claims = await verifyMicrosoftIdToken(idToken)
    const email = normalizeEmail(claims.email || claims.preferred_username)
    auditEmail = email

    if (!isValidEmail(email)) {
      await registerLoginAudit(req, {
        email,
        status: 'falha',
        motivo: 'Email corporativo invalido no token',
        provedor: 'microsoft_entra',
      })
      return res.status(400).json({
        mensagem: 'Token sem email corporativo valido',
      })
    }

    const nome = String(claims.name || email.split('@')[0]).trim()
    let usuario = await User.findOne({ email })

    if (!usuario) {
      usuario = await User.create({
        nome,
        email,
        senha: null,
        provedor: 'microsoft_entra',
        perfil: 'funcionario',
        emailVerificado: true,
        historico: [{ acao: 'Conta criada via Microsoft Entra ID' }],
      })
    } else {
      usuario.nome = usuario.nome || nome
      usuario.emailVerificado = true
      addHistory(usuario, 'Login via Microsoft Entra ID')
      await usuario.save()
    }

    await setSessionCookies(req, res, usuario)
    await registerLoginAudit(req, {
      usuario,
      email,
      status: 'sucesso',
      motivo: 'Login SSO Microsoft Entra ID realizado',
      provedor: 'microsoft_entra',
    })
    await writeSecurityEvent(req, {
      event: 'login_sso',
      status: 'sucesso',
      userId: usuario._id,
      email,
      reason: 'Login SSO Microsoft Entra ID realizado',
      provider: 'microsoft_entra',
      metadata: { perfil: usuario.perfil },
    })

    return res.json({
      mensagem: 'Login corporativo realizado com sucesso',
      usuario: publicUser(usuario),
    })
  } catch (error) {
    await registerLoginAudit(req, {
      email: auditEmail || 'token-invalido',
      status: 'falha',
      motivo: error.message || 'Falha na validacao OIDC',
      provedor: 'microsoft_entra',
    })
    return res.status(401).json({
      mensagem: 'Token corporativo invalido',
    })
  }
})

router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req) || req.body.refreshToken
    const rotation = await rotateRefreshToken(refreshToken, req)

    if (!rotation.ok) {
      await writeSecurityEvent(req, {
        event: 'refresh_token',
        status: 'falha',
        userId: rotation.userId,
        reason: rotation.reuseDetected
          ? 'Reutilizacao de refresh token detectada; sessao revogada'
          : 'Refresh token ausente, expirado ou ja utilizado',
        provider: 'session',
      })
      clearAuthCookie(res)
      return res.status(401).json({ mensagem: 'Sessao expirada' })
    }

    const usuario = await User.findById(rotation.userId)

    if (!usuario) {
      clearAuthCookie(res)
      return res.status(401).json({ mensagem: 'Usuario nao encontrado' })
    }

    const token = createAuthToken(usuario)
    setAuthCookie(res, token)
    setRefreshCookie(res, rotation.token)
    await writeSecurityEvent(req, {
      event: 'refresh_token',
      status: 'sucesso',
      userId: usuario._id,
      email: usuario.email,
      reason: 'Sessao renovada',
      provider: 'session',
      metadata: { perfil: usuario.perfil },
    })

    return res.json({ mensagem: 'Sessao renovada', usuario: publicUser(usuario) })
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao renovar sessao' })
  }
})

router.post('/logout', async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req) || req.body.refreshToken
  await revokeRefreshToken(refreshToken)
  clearAuthCookie(res)
  return res.json({
    mensagem: 'Logout realizado com sucesso',
  })
})

router.get('/google', (req, res) => {
  if (!isGoogleConfigured()) {
    return res.redirect('/?authError=google_not_configured')
  }

  const client = getGoogleOAuthClient()
  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'select_account',
    scope: ['openid', 'email', 'profile'],
  })

  return res.redirect(url)
})

router.get('/google/callback', async (req, res) => {
  try {
    if (!isGoogleConfigured()) {
      return res.status(500).send('Login com Google nao configurado.')
    }

    const { code } = req.query

    if (!code) {
      return res.status(400).send('Codigo do Google nao informado.')
    }

    const client = getGoogleOAuthClient()
    const { tokens } = await client.getToken(String(code))
    client.setCredentials(tokens)

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    if (!payload || !payload.email) {
      return res.status(400).send('Nao foi possivel obter o email da conta Google.')
    }

    const email = normalizeEmail(payload.email)
    let usuario = await User.findOne({ email })

    if (!usuario) {
      usuario = await User.create({
        nome: payload.name || email.split('@')[0],
        email,
        googleId: payload.sub,
        provedor: 'google',
        perfil: 'funcionario',
        emailVerificado: true,
        historico: [{ acao: 'Conta criada com Google' }],
      })
    } else {
      usuario.googleId = usuario.googleId || payload.sub
      usuario.emailVerificado = true
      usuario.provedor = usuario.provedor || 'google'
      addHistory(usuario, 'Login com Google')
      await usuario.save()
    }

    await setSessionCookies(req, res, usuario)

    return res.redirect('/')
  } catch (error) {
    return res.redirect('/?authError=google_login_failed')
  }
})

router.get('/perfil', authMiddleware, async (req, res) => {
  try {
    const usuario = await User.findById(req.userId).select(
      'nome email fotoPerfil bio provedor perfil createdAt emailVerificado'
    )

    if (!usuario) {
      return res.status(404).json({
        mensagem: 'Usuario nao encontrado',
      })
    }

    return res.json({
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      fotoPerfil: usuario.fotoPerfil,
      bio: usuario.bio,
      provedor: usuario.provedor,
      perfil: usuario.perfil,
      criadoEm: usuario.createdAt,
      emailVerificado: usuario.emailVerificado,
    })
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao buscar perfil',
    })
  }
})

router.put('/perfil', authMiddleware, async (req, res) => {
  try {
    const nome = String(req.body.nome || '').trim()
    const bio = String(req.body.bio || '').trim()

    if (nome.length < 2 || nome.length > 80) {
      return res.status(400).json({
        mensagem: 'O nome deve ter entre 2 e 80 caracteres',
      })
    }

    if (bio.length > 180) {
      return res.status(400).json({
        mensagem: 'A bio deve ter no maximo 180 caracteres',
      })
    }

    const usuario = await User.findById(req.userId)

    if (!usuario) {
      return res.status(404).json({
        mensagem: 'Usuario nao encontrado',
      })
    }

    usuario.nome = nome
    usuario.bio = bio
    addHistory(usuario, 'Perfil atualizado')
    await usuario.save()

    return res.json({
      mensagem: 'Perfil atualizado com sucesso',
    })
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao atualizar perfil',
    })
  }
})

router.put('/trocar-senha', authMiddleware, async (req, res) => {
  try {
    const senhaAtual = String(req.body.senhaAtual || '')
    const novaSenha = String(req.body.novaSenha || '')

    if (novaSenha.length < 8 || !/[A-Za-z]/.test(novaSenha) || !/[0-9]/.test(novaSenha)) {
      return res.status(400).json({
        mensagem: 'A nova senha deve ter no minimo 8 caracteres, com letras e numeros',
      })
    }

    const usuario = await User.findById(req.userId)

    if (!usuario) {
      return res.status(404).json({
        mensagem: 'Usuario nao encontrado',
      })
    }

    if (!usuario.senha) {
      return res.status(400).json({
        mensagem: 'Contas Google nao possuem senha local para trocar',
      })
    }

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha)

    if (!senhaValida) {
      return res.status(400).json({
        mensagem: 'Senha atual incorreta',
      })
    }

    usuario.senha = await bcrypt.hash(novaSenha, 10)
    addHistory(usuario, 'Senha alterada')
    await usuario.save()
    await revokeUserRefreshTokens(usuario._id)

    return res.json({
      mensagem: 'Senha alterada com sucesso',
    })
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao trocar senha',
    })
  }
})

router.post('/perfil/foto', authMiddleware, rateLimiters.upload, uploadProfilePhoto, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        mensagem: 'Selecione uma imagem',
      })
    }

    const usuario = await User.findById(req.userId)

    if (!usuario) {
      return res.status(404).json({
        mensagem: 'Usuario nao encontrado',
      })
    }

    usuario.fotoPerfil = `/uploads/${req.file.filename}`
    addHistory(usuario, 'Foto de perfil atualizada')
    await usuario.save()

    return res.json({
      mensagem: 'Foto atualizada com sucesso',
      fotoPerfil: usuario.fotoPerfil,
    })
  } catch (error) {
    return res.status(500).json({
      mensagem: error.message || 'Erro ao enviar foto',
    })
  }
})

router.get('/usuarios-suporte', authMiddleware, async (req, res) => {
  try {
    const usuario = await User.findById(req.userId)

    if (!usuario || !['n1', 'n2', 'gestor'].includes(usuario.perfil)) {
      return res.status(403).json({
        mensagem: 'Sem permissao para listar usuarios de suporte',
      })
    }

    const usuarios = await User.find({ perfil: { $in: ['n1', 'n2', 'gestor'] } })
      .select('nome email perfil')
      .sort({ perfil: 1, nome: 1 })

    return res.json(usuarios.map((item) => publicUser(item)))
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao listar usuarios de suporte',
    })
  }
})

router.put('/usuarios/:id/perfil', authMiddleware, requireProfileAdmin, async (req, res) => {
  try {
    const perfil = String(req.body.perfil || '').trim()

    if (!['funcionario', 'n1', 'n2', 'gestor'].includes(perfil)) {
      return res.status(400).json({ mensagem: 'Perfil invalido' })
    }

    const usuario = await User.findById(req.params.id)

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuario nao encontrado' })
    }

    usuario.perfil = perfil
    addHistory(usuario, `Perfil alterado para ${perfil}`)
    await usuario.save()

    return res.json({
      mensagem: 'Perfil atualizado com sucesso',
      usuario: publicUser(usuario),
    })
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao atualizar perfil do usuario' })
  }
})

module.exports = router
