/**
 * Constants de segurança e configuração
 */

export const SECURITY_CONFIG = {
  enableCSRF: true,
  enableCORS: true,
  enableContentSecurityPolicy: true,
  enableXSSProtection: true,
  enableXFrameOptions: true,
  enableXContentTypeOptions: true,
  enableHSTS: true,
  hstsMaxAge: 31536000, // 1 year
  enableCookieSecure: true,
  enableCookieSameSite: true,
  cookieSameSitePolicy: 'Strict' as const,
}

export const CACHE_CONFIG = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  staleWhileRevalidate: 1 * 60 * 1000, // 1 minute
  enableCompression: true,
}

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableRequestLogging: import.meta.env.DEV,
  enableResponseLogging: import.meta.env.DEV,
}

export const VALIDATION_CONFIG = {
  minPasswordLength: 8,
  maxPasswordLength: 128,
  minNameLength: 2,
  maxNameLength: 100,
  validPasswordRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  validEmailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}

export const TRUSTED_URLS = {
  // URLs confiáveis para links externos
  domains: [
    'ridejusto.local',
    'ridejusto.com',
    'app.ridejusto.com',
    'api.ridejusto.com',
  ],
  protocols: ['https', 'http', 'mailto', 'tel'],
}

export const XSS_PREVENTION = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
  allowedAttributes: {
    a: ['href', 'title'],
  },
  disallowedTagsMode: 'escape' as const,
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  RATE_LIMITED: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
}

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Email ou senha incorretos',
  INVALID_EMAIL: 'Email inválido',
  WEAK_PASSWORD: 'Senha muito fraca',
  PASSWORD_MISMATCH: 'Senhas não conferem',
  USER_EXISTS: 'Usuário já existe',
  USER_NOT_FOUND: 'Usuário não encontrado',
  UNAUTHORIZED: 'Não autorizado',
  FORBIDDEN: 'Acesso proibido',
  SERVER_ERROR: 'Erro no servidor',
  NETWORK_ERROR: 'Erro de conexão',
  INVALID_URL: 'URL inválida',
  INVALID_INPUT: 'Entrada inválida',
  RATE_LIMIT_EXCEEDED: 'Muitas requisições, tente novamente mais tarde',
}

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Bem-vindo!',
  LOGOUT_SUCCESS: 'Logout realizado com sucesso',
  REGISTRATION_SUCCESS: 'Cadastro realizado com sucesso',
  RIDE_CREATED: 'Corrida solicitada',
  RIDE_ACCEPTED: 'Corrida aceita',
  RIDE_COMPLETED: 'Corrida concluída',
  PROFILE_UPDATED: 'Perfil atualizado',
}

export const ROLE_PERMISSIONS = {
  admin: ['read', 'create', 'update', 'delete', 'manage_users'],
  driver: ['read', 'create', 'update', 'accept_rides'],
  passenger: ['read', 'create', 'rate_driver'],
} as const

export const SESSION_CONFIG = {
  tokenRefreshBuffer: 5 * 60 * 1000, // 5 minutes before expiry
  sessionTimeout: 30 * 60 * 1000, // 30 minutes of inactivity
  maxSessionDuration: 24 * 60 * 60 * 1000, // 24 hours max
}

export const RATE_LIMIT_CONFIG = {
  loginAttempts: 5,
  loginWindow: 15 * 60 * 1000, // 15 minutes
  apiRequestsPerMinute: 60,
  apiRequestsPerHour: 1000,
}
