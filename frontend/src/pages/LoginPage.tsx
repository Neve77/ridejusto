/**
 * Componente Login com validação Joi
 */
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material'
import { login } from '@/store/slices/auth'
import { useFormValidation } from '@/hooks'
import { authValidators, validateForm } from '@/validators'
import { LoginCredentials } from '@/types'
import { sanitizeString } from '@/security'

export const LoginPage: React.FC = () => {
  const dispatch = useDispatch()
  const [apiError, setApiError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  const form = useFormValidation(
    { email: '', password: '' },
    async (values) => {
      // Validate with Joi
      const validation = validateForm(authValidators.login, values)

      if (!validation.valid) {
        setValidationErrors(validation.errors || {})
        return
      }

      setValidationErrors({})
      setApiError(null)

      try {
        await (dispatch as any)(login(values as LoginCredentials)).unwrap()
        // Redirect to home
        window.location.href = '/dashboard'
      } catch (error) {
        setApiError(sanitizeString(error instanceof Error ? error.message : 'Erro ao fazer login. Tente novamente.'))
      }
    }
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.handleChange(e)
    // Clear validation error for this field
    const { name } = e.target
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
        <Card sx={{ width: '100%', p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
            🚗 RideJusto
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
            Faça login em sua conta
          </Typography>

          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          <form onSubmit={form.handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={form.values.email}
              onChange={handleInputChange}
              onBlur={form.handleBlur}
              error={!!(form.touched.email && validationErrors.email)}
              helperText={form.touched.email && validationErrors.email?.[0]}
              margin="normal"
              autoComplete="email"
              disabled={form.isSubmitting}
            />

            <TextField
              fullWidth
              label="Senha"
              name="password"
              type="password"
              value={form.values.password}
              onChange={handleInputChange}
              onBlur={form.handleBlur}
              error={!!(form.touched.password && validationErrors.password)}
              helperText={form.touched.password && validationErrors.password?.[0]}
              margin="normal"
              autoComplete="current-password"
              disabled={form.isSubmitting}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              sx={{ mt: 3, mb: 2 }}
              disabled={form.isSubmitting}
            >
              {form.isSubmitting ? <CircularProgress size={24} /> : 'Entrar'}
            </Button>
          </form>

          <Grid container sx={{ mt: 2 }}>
            <Grid item xs>
              <Link href="/forgot-password" variant="body2">
                Esqueceu a senha?
              </Link>
            </Grid>
            <Grid item>
              <Link href="/register" variant="body2">
                Não tem conta? Cadastre-se
              </Link>
            </Grid>
          </Grid>
        </Card>
      </Box>
    </Container>
  )
}
