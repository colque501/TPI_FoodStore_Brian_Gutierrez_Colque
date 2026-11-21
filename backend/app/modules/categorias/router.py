from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.categorias.schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.categorias.service import (
    CategoriaService,
    CategoriaNoEncontrada,
    NombreDuplicado,
)

router = APIRouter(prefix="/categorias", tags=["Catálogo - Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get("", response_model=List[CategoriaRead])
def listar_categorias(
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
):
    return service.list_activas()


@router.get("/{id}", response_model=CategoriaRead)
def obtener_categoria(
    id: int,
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
):
    try:
        return service.get_by_id(id)
    except CategoriaNoEncontrada:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    data: CategoriaCreate,
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
):
    try:
        return service.create(data)
    except NombreDuplicado:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una categoría con ese nombre",
        )


@router.put("/{id}", response_model=CategoriaRead)
def actualizar_categoria(
    id: int,
    data: CategoriaUpdate,
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
):
    try:
        return service.update(id, data)
    except CategoriaNoEncontrada:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )
    except NombreDuplicado:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe otra categoría con ese nombre",
        )


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(
    id: int,
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
):
    try:
        service.delete_logico(id)
    except CategoriaNoEncontrada:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )