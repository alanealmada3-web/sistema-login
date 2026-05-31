const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
const { createServer } = require('http')

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const authRoutes = require('./routes/auth')
const ticketRoutes = require('./routes/tickets')
const auditRoutes = require('./routes/audit')
const { setupChatGateway } = require('./services/chatGateway')
const { zeroTrustPolicy } = require('./middlewares/zeroTrustPolicy')

const app = express()
const httpServer = createServer(app)
const port = process.env.PORT || 3000
const clientOrigins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

function isAllowedOrigin(origin) {
    return !origin || clientOrigins.includes(origin)
}

app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https://lh3.googleusercontent.com', 'https://graph.microsoft.com'],
            styleSrc: ["'self'"],
            scriptSrc: ["'self'"],
            connectSrc: [
                "'self'",
                'ws:',
                'wss:',
                'https://accounts.google.com',
                'https://oauth2.googleapis.com',
                'https://login.microsoftonline.com',
                'https://graph.microsoft.com',
            ],
            formAction: ["'self'", 'https://accounts.google.com', 'https://login.microsoftonline.com'],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
        },
    },
    referrerPolicy: { policy: 'no-referrer' },
}))
app.use(cors({
    origin(origin, callback) {
        if (isAllowedOrigin(origin)) return callback(null, true)
        return callback(new Error('Origem nao permitida pelo CORS'))
    },
    credentials: true,
}))
app.use(express.json())
app.use(express.static(path.resolve(__dirname, '../public')))
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')))
app.use('/auth', zeroTrustPolicy('auth'), authRoutes)
app.use('/tickets', zeroTrustPolicy('helpdesk'), ticketRoutes)
app.use('/audit', zeroTrustPolicy('audit'), auditRoutes)

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB conectado!')
})
.catch((err) => {
    console.log(err)
})

app.get('/', (req, res) => {
    res.send('Servidor funcionando!')
})

setupChatGateway(httpServer, clientOrigins)

httpServer.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})
