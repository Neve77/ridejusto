# 🧪 Guia Prático de Testes - RideJusto Auth

## Início Rápido

**Backend rodando?** ✅  
**Frontend rodando?** ✅  

### URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Docs: http://localhost:8000/docs

---

## 📝 Testes com cURL

### 1️⃣ Teste: Validação de Senha Fraca
```bash
# DEVE FALHAR - Senha sem maiúscula
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123@",
    "role": "user"
  }'

# RESPOSTA ESPERADA:
# ❌ 422 Unprocessable Entity
# "Senha deve conter pelo menos uma letra maiúscula"
```

### 2️⃣ Teste: Validação de Email
```bash
# DEVE FALHAR - Email inválido
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João",
    "email": "email-invalido",
    "password": "ValidPass123@",
    "role": "user"
  }'

# RESPOSTA ESPERADA:
# ❌ 422 - "invalid email format"
```

### 3️⃣ Teste: Validação de Nome
```bash
# DEVE FALHAR - Nome com caracteres especiais
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João@123#",
    "email": "joao@example.com",
    "password": "ValidPass123@",
    "role": "user"
  }'

# RESPOSTA ESPERADA:
# ❌ 422 - "Nome deve conter apenas letras, espaços e hífens"
```

### 4️⃣ Teste: Registro Bem-Sucedido
```bash
# DEVE SUCEDER
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao'$(date +%s)'@example.com",
    "password": "ValidPass123@",
    "role": "user"
  }'

# RESPOSTA ESPERADA:
# ✅ 201 Created
# {
#   "success": true,
#   "message": "Usuário criado com sucesso",
#   "data": {
#     "user_id": 1,
#     "email": "joao@example.com",
#     "name": "João Silva",
#     "role": "user"
#   },
#   "access_token": "eyJhbGciOiJIUzI1NiIs..."
# }
```

### 5️⃣ Teste: Email Duplicado
```bash
# DEVE FALHAR - Email já registrado
EXISTING_EMAIL="joao1774640000@example.com"

# Registrar primeira vez
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João",
    "email": "'$EXISTING_EMAIL'",
    "password": "ValidPass123@",
    "role": "user"
  }'

# Tentar registrar segunda vez - DEVE FALHAR
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João 2",
    "email": "'$EXISTING_EMAIL'",
    "password": "ValidPass123@",
    "role": "user"
  }'

# RESPOSTA ESPERADA:
# ❌ 400 Bad Request
# {"detail": "Email já está registrado"}
```

### 6️⃣ Teste: Login com Credenciais Corretas
```bash
# Credenciais válidas
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "paulo1774639857@test.com",
    "password": "StrongPass123@"
  }'

# RESPOSTA ESPERADA:
# ✅ 200 OK
# {
#   "success": true,
#   "message": "Login realizado com sucesso",
#   "data": {
#     "user_id": 11,
#     "email": "paulo1774639857@test.com",
#     "name": "Paulo Silva",
#     "role": "user"
#   },
#   "access_token": "eyJhbGciOiJIUzI1NiIs..."
# }
```

### 7️⃣ Teste: Login com Email Incorreto
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nao-existe@test.com",
    "password": "AnyPassword123@"
  }'

# RESPOSTA ESPERADA:
# ❌ 401 Unauthorized
# {"detail": "Email ou senha incorretos"}
# (Note: mensagem genérica por segurança!)
```

### 8️⃣ Teste: Login com Senha Incorreta
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "paulo1774639857@test.com",
    "password": "WrongPassword123@"
  }'

# RESPOSTA ESPERADA:
# ❌ 401 Unauthorized
# {"detail": "Email ou senha incorretos"}
```

### 9️⃣ Teste: Role Inválido
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João",
    "email": "joao@test.com",
    "password": "ValidPass123@",
    "role": "superadmin"
  }'

# RESPOSTA ESPERADA:
# ❌ 422 - "Role deve ser um de: user, driver, admin"
```

### 🔟 Teste: Token JWT válido
```bash
# Extrair token do login bem-sucedido
TOKEN="seu_token_jwt_aqui"

# Usar token em requisição protegida
curl -X GET http://localhost:8000/api/v1/user/profile \
  -H "Authorization: Bearer $TOKEN"

