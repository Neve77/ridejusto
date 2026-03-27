/**
 * Página de Registro
 */
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { register } from '@/store/slices/auth'
import { authValidators } from '@/validators'
import {
  Container,
  Card,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
} from '@mui/material'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'passenger',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent): void => {
    const target = event.target as HTMLInputElement & { value: string; name: string }
    setFormData((prev) => ({
      ...prev,
      [target.name]: target.value,
    }))
    // Clear field error on change
    if (formErrors[target.name]) {
      setFormErrors((prev) => ({
        ...prev,
        [target.name]: '',
      }))
    }
  }

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()

    // Validate form
    const { error: validationError, value } = authValidators.register.validate(formData, {
      abortEarly: false,
    })

    if (validationError) {
      const errors: Record<string, string> = {}
      validationError.details.forEach((detail) => {
        errors[detail.path[0] as string] = detail.message
      })
      setFormErrors(errors)
      return
    }

    // Remove confirmPassword before sending to API
    const { confirmPassword: _, ...registerData } = value

    try {
      await dispatch(register(registerData)).unwrap()
      // Navigate to login on success
      navigate('/login', { replace: true })
    } catch (err) {
      // Error is handled by Redux
      console.error('Registration failed:', err)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Card sx={{ width: '100%', p: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
            Criar Conta
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            Junte-se ao RideJusto hoje
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Nome Completo"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              error={Boolean(formErrors.name)}
              helperText={formErrors.name}
              disabled={isLoading}
              autoComplete="name"
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={Boolean(formErrors.email)}
              helperText={formErrors.email}
              disabled={isLoading}
              autoComplete="email"
            />

            <FormControl fullWidth error={Boolean(formErrors.role)}>
              <InputLabel>Tipo de Conta</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Tipo de Conta"
                disabled={isLoading}
              >
                <MenuItem value="passenger">Passageiro</MenuItem>
                <MenuItem value="driver">Motorista</MenuItem>
              </Select>
              {formErrors.role && <FormHelperText>{formErrors.role}</FormHelperText>}
            </FormControl>

            <TextField
              fullWidth
              label="Senha"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={Boolean(formErrors.password)}
              helperText={formErrors.password}
              disabled={isLoading}
              autoComplete="new-password"
            />

            <TextField
              fullWidth
              label="Confirmar Senha"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={Boolean(formErrors.confirmPassword)}
              helperText={formErrors.confirmPassword}
              disabled={isLoading}
              autoComplete="new-password"
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Criar Conta'}
            </Button>

            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Já tem conta?{' '}
              <Link to="/login" style={{ color: 'inherit', fontWeight: 600, textDecoration: 'none' }}>
                Faça login
              </Link>
            </Typography>
          </Box>
        </Card>
      </Box>
    </Container>
  )
}
