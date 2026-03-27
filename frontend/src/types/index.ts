/**
 * Tipos globais da aplicação
 */

/* ========== Auth ========== */
export interface User {
  id: number
  name: string
  email: string
  role: 'passenger' | 'driver' | 'admin'
  rating: number
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  name: string
  confirmPassword: string
}

/* ========== Rides ========== */
export interface RideRequest {
  id: number
  passengerId: number
  driverId: number | null
  origin: string
  destination: string
  distanceKm: number
  estimatedPrice: number
  actualPrice?: number
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  paymentMethod: 'cash' | 'card' | 'wallet'
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export interface RideFilters {
  status?: RideRequest['status']
  dateFrom?: string
  dateTo?: string
  minPrice?: number
  maxPrice?: number
}

/* ========== API Response ========== */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/* ========== Security ========== */
export interface SecurityContext {
  nonce: string
  csrfToken: string
  timestamp: number
  userAgent: string
}

export interface EncryptedPayload {
  iv: string
  ciphertext: string
  tag: string
  salt: string
}

export interface ValidationResult {
  valid: boolean
  errors?: Record<string, string[]>
  warnings?: string[]
}

/* ========== Cache ========== */
export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
  etag?: string
  headers?: Record<string, string>
}

export interface CachePolicy {
  ttl: number // Time to live in milliseconds
  maxSize?: number
  staleWhileRevalidate?: number
  allowStale?: boolean
}

/* ========== UI ========== */
export interface Toast {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export interface TabState {
  activeTab: string
  tabs: Array<{
    id: string
    label: string
    icon?: string
  }>
}
