/**
 * Página Dashboard
 */
import React from 'react'
import { useAppSelector } from '@/hooks'
import { Layout } from '@/components/Layout'
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Alert,
} from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import PersonIcon from '@mui/icons-material/Person'
import StarIcon from '@mui/icons-material/Star'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { useNavigate } from 'react-router-dom'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)

  // Mock stats - in real app, fetch from API
  const stats = [
    { label: 'Corridas Totais', value: '24', icon: DirectionsCarIcon, color: '#1976d2' },
    { label: 'Avaliação', value: '4.8', icon: StarIcon, color: '#fbbf24' },
    { label: 'Perfil', value: user?.role || 'N/A', icon: PersonIcon, color: '#10b981' },
    { label: 'Tendência', value: '+12%', icon: TrendingUpIcon, color: '#f59e0b' },
  ]

  return (
    <Layout>
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Bem-vindo, {user?.name}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Aqui está o resumo da sua atividade
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Icon sx={{ fontSize: 40, color: stat.color }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {stat.value}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>

        {/* Actions */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Ações Rápidas
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/rides/new')}
                  >
                    Solicitar Corrida
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/rides')}
                  >
                    Ver Minhas Corridas
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/profile')}
                  >
                    Editar Perfil
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Segurança
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Sua conta está protegida com as melhores práticas de segurança.
                </Alert>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/settings')}
                >
                  Gerenciar Segurança
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  )
}
