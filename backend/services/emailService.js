const nodemailer = require('nodemailer')

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.EMAIL_FROM
  )
}

function createTransporter() {
  if (!isEmailConfigured()) {
    throw new Error('Envio de email nao configurado')
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function sendVerificationEmail({ to, name, code }) {
  const transporter = createTransporter()
  const safeName = escapeHtml(name)
  const safeCode = escapeHtml(code)

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Seu codigo de verificacao',
    text: `Ola, ${name}. Seu codigo de verificacao e ${code}. Ele expira em 15 minutos.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #172033;">
        <h2>Verificacao de email</h2>
        <p>Ola, ${safeName}.</p>
        <p>Use o codigo abaixo para verificar sua conta:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${safeCode}</p>
        <p>Este codigo expira em 15 minutos.</p>
      </div>
    `,
  })
}

async function sendPasswordResetEmail({ to, name, token }) {
  const transporter = createTransporter()
  const safeName = escapeHtml(name)
  const safeToken = escapeHtml(token)

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Recuperacao de senha',
    text: `Ola, ${name}. Use este codigo para redefinir sua senha: ${token}. Ele expira em 15 minutos.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #172033;">
        <h2>Recuperacao de senha</h2>
        <p>Ola, ${safeName}.</p>
        <p>Use o codigo abaixo para redefinir sua senha:</p>
        <p style="font-size: 24px; font-weight: 700; letter-spacing: 2px;">${safeToken}</p>
        <p>Este codigo expira em 15 minutos. Se voce nao solicitou, ignore esta mensagem.</p>
      </div>
    `,
  })
}

module.exports = {
  isEmailConfigured,
  sendPasswordResetEmail,
  sendVerificationEmail,
}
