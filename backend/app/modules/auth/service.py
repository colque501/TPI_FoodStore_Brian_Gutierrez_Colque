from datetime import timedelta
from fastapi import HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import settings
from app.core.security import get_password_hash, verify_password, create_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def register(self, user_in: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(user_in.username):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El nombre de usuario ya está registrado",
                )
            if uow.usuarios.get_by_email(user_in.email):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El email ya está registrado",
                )

            nuevo_usuario = Usuario(
                username=user_in.username,
                full_name=user_in.full_name,
                email=user_in.email,
                hashed_password=get_password_hash(user_in.password),
                role="user",
                disabled=False,
            )
            uow.usuarios.add(nuevo_usuario)
            uow.session.flush()
            uow.session.refresh(nuevo_usuario)
            return UserPublic.model_validate(nuevo_usuario)

    def login(self, form_data: OAuth2PasswordRequestForm, response: Response) -> dict:
        with self.uow as uow:
            user = uow.usuarios.get_by_username(form_data.username)
            if not user or not verify_password(form_data.password, user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciales incorrectas",
                )

            if user.disabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cuenta de usuario desactivada",
                )

            expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            token = create_access_token(
                data={"sub": user.username, "role": user.role},
                expires_delta=expires_delta,
            )

            # Cookie HttpOnly segura para el navegador
            response.set_cookie(
                key="access_token",
                value=token,
                httponly=True,
                max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                samesite="lax",
                secure=False,  # True en HTTPS de producción
            )

            return {"message": "Login exitoso"}

    def logout(self, response: Response) -> dict:
        response.delete_cookie(key="access_token")
        return {"message": "Logout exitoso"}