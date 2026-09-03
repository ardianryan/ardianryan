import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import serverEntry from '../dist/server/server.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDir = path.resolve(__dirname, '../dist/client')
const publicDir = path.resolve(__dirname, '../public')
const PORT = parseInt(process.env.PORT || '3000', 10)
const HOST = process.env.HOST || '0.0.0.0'

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return MIME_TYPES[ext] || 'application/octet-stream'
}

const MAX_BODY_BYTES = 12 * 1024 * 1024 // 12MB limit

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'X-XSS-Protection': '1; mode=block',
}

const BLOCKED_PATTERNS = [
  /^\/\.env/i,
  /^\/\.git/i,
  /^\/\.vscode/i,
  /^\/\.dockerignore/i,
  /^\/package\.json/i,
  /^\/package-lock\.json/i,
  /^\/Dockerfile/i,
  /^\/scripts\//i,
  /^\/src\//i,
  /^\/node_modules\//i,
]

const server = http.createServer(async (req, res) => {
  try {
    // Apply core security headers to all responses
    for (const [secHeader, secVal] of Object.entries(SECURITY_HEADERS)) {
      res.setHeader(secHeader, secVal)
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost:3000'}`)
    let reqPath = decodeURIComponent(url.pathname)

    // Block directory traversal or hidden/sensitive server files immediately
    if (
      reqPath.includes('..') ||
      reqPath.includes('\0') ||
      BLOCKED_PATTERNS.some((pattern) => pattern.test(reqPath))
    ) {
      res.statusCode = 403
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end('Access Forbidden: Security policy violation.')
      return
    }

    // 1. Static Asset Serving with safe path boundary enforcement
    const safeRelPath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '')
    const resolvedClientPath = path.resolve(clientDir, '.' + safeRelPath)
    const resolvedPublicPath = path.resolve(publicDir, '.' + safeRelPath)

    let finalFilePath = null
    if (resolvedClientPath.startsWith(clientDir) && fs.existsSync(resolvedClientPath) && fs.statSync(resolvedClientPath).isFile()) {
      finalFilePath = resolvedClientPath
    } else if (resolvedPublicPath.startsWith(publicDir) && fs.existsSync(resolvedPublicPath) && fs.statSync(resolvedPublicPath).isFile()) {
      finalFilePath = resolvedPublicPath
    }

    if (finalFilePath) {
      const mime = getMimeType(finalFilePath)
      res.setHeader('Content-Type', mime)
      if (reqPath.startsWith('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      } else {
        res.setHeader('Cache-Control', 'public, max-age=3600')
      }
      fs.createReadStream(finalFilePath).pipe(res)
      return
    }

    // 2. Build Web Standard Request for TanStack Start SSR
    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          for (const v of value) headers.append(key, v)
        } else {
          headers.set(key, value)
        }
      }
    }

    const init = {
      method: req.method,
      headers,
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      let receivedBytes = 0
      const chunks = []
      for await (const chunk of req) {
        receivedBytes += chunk.length
        if (receivedBytes > MAX_BODY_BYTES) {
          res.statusCode = 413
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end('Payload Too Large: Maximum allowed request size is 12MB.')
          return
        }
        chunks.push(chunk)
      }
      init.body = Buffer.concat(chunks)
    }

    const webReq = new Request(url.href, init)

    // 3. Dispatch to TanStack Start fetch handler
    const webRes = await serverEntry.fetch(webReq)

    // 4. Send Web Response back to Node HTTP response
    res.statusCode = webRes.status
    for (const [key, value] of webRes.headers.entries()) {
      res.setHeader(key, value)
    }

    if (webRes.body) {
      const reader = webRes.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(value)
      }
    }
    res.end()
  } catch (err) {
    console.error('SSR Request Error:', err)
    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end('Internal Server Error')
    }
  }
})

server.listen(PORT, HOST, () => {
  console.log(`🚀 Ardian Ryan Portfolio SSR Server is running on http://${HOST}:${PORT}`)
})
