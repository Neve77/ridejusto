/**
 * Auth slice - Gerenciamento de autenticação
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { AuthState, LoginCredentials, RegisterData, User } from '@/types'
import { apiService } from '@/services/api'
import { sanitizeString, checkRateLimit } from '@/security'
import { RATE_LIMIT_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants'

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }: { rejectWithValue: any }) => {
    try {
      // Rate limiting
      if (!checkRateLimit('login', RATE_LIMIT_CONFIG.loginAttempts, RATE_LIMIT_CONFIG.loginWindow)) {
        return rejectWithValue(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED)
      }

      const response = await apiService.post('/auth/login', credentials)

      if (response.success && response.data) {
        const { access_token, user } = response.data as { access_token: string; user: User }

        // Store tokens securely
        localStorage.setItem('auth_token', access_token)

        return { user, token: access_token }
      }

      return rejectWithValue(response.error || ERROR_MESSAGES.INVALID_CREDENTIALS)
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? sanitizeString(error.message) : ERROR_MESSAGES.SERVER_ERROR
      )
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }: { rejectWithValue: any }) => {
    try {
      const { confirmPassword, ...payload } = data

      const response = await apiService.post('/auth/register', payload)

      if (response.success) {
        return { message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS }
      }

      return rejectWithValue(response.error || ERROR_MESSAGES.SERVER_ERROR)
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? sanitizeString(error.message) : ERROR_MESSAGES.SERVER_ERROR
      )
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async (_: void, { rejectWithValue }: { rejectWithValue: any }) => {
  try {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    return { message: SUCCESS_MESSAGES.LOGOUT_SUCCESS }
  } catch (error) {
    return rejectWithValue(ERROR_MESSAGES.SERVER_ERROR)
  }
})

export const refreshToken = createAsyncThunk('auth/refreshToken', async (_: void, { rejectWithValue }: { rejectWithValue: any }) => {
  try {
    const token = localStorage.getItem('refresh_token')

    if (!token) {
      return rejectWithValue('No refresh token available')
    }

    const response = await apiService.post('/auth/refresh', { refreshToken: token })

    if (response.success && response.data) {
      const { access_token } = response.data as { access_token: string }
      localStorage.setItem('auth_token', access_token)
      return { token: access_token }
    }

    return rejectWithValue(response.error || ERROR_MESSAGES.SERVER_ERROR)
  } catch (error) {
    return rejectWithValue(ERROR_MESSAGES.SERVER_ERROR)
  }
})

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state: AuthState) => {
      state.error = null
    },
    setUser: (state: AuthState, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state: AuthState) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state: AuthState, action: PayloadAction<any>) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state: AuthState, action: PayloadAction<any>) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })

    // Register
    builder
      .addCase(register.pending, (state: AuthState) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state: AuthState) => {
        state.isLoading = false
      })
      .addCase(register.rejected, (state: AuthState, action: PayloadAction<any>) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Logout
    builder
      .addCase(logout.fulfilled, (state: AuthState) => {
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.error = null
      })

    // Refresh Token
    builder
      .addCase(refreshToken.fulfilled, (state: AuthState, action: PayloadAction<any>) => {
        state.token = action.payload.token
      })
      .addCase(refreshToken.rejected, (state: AuthState) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
