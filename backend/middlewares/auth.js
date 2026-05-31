const jwt = require('jsonwebtoken')
const { getAuthTokenFromRequest } = require('../utils/authSession')

function authMiddleware(req, res, next) {
  const token = getAuthTokenFromRequest(req)

  if (!token) {
    return res.status(401).json({
      mensagem: 'Sessao nao informada',
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    req.userPerfil = decoded.perfil
    return next()
  } catch (error) {
    return res.status(401).json({
      mensagem: 'Token invalido',
    })
  }
}

module.exports = authMiddleware
