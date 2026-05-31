const crypto = require('crypto')
const fs = require('fs/promises')
const path = require('path')

const multer = require('multer')

const allowedImageMimes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
const extensionByMime = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

async function detectFileType(buffer) {
  const { fileTypeFromBuffer } = await import('file-type')
  return fileTypeFromBuffer(buffer)
}

function createSafeFilename(prefix, mime) {
  const cleanPrefix = String(prefix || 'upload').replace(/[^a-zA-Z0-9_-]/g, '')
  const suffix = crypto.randomBytes(16).toString('hex')
  return `${cleanPrefix}-${Date.now()}-${suffix}${extensionByMime[mime]}`
}

function buildMulter({ maxSizeBytes, maxFiles }) {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxSizeBytes,
      files: maxFiles,
    },
  })
}

function handleMulterError(error, res, maxSizeBytes) {
  if (!error) return false

  if (error instanceof multer.MulterError) {
    res.status(400).json({
      mensagem: `Arquivo invalido ou maior que ${Math.floor(maxSizeBytes / 1024 / 1024)} MB`,
    })
    return true
  }

  res.status(400).json({ mensagem: error.message || 'Erro ao enviar arquivo' })
  return true
}

async function persistImage(file, destinationDir, filenamePrefix) {
  const detected = await detectFileType(file.buffer)

  if (!detected || !allowedImageMimes.has(detected.mime)) {
    throw new Error('Envie apenas imagens reais nos formatos PNG, JPG, WEBP ou GIF')
  }

  const filename = createSafeFilename(filenamePrefix, detected.mime)
  const filePath = path.join(destinationDir, filename)

  await fs.mkdir(destinationDir, { recursive: true })
  await fs.writeFile(filePath, file.buffer, { flag: 'wx' })

  return {
    ...file,
    buffer: undefined,
    filename,
    path: filePath,
    mimetype: detected.mime,
    size: file.size,
  }
}

async function persistImages(files, destinationDir, filenamePrefix) {
  const persisted = []

  try {
    for (const [index, file] of files.entries()) {
      persisted.push(await persistImage(file, destinationDir, `${filenamePrefix}-${index + 1}`))
    }
    return persisted
  } catch (error) {
    await Promise.all(persisted.map((file) => fs.unlink(file.path).catch(() => {})))
    throw error
  }
}

function createImageUpload({ fieldName, destinationDir, maxSizeBytes, maxFiles = 1, filenamePrefix }) {
  const upload = buildMulter({ maxSizeBytes, maxFiles })
  const runUpload = maxFiles === 1 ? upload.single(fieldName) : upload.array(fieldName, maxFiles)

  return (req, res, next) => {
    runUpload(req, res, async (error) => {
      if (handleMulterError(error, res, maxSizeBytes)) return

      try {
        if (maxFiles === 1) {
          if (!req.file) return next()
          req.file = await persistImage(req.file, destinationDir, filenamePrefix(req))
          return next()
        }

        const files = req.files || []
        req.files = await persistImages(files, destinationDir, filenamePrefix(req))
        return next()
      } catch (validationError) {
        return res.status(400).json({
          mensagem: validationError.message || 'Arquivo invalido',
        })
      }
    })
  }
}

module.exports = {
  allowedImageMimes,
  createImageUpload,
}