# RESPOSTA ESPERADA:
# ✅ 200 - Dados do usuário
# OU
# ❌ 401 - Token expirado/inválido
```

---

## 🌐 Testes no Navegador (Frontend)

### 1. Registrar Nova Conta
1. Vá para: http://localhost:3000
2. Clique em "Registre uma Conta"
3. Preencha com:
   - **Nome:** Seu Nome
   - **Email:** seuemail@test.com (NOVO a cada vez!)
   - **Senha:** MinhaSenh@123 (Maiúscula, minúscula, número, caractere especial)
   - **Função:** user
4. Clique em "Registrar"
5. **ESPERADO:** ✅ Redirecionado para Dashboard

### 2. Fazer Login
1. Se não estiver logado, vá para: http://localhost:3000/login
2. Preencha com:
   - **Email:** seuemail@test.com
   - **Senha:** MinhaSenh@123
3. Clique em "Entrar"
4. **ESPERADO:** ✅ Acesso ao Dashboard com dados do usuário

### 3. Ver Dashboard
1. Após login bem-sucedido
2. Você verá:
   - ✅ Foto/Avatar do usuário
   - ✅ Dados de perfil (Nome, Email)
   - ✅ Menu lateral com opções
   - ✅ Cards de estatísticas
3. **ESPERADO:** Tudo carrega corretamente

---

## 🔒 Testes de Segurança Avançados

### A. Teste de Timing Attack (Proteção Contra)
```bash
# Este teste valida que a comparação de senhas é timing-safe

time curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "a"}'

time curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "totallywrongpasswordthatistoolong"}'

# ESPERADO: Ambos levam aproximadamente o mesmo tempo
# (timing-safe comparison evita timing attacks)
```

### B. Teste de SQL Injection (Proteção Contra)
```bash
# Tentar SQL injection no email
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com\" or \"1\"=\"1",
    "password": "anything"
  }'

# ESPERADO: ❌ 401 - Mensagem genérica (SQL injection bloqueado)
```

### C. Teste de Rate Limiting
```bash
# Fazer múltiplas requisições Login rapidamente
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@test.com",
      "password": "WrongPass123@"
    }'
done

# ESPERADO: Algumas requisições podem retornar 429 Too Many Requests
```

### D. Teste de CORS
```bash
# Tentar requisição de origem não permitida
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://attacker.com" \
  -d '{"email": "test@test.com", "password": "test"}'

# ESPERADO: Em produção, seria bloqueado
# Em dev, retorna a resposta normalmente
```

---

## 📊 Checklist de Testes Completo

### Validação de Entrada
- [ ] ✅ Senha fraca é rejeitada
- [ ] ✅ Email inválido é rejeitado
- [ ] ✅ Nome com caracteres especiais é rejeitado
- [ ] ✅ Role inválido é rejeitado
- [ ] ✅ Email vazio é rejeitado
- [ ] ✅ Senha vazia é rejeitada

### Lógica de Negócio
- [ ] ✅ Email duplicado é rejeitado
- [ ] ✅ Registro bem-sucedido cria usuário
- [ ] ✅ Login com credenciais corretas sucede
- [ ] ✅ Login com senha incorreta falha
- [ ] ✅ Login com email inexistente falha
- [ ] ✅ Mensagens de erro são genéricas

### Segurança
- [ ] ✅ Senhas são hashed com salt
- [ ] ✅ JWT é gerado com expiração
- [ ] ✅ CORS está configurado
- [ ] ✅ Rate limit está ativo
- [ ] ✅ Logging de auditoria funciona
- [ ] ✅ Timing-safe comparison implementado

### Frontend
- [ ] ✅ Validação de senha fraca no formulário
- [ ] ✅ Mensagens de erro aparecem
- [ ] ✅ Token é armazenado
- [ ] ✅ Usuario é redirecionado ao login
- [ ] ✅ Dashboard carrega com dados corretos
- [ ] ✅ Logout funciona

---

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Verificar se porta 8000 está em uso
lsof -i :8000

# Matar processo na porta 8000
kill -9 $(lsof -ti :8000)

# Reiniciar backend
cd backend
C:/Python313/python.exe -m uvicorn app.main:app --reload --port 8000
```

### Frontend não conecta ao backend
```bash
# Verificar CORS
curl -X OPTIONS http://localhost:8000/api/v1/auth/login \
  -H "Origin: http://localhost:3000"

# Deve retornar headers CORS
```

### Erro de banco de dados
```bash
# Deletar banco de dados antigo
rm backend/ridejusto.db

# Banco será recriado ao iniciar backend
```

---

## 📱 Resumo de Senhas para Teste

| Email | Senha | Role | Status |
|-------|-------|------|--------|
| paulo1774639857@test.com | StrongPass123@ | user | ✅ Funciona |
| novo@test.com | SecurePass123! | user | ✅ Funciona |
| test@test.com | MinhaSenh@123 | user | 🟡 Crie novo |

---

## 🎉 Próximas Etapas

1. ✅ **Testar todos os endpoints above**
2. ✅ **Verificar logs do backend**
3. ✅ **Testar no navegador**
4. ✅ **Verificar armazenamento de token**
5. ✅ **Validar força de senha**
6. ✅ **Testar rate limiting**

---

**Boa sorte nos testes PENSETS! 🚀**
