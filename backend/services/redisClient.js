const { createClient } = require('redis')

let clientPromise = null

function isRedisRequired() {
  return process.env.REQUIRE_REDIS === 'true' || process.env.NODE_ENV === 'production'
}

async function getRedisClient() {
  if (!process.env.REDIS_URL) {
    if (isRedisRequired()) {
      throw new Error('REDIS_URL obrigatorio para rate limiting distribuido')
    }
    return null
  }

  if (!clientPromise) {
    const client = createClient({ url: process.env.REDIS_URL })
    client.on('error', (error) => {
      console.error('Redis error:', error.message)
    })
    clientPromise = client.connect().then(() => client)
  }

  return clientPromise
}

module.exports = {
  getRedisClient,
  isRedisRequired,
}
