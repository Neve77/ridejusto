"""
Schemas Pydantic para autenticação
Valida requisições e respostas de auth
"""

from pydantic import BaseModel, EmailStr, validator
import re

# Constantes de validação
MIN_NAME_LENGTH = 2
MAX_NAME_LENGTH = 100
MAX_EMAIL_LENGTH = 255
VALID_ROLES = ["user", "driver", "admin"]
NAME_REGEX = re.compile(r'^[a-zA-ZÀ-ÿ\s\-]{2,100}$')


class RegisterSchema(BaseModel):
    """Schema para registro de novo usuário"""
    
    name: str
    email: EmailStr
    password: str
    role: str
    
    @validator('name')
    def validate_name(cls, v):
        """
        Valida nome do usuário
        - Mínimo 2 caracteres
        - Máximo 100 caracteres
        - Apenas letras, espaços e hífens
        """
        if not v or not isinstance(v, str):
            raise ValueError('Nome deve ser uma string válida')
        
        v = v.strip()
        
        if len(v) < MIN_NAME_LENGTH:
            raise ValueError(f'Nome deve ter no mínimo {MIN_NAME_LENGTH} caracteres')
        
        if len(v) > MAX_NAME_LENGTH:
            raise ValueError(f'Nome deve ter no máximo {MAX_NAME_LENGTH} caracteres')
        
        if not NAME_REGEX.match(v):
            raise ValueError('Nome deve conter apenas letras, espaços e hífens')
        
        return v
    
    @validator('email')
    def validate_email(cls, v):
        """
        Valida email
        - Formato válido de email
        - Não vazio
        """
        if not v:
            raise ValueError('Email é obrigatório')
        
        if len(v) > MAX_EMAIL_LENGTH:
            raise ValueError(f'Email não pode exceder {MAX_EMAIL_LENGTH} caracteres')
        
        return v.lower()
    
    @validator('password')
    def validate_password(cls, v):
        """
        Valida força da senha
        - Mínimo 8 caracteres
        - Máximo 128 caracteres
        - Pelo menos uma maiúscula
        - Pelo menos uma minúscula
        - Pelo menos um número
        - Pelo menos um caractere especial
        """
        if not v:
            raise ValueError('Senha é obrigatória')
        
        if len(v) < 8:
            raise ValueError('Senha deve ter no mínimo 8 caracteres')
        
        if len(v) > 128:
            raise ValueError('Senha deve ter no máximo 128 caracteres')
        
        if not any(c.isupper() for c in v):
            raise ValueError('Senha deve conter pelo menos uma letra maiúscula')
        
        if not any(c.islower() for c in v):
            raise ValueError('Senha deve conter pelo menos uma letra minúscula')
        
        if not any(c.isdigit() for c in v):
            raise ValueError('Senha deve conter pelo menos um número')
        
        if not any(c in '@$!%*?&' for c in v):
            raise ValueError('Senha deve conter um caractere especial (@$!%*?&)')
        
        return v
    
    @validator('role')
    def validate_role(cls, v):
        """
        Valida role do usuário
        - Deve ser um dos roles válidos
        """
        if not v:
            raise ValueError('Role é obrigatória')
        
        if v not in VALID_ROLES:
            raise ValueError(f'Role deve ser um de: {", ".join(VALID_ROLES)}')
        
        return v.lower()
    
    class Config:
        """Configurações do Pydantic"""
        json_schema_extra = {
            "example": {
                "name": "João Silva",
                "email": "joao@example.com",
                "password": "SecurePass123!",
                "role": "user"
            }
        }


class LoginSchema(BaseModel):
    """Schema para login de usuário"""
    
    email: EmailStr
    password: str
    
    @validator('email')
    def validate_email(cls, v):
        """Valida e normaliza email"""
        if not v:
            raise ValueError('Email é obrigatório')
        
        if len(v) > MAX_EMAIL_LENGTH:
            raise ValueError(f'Email não pode exceder {MAX_EMAIL_LENGTH} caracteres')
        
        return v.lower()
    
    @validator('password')
    def validate_password(cls, v):
        """Valida que senha não está vazia"""
        if not v:
            raise ValueError('Senha é obrigatória')
        
        if not isinstance(v, str):
            raise ValueError('Senha deve ser uma string')
        
        return v
    
    class Config:
        """Configurações do Pydantic"""
        json_schema_extra = {
            "example": {
                "email": "joao@example.com",
                "password": "SecurePass123!"
            }
        }


class UserResponseSchema(BaseModel):
    """Schema para resposta com dados do usuário"""
    
    user_id: int
    email: str
    name: str
    role: str
    
    class Config:
        """Configurações do Pydantic"""
        from_attributes = True


class AuthResponseSchema(BaseModel):
    """Schema para resposta de autenticação"""
    
    success: bool
    message: str
    data: UserResponseSchema
    access_token: str
    
    class Config:
        """Configurações do Pydantic"""
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Autenticação bem-sucedida",
                "data": {
                    "user_id": 1,
                    "email": "user@example.com",
                    "name": "João Silva",
                    "role": "user"
                },
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }
