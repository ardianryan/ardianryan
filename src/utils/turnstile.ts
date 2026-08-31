import { getEnvVar } from '../data/provider'

/**
 * Cloudflare Turnstile verification helper for server-side endpoints
 */
export async function verifyTurnstileToken(token?: string, clientIp?: string): Promise<boolean> {
  const secretKey = getEnvVar('TURNSTILE_SECRET_KEY') || getEnvVar('TURNSTILE_SECRET')

  // If Turnstile secret key is unset (e.g. during local development), gracefully allow login
  if (!secretKey || secretKey === 'development' || secretKey.trim() === '') {
    return true
  }

  if (!token || typeof token !== 'string') {
    return false
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        ...(clientIp ? { remoteip: clientIp } : {}),
      }),
    })

    if (!response.ok) return false
    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.warn('Turnstile verification request failed:', error)
    return false
  }
}
