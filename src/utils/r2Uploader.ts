import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getEnvVar } from '../data/provider'

export interface R2UploadResult {
  url: string
  key: string
  bucket: string
}

export function isR2Configured(): boolean {
  return Boolean(
    (getEnvVar('R2_ENDPOINT') || getEnvVar('R2_ACCOUNT_ID')) &&
    getEnvVar('R2_ACCESS_KEY_ID') &&
    getEnvVar('R2_SECRET_ACCESS_KEY') &&
    getEnvVar('R2_BUCKET_NAME')
  )
}

const ALLOWED_MIME_TYPES = new Set([
  'image/webp',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/gif',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/avif',
  'application/octet-stream',
])

const ALLOWED_EXTENSIONS = new Set([
  '.webp',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.gif',
  '.ico',
  '.avif',
])

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10 MB

export async function uploadBase64ToR2({
  base64Data,
  fileName,
}: {
  base64Data: string
  fileName: string
}): Promise<R2UploadResult> {
  const endpoint =
    getEnvVar('R2_ENDPOINT') ||
    (getEnvVar('R2_ACCOUNT_ID')
      ? `https://${getEnvVar('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`
      : '')

  const accessKeyId = getEnvVar('R2_ACCESS_KEY_ID')
  const secretAccessKey = getEnvVar('R2_SECRET_ACCESS_KEY')
  const bucketName = getEnvVar('R2_BUCKET_NAME')
  const folderPath = (getEnvVar('R2_FOLDER_PATH', 'portfolio')).replace(/^\/+|\/+$/g, '')
  const publicUrlBase = (getEnvVar('R2_PUBLIC_URL') || getEnvVar('R2_PUBLIC_DOMAIN') || '').replace(/\/+$/, '')
  const region = getEnvVar('R2_REGION', 'auto')
  const forcePathStyle = getEnvVar('R2_USE_PATH_STYLE_ENDPOINT') !== 'false'

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error(
      'Cloudflare R2 is not fully configured in .env. Please define R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.'
    )
  }

  // Extract MIME type and decode buffer
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  let contentType = 'image/webp'
  let buffer: Buffer

  if (matches && matches.length === 3) {
    contentType = matches[1].toLowerCase().trim()
    buffer = Buffer.from(matches[2], 'base64')
  } else {
    buffer = Buffer.from(base64Data, 'base64')
  }

  // 1. File size validation
  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new Error(`Upload payload exceeds maximum allowed size of 10MB (Received: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB).`)
  }

  // 2. MIME type whitelist validation
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    throw new Error(`Security validation failed: Unsupported MIME type "${contentType}". Only safe web image formats are permitted.`)
  }

  // 3. Filename and extension sanitization (Path Traversal prevention)
  const cleanBase = fileName.replace(/[\/\\]/g, '').replace(/\.\.+/g, '')
  const safeName = cleanBase.replace(/[^a-zA-Z0-9._-]/g, '_')
  const extMatch = safeName.match(/\.[a-zA-Z0-9]+$/)
  const ext = extMatch ? extMatch[0].toLowerCase() : ''

  if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`Security validation failed: Unsupported file extension "${ext}".`)
  }

  const s3 = new S3Client({
    region,
    endpoint,
    forcePathStyle,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

  const key = folderPath ? `${folderPath}/${Date.now()}_${safeName}` : `${Date.now()}_${safeName}`

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )

  // Direct public custom domain without bucket prefix in path
  const finalUrl = publicUrlBase
    ? `${publicUrlBase}/${key}`
    : `${endpoint}/${bucketName}/${key}`

  return {
    url: finalUrl,
    key,
    bucket: bucketName,
  }
}
