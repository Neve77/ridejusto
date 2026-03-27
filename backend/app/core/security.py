"""
Módulo de segurança para autenticação e criptografia
Responsável por:
- Hash e verificação de senhas com salt
- Criação e validação de tokens JWT
- Proteção contra ataques comuns
"""

import hashlib
import secrets
import re
from jose import jwt, JWTError
from datetime import datetime, timedelta
from app.core.config import settings

# Constantes de segurança
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128
PASSWORD_REGEX = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$')
SALT_LENGTH = 64  # 32 bytes = 64 hex chars


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Valida força da senha
    
    Requisitos:
    - Mínimo 8 caracteres, máximo 128
    - Pelo menos uma letra maiúscula
    - Pelo menos uma letra minúscula
    - Pelo menos um número
    - Pelo menos um caractere especial (@$!%*?&)
    
    Args:
        password: Senha a validar
        
    Returns:
        Tupla (válido: bool, mensagem: str)
    """
    if not isinstance(password, str):
        return False, "Senha deve ser uma string válida"
    
    if len(password) < MIN_PASSWORD_LENGTH:
        return False, f"Senha deve ter no mínimo {MIN_PASSWORD_LENGTH} caracteres"
    
    if len(password) > MAX_PASSWORD_LENGTH:
        return False, f"Senha deve ter no máximo {MAX_PASSWORD_LENGTH} caracteres"
    
    if not PASSWORD_REGEX.match(password):
        return False, "Senha deve conter maiúscula, minúscula, número e caractere especial (@$!%*?&)"
    
    return True, "Senha válida"


def hash_password(password: str) -> str:
    """
    Hash de senha usando SHA256 com salt aleatório
    
    Processo:
    1. Valida força da senha
    2. Gera salt criptograficamente seguro
    3. Combina password + salt
    4. Hash com SHA256
    5. Retorna salt$hash para armazenamento
    
    Args:
        password: Senha em texto plano
        
    Returns:
        String formatada como "salt$hash"
        
    Raises:
        ValueError: Se senha inválida
    """
    # Validar força da senha
    is_valid, message = validate_password_strength(password)
    if not is_valid:
        raise ValueError(f"Senha fraca: {message}")
    
    # Gerar salt criptograficamente seguro
    salt = secrets.token_hex(SALT_LENGTH // 2)
    
    # Hash: salt + password com SHA256
    password_bytes = (salt + password).encode('utf-8')
    pwd_hash = hashlib.sha256(password_bytes).hexdigest()
    
    # Retornar formato: salt$hash para verificação posterior
    return f"{salt}${pwd_hash}"


def verify_password(password: str, hashed: str) -> bool:
    """
    Verifica se a senha corresponde ao hash armazenado
    
    Processo:
    1. Extrai salt do hash armazenado
    2. Hash da senha fornecida com salt
    3. Compara hashes com timing-safe comparison
    
    Args:
        password: Senha em texto plano
        hashed: Hash armazenado (salt$hash)
        
    Returns:
        True se senha correta, False caso contrário
    """
    try:
        if not isinstance(password, str) or not isinstance(hashed, str):
            return False
        
        # Validar formato do hash
        if '$' not in hashed:
            return False
        
        # Extrair salt e hash armazenado
        parts = hashed.split('$')
        if len(parts) != 2:
            return False
        
        salt, stored_hash = parts
        
        # Validar comprimento do salt
        if len(salt) != SALT_LENGTH:
            return False
        
        # Hash da senha fornecida com salt extraído
        password_bytes = (salt + password).encode('utf-8')
        check_hash = hashlib.sha256(password_bytes).hexdigest()
        
        # Timing-safe comparison para evitar timing attacks
        return secrets.compare_digest(check_hash, stored_hash)
    
    except (ValueError, AttributeError, IndexError):
        return False


def create_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    Cria JWT token com claims e expiração
    
    Segurança:
    - Algoritmo HS256 com SECRET_KEY
    - Expiração automática
    - Claims validados
    
    Args:
        data: Dictionary com claims (ex: {"user_id": 1})
        expires_delta: Tempo de expiração customizado
        
    Returns:
        Token JWT codificado
    """
    if not isinstance(data, dict):
        raise ValueError("Data deve ser um dicionário")
    
    # Copiar data para não modificar original
    to_encode = data.copy()
    
    # Definir tempo de expiração
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    
    # Adicionar claim de expiração
    to_encode.update({"exp": expire})
    
    # Codificar JWT com algoritmo seguro
    try:
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        return encoded_jwt
    except Exception as e:
        raise ValueError(f"Erro ao criar token: {str(e)}")


def verify_token(token: str) -> dict:
    """
    Verifica e decodifica JWT token
    
    Validações:
    - Assinatura válida com SECRET_KEY
    - Algoritmo correto (HS256)
    - Expiração verificada
    
    Args:
        token: JWT token a verificar
        
    Returns:
        Dictionary com payload decodificado ou None se inválido
    """
    if not isinstance(token, str) or not token.strip():
        return None
    
    try:
        # Decodificar e validar token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # Validar que user_id está presente
        if "user_id" not in payload:
            return None
        
        return payload
    
    except jwt.ExpiredSignatureError:
        # Token expirado
        return None
    except jwt.JWTClaimsError:
        # Claims inválidas
        return None
    except JWTError:
        # Erro geral de JWT
        return None
    except Exception:
        return None