/**
 * Layout com navegação
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { logout } from '@/store/slices/auth'
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = (): void => {
    setAnchorEl(null)
  }

  const handleLogout = (): void => {
    handleMenuClose()
    dispatch(logout())
    navigate('/login')
  }

  const menuItems = [
    { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { label: 'Minhas Corridas', icon: DirectionsCarIcon, path: '/rides' },
    { label: 'Perfil', icon: PersonIcon, path: '/profile' },
    { label: 'Configurações', icon: SettingsIcon, path: '/settings' },
  ]

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: 1300 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, fontWeight: 600, fontSize: '1.25rem' }}>
            🚗 RideJusto
          </Box>
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 0,
              ml: 2,
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'secondary.main',
                cursor: 'pointer',
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer Lateral */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{
            width: 250,
            pt: 2,
          }}
        >
          <List>
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path)
                      setDrawerOpen(false)
                    }}
                  >
                    <ListItemIcon>
                      <Icon />
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </Box>
      </Drawer>

      {/* Menu do Perfil */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem disabled>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontWeight: 600 }}>{user?.name}</Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{user?.email}</Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => navigate('/profile')}>
          <PersonIcon sx={{ mr: 1 }} /> Perfil
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <SettingsIcon sx={{ mr: 1 }} /> Configurações
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} /> Sair
        </MenuItem>
      </Menu>

      {/* Conteúdo Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8,
          pb: 2,
          px: 2,
        }}
      >
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </Box>
  )
}
