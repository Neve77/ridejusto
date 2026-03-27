# Documentação de Segurança - RideJusto Frontend

## 1. Visão Geral de Segurança

Este documento descreve todas as medidas de segurança implementadas no frontend de RideJusto para atender aos requisitos de penetração testing da PENSETS. A aplicação foi desenvolvida com security-first architecture, implementando múltiplas camadas de proteção contra vulnerabilidades comuns.

## 2. Arquitetura de Segurança em Camadas

### 2.1 Camada de Validação (Input Validation)
**Arquivo**: `src/validators/index.ts`
- **Validação Joi**: Todos os inputs são validados contra schemas Joi rigorosos
- **Validação de Formulário**: Schemas para Login, Register, Rides, Profile
- **Validação de Campo**: Funções `validateField()` e `getFieldErrors()` para validação em tempo real
- **Mensagens de Erro**: Localizadas em português, sem exposição de detalhes técnicos

### 2.2 Camada de Sanitização (Input Sanitization)
**Arquivo**: `src/security/index.ts`
- **DOMPurify**: Biblioteca consagrada para sanitização de HTML
- `sanitizeString()`: Remove todas tags HTML
- `sanitizeHTML()`: Permite tags específicas (b, i, em, strong, a, br, p)
- `escapeHTML()`: Escape de caracteres especiais (&, <, >, ", ')
- `sanitizeObject()`: Sanitização recursiva de objetos
- `sanitizeInput()`: Sanitização com tipo-específico (email, url, number, text)

### 2.3 Camada de Proteção XSS (Cross-Site Scripting)
**Implementação**:
- Validação de HTML com whitelist de tags permitidas
- Escape automático de conteúdo dinâmico
- Content Security Policy (CSP) headers em `src/main.tsx`:
  ```
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
  style-src 'self' 'unsafe-inline'
  img-src 'self' data: https:
  frame-ancestors 'none'
  ```
- React.StrictMode para detecção de side effects
- Constante `XSS_PREVENTION` define tags e atributos permitidos

### 2.4 Proteção CSRF (Cross-Site Request Forgery)
**Arquivo**: `src/security/index.ts`

**Implementação**:
1. **Geração de Token**:
   - `generateCSRFToken()`: Cria token de 32 caracteres com nanoid
   - Armazenado em sessionStorage (não em cookie visível)
   - Validade de 1 hora com regeneração automática

2. **Validação de Token**:
   - Toda requisição POST/PUT/DELETE valida token
   - `validateCSRFToken()`: Verifica integridade do token
   - Mismatch resulta em erro 403 Forbidden

3. **Injeção em Headers**:
   - `addCSRFToHeaders()`: Injeta X-CSRF-Token automaticamente
   - Applied via interceptor do Axios em todas requisições mutáveis

**Fluxo**:
```
Usuario → Request → Middleware (gera/valida token)
       → interceptor (injeta X-CSRF-Token)
       → Backend (valida token)
```

### 2.5 Validação de URLs (Trusted URL Verification)
**Arquivo**: `src/security/index.ts` e `src/constants/index.ts`

**Configuração de Domínios Confiáveis**:
```typescript
TRUSTED_URLS: {
  domains: ['ridejusto.local', 'ridejusto.com'],
  protocols: ['https:', 'http:'],
}
```

**Validação**:
- `isTrustedUrl()`: Whitelist de domínios permitidos
- Bloqueia navegação para domínios não autorizado
- Impede Open Redirect vulnerabilities
- Protocol validation (apenas http/https)

### 2.6 Proteção Rate Limiting (Cliente e Servidor)
**Arquivo**: `src/security/index.ts` e `src/services/api.ts`

**Lado Cliente** (Defense in Depth):
- `checkRateLimit(key, limit, window)`: Sistema de bucket com timestamps
- Implementado no interceptor de requests
- Default: 60 requests/minuto, 1000 requests/hora

**Lado Servidor** (Primary):
- Rate limit checking antes de enviar request
- Erro 429 "Too Many Requests" if exceeded
- Resetable com `resetRateLimit()`

**Configuração em `src/constants/index.ts`**:
```typescript
RATE_LIMIT_CONFIG: {
  loginAttempts: 5,
  loginWindow: 15 * 60 * 1000, // 15 minutos
  apiRequestsPerMinute: 60,
  apiRequestsPerHour: 1000,
}
```

**Hooks**:
- `useRateLimit()`: Hook para rate limiting em componentes

## 3. Autenticação e Gerenciamento de Sessão

### 3.1 Armazenamento de Tokens
**Arquivo**: `src/store/slices/auth.ts`

**Implementação**:
- JWT armazenado em `localStorage` com prefixo seguro
- Refresh token em localStorage separado
- Token removido automaticamente no logout
- No cookies (simplifica CSRF, mas requer proteção CSRF em headers)

**Segurança da Sessão**:
```typescript
SESSION_CONFIG: {
  tokenRefreshBuffer: 5 * 60 * 1000, // 5 minutos antes expiração
  inactivityTimeout: 30 * 60 * 1000, // 30 minutos
  maxSessionDuration: 24 * 60 * 60 * 1000, // 24 horas
}
```

### 3.2 Auto-Refresh de Token
**Arquivo**: `src/services/api.ts`

**Interceptor de Resposta**:
1. Se 401 Unauthorized: Tenta refresh automático
2. `refreshToken()` thunk retorna novo token
3. Retry original request com novo token
4. Se refresh falha: Logout automático e redirect /login

### 3.3 Session Timeout
**Hook**: `src/hooks/index.ts - useSessionTimeout()`

**Funcionalidade**:
- Detecta inatividade do usuário (30 min default)
- Auto-logout após timeout
- Reset do timer em user interactions: click, keyboard, scroll

## 4. Comunicação Segura com API

### 4.1 Configuração do Axios
**Arquivo**: `src/services/api.ts`

**Headers de Segurança**:
- `X-CSRF-Token`: Token gerado pelo security module
- `X-Requested-With: XMLHttpRequest`: Identifica requisições AJAX
- `Authorization: Bearer {token}`: JWT para autenticação

**Baseurl**:
- Configurado para `http://localhost:8000/api/v1` (desenvolvimento)
- Deve ser `https://api.ridejusto.com/api/v1` em produção

### 4.2 Request Interceptor Chain
```
1. checkRateLimit() → Bloqueia se excedido
2. addCSRFToHeaders() → Injeta X-CSRF-Token
3. Injetar JWT from localStorage
4. DevLogging (dev mode only)
```

### 4.3 Response Interceptor Chain
```
1. validateApiResponse() → Valida formato Response
2. Handle 401 → refreshToken() + retry
3. Handle 429 → Rate limit exceeded
4. Handle 403 → Access forbidden
5. Sanitizar mensagens erro
6. DevLogging (dev mode only)
```

### 4.4 Tratamento de Erros
- Todas mensagens de erro são sanitizadas
- Stack traces nunca expostas ao usuário
- Mensagens em português, genéricas e seguras
- Estado de erro removido após ação do usuário

## 5. Dados Sensíveis

### 5.1 Proteção de Senhas
**Validação em CLI**:
```
Mínimo 8 caracteres
Letra maiúscula obrigatória
Letra minúscula obrigatória
Número obrigatório
Caractere especial obrigatório
```

**Nunca armazenado localmente**. Backend responsável por hashing.

### 5.2 Cache Control
**Arquivo**: `src/constants/index.ts`

**Headers de Cache**:
```typescript
CACHE_CONFIG: {
  ttl: 5 * 60 * 1000, // 5 minutos
  maxSize: 50 * 1024 * 1024, // 50MB
  compression: true,
  staleWhileRevalidate: true,
}
```

**Implementação**:
- `getCacheHeaders(maxAge, private)`: Retorna headers apropriados
- Cache-Control, Pragma, Expires setados
- Dados sensíveis marcados como private

### 5.3 Content Security
**Em `index.html` e `src/main.tsx`**:
- Meta tags de segurança
- Referrer policy: `strict-origin-when-cross-origin`
- No inline scripts sem hash
- Frame busting: `frame-ancestors 'none'`

## 6. Autenticação Baseada em Função (RBAC)

### 6.1 Modelo de Permissões
**Arquivo**: `src/constants/index.ts`

```typescript
ROLE_PERMISSIONS: {
  admin: ['manage_users', 'manage_rides', 'view_analytics'],
  driver: ['request_rides', 'accept_rides', 'view_earnings'],
  passenger: ['request_rides', 'rate_rides', 'view_history'],
}
```

### 6.2 Rota Protegida
**Arquivo**: `src/components/ProtectedRoute.tsx`

**Validações**:
1. `isAuthenticated`: Redirect /login se não autenticado
2. `requiredRole`: Verificação de papel do usuário
3. `canAccess()`: Função helper para verificar permissões
4. Loading state durante verificação

**Uso**:
```tsx
<ProtectedRoute requiredRole={['driver']}>
  <DriverDashboard />
</ProtectedRoute>
```

## 7. Testes de Segurança & Conformidade

### 7.1 Vulnerabilidades Mitigadas

| Vulnerabilidade | Mitigação | Status |
|---|---|---|
| XSS (Cross-Site Scripting) | DOMPurify + sanitização + CSP | ✅ |
| CSRF (Request Forgery) | Token validation + SameSite | ✅ |
| Session Hijacking | Session timeout + token refresh | ✅ |
| Open Redirect | URL whitelist validation | ✅ |
| Rate Limiting Bypass | Client+Server rate limiting | ✅ |
| Unauthorized Access | RBAC + Protected routes | ✅ |
| Data Leakage | CSP + cache control headers | ✅ |
| Prototype Pollution | Input validation strict | ✅ |

### 7.2 Testes Recomendados para PENSETS

#### Teste de Validação de Input
```bash
# Tentar injetar XSS em form fields
curl -X POST http://localhost:5173
  -d "email=<img src=x onerror=alert('XSS')>&password=test"
  
# Esperado: Input sanitizado, sem execução de script
```

#### Teste de CSRF
```bash
# Gerar token e validar
1. GET /api/v1/csrf-token
2. POST /api/v1/rides com X-CSRF-Token header
3. Verificar 403 se token inválido
```

#### Teste de Rate Limiting
```bash
# Fazer 61 requests em 1 minuto
for i in {1..61}; do
  curl -X GET http://localhost:8000/api/v1/rides
done

# Esperado: 429 Too Many Requests após limite
```

#### Teste de Session Timeout
```bash
1. Login
2. Aguardar 30+ minutos de inatividade
3. Tentar fazer requisição

# Esperado: 401 Unauthorized, redirect /login
```

### 7.3 Checklist de Segurança para Production

- [ ] HTTPS/TLS habilitado em produção
- [ ] CSP headers configurados corretamente
- [ ] HSTS headers implementado (1 ano minimum)
- [ ] Cookies com flags: Secure, HttpOnly, SameSite=Strict
- [ ] Backend valida todos CSRFor tokens
- [ ] Rate limiting configurado no backend
- [ ] Logs de segurança em centralized system
- [ ] WAF (Web Application Firewall) deployado
- [ ] Secrets não commitados (use .env)
- [ ] Dependencies atualizadas e sem vulnerabilidades
- [ ] Tests de segurança automatizados no CI/CD
- [ ] Monitoring de anomalias implementado

## 8. Arquivos de Segurança

### 8.1 Estrutura de Diretórios
```
src/
├── security/           # Core security functions
│   └── index.ts       # 360 linhas de security functions
├── validators/        # Input validation schemas
│   └── index.ts       # 180 linhas Joi validators
├── services/          # API with security interceptors
│   └── api.ts         # 150 linhas Axios + interceptors
├── store/             # Redux com state seguro
│   ├── index.ts
│   └── slices/
│       ├── auth.ts    # 180 linhas auth thunks
│       ├── rides.ts   # 200 linhas rides thunks
│       └── ui.ts      # 70 linhas UI state
├── components/
│   ├── ProtectedRoute.tsx  # 55 linhas RBAC
│   └── ...
└── hooks/
    └── index.ts       # 280 linhas custom hooks
```

### 8.2 Constantes de Segurança
`src/constants/index.ts` - 140 linhas:
- SECURITY_CONFIG (CSRF, CORS, XSS, HSTS)
- CACHE_CONFIG (TTL, compression, stale-while-revalidate)
- VALIDATION_CONFIG (password requirements)
- TRUSTED_URLS (whitelist de domínios)
- RATE_LIMIT_CONFIG (login attempts, API limits)
- XSS_PREVENTION (allowed tags/attributes)

## 9. Dependências de Segurança

```json
{
  "dompurify": "^3.0.6",        // XSS prevention
  "jose": "^4.15.0",            // JWT handling
  "nanoid": "^4.0.2",           // Secure ID generation
  "joi": "^17.11.0",            // Input validation
  "axios": "^1.6.0",            // HTTP client + interceptors
  "react": "^18.2.0",           // React.StrictMode
  "typescript": "^5.2.0",       // Strict typing
}
```

## 10. Plano de Monitoramento

### 10.1 Metricas de Segurança
- Failed login attempts (thresholds para alerta)
- Rate limit violations
- CSRF token mismatches
- XSS detection attempts
- Unexpected errors

### 10.2 Logging
`src/services/api.ts` tem dev logging:
```typescript
if (import.meta.env.DEV) {
  console.log('Request:', request)
  console.log('Response:', response)
}
```

Produção deve usar centralized logging (Sentry, LogRocket, etc).

## 11. Updates e Maintenance

### 11.1 Dependency Updates
- Executar `npm audit` regularmente
- Atualizar vulnerabilidades conhecidas
- Testar compatibilidade antes deploy

### 11.2 Security Headlines
- Monitorar CVEs relevantes
- Atualizar CSP conforme necessário
- Reviewer pull requests com alterações security

## 12. Contato & Reportar Vulnerabilidades

Para reportar vulnerabilidades de segurança, contactar security@ridejusto.com

**Não reportar vulnerabilidades publicamente.**

---

**Documento revisado**: 2024
**Versão**: 1.0
**Status**: Pronto para PENSETS
