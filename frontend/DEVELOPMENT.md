# Guia de Desenvolvimento - RideJusto Frontend

## 1. Setup Inicial

### 1.1 Requisitos
- Node.js 16+ (recomendado 18 LTS)
- npm 8+ ou yarn 3+
- Git

### 1.2 Instalação

```bash
# Clonar repositório
git clone <repo-url>
cd ridejusto/frontend

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local

# Editar .env.local com configurações locais
# VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 1.3 Desenvolvimento

```bash
# Iniciar dev server (http://localhost:5173)
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint código
npm run lint

# Format código
npm run format
```

## 2. Estrutura do Projeto

```
src/
├── main.tsx              # Entry point com CSP headers
├── App.tsx               # App routing com ErrorBoundary
├── index.css             # Global styles
├── types/                # TypeScript interfaces
│   └── index.ts          # 25+ tipos para toda app
├── constants/            # Configurações globais
│   └── index.ts          # SECURITY_CONFIG, CACHE_CONFIG, etc
├── security/             # Segurança
│   └── index.ts          # 360 linhas de security functions
├── validators/           # Validação de input
│   └── index.ts          # Joi schemas para forms
├── services/             # API client
│   └── api.ts            # Axios + interceptors
├── store/                # Redux state
│   ├── index.ts          # Store config
│   ├── slices/
│   │   ├── auth.ts       # Auth state + thunks
│   │   ├── rides.ts      # Rides state + thunks
│   │   └── ui.ts         # UI state (toasts, theme)
├── hooks/                # Custom React hooks
│   └── index.ts          # useAuth, useRides, useUI, etc
├── components/           # Reusable components
│   ├── ProtectedRoute.tsx     # Route guard RBAC
│   ├── Layout.tsx             # App layout com navigation
│   ├── ErrorBoundary.tsx      # Error boundary
│   ├── ToastContainer.tsx     # Toast notifications
│   ├── ConfirmDialog.tsx      # Confirm dialog
│   ├── LoadingSpinner.tsx     # Loading spinner
│   └── ...
├── pages/                # Route pages
│   ├── LoginPage.tsx         # Login com Joi validation
│   ├── RegisterPage.tsx      # Register form
│   ├── DashboardPage.tsx     # Dashboard
│   └── ...
└── utils/                # Utility functions
    └── index.ts          # Helpers comuns

public/
├── index.html            # HTML entry point
├── vite.svg              # Favicon
└── ...
```

## 3. Padrões de Desenvolvimento

### 3.1 Criando um Novo Component

```typescript
// src/components/MyComponent.tsx
import React from 'react'
import { Box, Typography } from '@mui/material'

interface MyComponentProps {
  title: string
  children?: React.ReactNode
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, children }) => {
  return (
    <Box>
      <Typography variant="h5">{title}</Typography>
      {children}
    </Box>
  )
}
```

### 3.2 Usando Validação

```typescript
import { authValidators } from '@/validators'

const formData = { email: 'test@test.com', password: '123456' }
const { error, value } = authValidators.login.validate(formData)

if (error) {
  // Handle validation error
  console.log(error.details)
} else {
  // Use validated value
  console.log(value)
}
```

### 3.3 Usando Redux

```typescript
import { useAppDispatch, useAppSelector } from '@/hooks'
import { login } from '@/store/slices/auth'

function MyComponent() {
  const dispatch = useAppDispatch()
  const { user, isLoading } = useAppSelector(state => state.auth)

  const handleLogin = async (credentials) => {
    try {
      await dispatch(login(credentials)).unwrap()
      // Success
    } catch (error) {
      // Error handled
    }
  }

  return (
    // Component JSX
  )
}
```

### 3.4 Usando API Service

```typescript
import { ApiService } from '@/services/api'

const api = ApiService.getInstance()

// GET request
const rides = await api.get('/rides')

// POST request
const newRide = await api.post('/rides', { origin: '...', destination: '...' })

// PUT request
const updated = await api.put('/rides/1', { status: 'completed' })

// DELETE request
await api.delete('/rides/1')
```

## 4. Segurança

### 4.1 Checklist de Segurança

Antes de commitar código:

- [ ] Nenhum console.log com dados sensíveis
- [ ] Nenhum hardcoded credentials
- [ ] Todos inputs validados com Joi
- [ ] Sanitização aplicada para HTML rendering
- [ ] CSRF token sendo usado para mutações
- [ ] Senhas nunca armazenadas localmente
- [ ] URLs externas validadas contra whitelist
- [ ] Rate limiting considerado

### 4.2 Tratando Dados Sensíveis

```typescript
// ❌ DON'T
localStorage.setItem('password', password)
console.log('User token:', token)

// ✅ DO
localStorage.setItem('token', token)
// Log apenas em DEV
if (import.meta.env.DEV) {
  console.log('Debug info')
}
```

### 4.3 Validação de Input

```typescript
import { sanitizeInput } from '@/security'

// Sanitize email
const cleanEmail = sanitizeInput(userInput, 'email')

// Sanitize HTML
const cleanHTML = sanitizeInput(htmlContent, 'html')

// Sanitize URL
const cleanURL = sanitizeInput(userURL, 'url')
```

## 5. Testes

### 5.1 Executar Testes

```bash
# Run tests com coverage
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### 5.2 Escrevendo Testes

```typescript
// src/hooks/__tests__/useAuth.test.ts
import { renderHook } from '@testing-library/react'
import { useAppSelector } from '@/hooks'

describe('useAuth', () => {
  it('should return auth state', () => {
    const { result } = renderHook(() => useAppSelector(state => state.auth))
    expect(result.current).toHaveProperty('user')
  })
})
```

## 6. Performance

### 6.1 Otimizações

- React.memo para componentes caros
- useCallback para funções em dependência de props
- useMemo para computações caras
- Code splitting com React.lazy + Suspense

### 6.2 Monitorar Performance

```bash
# Build stats
npm run build -- --report

# Dev tools
npm run build:analyze
```

## 7. Deployment

### 7.1 Build Checklist

- [ ] Rodar `npm run build` com sucesso
- [ ] Rodar `npm run lint` sem erros
- [ ] Todos testes passando
- [ ] `.env.local` não commitado
- [ ] HTTPS habilitado em produção
- [ ] CSP headers configurados

### 7.2 Environment Variables

**Development** (.env.local):
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_LOG_LEVEL=debug
```

**Production** (.env.production):
```
VITE_API_BASE_URL=https://api.ridejusto.com/api/v1
VITE_LOG_LEVEL=warn
VITE_ENABLE_DEBUG=false
```

## 8. Troubleshooting

### 8.1 Problemas Comuns

**"Cannot find module '@/...'"**
- Verificar se o alias está definido em `vite.config.ts` e `tsconfig.json`

**"CORS error"**
- Backend deve estar rodando em `http://localhost:8000`
- Verificar `VITE_API_BASE_URL` em `.env.local`

**"Token expired"**
- App tenta refresh automático
- Se refresh falha, usuário é deslogado

**"Rate limit exceeded"**
- Aguardar 1 minuto ou refresh a página
- Client-side rate limiting é para UX, backend é a fonte da verdade

### 8.2 Debug Mode

```bash
# Ver todos campos de environment
npm run build -- --debug

# Enable debugging no browser
localStorage.setItem('DEBUG', '*')
```

## 9. Recursos Úteis

- [Material-UI Docs](https://mui.com/)
- [React Docs](https://react.dev/)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Vite Docs](https://vitejs.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/)

## 10. Contato & Suporte

Para dúvidas sobre desenvolvimento, contactar time@ridejusto.com

---

**Última atualização**: 2024
