/**
 * Error Boundary para tratamento de erros
 */
import React, { ReactNode } from 'react'
import { Container, Box, Typography, Button } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              gap: 2,
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Algo deu errado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {this.state.error?.message || 'Um erro inesperado ocorreu. Por favor, tente recarregar a página.'}
            </Typography>
            <Button variant="contained" onClick={this.handleReset}>
              Tentar Novamente
            </Button>
            <Button
              variant="text"
              onClick={() => {
                window.location.href = '/'
              }}
            >
              Voltar para Home
            </Button>
          </Box>
        </Container>
      )
    }

    return this.props.children
  }
}
