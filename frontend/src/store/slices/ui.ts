/**
 * UI slice - Estado da interface do usuário
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Toast } from '@/types'
import { nanoid } from 'nanoid'

interface UIState {
  toasts: Toast[]
  isNavigationOpen: boolean
  isLoading: boolean
  theme: 'light' | 'dark'
}

const initialState: UIState = {
  toasts: [],
  isNavigationOpen: false,
  isLoading: false,
  theme: 'light',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = nanoid()
      const toast: Toast = {
        id,
        ...action.payload,
      }
      state.toasts.push(toast)

      // Auto remove after duration
      if (action.payload.duration) {
        setTimeout(() => {
          state.toasts = state.toasts.filter((t) => t.id !== id)
        }, action.payload.duration)
      }
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
    toggleNavigation: (state) => {
      state.isNavigationOpen = !state.isNavigationOpen
    },
    setNavigationOpen: (state, action: PayloadAction<boolean>) => {
      state.isNavigationOpen = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
  },
})

export const { addToast, removeToast, toggleNavigation, setNavigationOpen, setLoading, setTheme } =
  uiSlice.actions
export default uiSlice.reducer
