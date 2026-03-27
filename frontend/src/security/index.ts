/**
 * Camada de segurança - Sanitização, XSS, CSRF, URL validation
 */
import DOMPurify from 'dompurify'
import { nanoid } from 'nanoid'
import { TRUSTED_URLS, XSS_PREVENTION, SECURITY_CONFIG } from '@/constants'

/* ========== XSS Prevention ========== */
/**
 * Sanitiza string para prevenir XSS attacks
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    return ''
  }
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim()
}

/**
 * Sanitiza HTML com tags permitidas
 */
export const sanitizeHTML = (input: string): string => {
  if (typeof input !== 'string') {
    return ''
  }
  const config = {
    ALLOWED_TAGS: XSS_PREVENTION.allowedTags,
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  }
  return DOMPurify.sanitize(input, config)
}

/**
 * Escapa caracteres especiais HTML
 */
export const escapeHTML = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/* ========== URL Validation ========== */
/**
 * Valida se URL é confiável
 */
export const isTrustedUrl = (url: string): boolean => {
  if (!url) return false

  try {
    const urlObj = new URL(url, window.location.origin)

    // Verifica protocolo
    if (!TRUSTED_URLS.protocols.includes(urlObj.protocol.replace(':', ''))) {
      return false
    }

    // Para mailto e tel, sempre é confiável
    if (urlObj.protocol === 'mailto:' || urlObj.protocol === 'tel:') {
      return true
    }

    // Verifica domínio
    const hostname = urlObj.hostname
    return TRUSTED_URLS.domains.some((domain) => {
      return hostname === domain || hostname.endsWith('.' + domain)
    })
  } catch {
    return false
  }
}

/**
 * Sanitiza URL
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return ''

  try {
    const urlObj = new URL(url, window.location.origin)

    // Remove caracteres perigosos dos parâmetros
    const params = new URLSearchParams(urlObj.search)
    const sanitizedParams = new URLSearchParams()

    params.forEach((value, key) => {
      sanitizedParams.set(sanitizeString(key), sanitizeString(value))
    })

    urlObj.search = sanitizedParams.toString()
    return urlObj.toString()
  } catch {
    return ''
  }
}

/* ========== CSRF Protection ========== */
interface CSRFToken {
  token: string
  timestamp: number
}

const CSRF_TOKEN_KEY = 'ridejusto_csrf_token'
const CSRF_TOKEN_HEADER = 'X-CSRF-Token'

/**
 * Gera novo token CSRF
 */
export const generateCSRFToken = (): string => {
  const token = nanoid(32)
  const data: CSRFToken = {
    token,
    timestamp: Date.now(),
  }
  sessionStorage.setItem(CSRF_TOKEN_KEY, JSON.stringify(data))
  return token
}

/**
 * Obtém token CSRF atual
 */
export const getCSRFToken = (): string => {
  const stored = sessionStorage.getItem(CSRF_TOKEN_KEY)
  if (!stored) {
    return generateCSRFToken()
  }

  const data: CSRFToken = JSON.parse(stored)

  // Regenera se expirado (1 hora)
  if (Date.now() - data.timestamp > 60 * 60 * 1000) {
    return generateCSRFToken()
  }

  return data.token
}

/**
 * Valida token CSRF
 */
export const validateCSRFToken = (token: string): boolean => {
  const stored = sessionStorage.getItem(CSRF_TOKEN_KEY)
  if (!stored) return false

  const data: CSRFToken = JSON.parse(stored)
  return data.token === token
}

/**
 * Adiciona CSRF token aos headers da requisição
 */
export const addCSRFToHeaders = (headers: Record<string, string>): Record<string, string> => {
  if (SECURITY_CONFIG.enableCSRF) {
    headers[CSRF_TOKEN_HEADER] = getCSRFToken()
  }
  return headers
}

/* ========== Input Validation ========== */
/**
 * Valida e sanitiza entrada do usuário
 */
export const sanitizeInput = (input: string, type: 'text' | 'email' | 'url' | 'number' = 'text'): string => {
  let sanitized = sanitizeString(input)

  switch (type) {
    case 'email':
      // Remove caracteres não permitidos em email
      sanitized = sanitized.toLowerCase().replace(/[^a-z0-9@._-]/g, '')
      break

    case 'url':
      sanitized = sanitizeUrl(sanitized)
      break

    case 'number':
      sanitized = sanitized.replace(/[^0-9.-]/g, '')
      break

    case 'text':
    default:
      // Apenas remove XSS
      sanitized = escapeHTML(sanitized)
      break
  }

  return sanitized
}

/* ========== Content Security ========== */
/**
 * Gera nonce para inline scripts
 */
export const generateNonce = (): string => {
  return nanoid(16)
}

/**
 * Valida Content Security Policy headers
 */
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }
}

/* ========== Data Sanitization ========== */
/**
 * Sanitiza objeto complexo recursivamente
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized = { ...obj }

  Object.keys(sanitized).forEach((key) => {
    const value = sanitized[key as keyof T]

    if (typeof value === 'string') {
      ;(sanitized[key as keyof T] as any) = sanitizeString(value)
    } else if (typeof value === 'object' && value !== null) {
      ;(sanitized[key as keyof T] as any) = sanitizeObject(value)
    }
  })

  return sanitized
}

/* ========== Cache Headers ========== */
/**
 * Define headers de cache seguros
 */
export const getCacheHeaders = (
  maxAge: number = 300,
  private_: boolean = true
): Record<string, string> => {
  const cacheControl = [
    private_ ? 'private' : 'public',
    `max-age=${maxAge}`,
    'no-transform',
  ]

  return {
    'Cache-Control': cacheControl.join(', '),
    'Pragma': 'no-cache',
    'Expires': new Date(Date.now() + maxAge * 1000).toUTCString(),
  }
}

/* ========== Request/Response Validation ========== */
/**
 * Valida estrutura de resposta API
 */
export const validateApiResponse = (data: unknown): data is Record<string, any> => {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const obj = data as Record<string, any>

  // Verifica se tem estrutura esperada
  return 'success' in obj && ('data' in obj || 'error' in obj)
}

/* ========== Rate Limiting Client-Side ========== */
interface RateLimitBucket {
  count: number
  resetTime: number
}

const rateLimitBuckets = new Map<string, RateLimitBucket>()

/**
 * Verifica rate limit client-side
 */
export const checkRateLimit = (key: string, limit: number, windowMs: number): boolean => {
  const now = Date.now()
  const bucket = rateLimitBuckets.get(key)

  if (!bucket || now > bucket.resetTime) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return true
  }

  bucket.count++

  if (bucket.count > limit) {
    return false
  }

  return true
}

/**
 * Reseta rate limit
 */
export const resetRateLimit = (key: string): void => {
  rateLimitBuckets.delete(key)
}

/* ========== Security Context ========== */
/**
 * Cria segurança context para requisições
 */
export const createSecurityContext = () => {
  return {
    nonce: generateNonce(),
    csrfToken: getCSRFToken(),
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  }
}
