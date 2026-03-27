/**
 * Redux store configuration
 */
import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import authReducer from '@/store/slices/auth'
import ridesReducer from '@/store/slices/rides'
import uiReducer from '@/store/slices/ui'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rides: ridesReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignora tipos não-serializáveis esperados
        ignoredActions: ['auth/loginSuccess'],
        ignoredPaths: ['auth.user'],
      },
    }),
  devTools: import.meta.env.DEV,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>

export default store
