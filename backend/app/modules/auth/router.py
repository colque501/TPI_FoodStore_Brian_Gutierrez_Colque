from typing import Annotated
from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.deps import get_current_active_user
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork
from app.modules.auth.schemas import TokenResponse
from app.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserCreate,
    service: Annotated[AuthService, Depends(get_auth_service)],
):
    return service.register(user_in)


@router.post("/token", response_model=TokenResponse)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: Annotated[AuthService, Depends(get_auth_service)],
):
    return service.login(form_data, response)


@router.post("/logout", response_model=TokenResponse)
def logout(
    response: Response,
    service: Annotated[AuthService, Depends(get_auth_service)],
):
    return service.logout(response)


@router.get("/me", response_model=UserPublic)
def read_current_user(
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
):
    return UserPublic.model_validate(current_user)