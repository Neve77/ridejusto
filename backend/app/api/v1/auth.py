"""
Endpoints de autenticação (login e registro)
Responsável por:
- Registro de novos usuários
- Login e geração de tokens JWT
- Validações de segurança
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.database.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password, verify_password, create_token
from app.schemas.auth import RegisterSchema, LoginSchema, AuthResponseSchema, UserResponseSchema

# Logger para auditoria de segurança
logger = logging.getLogger(__name__)

# Criar router para rotas de auth
router = APIRouter()


def get_db():
    """
    Dependency para obter sessão do banco de dados
    Garante que a conectção é fechada após o request
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post(
    "/register",
    response_model=AuthResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar novo usuário",
    response_description="Usuário registrado com sucesso",
    tags=["Autenticação"]
)
def register(
    user_data: RegisterSchema,
    db: Session = Depends(get_db)
):
    """
    Endpoint de registro de novo usuário
    
    Valida:
    - Email único no sistema
    - Força da senha
    - Dados do usuário válidos
    
    Segurança:
    - Senha criptografada com hash + salt
    - JWT token gerado automaticamente
    - Log de audit
    
    Args:
        user_data: Dados do usuário (name, email, password, role)
        db: Sessão do banco de dados
        
    Returns:
        AuthResponseSchema com token e dados do usuário
        
    Raises:
        HTTPException: 400 se email duplicado, 500 se erro interno
    """
    try:
        # 1. Validar se email já existe no sistema
        existing_user = db.query(User).filter(
            User.email == user_data.email.lower()
        ).first()
        
        if existing_user:
            logger.warning(
                f"Tentativa de registro com email existente: {user_data.email}"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já está registrado no sistema"
            )
        
        # 2. Hash seguro da senha
        try:
            hashed_password = hash_password(user_data.password)
        except ValueError as e:
            logger.warning(f"Senha fraca no registro: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        
        # 3. Criar novo usuário
        new_user = User(
            name=user_data.name.strip(),
            email=user_data.email.lower(),
            password=hashed_password,
            role=user_data.role.lower()
        )
        
        # 4. Salvar no banco de dados
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # 5. Gerar token JWT para login automático
        access_token = create_token({"user_id": new_user.id})
        
        # 6. Log de auditoria
        logger.info(
            f"Novo usuário registrado: ID={new_user.id}, Email={new_user.email}, Role={new_user.role}"
        )
        
        # 7. Retornar resposta
        return {
            "success": True,
            "message": "Usuário criado com sucesso",
            "data": {
                "user_id": new_user.id,
                "email": new_user.email,
                "name": new_user.name,
                "role": new_user.role
            },
            "access_token": access_token
        }
    
    except IntegrityError as e:
        # Erro de integridade do banco de dados
        db.rollback()
        logger.error(f"Erro de integridade no registro: {str(e)}")
        
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já está registrado"
            )
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao registrar usuário"
        )
    
    except HTTPException:
        # Re-lançar exceções HTTP já tratadas
        raise
    
    except SQLAlchemyError as e:
        # Erro geral do banco de dados
        db.rollback()
        logger.error(f"Erro de banco de dados no registro: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao processar registro"
        )
    
    except Exception as e:
        # Erro inesperado
        db.rollback()
        logger.exception(f"Erro inesperado no registro: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao processar registro"
        )


@router.post(
    "/login",
    response_model=AuthResponseSchema,
    status_code=status.HTTP_200_OK,
    summary="Fazer login",
    response_description="Login realizado com sucesso",
    tags=["Autenticação"]
)
def login(
    credentials: LoginSchema,
    db: Session = Depends(get_db)
):
    """
    Endpoint de login
    
    Valida:
    - Email existe no sistema
    - Senha correta (verificação timing-safe)
    
    Segurança:
    - Mensagens de erro genéricas para não revelar se email existe
    - Verificação timing-safe contra timing attacks
    - JWT token gerado
    - Log de tentativas
    
    Args:
        credentials: Email e senha (LoginSchema)
        db: Sessão do banco de dados
        
    Returns:
        AuthResponseSchema com token e dados do usuário
        
    Raises:
        HTTPException: 401 se credenciais inválidas, 500 se erro interno
    """
    try:
        # 1. Buscar usuário por email (case-insensitive)
        user = db.query(User).filter(
            User.email == credentials.email.lower()
        ).first()
        
        # 2. Verificar se usuário existe e senha está correta
        if not user:
            logger.warning(f"Tentativa de login com email inexistente: {credentials.email}")
            # Erro genérico por segurança (não revelar se email existe)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos"
            )
        
        # 3. Verificar senha com timing-safe comparison
        password_valid = verify_password(credentials.password, user.password)
        
        if not password_valid:
            logger.warning(f"Tentativa de login com senha incorreta: {user.email}")
            # Erro genérico por segurança
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos"
            )
        
        # 4. Gerar JWT token
        access_token = create_token({"user_id": user.id})
        
        # 5. Log de auditoria
        logger.info(
            f"Login bem-sucedido: ID={user.id}, Email={user.email}, Role={user.role}"
        )
        
        # 6. Retornar resposta
        return {
            "success": True,
            "message": "Login realizado com sucesso",
            "data": {
                "user_id": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role
            },
            "access_token": access_token
        }
    
    except HTTPException:
        # Re-lançar exceções HTTP
        raise
    
    except SQLAlchemyError as e:
        # Erro de banco de dados
        logger.error(f"Erro de banco de dados no login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao processar login"
        )
    
    except Exception as e:
        # Erro inesperado
        logger.exception(f"Erro inesperado no login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao processar login"
        )
