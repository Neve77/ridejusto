/**
 * Serviço de API com interceptores de segurança
 */
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'
import {
  addCSRFToHeaders,
  sanitizeString,
  sanitizeObject,
  validateApiResponse,
  checkRateLimit,
} from '@/security'
import { API_CONFIG, RATE_LIMIT_CONFIG } from '@/constants'
import { ApiResponse } from '@/types'

class ApiService {
  private client: AxiosInstance
  private requestInterceptor: number | null = null
  private responseInterceptor: number | null = null

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request Interceptor
    this.requestInterceptor = this.client.interceptors.request.use(
      (config) => {
        // Rate limiting
        if (!checkRateLimit('api_requests', RATE_LIMIT_CONFIG.apiRequestsPerMinute, 60000)) {
          throw new Error('Rate limit exceeded')
        }

        // Add CSRF token
        const csrfHeaders = addCSRFToHeaders(
          config.headers as unknown as Record<string, string>
        ) as unknown as Record<string, string>
        config.headers = Object.assign(config.headers || {}, csrfHeaders)

        // Add security headers
        config.headers['X-Requested-With'] = 'XMLHttpRequest'

        // Add auth token if available
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Log request (dev only)
        if (API_CONFIG.enableRequestLogging) {
          console.log(`🔵 Request: ${config.method?.toUpperCase()} ${config.url}`)
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response Interceptor
    this.responseInterceptor = this.client.interceptors.response.use(
      (response) => {
        const { data } = response

        // Validate response structure
        if (!validateApiResponse(data)) {
          throw new Error('Invalid API response format')
        }

        // Log response (dev only)
        if (API_CONFIG.enableResponseLogging) {
          console.log(`🟢 Response: ${response.status}`, data)
        }

        return response
      },
      async (error: AxiosError) => {
        const response = error.response

        // Log error (dev only)
        if (API_CONFIG.enableResponseLogging) {
          console.error(`🔴 Error: ${error.message}`, error.response?.data)
        }

        // Handle specific error codes
        if (response?.status === 401) {
          // Unauthorized - try to refresh token
          try {
            await this.refreshToken()
            return this.client.request(error.config!)
          } catch {
            // If refresh fails, logout
            this.logout()
          }
        }

        if (response?.status === 429) {
          // Rate limited
          throw new Error('Too many requests. Please try again later.')
        }

        if (response?.status === 403) {
          // Forbidden
          throw new Error('Access forbidden')
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * POST request com sanitização
   */
  async post<T = any>(
    url: string,
    data?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const sanitizedData = data ? sanitizeObject(data) : undefined
      const response = await this.client.post<ApiResponse<T>>(url, sanitizedData, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * PUT request com sanitização
   */
  async put<T = any>(
    url: string,
    data?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const sanitizedData = data ? sanitizeObject(data) : undefined
      const response = await this.client.put<ApiResponse<T>>(url, sanitizedData, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Refresh token
   */
  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await axios.post(`${API_CONFIG.baseURL}/auth/refresh`, {
      refreshToken,
    })

    const { data: token } = response.data
    localStorage.setItem('auth_token', token)
  }

  /**
   * Logout
   */
  private logout(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
  }

  /**
   * Handle errors
   */
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const message = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message ||
        'An error occurred'
      
      return new Error(sanitizeString(message))
    }

    return new Error('An unexpected error occurred')
  }

  /**
   * Limpa interceptadores
   */
  destroy(): void {
    if (this.requestInterceptor !== null) {
      this.client.interceptors.request.eject(this.requestInterceptor)
    }
    if (this.responseInterceptor !== null) {
      this.client.interceptors.response.eject(this.responseInterceptor)
    }
  }
}

// Singleton instance
export const apiService = new ApiService()

export default apiService
