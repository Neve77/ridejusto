/**
 * Container para notificações toast
 */
import React from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { removeToast } from '@/store/slices/ui'
import { Toast as IToast } from '@/types'
import { Box, Alert, Snackbar, AlertTitle } from '@mui/material'

export const ToastContainer: React.FC = () => {
  const dispatch = useAppDispatch()
  const toasts = useAppSelector((state) => state.ui.toasts)

  const handleClose = (id: string): void => {
    dispatch(removeToast(id))
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: 400,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast: IToast) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.duration || 5000}
          onClose={() => handleClose(toast.id)}
          sx={{ pointerEvents: 'auto' }}
        >
          <Alert
            onClose={() => handleClose(toast.id)}
            severity={toast.type}
            variant="filled"
            sx={{
              width: '100%',
              boxShadow: (theme) => theme.shadows[8],
            }}
          >
            {toast.title && <AlertTitle>{toast.title}</AlertTitle>}
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  )
}
