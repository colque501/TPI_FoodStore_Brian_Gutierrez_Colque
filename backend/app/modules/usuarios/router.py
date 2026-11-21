from typing import Annotated, List
from fastapi import APIRouter, Depends
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork
from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix="/admin/usuarios", tags=["Admin - Usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=List[UserPublic])
def listar_usuarios(
    service: Annotated[UsuarioService, Depends(get_usuario_service)],
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
):
    return service.list_usuarios()


@router.post("/{user_id}/activar", response_model=UserPublic)
def activar_usuario(
    user_id: int,
    service: Annotated[UsuarioService, Depends(get_usuario_service)],
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
):
    return service.set_user_status(user_id=user_id, disabled=False, current_admin=_)


@router.post("/{user_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    user_id: int,
    service: Annotated[UsuarioService, Depends(get_usuario_service)],
    current_admin: Annotated[Usuario, Depends(require_role(["admin"]))],
):
    return service.set_user_status(user_id=user_id, disabled=True, current_admin=current_admin)